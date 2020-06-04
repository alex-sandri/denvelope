export {};

import * as loadEvents from "./scripts/load-events";
import * as genericMessage from "./scripts/generic-message";
import {
    GetCurrentFolderId,
    AddClass,
    RemoveClass,
    IsSet,
    LogPageViewEvent,
    FormatDate,
    FormatStorage,
    SetCurrentFolderId,
    GetFirestoreUpdateTimestamp,
    GetFirestoreServerTimestamp,
    GetCurrentFolderIdAsync,
    ShowElement,
    ShowElements,
    HideElement,
    HideElements,
    HasClass,
    IsTouchDevice,
    AddClasses
} from "./scripts/Utilities";
import { Modal, UploadModal, DownloadModal } from "./scripts/Modal";
import { Auth } from './scripts/Auth';
import { Linguist } from './scripts/Linguist';
import { Component, Input, Spinner, InputWithIcon } from './scripts/Component';
import { Translation } from './scripts/Translation';
import { HideHeaderMenu, header, whatIsTakingUpSpace } from "./scripts/header";

loadEvents.Init();

const db = (<any>window).firebase.firestore();
const storage = (<any>window).firebase.storage();
const functions = (<any>window).firebase.app().functions("europe-west1");
const analytics = (<any>window).firebase.analytics();

const addContentOptions : HTMLDivElement = document.querySelector(".add-content-options");

const addFiles : HTMLButtonElement = addContentOptions.querySelector("#add-files");
const fileInput : HTMLInputElement = addContentOptions.querySelector("#files");

const addFolder : HTMLButtonElement = addContentOptions.querySelector("#add-folder");
const folderInput : HTMLInputElement = addContentOptions.querySelector("#folder");

const createFile : HTMLButtonElement = addContentOptions.querySelector("#create-file");
const createFolder : HTMLButtonElement = addContentOptions.querySelector("#create-folder");

const bottomMenu : HTMLElement = document.querySelector("aside");
const viewMyAccount : HTMLButtonElement = bottomMenu.querySelector("#my-account");
const viewSharedContent : HTMLButtonElement = bottomMenu.querySelector("#shared");
const viewStarredContent : HTMLButtonElement = bottomMenu.querySelector("#starred");
const viewRecentContent : HTMLButtonElement = bottomMenu.querySelector("#recents");
const viewTrashedContent : HTMLButtonElement = bottomMenu.querySelector("#trash");

const searchBar : HTMLInputElement = document.querySelector("#search");
const addContent : HTMLButtonElement = document.querySelector("#add-content");
const moreOptions : HTMLButtonElement = document.querySelector(".more-options");

const folderNavigation : HTMLElement = document.querySelector(".folder-nav");
const navigationBackButton : HTMLButtonElement = folderNavigation.querySelector(".back-button");
const emptyTrashButton : HTMLButtonElement = folderNavigation.querySelector(".empty-trash-button");
const lockVaultButton : HTMLButtonElement = folderNavigation.querySelector(".lock-vault-button");

const userContentLoadingSpinner : HTMLSpanElement = document.querySelector(".user-content > span");

const vault : HTMLDivElement = document.querySelector(".vault");
const vaultInfo : HTMLDivElement = document.querySelector(".vault-info");

const foldersContainer : HTMLDivElement = document.querySelector(".folders-container");
const folderSelector : string = "div.folder";

const filesContainer : HTMLDivElement = document.querySelector(".files-container");
const fileSelector : string = "div.file";

const showFile : HTMLDivElement = document.querySelector(".show-file");
const editorMenuSelector : string = ".show-file .tabs .tab .menu";
const editorTabs : HTMLElement = showFile.querySelector(".tabs");
const editorElement : HTMLDivElement = document.querySelector("#editor");

let editor : any, editorSavedValue : string;
const editorModels : Map<string, any> = new Map<string, any>();

const contextMenuContainer : HTMLDivElement = document.querySelector(".context-menu-container");
const contextMenu : HTMLDivElement = contextMenuContainer.querySelector(".context-menu");

const contextMenuContent : HTMLDivElement = contextMenu.querySelector("#cm-content");
const contextMenuView : HTMLButtonElement = contextMenuContent.querySelector("#cm-view");
const contextMenuSave : HTMLButtonElement = contextMenuContent.querySelector("#cm-save");
const contextMenuSaveToMyAccount : HTMLButtonElement = contextMenuContent.querySelector("#cm-save-to-my-account");
const contextMenuShare : HTMLButtonElement = contextMenuContent.querySelector("#cm-share");
const contextMenuSharingOptions : HTMLButtonElement = contextMenuContent.querySelector("#cm-sharing-options");
const contextMenuCopyShareableLink : HTMLButtonElement = contextMenuContent.querySelector("#cm-copy-shareable-link");
const contextMenuUnshare : HTMLButtonElement = contextMenuContent.querySelector("#cm-unshare");
const contextMenuMove : HTMLButtonElement = contextMenuContent.querySelector("#cm-move");
const contextMenuAddToFavourites : HTMLButtonElement = contextMenuContent.querySelector("#cm-add-to-favourites");
const contextMenuRemoveFromFavourites : HTMLButtonElement = contextMenuContent.querySelector("#cm-remove-from-favourites");
const contextMenuRename : HTMLButtonElement = contextMenuContent.querySelector("#cm-rename");
const contextMenuInfo : HTMLButtonElement = contextMenuContent.querySelector("#cm-info");
const contextMenuDownload : HTMLButtonElement = contextMenuContent.querySelector("#cm-download");
const contextMenuRestore : HTMLButtonElement = contextMenuContent.querySelector("#cm-restore");
const contextMenuDelete : HTMLButtonElement = contextMenuContent.querySelector("#cm-delete");
const contextMenuDisplayImage : HTMLButtonElement = contextMenuContent.querySelector("#cm-display-image");
const contextMenuDisplayPdf : HTMLButtonElement = contextMenuContent.querySelector("#cm-display-pdf");
const contextMenuValidateXml : HTMLButtonElement = contextMenuContent.querySelector("#cm-validate-xml");
const contextMenuValidateJson : HTMLButtonElement = contextMenuContent.querySelector("#cm-validate-json");

const contextMenuGeneric : HTMLDivElement = contextMenu.querySelector("#cm-generic");
const contextMenuAddFiles : HTMLButtonElement = contextMenuGeneric.querySelector("#cm-add-files");
const contextMenuAddFolder : HTMLButtonElement = contextMenuGeneric.querySelector("#cm-add-folder");
const contextMenuCreateFile : HTMLButtonElement = contextMenuGeneric.querySelector("#cm-create-file");
const contextMenuCreateFolder : HTMLButtonElement = contextMenuGeneric.querySelector("#cm-create-folder");

const contextMenuVault : HTMLDivElement = contextMenu.querySelector("#cm-vault");
const contextMenuCreateVault : HTMLButtonElement = contextMenuVault.querySelector("#cm-create-vault");
const contextMenuLockVault : HTMLButtonElement = contextMenuVault.querySelector("#cm-lock");
const contextMenuUnlockVault : HTMLButtonElement = contextMenuVault.querySelector("#cm-unlock");

const contextMenuTools : HTMLDivElement = contextMenu.querySelector("#cm-tools");

let contextMenuItem : HTMLElement;
let contextMenuItems : HTMLElement[];

const contextMenuMoveSelector : HTMLDivElement = contextMenu.querySelector("#move-selector");
const contextMenuMoveSelectorOptions : HTMLDivElement = contextMenuMoveSelector.querySelector(".options");

const emptyFolder : HTMLDivElement = document.querySelector(".empty-folder");

const filePreviewContainer : HTMLDivElement = document.querySelector(".file-preview-container");
const filePreview : HTMLDivElement = filePreviewContainer.querySelector(".file-preview");
const filePreviewSpinner : HTMLElement = filePreview.querySelector(".spinner");

let unsubscribeFoldersListener : any = null;
let unsubscribeFilesListener : any = null;

let folderShared : boolean = false;

let preventWindowUnload : any = {};

const IS_SHARED_FOLDER : boolean = location.pathname.startsWith("/folder/shared/");

window.addEventListener("userready", async () =>
{
    [addFiles, contextMenuAddFiles].forEach(element => element.addEventListener("click", () => fileInput.click()));

    [addFolder, contextMenuAddFolder].forEach(element => element.addEventListener("click", () => folderInput.click()));

    [createFile, contextMenuCreateFile, createFolder, contextMenuCreateFolder].forEach(element =>
        element.addEventListener("click", () =>
        {
            const isFile = element.contains(createFile) || element.contains(contextMenuCreateFile);

            const modal = new Modal({
                "title": Translation.Get(isFile ? "account->create_file" : "account->create_folder"),
                "allow": [
                    "close",
                    "confirm"
                ]
            });

            const input = <HTMLInputElement>new Input({
                attributes: {
                    id: "name",
                    placeholder: Translation.Get("generic->name")
                }
            }).element.querySelector("input");

            input.addEventListener("input", () => modal.ConfirmButton.disabled = input.value.length === 0);

            modal.ConfirmButton.disabled = true;

            modal.AppendContent([input.parentElement]);

            modal.OnConfirm = () =>
            {
                const name = input.value;

                modal.element.querySelectorAll(".input-error").forEach(element => element.remove());

                RemoveClass(input, "error");

                if (name.length > 0)
                {
                    isFile ? UploadFile("", name, 0, GetCurrentFolderId(true)) : UploadFolder([], name, "/", GetCurrentFolderId(true), 0);

                    modal.HideAndRemove();
                }
                else
                {
                    input.parentElement.insertAdjacentElement("beforebegin", new Component("p", {
                        innerText: Translation.Get("errors->empty"),
                        class: "input-error"
                    }).element);

                    AddClass(input, "error");
                }
            }

            modal.Show(true);

            input.focus();
        }));

    viewMyAccount.addEventListener("click", () =>
    {
        SetCurrentFolderId("root");

        if (location.pathname !== "/account") history.pushState(null, "", "/account");

        GetUserContent();

        UpdateBottomSectionBar(viewMyAccount);
    });

    viewSharedContent.addEventListener("click", () =>
    {
        if (location.pathname !== "/account/shared") history.pushState(null, "", "/account/shared");

        SetCurrentFolderId("shared");

        GetUserContent();

        UpdateBottomSectionBar(viewSharedContent);
    });

    viewStarredContent.addEventListener("click", () =>
    {
        if (!starredOnly()) history.pushState(null, "", "/account/starred");

        SetCurrentFolderId("starred");

        GetUserContent();

        UpdateBottomSectionBar(viewStarredContent);
    });

    viewRecentContent.addEventListener("click", () =>
    {
        if (!recentsOnly()) history.pushState(null, "", "/account/recents");

        SetCurrentFolderId("root"); // Reset it to default

        GetUserContent(null, "updated", "desc", 20, true, false);

        UpdateBottomSectionBar(viewRecentContent);
    });

    viewTrashedContent.addEventListener("click", () =>
    {
        if (!trashedOnly()) history.pushState(null, "", "/account/trash");

        SetCurrentFolderId("trash");

        GetUserContent();

        UpdateBottomSectionBar(viewTrashedContent);

        emptyTrashButton.disabled = true;
    });

    searchBar.addEventListener("input", () => GetUserContent(searchBar.value));

    searchBar.addEventListener("focusin", () => HideHeaderMenu());

    addContent.addEventListener("click", () =>
    {
        const modal = new Modal({ allow: [ "close" ] });

        modal.AppendContent([addContentOptions]);

        ShowElement(modal.Content.querySelector(".add-content-options"));

        addContent.blur();

        addContentOptions.querySelectorAll("button").forEach(element => element.addEventListener("click", () => modal.HideAndRemove()));

        modal.Show(true);
    });

    moreOptions.addEventListener("click", showContextMenu);

    fileInput.addEventListener("change", (e) =>
    {
        const files : FileList = (<HTMLInputElement>e.target).files;

        UploadFiles(Array.from(files), GetCurrentFolderId(true));

        fileInput.value = null;
    });

    folderInput.addEventListener("change", (e) =>
    {
        const files : FileList = (<HTMLInputElement>e.target).files;
        const folderName : string = (<any>files[0]).webkitRelativePath.split("/")[0];

        UploadFolder(Array.from(files), folderName, folderName + "/", GetCurrentFolderId(true), 0);

        folderInput.value = null;
    });

    contextMenuView.addEventListener("click", () =>
        [...contextMenuItems, contextMenuItem].filter(Boolean).forEach((item, index, array) => HandlePageChangeAndLoadUserContent(null, item, array.length > 1)));

    contextMenuSave.addEventListener("click", () =>
    {
        const value = editor.getValue();
        const id = editorTabs.querySelector(".active").id.split("-")[1];

        UploadFile(value, (<HTMLElement>editorTabs.querySelector(".active").querySelector(".name")).innerText, value.length, GetCurrentFolderId(true), id);

        db.collection(`users/${Auth.UserId}/files`).doc(id).update({ ...GetFirestoreUpdateTimestamp() });

        preventWindowUnload.editor = false;

        editorSavedValue = value;

        RemoveClass(editorTabs.querySelector(".active"), "modified");
    });

    contextMenuSaveToMyAccount.addEventListener("click", () =>
    {
        [...contextMenuItems, contextMenuItem].filter(Boolean).forEach(item =>
            functions.httpsCallable("saveToMyAccount")({
                userId: Auth.UserId,
                id: item.id,
                type: item.classList[0]
            }));

        preventWindowUnload.editor = false;
    });

    contextMenuShare.addEventListener("click", () =>
    {
        const id = contextMenuItem.id;
        const type = contextMenuItem.classList[0];

        db.collection(`users/${Auth.UserId}/${type}s`).doc(id).update({
            shared: true,
            ...GetFirestoreUpdateTimestamp()
        });

        if (type === "folder") functions.httpsCallable("shareFolder")({ id, shared: true });

        if ((<any>navigator).share) contextMenuSharingOptions.click();
        else contextMenuCopyShareableLink.click();

        analytics.logEvent("share", {
            method: (<any>navigator).share ? "share_api" : "shareable_link",
            content_type: type,
            content_id: id,
        });
    });

    contextMenuSharingOptions.addEventListener("click", () => (<any>navigator).share({
        title: "Denvelope",
        text: `${Translation.Get("share->check_out")} ${(<HTMLElement>contextMenuItem.querySelector(".name p")).innerText} ${Translation.Get("share->on_denvelope")}`,
        url: getUserContentURL(contextMenuItem, true),
    }));

    contextMenuCopyShareableLink.addEventListener("click", () => navigator.clipboard.writeText(getUserContentURL(contextMenuItem, true)));

    contextMenuUnshare.addEventListener("click", () =>
    {
        const id = contextMenuItem.id;
        const type = contextMenuItem.classList[0];

        db.collection(`users/${Auth.UserId}/${type}s`).doc(id).update({
            shared: false,
            ...GetFirestoreUpdateTimestamp()
        });

        if (type === "folder") functions.httpsCallable("shareFolder")({ id, shared: false });
    });

    contextMenuMove.addEventListener("click", () =>
    {
        const tempArray = [...contextMenuItems, contextMenuItem].filter(Boolean);

        let currentId = GetCurrentFolderId();

        HideElements([ contextMenuContent, contextMenuGeneric ]);

        ShowElement(contextMenuMoveSelector);

        const ShowAvailableFoldersIn = async (id : string) =>
        {
            if (id === "root") HideElement(contextMenuMoveSelector.querySelector(".back"));
            else ShowElement(contextMenuMoveSelector.querySelector(".back"));

            ShowElement(contextMenuMoveSelector.querySelector(".spinner"));

            contextMenuMoveSelectorOptions.innerHTML = "";

            db.collection(`users/${Auth.UserId}/folders`).where("inVault", "==", await vaultOnly()).where("parentId", "==", id).get().then((docs : any) =>
            {
                HideElement(contextMenuMoveSelector.querySelector(".spinner"));

                contextMenuMoveSelectorOptions.innerHTML = "";
    
                docs.forEach((doc : any) =>
                {
                    if (tempArray.filter(element => element.id === doc.id).length === 0)
                    {
                        const element = new Component("div", {
                            id: doc.id,
                            children: [
                                new Component("button", {
                                    class: "select",
                                    children: [
                                        new Component("i", { class: "fas fa-folder" }).element,
                                        new Component("span", { innerText: doc.data().name }).element,
                                    ]
                                }).element,
                                new Component("button", {
                                    class: "goto",
                                    children: [ new Component("i", { class: "fas fa-chevron-right" }).element ]
                                }).element,
                            ]
                        }).element;
    
                        contextMenuMoveSelectorOptions.appendChild(element);
        
                        element.querySelector(".select").addEventListener("click", async () => MoveElements(tempArray, element.id));
                        element.querySelector(".goto").addEventListener("click", () =>
                        {
                            currentId = doc.id;

                            ShowAvailableFoldersIn(doc.id);
                        });
                    }
                });
    
                if (contextMenuMoveSelectorOptions.innerHTML.trim().length === 0)
                    contextMenuMoveSelectorOptions.appendChild(new Component("p", {
                        innerText: Translation.Get("account->context_menu->move->impossible")
                    }).element);
            });
        }

        contextMenuMoveSelector.querySelector(".back").addEventListener("click", async () =>
        {
            HideElement(contextMenuMoveSelector.querySelector(".back"));

            ShowElement(contextMenuMoveSelector.querySelector(".spinner"));

            contextMenuMoveSelectorOptions.innerHTML = "";

            const parentId = (await db.collection(`users/${Auth.UserId}/folders`).doc(currentId).get()).data().parentId;

            ShowAvailableFoldersIn(parentId);
        });

        ShowAvailableFoldersIn(currentId);
    });

    [contextMenuAddToFavourites, contextMenuRemoveFromFavourites].forEach(element => element.addEventListener("click", () =>
    {
        const batch = db.batch();

        [...contextMenuItems, contextMenuItem].filter(Boolean).forEach(item =>
            batch.update(db.collection(`users/${Auth.UserId}/${item.classList[0]}s`).doc(item.id), {
                starred: contextMenuAddToFavourites.contains(element),
                ...GetFirestoreUpdateTimestamp()
            }));

        batch.commit();
    }));

    contextMenuRename.addEventListener("click", () =>
    {
        const id = contextMenuItem.id;
        const type = contextMenuItem.classList[0];

        const modal = new Modal({
            "allow": [
                "close",
                "update"
            ]
        });

        const nameInput = new Input({
            attributes: {
                class: "name",
                placeholder: Translation.Get("generic->name")
            }
        }).element;

        const input : HTMLInputElement = nameInput.querySelector(".name");

        input.addEventListener("input", () => modal.UpdateButton.disabled = input.value.length === 0);

        modal.AppendContent([ nameInput ]);

        input.value = (<HTMLParagraphElement>contextMenuItem.querySelector(".name p")).innerText;

        modal.OnUpdate = async () =>
        {
            const name = input.value;

            modal.element.querySelectorAll(".input-error").forEach(element => element.remove());

            RemoveClass(input, "error");

            modal.Hide();

            const parentId = (await db.collection(`users/${Auth.UserId}/${type}s`).doc(id).get()).data().parentId;

            const tempSnapshot = await db
                .collection(`users/${Auth.UserId}/${type}s`)
                .where("inVault", "==", await vaultOnly())
                .where("parentId", "==", parentId)
                .where("name", "==", name)
                .get();

            if (name.length > 0 && (tempSnapshot.size === 0 || tempSnapshot.docs[0].id === id))
            {
                db.collection(`users/${Auth.UserId}/${type}s`).doc(id).update({
                    name,
                    ...GetFirestoreUpdateTimestamp()
                });

                modal.HideAndRemove();
            }
            else
            {
                modal.Show(true);

                input.parentElement.insertAdjacentElement("beforebegin", new Component("p", {
                    innerText: Translation.Get(`errors->${name.length === 0 ? "empty" : "user_content->already_exists"}`),
                    class: "input-error"
                }).element);

                AddClass(input, "error");
            }
        }

        modal.Show(true);

        input.focus();
    });

    contextMenuInfo.addEventListener("click", () =>
    {
        const id = contextMenuItem.id;
        const type = contextMenuItem.classList[0];

        const modal = new Modal({ allow: [ "close" ] });

        modal.Show(true);

        analytics.logEvent("view_item", {
            items: [
                {
                    content_type: type,
                    content_id: id
                }
            ]
        });

        const unsubscribe = db.collection(`users/${Auth.UserId}/${type}s`).doc(id).onSnapshot(async (doc : any) =>
        {
            if (!doc.exists || doc.data().trashed)
            {
                modal.HideAndRemove();

                unsubscribe();

                return;
            }

            modal.RemoveContent();

            const data = doc.data();

            const name = data.name;

            let dateFormatOptions;

            if (Auth.IsAuthenticated)
            {
                dateFormatOptions = (await db.collection(`users/${Auth.UserId}/config`).doc("preferences").get()).data().dateFormatOptions;

                if (dateFormatOptions === "default") dateFormatOptions = null;
            }

            modal.AppendContent([
                new Component("p", {
                    children: [
                        new Component("span", { innerText: Translation.Get("generic->id") }).element,
                        new Component("span", { innerText: doc.id }).element
                    ]
                }).element,
                new Component("p", {
                    children: [
                        new Component("span", { innerText: Translation.Get("generic->name") }).element,
                        new Component("span", { innerText: name }).element
                    ]
                }).element,
                new Component("p", {
                    children: [
                        new Component("span", { innerText: Translation.Get("generic->type") }).element,
                        new Component("span", { innerText: Linguist.GetDisplayName(<string>Linguist.Detect(name, type === "file")) || Translation.Get(`generic->${type}`) }).element
                    ]
                }).element,
                new Component("p", {
                    children: [
                        new Component("span", { innerText: Translation.Get("generic->created") }).element,
                        new Component("span", { innerText: FormatDate(data.created.seconds * 1000, dateFormatOptions) }).element
                    ]
                }).element,
                new Component("p", {
                    children: [
                        new Component("span", { innerText: Translation.Get("generic->last_modified") }).element,
                        new Component("span", { innerText: FormatDate(data.updated.seconds * 1000, dateFormatOptions) }).element
                    ]
                }).element,
                type === "file"
                    ? new Component("p", {
                        children: [
                            new Component("span", { innerText: Translation.Get("generic->size") }).element,
                            new Component("span", { innerText: FormatStorage(data.size || 0) }).element
                        ]
                    }).element
                    : null,
            ]);

            if (Auth.IsAuthenticated)
            {
                const parentFolderUrl = GetFolderUrl(data.parentId, false);

                const contentPosition = new Component("p", {
                    children: [
                        new Component("span", { innerText: Translation.Get("generic->position") }).element,
                        new Component("a", {
                            href: parentFolderUrl,
                            innerText: data.parentId === "root"
                                ? Translation.Get("account->title")
                                : (data.parentId === "vault"
                                    ? Translation.Get("generic->vault")
                                    : (await db.collection(`users/${Auth.UserId}/folders`).doc(data.parentId).get()).data().name
                                )
                        }).element
                    ]
                }).element;

                contentPosition.querySelector("a").addEventListener("click", e =>
                {
                    e.preventDefault();

                    if (location.href !== parentFolderUrl) history.pushState(null, "", parentFolderUrl);

                    SetCurrentFolderId(data.parentId);

                    GetUserContent();

                    UpdateBottomSectionBar(viewMyAccount);

                    modal.HideAndRemove();
                });

                modal.AppendContent([
                    new Component("p", {
                        children: [
                            new Component("span", { innerText: Translation.Get("generic->shared") }).element,
                            new Component("span", { innerText: Translation.Get(`generic->${data.shared ? "yes" : "no"}`) }).element
                        ]
                    }).element,
                    new Component("p", {
                        children: [
                            new Component("span", { innerText: Translation.Get("generic->starred") }).element,
                            new Component("span", { innerText: Translation.Get(`generic->${data.starred ? "yes" : "no"}`) }).element
                        ]
                    }).element,
                    contentPosition,
                ]);
            }
        });

        modal.OnClose = unsubscribe;
    });

    contextMenuDownload.addEventListener("click", () =>
        [...contextMenuItems, contextMenuItem].filter(Boolean).forEach(async item =>
        {
            const id = item.id;
            const type = item.classList[0];

            let folderFormat : string;

            if (type === "folder" && contextMenuItems?.length <= 1)
            {
                const modal = new Modal({
                    title: Translation.Get("api->messages->folder->choose_download_format"),
                    allow: [ "close" ]
                });
    
                modal.AppendContent([
                    new Component("button", {
                        id: "zip",
                        innerText: ".zip"
                    }).element,
                    new Component("button", {
                        id: "tar",
                        innerText: ".tar"
                    }).element,
                    new Component("button", {
                        id: "tar-gz",
                        innerText: ".tar.gz"
                    }).element
                ]);
    
                modal.Show();
    
                await new Promise(resolve => modal.Content.querySelectorAll("#zip, #tar, #tar-gz").forEach(element => element.addEventListener("click", async () =>
                {
                    modal.HideAndRemove();

                    folderFormat = element.id.replace("-",".")
    
                    resolve();
                })));
            }

            DownloadContent(id, (<HTMLParagraphElement>item.querySelector(".name p")).innerText, type === "folder");
        }));

    [contextMenuDelete, contextMenuRestore].forEach(element => element.addEventListener("click", async () =>
    {
        const tempArray = [...contextMenuItems, contextMenuItem].filter(Boolean); // waiting for vaultOnly() caused contextMenuItem to become null on HideContextMenu()

        const batch = db.batch();

        const inVault = await vaultOnly();

        tempArray.forEach(item =>
        {
            const id = item.id;
            const type = item.classList[0];

            const trashed = document.getElementById(id).getAttribute("data-trashed") === "true";

            const docRef = db.collection(`users/${Auth.UserId}/${type}s`).doc(id);
    
            if (!inVault && (!trashed || (trashed && contextMenuRestore.contains(element)))) // If the content is in the vault it is immediately deleted
            {
                batch.update(docRef, {
                    trashed: !trashed,
                    ...GetFirestoreUpdateTimestamp()
                });

                analytics.logEvent(!trashed ? "trash" : "restore", {
                    content_type: type,
                    content_id: id,
                });
            }
            else
            {
                batch.delete(docRef);

                analytics.logEvent("delete", {
                    content_type: type,
                    content_id: id
                });
            }
        });

        batch.commit();

        if (IsSet(contextMenuItem) || contextMenuItems?.length === 1)
            genericMessage.Show(Translation.Get(`api->messages->${contextMenuItems[0]?.classList[0] ?? contextMenuItem.classList[0]}->${
                inVault
                    ? "deleted"
                    : document.getElementById(contextMenuItems[0]?.id ?? contextMenuItem.id).getAttribute("data-trashed") === "true"
                        ? (contextMenuRestore.contains(element) ? "restored" : "deleted")
                        : "moved_to_trash"
            }`));
        
        if (IsShowFileVisible())
        {
            preventWindowUnload.editor = false;

            CloseEditor();
        }
    }));

    contextMenuDisplayImage.addEventListener("click", async () =>
    {
        ShowElement(filePreviewContainer);

        const img = new Image();

        const canvas = document.createElement("canvas");

        const ctx = canvas.getContext("2d");

        img.onload = () =>
        {
            HideElement(filePreviewSpinner);
            
            filePreview.appendChild(canvas);

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
        };

        img.onerror = () => filePreviewContainer.click();

        img.src = await storage.ref(`${Auth.UserId}/${contextMenuItem.id}`).getDownloadURL();

        let scale = 1;

        const ScaleImage = (e : WheelEvent) =>
        {
            scale += e.deltaY < 0 ? /* UP (zoom in) */ 0.1 : -0.1 ;

            if (scale < 0.1) return;

            const scaleString = `scale(${scale})`;

            canvas.style.transform = canvas.style.transform.split(" ").map(value => value.indexOf("scale") > -1 ? scaleString : value).join(" ");
        
            if (canvas.style.transform.indexOf("scale") === -1) canvas.style.transform += scaleString;
        }

        let rotateAngle = 0;

        const RotateImage = (e : KeyboardEvent) =>
        {
            if (e.key.toLowerCase() !== "r" || e.ctrlKey) return;

            rotateAngle += e.shiftKey ? -90 : 90;

            const rotateString = `rotate(${rotateAngle}deg)`;

            canvas.style.transform = canvas.style.transform.split(" ").map(value => value.indexOf("rotate") > -1 ? rotateString : value).join(" ");

            if (canvas.style.transform.indexOf("rotate") === -1) canvas.style.transform += rotateString;
        }

        let translateX = 0;
        let translateY = 0;

        const MoveImageWithKeyboard = (e : KeyboardEvent) =>
        {
            const key = e.key.toLowerCase();

            if (!key.startsWith("arrow")) return;

            const moveBy = 10;

            switch (key)
            {
                case "arrowleft": translateX += moveBy; break;
                case "arrowup": translateY += moveBy; break;
                case "arrowright": translateX -= moveBy; break;
                case "arrowdown": translateY -= moveBy; break;
            }

            const translateString = `translateX(${translateX}px) translateY(${translateY}px)`;

            canvas.style.transform = canvas.style.transform.split(" ").map(value =>
                value.indexOf("translateX") > -1
                    ? translateString.split(" ")[0]
                    : (value.indexOf("translateY") > -1
                        ? translateString.split(" ")[1]
                        : value)
            ).join(" ");

            if (canvas.style.transform.indexOf("translate") === -1) canvas.style.transform += translateString;
        }

        let offsetX : number, offsetY : number;

        const MoveImageWithMouse = (e : MouseEvent) =>
        {
            // If mousedown hasn't been fired on the image element
            if (e.target !== canvas && e.type === "mousedown") return;

            if (offsetX === undefined && offsetY === undefined)
            {
                offsetX = e.offsetX + translateX;
                offsetY = e.offsetY + translateY;
            }

            const top : number = e.pageY - offsetY;
            const left : number = e.pageX - offsetX;
        
            Object.assign(canvas.style, {
                top: top + "px",
                left: left + "px",
                transformOrigin: `${offsetX}px ${offsetY}px`
            });

            document.addEventListener("mousemove", MoveImageWithMouse);

            const Reset = () =>
            {
                offsetX = offsetY = undefined;

                document.removeEventListener("mousemove", MoveImageWithMouse);
                document.removeEventListener("mouseup", Reset);
            }

            document.addEventListener("mouseup", Reset);
        }

        const RemoveContent = (e : MouseEvent) =>
        {
            if (!canvas.contains(<HTMLElement>e.target))
            {
                HideElement(filePreviewContainer);

                canvas.remove();

                document.removeEventListener("wheel", ScaleImage);
                document.removeEventListener("keydown", RotateImage);
                document.removeEventListener("keydown", MoveImageWithKeyboard);
                document.removeEventListener("mousedown", MoveImageWithMouse);

                filePreviewContainer.removeEventListener("click", RemoveContent);
            }
        }

        filePreviewContainer.addEventListener("click", RemoveContent);

        document.addEventListener("wheel", ScaleImage);
        document.addEventListener("keydown", RotateImage);
        document.addEventListener("keydown", MoveImageWithKeyboard);
        document.addEventListener("mousedown", MoveImageWithMouse);
    });

    contextMenuDisplayPdf.addEventListener("click", async () =>
    {
        ShowElement(filePreviewContainer);

        const iframe = document.createElement("iframe");

        iframe.src = await storage.ref(`${Auth.UserId}/${contextMenuItem.id}`).getDownloadURL();
        iframe.frameBorder = "0";

        iframe.onload = () =>
        {
            HideElement(filePreviewSpinner);

            ShowElement(iframe);
        };

        iframe.onerror = () => filePreviewContainer.click();

        HideElement(iframe);

        filePreview.appendChild(iframe);

        const RemoveContent = (e : MouseEvent) =>
        {
            if (!iframe.contains(<HTMLElement>e.target))
            {
                HideElement(filePreviewContainer);

                iframe.remove();

                filePreviewContainer.removeEventListener("click", RemoveContent);
            }
        }

        filePreviewContainer.addEventListener("click", RemoveContent);
    });

    contextMenuValidateXml.addEventListener("click", () =>
    {
        const dom = new DOMParser().parseFromString(editor.getValue(), "text/xml");

        const message : string = dom.getElementsByTagName("parsererror").length > 0
            ? dom.getElementsByTagName('parsererror')[0].getElementsByTagName('div')[0].innerHTML
            : Translation.Get("generic->no_errors_found");

        genericMessage.Show(message);
    });

    contextMenuValidateJson.addEventListener("click", () =>
    {
        let message : string;

        try
        {
            JSON.parse(editor.getValue());

            message = Translation.Get("generic->no_errors_found");
        }
        catch (e)
        {
            message = e;
        }

        genericMessage.Show(message);
    });

    [ contextMenuCreateVault, contextMenuUnlockVault ].forEach(element => element.addEventListener("click", () => vault.click()));

    contextMenuLockVault.addEventListener("click", () => lockVaultButton.click());

    navigationBackButton.addEventListener("click", async () =>
    {
        HideElement(emptyFolder);

        ShowElement(userContentLoadingSpinner);

        EmptyUserContentContainers();

        folderNavigation.querySelector("[data-update-field=folder-name]").innerHTML = "";
        folderNavigation.querySelector("[data-update-field=folder-name]").insertAdjacentElement("afterbegin", new Spinner().element);

        if (await vaultOnly(false))
        {
            viewMyAccount.click();
            
            return;
        }

        db.collection(`users/${Auth.UserId}/folders`).doc(GetCurrentFolderId()).get().then((doc : any) =>
        {
            const parentId = doc.data().parentId;

            if (parentId === "vault")
            {
                vault.click();

                return;
            }

            SetCurrentFolderId(parentId);

            const url = GetFolderUrl(GetCurrentFolderId(), IsShared());

            if (location.href !== url) history.pushState(null, "", url);

            GetUserContent();
        });
    });

    emptyTrashButton.addEventListener("click", () =>
    {
        emptyTrashButton.disabled = true;

        functions.httpsCallable("emptyTrash")({});
    });

    lockVaultButton.addEventListener("click", async () =>
    {
        functions.httpsCallable("lockVault")({}).then(() => Auth.RefreshToken());

        viewMyAccount.click();
    });

    whatIsTakingUpSpace.addEventListener("click", e =>
    {
        e.preventDefault();

        HideHeaderMenu();

        if (location.pathname !== "/account/storage/info") history.pushState(null, "", "/account/storage/info");

        SetCurrentFolderId("root"); // Reset it to default

        GetUserContent(null, "size", "desc", 20, true, false);

        UpdateBottomSectionBar(viewMyAccount);
    });

    document.addEventListener("click", e =>
    {
        const target = <HTMLElement>e.target;

        if(target.closest(`${folderSelector} .menu-button, ${fileSelector} .menu-button, .vault .menu-button`) === null &&
            target.closest(editorMenuSelector) === null && target.closest("#cm-move") === null && !moreOptions.contains(target) &&
            target.closest(".goto, .back") === null) HideContextMenu();

        if ((<HTMLElement[]>[...foldersContainer.children, ...filesContainer.children]).filter(element => HasClass(element, "selected")).length === 0)
            contextMenuItems = [];
    });

    document.addEventListener("scroll", () => HideContextMenu());

    document.addEventListener("contextmenu", e =>
        // Allow custom context menu only in non-touch devices, outside of any .allow-context-menu and inside .user-content
        (!IsTouchDevice() && (<HTMLElement>e.target).closest(".allow-context-menu") === null && (<HTMLElement>e.target).closest(".user-content") !== null)
            ? showContextMenu(e)
            : HideContextMenu());

    document.addEventListener("drop", e =>
    {
        const items : DataTransferItemList = e.dataTransfer.items;

        Array.from(items).map(item => item.webkitGetAsEntry()).forEach((item : any) =>
        {
            if (item.isFile) item.file((file : File) => UploadFile(file, file.name, file.size, GetCurrentFolderId(true)));
            else if (item.isDirectory)
            {
                const entries : File[] = [];

                GetFolderEntries(item, item.name + "/", entries);

                UploadFolder(entries, item.name, item.name + "/", GetCurrentFolderId(true), 0);
            }
        });
    });

    foldersContainer.parentElement.addEventListener("mousedown", e =>
    {
        if (isUserContentElement(<HTMLElement>e.target) && e.button === 2 && !HasClass(GetUserContentElement(<HTMLElement>e.target), "selected"))
            (<HTMLElement[]>[...foldersContainer.children, ...filesContainer.children]).forEach(element => RemoveClass(element, "selected"));

        if (isUserContentElement(<HTMLElement>e.target)) return;
        
        (<HTMLElement[]>[...foldersContainer.children, ...filesContainer.children]).forEach(element => RemoveClass(element, "selected"));

        if (e.button === 2) return;

        const multipleContentSelector = new Component("div", {
            class: "multiple-content-selector",
            style: {
                top: e.pageY + "px",
                left: e.pageX + "px",
            }
        }).element;

        document.body.appendChild(multipleContentSelector);

        const UpdateContentSelectorSize = (ev : MouseEvent) =>
        {
            ShowElement(multipleContentSelector);

            HideContextMenu();

            let width = e.pageX - ev.pageX;
            let height = e.pageY - ev.pageY;

            const top = e.pageY - Math.max(height, 0);
            const left = e.pageX - Math.max(width, 0);

            if (Math.abs(width) + left > document.documentElement.scrollWidth) width = document.documentElement.scrollWidth - left;

            if (Math.abs(height) + top + bottomMenu.clientHeight > document.documentElement.scrollHeight)
                height = document.documentElement.scrollHeight - top - bottomMenu.clientHeight;

            Object.assign(multipleContentSelector.style, {
                top: top + "px",
                left: left + "px",
                width: Math.abs(width) + "px",
                height: Math.abs(height) + "px"
            });

            // Highlight selected content
            (<HTMLElement[]>[...foldersContainer.children, ...filesContainer.children]).forEach(element =>
            {
                const elementRect : DOMRect = element.getBoundingClientRect();
                const selectedRect : DOMRect = multipleContentSelector.getBoundingClientRect();
    
                if (elementRect.top <= selectedRect.bottom && elementRect.bottom >= selectedRect.top && elementRect.left <= selectedRect.right && elementRect.right >= selectedRect.left)
                    AddClass(element, "selected");
                else RemoveClass(element, "selected");
            });

            contextMenuItem = null;
            contextMenuItems = (<HTMLElement[]>[...foldersContainer.children, ...filesContainer.children]).filter(element => HasClass(element, "selected"));
        }

        document.addEventListener("mousemove", UpdateContentSelectorSize);

        document.addEventListener("mouseup", () =>
        {
            document.removeEventListener("mousemove", UpdateContentSelectorSize);

            multipleContentSelector.remove();
        });
    });

    vault.addEventListener("click", e =>
    {
        if (vault.querySelector(".menu-button button").contains(<HTMLElement>e.target)) return;

        db.collection(`users/${Auth.UserId}/vault`).doc("status").get().then((snapshot : any) =>
        {
            const LoadVault = () =>
            {
                if (location.pathname !== "/account/vault") history.pushState(null, "", "/account/vault");

                SetCurrentFolderId("vault");

                GetUserContent();

                Auth.RefreshToken();
            }

            if (snapshot.exists && !snapshot.data().locked)
            {
                LoadVault();

                return;
            }

            const modal = new Modal({
                title: Translation.Get(`api->messages->vault->${snapshot.exists ? "unlock" : "set_pin"}`),
                allow: [ "confirm", "close" ]
            });

            const vaultPinInput = new InputWithIcon({
                attributes: {
                    id: "vault-pin",
                    placeholder: "PIN",
                    type: "password"
                },
                iconClassName: "fas fa-key fa-fw"
            }).element;

            const input = vaultPinInput.querySelector("input");

            input.addEventListener("input", () => modal.ConfirmButton.disabled = input.value.length < 4);

            modal.ConfirmButton.disabled = true;

            modal.AppendContent([ vaultPinInput ]);

            modal.OnConfirm = async () =>
            {
                const pin = input.value;

                if (HasClass(input, "error")) vaultPinInput.previousElementSibling.remove();

                RemoveClass(input, "error");

                modal.Hide();
                
                functions.httpsCallable(snapshot.exists ? "unlockVault" : "createVault")({ pin }).then((result : any) =>
                {
                    if (result.data.success)
                    {
                        modal.Remove();
                        
                        LoadVault();
                    }
                    else if (snapshot.exists)
                    {
                        AddClass(input, "error");

                        vaultPinInput.insertAdjacentElement("beforebegin", new Component("p", {
                            class: "input-error",
                            innerText: Translation.Get("api->messages->vault->wrong_pin")
                        }).element);

                        modal.Show(true);

                        input.focus();
                    }
                });
            }

            modal.Show(true);

            input.focus();
        });
    });

    navigator.serviceWorker?.addEventListener("message", e =>
    {
        if ("file" in e.data)
        {
            const file : File = e.data.file;

            UploadFile(file, file.name, file.size, "root");
        }
        else if ("add" in e.data)
        {
            if (e.data.add === "file") createFile.click();
            else if (e.data.add === "folder") createFolder.click();
        }
    });

    navigator.serviceWorker?.controller?.postMessage("ready");

    if (location.href.indexOf("/file/") > -1)
    {
        let id = location.href.indexOf("/shared/") > -1
            ? location.href.substr(location.href.indexOf("/file/shared/") + 13)
            : location.href.substr(location.href.indexOf("/file/") + 6);

        if (id.indexOf("/") > -1) id = id.substr(0, id.indexOf("/"));

        ShowFile(id);

        await db.collection(`users/${Auth.UserId}/files`).doc(id).get().then((doc : any) =>
        {
            SetCurrentFolderId(doc.data().parentId);

            GetUserContent();
        });
    }

    if (await vaultOnly()) Auth.RefreshToken();

    if (location.pathname === "/account/storage/info") whatIsTakingUpSpace.click();
    else if (recentsOnly()) viewRecentContent.click();
    else GetUserContent();

    if (Auth.IsAuthenticated)
    {
        db.collection(`users/${Auth.UserId}/config`).doc("preferences").onSnapshot((preferences : any) =>
        {
            const backgroundImageUrl = preferences.data()?.backgroundImageUrl;
            
            document.body.style.backgroundImage = backgroundImageUrl ? `url(${backgroundImageUrl})` : "";
        });

        db.collection(`users/${Auth.UserId}/vault`).doc("status").onSnapshot((snapshot : any) =>
        {
            if (snapshot.exists)
            {
                const locked : boolean = snapshot.data().locked;

                (<HTMLParagraphElement>vault.querySelector(".name p")).innerText = Translation.Get("generic->vault") + " ";

                const icon = document.createElement("i");
                icon.className = `fas fa-lock${locked ? "" : "-open"}`;

                vault.querySelector(".name p").appendChild(icon);

                vault.setAttribute("data-locked", `${locked}`);

                locked ? AddClass(vault, "disabled") : RemoveClass(vault, "disabled");
            }

            Auth.RefreshToken();
        });
    }
});

window.addEventListener("resize", () => HideContextMenu());

window.addEventListener("popstate", async () =>
{
    let id : string = "root";

    if (location.href.indexOf("/account") === -1)
    {
        if (location.pathname.indexOf("/folder/") > -1) id = location.href.substr(location.href.indexOf("/folder/") + 8);
        else if (location.pathname.indexOf("/file/") > -1)
        {
            id = location.href.substr(location.href.indexOf("/file/") + 6);

            if (id.indexOf("/") > -1) id = id.substr(0, id.indexOf("/"));

            ShowFile(id);

            return;
        }
    }
    else if (location.pathname.indexOf("/account/shared/") > -1) id = location.href.substr(location.href.indexOf("/account/shared/") + 16);

    if (id.indexOf("/") > -1) id = id.substr(0, id.indexOf("/"));

    SetCurrentFolderId(id);

    if (location.pathname === "/account/shared") viewSharedContent.click();
    else if (location.pathname === "/account/starred") viewStarredContent.click();
    else if (location.pathname === "/account/trash") viewTrashedContent.click();
    else if (location.pathname === "/account/storage/info") whatIsTakingUpSpace.click();
    else if (recentsOnly()) viewRecentContent.click();
    else
    {
        UpdateBottomSectionBar(viewMyAccount);

        GetUserContent();
    }
});

window.addEventListener("keydown", e =>
{
    const key = e.key.toLowerCase();

    if (["input", "textarea"].includes(document.activeElement.tagName.toLowerCase()) && !(IsShowFileVisible() && e.ctrlKey && key === "s")) return;

    if ([ "s", "n", "f" ].includes(key)) e.preventDefault();

    if (key === "o") { if (e.shiftKey) addFolder.click(); else addFiles.click(); }
    else if (key === "n") { if (e.shiftKey) createFolder.click(); else createFile.click(); }
    else if (key === "s")
    {
        if (e.ctrlKey && IsShowFileVisible())
        {
            if (Auth.IsAuthenticated) contextMenuSave.click();
            else if (Auth.IsSignedIn) contextMenuSaveToMyAccount.click();
        }
    }
    else if (key === "f")
    {
        if (!e.ctrlKey) viewMyAccount.click();
        else if (!IsShowFileVisible()) searchBar.focus();
    }
    else if (key === "c")
    {
        if (!e.ctrlKey) viewSharedContent.click();
    }
    else if (key === "p")
    {
        if (!e.ctrlKey) viewStarredContent.click();
    }
    else if (key === "r")
    {
        if (!e.ctrlKey) viewRecentContent.click();
    }
    else if (key === "t")
    {
        if (!e.ctrlKey) viewTrashedContent.click();
    }
    else if (key === "delete") contextMenuDelete.click();
    else if (key === "backspace") contextMenuItems?.length > 0 ? contextMenuDelete.click() : (GetCurrentFolderId() !== "root" ? navigationBackButton.click() : null);
    else if (key === "d") DownloadContent(GetCurrentFolderId(), document.title, true);
});

window.addEventListener("beforeunload", e =>
{
    // If at least one value is true
    if (Object.values(preventWindowUnload).some(value => <boolean>value))
    {
        e.preventDefault();

        e.returnValue = "";
    }
});

const hideVaultContent : HTMLElement = document.querySelector(".hide-vault-content");

document.addEventListener("visibilitychange", async () =>
{
    if (document.visibilityState === "hidden" && await vaultOnly()) ShowElement(hideVaultContent, "flex");
    else HideElement(hideVaultContent);
});

window.addEventListener("blur", async () =>
{
    if (await vaultOnly()) ShowElement(hideVaultContent, "flex");
});

window.addEventListener("focus", async () => HideElement(hideVaultContent));

const UploadFile = async (file : File | string, name : string, size : number, parentId : string, id ?: string) : Promise<void> => new Promise(async (resolve, reject) =>
{
    const usedStorage = parseInt((<HTMLInputElement>document.querySelector("[data-update-field=used-storage]")).getAttribute("data-bytes"));
    const maxStorage = parseInt((<HTMLInputElement>document.querySelector("[data-update-field=max-storage]")).getAttribute("data-bytes"));

    if (usedStorage + size > maxStorage)
    {
        reject();

        genericMessage.Show(Translation.Get("api->messages->user->not_enough_storage"));

        return;
    }

    const resolveUpload = () =>
    {
        preventWindowUnload.fileUpload = false;

        resolve();
    }

    const rejectUpload = (error : string) =>
    {
        preventWindowUnload.fileUpload = false;

        reject(error);
    }

    preventWindowUnload.fileUpload = true;

    const shared = GetCurrentFolderId() === "root" ? false : folderShared;
    const inVault = await vaultOnly();

    const metadata = { customMetadata: { shared: `${shared}`, inVault: `${inVault}` } };

    if (IsSet(id) && typeof file === "string")
        ShowFileUploadModal(storage.ref(Auth.UserId + "/" + id).putString(file, (<any>window).firebase.storage.StringFormat.RAW, metadata), name, size, id)
            .then(() => resolveUpload())
            .catch(error => rejectUpload(error));
    else
    {
        if (parentId === "shared" || parentId === "starred" || parentId === "trash") parentId = "root";

        name = await CheckElementNameValidity(name, "file", parentId);

        db.collection(`users/${Auth.UserId}/files`).add({
            name,
            parentId,
            shared,
            starred: false,
            trashed: false,
            inVault,
            created: GetFirestoreServerTimestamp(),
            ...GetFirestoreUpdateTimestamp()
        }).then((ref : any) =>
        {
            const id = ref.id;

            analytics.logEvent("create", {
                content_type: "file",
                content_id: id
            });
    
            if (typeof file !== "string") ShowFileUploadModal(storage.ref(Auth.UserId + "/" + id).put(file, metadata), name, size, id)
                .then(() => resolveUpload()).catch(error => rejectUpload(error));
            else ShowFileUploadModal(storage.ref(Auth.UserId + "/" + id).putString(file, (<any>window).firebase.storage.StringFormat.RAW, metadata), name, size, id)
                .then(() => resolveUpload()).catch(error => rejectUpload(error));
        });
    }
});

const ShowFileUploadModal = async (uploadTask : any, name : string, size : number, id : string) : Promise<void> => new Promise((resolve, reject) =>
{
    // Avoid showing the modal if the upload size is 0, and also avoid a division by 0 while calculating the progress if the file is empty
    if (size > 0)
    {
        const modal = new UploadModal(name, size);

        modal.OnPause = () => uploadTask.pause();
        modal.OnResume = () => uploadTask.resume();
        modal.OnCancel = () => uploadTask.cancel();

        uploadTask.on("state_changed", (snapshot : any) =>
        {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            modal.ProgressBar.style.width = progress + "%";
            modal.TransferSize.innerText = FormatStorage(snapshot.bytesTransferred);
        }, (error : any) =>
        {
            // Upload Error
            modal.Remove();

            reject(error);
        }, () =>
        {
            // Upload Success
            modal.Remove();

            analytics.logEvent("upload", {
                content_type: "file",
                content_id: id,
                size: size
            });

            resolve();
        });
    }
    else resolve();
});

const GetUserContent = async (searchTerm ?: string, orderBy ?: string, orderDir ?: "desc" | "asc", limit ?: number, globalSearch ?: boolean, includeFolders : boolean = true) =>
{
    const parentId = GetCurrentFolderId(true);

    EmptyUserContentContainers();

    if (globalSearch) HideElement(folderNavigation);

    if (Auth.IsAuthenticated && parentId === "root" && navigator.onLine && !searchTerm && !globalSearch) ShowElement(vault, "flex");
    else HideElement(vault);

    HideElement(vaultInfo);

    // The user is probably loading a file, this function will be called later when the file parentId is received by the client
    if (parentId === "") return;

    if (IsSet(unsubscribeFoldersListener)) unsubscribeFoldersListener();
    if (IsSet(unsubscribeFilesListener)) unsubscribeFilesListener();

    if (IsShowFileVisible() && location.pathname.indexOf("/file/") === -1) CloseEditor();

    if ((searchTerm ?? "").length === 0 && !globalSearch)
    {
        if (parentId !== "root" && GetCurrentFolderId(true) !== "shared" && !starredOnly() && !trashedOnly() && location.pathname.indexOf("/file/") === -1)
        {
            if (!await vaultOnly(false)) // If this isn't the vault root directory
            {
                folderNavigation.querySelector("[data-update-field=folder-name]").innerHTML = "";
                folderNavigation.querySelector("[data-update-field=folder-name]").insertAdjacentElement("afterbegin", new Spinner().element);

                await db.collection(`users/${Auth.UserId}/folders`).doc(parentId).get().then((doc : any) =>
                {
                    const data = doc.data();

                    document
                        .querySelectorAll("[data-update-field=folder-name]")
                        .forEach(element => (<HTMLElement>element).innerText = data.name);

                    folderShared = data.shared;

                    ShowElement(folderNavigation, "flex");

                    ShowElement(folderNavigation.querySelector("[data-update-field=folder-name]"));

                    HideElements([
                        emptyTrashButton,
                        lockVaultButton
                    ]);

                    if (Auth.IsAuthenticated) ShowElement(navigationBackButton, "flex");
                    else
                    {
                        const parentId : string = data.parentId;

                        // A user cannot access another user's root (even if only shared content is shown), only one folder (get operation) is allowed just to get the name
                        if (parentId === "root") HideElement(navigationBackButton);
                        else
                        {
                            db.collection(`users/${Auth.UserId}/folders`).doc(parentId).get()
                                .then(() => ShowElement(navigationBackButton, "flex")) // If the query succeeds the folder is shared
                                .catch(() => HideElement(navigationBackButton)); // Otherwise hide the navigation
                        }
                    }
                });
            }
            else
                (<NodeListOf<HTMLElement>>document.querySelectorAll("[data-update-field=folder-name]"))
                    .forEach(element => element.innerText = Translation.Get("generic->vault"));

            if (await vaultOnly())
            {
                ShowElements([
                    folderNavigation,
                    navigationBackButton,
                    vaultInfo
                ], "flex");

                ShowElement(lockVaultButton);

                HideElement(emptyTrashButton);
            }
        }
        else
        {
            if (trashedOnly())
            {
                ShowElement(folderNavigation, "flex");
                ShowElement(emptyTrashButton);

                HideElements([
                    navigationBackButton,
                    lockVaultButton,
                    folderNavigation.querySelector("[data-update-field=folder-name]")
                ]);
            }
            else HideElement(folderNavigation);

            if (location.pathname.indexOf("file") === -1)
                (<NodeListOf<HTMLElement>>document.querySelectorAll("[data-update-field=folder-name]"))
                    .forEach(element => element.innerText = Translation.Get("account->title"));
        }
    }

    (<HTMLDivElement>document.querySelector(".user-content")).style.height = `calc(100% - ${document.querySelector(".top-section").clientHeight}px)`;

    HideElement(emptyFolder);

    ShowElement(userContentLoadingSpinner);

    let callCount = 0; // The number of times UserContentLoaded has been called

    const UserContentLoaded = async (isUpdate : boolean) =>
    {
        callCount++;

        addUserContentEvents();

        if (AreUserContentContainersEmpty() && (callCount === 2 || isUpdate || (callCount === 1 && !includeFolders)))
        {
            emptyFolder.querySelector("h2").innerText = Translation.Get(`api->messages->folder->${
                !navigator.onLine
                    ? "offline"
                    : (searchTerm?.length > 0
                        ? "no_search_results"
                        : (recentsOnly()
                            ? "no_recents"
                            : (await vaultOnly(false)
                                ? "vault_empty"
                                : "empty"
                            )
                        )
                    )
            }`);

            emptyFolder.querySelector("img").src = `assets/img/miscellaneous/${
                !navigator.onLine
                    ? "offline"
                    : (sharedOnly()
                        ? "share"
                        : (starredOnly()
                            ? "starred"
                            : (recentsOnly()
                                ? "empty-recents"
                                : (trashedOnly()
                                    ? "trash"
                                    : (await vaultOnly(false)
                                        ? "vault"
                                        : "empty"
                                    )
                                )
                            )
                        )
                    )
            }.svg${await vaultOnly() ? "?v=3" : ""}`;

            ShowElement(emptyFolder, "flex");
        }

        if (searchTerm?.length > 0)
        {
            (<HTMLElement[]>[...foldersContainer.children, ...filesContainer.children])
                .filter(element => element.getAttribute("data-search-term") !== searchTerm)
                .forEach(element => element.remove());

            analytics.logEvent("view_search_results", { search_term: searchTerm });
        }

        emptyTrashButton.disabled = trashedOnly() && AreUserContentContainersEmpty();
    }

    const collator = new Intl.Collator(undefined, { numeric: true });

    const end = searchTerm?.replace(/.$/, (c : string) => String.fromCharCode(c.charCodeAt(0) + 1));

    let foldersRef = db.collection(`users/${Auth.UserId}/folders`).where("trashed", "==", trashedOnly());
    let filesRef = db.collection(`users/${Auth.UserId}/files`).where("trashed", "==", trashedOnly());

    if (sharedOnly())
    {
        foldersRef = foldersRef.where("shared", "==", true);
        filesRef = filesRef.where("shared", "==", true);
    }
    else if (starredOnly())
    {
        foldersRef = foldersRef.where("starred", "==", true);
        filesRef = filesRef.where("starred", "==", true);
    }

    if (!(sharedOnly() && Auth.IsAuthenticated) && !starredOnly() && !trashedOnly() && (searchTerm ?? "").length === 0 && !globalSearch)
    {
        foldersRef = foldersRef.where("parentId", "==", parentId);
        filesRef = filesRef.where("parentId", "==", parentId);
    }

    if (searchTerm?.length > 0)
    {
        foldersRef = foldersRef.where("name", ">=", searchTerm).where("name", "<", end);
        filesRef = filesRef.where("name", ">=", searchTerm).where("name", "<", end);

        analytics.logEvent("search", { search_term: searchTerm });
    }

    if (orderBy)
    {
        foldersRef = foldersRef.orderBy(orderBy, orderDir ?? "desc");
        filesRef = filesRef.orderBy(orderBy, orderDir ?? "desc");
    }

    if (limit)
    {
        foldersRef = foldersRef.limit(limit);
        filesRef = filesRef.limit(limit);
    }

    foldersRef = foldersRef.where("inVault", "==", await vaultOnly());
    filesRef = filesRef.where("inVault", "==", await vaultOnly() && !trashedOnly());

    let foldersUpdateCount = 0;

    if (includeFolders)
        unsubscribeFoldersListener = foldersRef.onSnapshot((snapshot : any) =>
        {
            HideElement(userContentLoadingSpinner);

            const elements = Array.from(<NodeListOf<HTMLElement>>foldersContainer.querySelectorAll(folderSelector));

            elements.forEach(element => AddClass(element, "old"));

            snapshot.docs
                .sort((a : any, b : any) => !orderBy ? collator.compare(a.data().name, b.data().name) : 0 /* DO NOT SORT ON THE CLIENT IF ORDERBY IS SET */)
                .forEach((doc : any) =>
                    CreateUserContent(
                        "folder",
                        doc.data().name,
                        doc.id,
                        doc.data().shared,
                        doc.data().starred,
                        doc.data().trashed
                    ).setAttribute("data-search-term", searchTerm ?? ""));

            foldersContainer.querySelectorAll(".old").forEach(element => element.remove());

            UserContentLoaded(foldersUpdateCount > 0);

            foldersUpdateCount++;
        });

    let filesUpdateCount = 0;

    unsubscribeFilesListener = filesRef.onSnapshot((snapshot : any) =>
    {
        HideElement(userContentLoadingSpinner);

        const elements = <NodeListOf<HTMLElement>>filesContainer.querySelectorAll(fileSelector);

        elements.forEach(element => AddClass(element, "old"));

        snapshot.docs
            .sort((a : any, b : any) => !orderBy ? collator.compare(a.data().name, b.data().name) : 0)
            .forEach((doc : any) =>
                CreateUserContent(
                    "file",
                    doc.data().name,
                    doc.id,
                    doc.data().shared,
                    doc.data().starred,
                    doc.data().trashed
                ).setAttribute("data-search-term", searchTerm ?? ""));

        filesContainer.querySelectorAll(".old").forEach(element => element.remove());

        UserContentLoaded(filesUpdateCount > 0);
       
        filesUpdateCount++;
    });

    LogPageViewEvent();
}

const showContextMenu = (e : MouseEvent) : void =>
{
    const target = <HTMLElement>e.target;
    const contentTarget = GetUserContentElement(<HTMLElement>e.target);

    contextMenuItem = null;
    contextMenuItems = (<HTMLElement[]>[...foldersContainer.children, ...filesContainer.children]).filter(element => HasClass(element, "selected"));

    // Every event would have been fired twice because with length === 1 as contextMenuItem would have been the same element
    if (contextMenuItems?.length === 1) contextMenuItems = [];

    HideElements([ contextMenuMoveSelector, contextMenuTools ]);

    if ((isUserContentElement(contentTarget) || target.closest(editorMenuSelector) !== null) && contextMenuItems.length <= 1)
    {
        ShowElements(<HTMLElement[]>[contextMenuContent, ...contextMenuContent.children]);

        if (isUserContentElement(contentTarget)) contextMenuItem = contentTarget;
        else contextMenuItem = document.getElementById(editorTabs.querySelector(".active").id.split("-")[1]);

        HideElements(<HTMLElement[]>[
            contextMenuGeneric,
            contextMenuVault,
            contextMenuView,
            contextMenuSave,
            contextMenuSaveToMyAccount,
            contextMenuShare,
            contextMenuSharingOptions,
            contextMenuCopyShareableLink,
            contextMenuUnshare,
            contextMenuAddToFavourites,
            contextMenuRemoveFromFavourites,
            contextMenuRestore,
            contextMenuDelete,
            contextMenuDownload
        ]);

        if (!Auth.IsAuthenticated || contextMenuItem.getAttribute("data-trashed") === "true")
            HideElements([
                contextMenuMove,
                contextMenuRename
            ]);
        else if (Auth.IsAuthenticated)
            ShowElements([
                contextMenuMove,
                contextMenuRename
            ]);

        if (contextMenuItem.getAttribute("data-trashed") === "false")
        {
            if (contextMenuItem.getAttribute("data-shared") === "true")
            {
                if ((<any>navigator).share) ShowElement(contextMenuSharingOptions);
                
                ShowElement(contextMenuCopyShareableLink);

                if (Auth.IsAuthenticated) ShowElement(contextMenuUnshare);
            }
            else ShowElement(contextMenuShare);

            if (contextMenuItem.getAttribute("data-starred") === "true" && Auth.IsAuthenticated) ShowElement(contextMenuRemoveFromFavourites);
            else if (Auth.IsAuthenticated) ShowElement(contextMenuAddToFavourites);

            if (target.closest(editorMenuSelector) === null) ShowElement(contextMenuView);
            else if (Auth.IsAuthenticated && IsSet(editor)) ShowElement(contextMenuSave);

            if (Auth.IsAuthenticated) ShowElement(contextMenuDelete);
            else if (Auth.IsSignedIn) ShowElement(contextMenuSaveToMyAccount);

            ShowElement(contextMenuInfo);

            if (navigator.onLine) ShowElement(contextMenuDownload);
        }
        else if (Auth.IsAuthenticated)
        {
            HideElements([
                contextMenuInfo,
                contextMenuDownload
            ]);

            ShowElements([
                contextMenuDelete,
                contextMenuRestore
            ]);
        }
    }
    else if (moreOptions.contains(target))
    {
        HideElements([ contextMenuContent, contextMenuGeneric, contextMenuVault ]);

        ShowElement(contextMenuTools);
    }
    else if (Auth.IsAuthenticated && contextMenuItems.length === 0)
    {
        HideElements([ contextMenuContent, contextMenuGeneric, contextMenuVault ]);

        if (!vault.contains(target)) ShowElements(<HTMLElement[]>[contextMenuGeneric, ...contextMenuGeneric.children]);
        else
        {
            const vaultLocked = vault.getAttribute("data-locked");

            HideElements(<HTMLElement[]>[ ...contextMenuVault.children ]);

            ShowElements([
                contextMenuVault,
                vaultLocked === "true" ? contextMenuUnlockVault : (vaultLocked === "false" ? contextMenuLockVault : contextMenuCreateVault)
            ]);
        }
    }
    else if (contextMenuItems.length > 1)
    {
        HideElements(<HTMLElement[]>[...contextMenuContent.children, contextMenuGeneric, contextMenuVault]);

        ShowElement(contextMenuContent);

        if (Auth.IsAuthenticated) ShowElement(contextMenuDelete);
        else if (Auth.IsSignedIn) ShowElement(contextMenuSaveToMyAccount);

        if (contextMenuItems.filter(element => element.getAttribute("data-trashed") === "false").length > 0)
        {
            if (Auth.IsAuthenticated)
            {
                if (contextMenuItems.filter(element => element.getAttribute("data-starred") === "false").length > 0) ShowElement(contextMenuAddToFavourites);
                else if (contextMenuItems.filter(element => element.getAttribute("data-starred") === "true").length > 0) ShowElement(contextMenuRemoveFromFavourites);

                ShowElements([ contextMenuMove ]);
            }

            ShowElements([ contextMenuDownload ]);
        }
        else ShowElement(contextMenuRestore);

        if (contextMenuItems.filter(element => HasClass(element, "file")).length === contextMenuItems.length)
            ShowElement(contextMenuView);
    }

    const selectedEditorTabContentType = target.closest(".tab")?.getAttribute("content-type");
    const selectedEditorTabName = (<HTMLParagraphElement>target.closest(".tab")?.querySelector(".name"))?.innerText;

    if (!selectedEditorTabContentType?.startsWith("image/")) HideElement(contextMenuDisplayImage);
    
    if (selectedEditorTabContentType !== "application/pdf") HideElement(contextMenuDisplayPdf);

    if (!selectedEditorTabName?.endsWith(".xml")) HideElement(contextMenuValidateXml);

    if (!selectedEditorTabName?.endsWith(".json")) HideElement(contextMenuValidateJson);

    if (!editor) HideElements([ contextMenuDisplayImage, contextMenuDisplayPdf, contextMenuValidateXml, contextMenuValidateJson ]);

    ShowElement(contextMenuContainer, "flex");

    let top : number = e.pageY - scrollY;
    let left : number = e.pageX;

    if (e.pageX + contextMenu.offsetWidth > window.innerWidth) left -= contextMenu.offsetWidth;

    if (e.pageY + contextMenu.offsetHeight - scrollY > window.innerHeight) top -= contextMenu.offsetHeight;

    if (top < 0) top = 0;

    if (left < 0) left = 0;

    Object.assign(contextMenu.style, {
        top: top + "px",
        left: left + "px",
    });
}

const HideContextMenu = () : void =>
{
    HideElement(contextMenuContainer);

    contextMenuItem = null;
}

let AllowContentMoveTouchDevice : boolean = false;

const addUserContentEvents = () : void =>
{
    const userContentMenuButtons = (<NodeListOf<HTMLButtonElement>>document.querySelectorAll(folderSelector + " .menu-button button," + fileSelector + " .menu-button button"));
    const userContentElements = (<NodeListOf<HTMLDivElement>>document.querySelectorAll(`${folderSelector}, ${fileSelector}`));

    [ ...userContentMenuButtons, <HTMLButtonElement>vault.querySelector(".menu-button button") ].forEach(element => element.addEventListener("click", showContextMenu));

    if (trashedOnly()) return;

    [...userContentElements, navigationBackButton, vault].forEach(element =>
    {
        const HandleTargetElement = (e : MouseEvent | TouchEvent) : void =>
        {
            const targetFromPoint = (<TouchEvent>e).touches && <HTMLElement>document.elementFromPoint((<TouchEvent>e).touches[0].clientX, (<TouchEvent>e).touches[0].clientY);

            if (((e.type === "touchmove" &&
                element.contains(targetFromPoint) && // Avoid making all the folders a target if the element is dragged over the back button or the vault
                (IsSet(targetFromPoint?.closest(folderSelector)) || navigationBackButton.contains(targetFromPoint) || vault.contains(targetFromPoint))) ||
                e.type === "mouseenter") &&
                IsSet(document.querySelector(".dragging")) &&
                (targetFromPoint?.id || element.id) !== document.querySelector(".dragging").id &&
                !HasClass(targetFromPoint?.closest(folderSelector) || element, "placeholder"))
                AddClass(targetFromPoint?.closest(folderSelector) || element, "target");
            else RemoveClass(element, "target");
        }

        if (HasClass(element, "folder") || HasClass(element, "back-button") || HasClass(element, "vault"))
        {
            element.removeEventListener("mouseenter", <EventListener>HandleTargetElement);
            element.removeEventListener("mouseleave", <EventListener>HandleTargetElement);
            document.removeEventListener("touchmove", HandleTargetElement);
            document.removeEventListener("touchmove", HandleTargetElement);

            element.addEventListener("mouseenter", <EventListener>HandleTargetElement);
            element.addEventListener("mouseleave", <EventListener>HandleTargetElement);
            document.addEventListener("touchmove", HandleTargetElement);
            document.addEventListener("touchmove", HandleTargetElement);
        }

        if (isUserContentElement(element))
        {
            element.removeEventListener("mousedown", <EventListener>HandleUserContentMove);
            element.removeEventListener("touchstart", <EventListener>HandleUserContentMove);

            element.addEventListener("mousedown", <EventListener>HandleUserContentMove);

            if (IsTouchDevice())
            {
                // Used on a touch device as a long press
                element.addEventListener("contextmenu", e =>
                {   
                    AllowContentMoveTouchDevice = true;

                    HandleUserContentMove(<MouseEvent>e, true);
                });

                element.addEventListener("touchstart", <EventListener>HandleUserContentMove);
            }
        }
    });
}

/**
 * Changes the viewed folder or loads a file
 * 
 * @param e The event fired on user interaction (e.g.: MouseEvent)
 * @param targetElement Specified if an Event parameter is not available
 */
const HandlePageChangeAndLoadUserContent = (e : MouseEvent | TouchEvent, targetElement ?: HTMLElement, isMultipleFileEditor ?: boolean) =>
{
    const target : HTMLElement = targetElement ?? <HTMLElement>e.target;

    if (target.closest(".menu-button") === null &&
        GetUserContentElement(target)?.getAttribute("data-trashed") === "false" &&
        !HasClass(GetUserContentElement(target), "placeholder") &&
        !HasClass(GetUserContentElement(target), "dragging"))
    {
        const closestFile = target.closest(fileSelector);

        const openInNewWindow = e instanceof MouseEvent && e.button === 1; // Mouse wheel

        HideContextMenu();

        const url = getUserContentURL(GetUserContentElement(target), !Auth.IsAuthenticated);

        if (openInNewWindow) open(url);
        else
        {
            if (closestFile === null)
            {
                SetCurrentFolderId(target.closest(folderSelector).id);
    
                GetUserContent();

                UpdateBottomSectionBar(viewMyAccount);
            }
            else ShowFile(closestFile.id, null, null, isMultipleFileEditor);
    
            if (!isMultipleFileEditor && location.href !== url) history.pushState(null, "", url);
        }
    }
}

const HandleUserContentMove = (e : MouseEvent | TouchEvent, ignoreMovement ?: boolean) : void =>
{
    const placeholderElement : HTMLElement = GetUserContentElement(<HTMLElement>e.target);
    let element : HTMLElement = <HTMLElement>placeholderElement?.cloneNode(true);

    let moved : boolean = false;

    const tempArray = <HTMLElement[]>[ ...(contextMenuItems || []), element ].filter(Boolean);

    const MoveElement = (ev : MouseEvent | TouchEvent, ignoreMovement ?: boolean) : void =>
    {
        console.log("move");

        if (!IsSet(element)) return;

        const top : number = (<MouseEvent>ev).pageY ?? (<TouchEvent>ev).touches[0].pageY;
        const left : number = (<MouseEvent>ev).pageX ?? (<TouchEvent>ev).touches[0].pageX;

        console.log(top, left, moved, ignoreMovement, ev.type, AllowContentMoveTouchDevice);

        // If this was called by a touchmove event and the user didn't yet reached the context menu
        // endsWith is required as Chrome (and hopefully all of the others use touchmove), Firefox on the other hand uses mousemove (WHY?)
        if (!ignoreMovement && IsTouchDevice() && ev.type.endsWith("move") && !AllowContentMoveTouchDevice)
        {
            moved = true;

            return;
        }

        HideContextMenu();

        if (Auth.IsAuthenticated)
        {
            if (IsTouchDevice()) moved = true;

            if (!ignoreMovement)
            {
                // Set moved=true only if the mouse moved by at least 5px
                if (Math.abs(left - (<MouseEvent>e).pageX ?? (<TouchEvent>e).touches[0].pageX) > 5 || Math.abs(top - (<MouseEvent>e).pageY ?? (<TouchEvent>e).touches[0].pageY) > 5)
                    moved = true;

                if (moved) ShowElement(element, "flex");
            }
            else if (IsTouchDevice()) ShowElement(element, "flex");

            if (moved)
            {
                [foldersContainer, filesContainer].forEach(element =>
                    (<NodeListOf<HTMLDivElement>>element.querySelectorAll(`${folderSelector}, ${fileSelector}`)).forEach(element =>
                        AddClasses(element, [ "no-hover", HasClass(element, "file") ? "disabled" : "" ])));
    
                Object.assign(element.style, {
                    top: top + "px",
                    left: left + "px"
                });

                AddClass(element, "dragging");

                AddClass(placeholderElement, "placeholder");
            
                AddClass(document.documentElement, "grabbing");
            }
        }
    }

    const ResetElement = async (ev : MouseEvent | TouchEvent) =>
    {
        console.log("reset");

        const target : HTMLElement = foldersContainer.querySelector(".target");

        let parentId = null;

        AllowContentMoveTouchDevice = false;

        [foldersContainer, filesContainer].forEach(element =>
            (<NodeListOf<HTMLDivElement>>element.querySelectorAll(`${folderSelector}, ${fileSelector}`)).forEach(element =>
            {
                RemoveClass(element, "no-hover");

                if (HasClass(element, "file")) RemoveClass(element, "disabled");
            }));

        RemoveClass(placeholderElement, "placeholder");

        RemoveClass(document.documentElement, "grabbing");

        element.remove();
        element = null;

        if (IsSet(target))
        {
            parentId = target.id;

            RemoveClass(target, "target");
        }
        else if (HasClass(navigationBackButton, "target"))
        {
            parentId = await vaultOnly() ? "root" : (await db.collection(`users/${Auth.UserId}/folders`).doc(GetCurrentFolderId()).get()).data().parentId;

            RemoveClass(navigationBackButton, "target");
        }
        else if (HasClass(vault, "target"))
        {
            if (vault.getAttribute("data-locked") === "false") parentId = "vault";

            RemoveClass(vault, "target");
        }

        if (!moved) HandlePageChangeAndLoadUserContent(ev);
        else if (IsSet(parentId) && Auth.IsAuthenticated)
            MoveElements(tempArray, parentId);

        document.removeEventListener("mousemove", MoveElement);
        document.removeEventListener("touchmove", MoveElement);
        document.removeEventListener("mouseup", ResetElement);
        document.removeEventListener("touchend", ResetElement);
    }

    console.log(element, e.which);

    if (IsSet(element) && (e.which !== 3 || IsTouchDevice())) // Not on right click, unless is a touch device (fix issue in Firefox)
    {
        if (!ignoreMovement)
        {
            console.log("add event listeners");

            HideElement(element);

            document.body.appendChild(element);

            document.removeEventListener("mousemove", MoveElement);
            document.removeEventListener("touchmove", MoveElement);
            element.removeEventListener("touchmove", MoveElement);
            document.removeEventListener("mouseup", ResetElement);
            document.removeEventListener("touchend", ResetElement);

            document.addEventListener("mousemove", MoveElement);
            document.addEventListener("touchmove", MoveElement);
            element.addEventListener("touchmove", MoveElement);
            document.addEventListener("mouseup", ResetElement);
            document.addEventListener("touchend", ResetElement);
        }
        else if (IsTouchDevice())
        {
            console.log("show element");

            MoveElement(e, true);
        }
    }
}

const isUserContentElement = (element : HTMLElement) : boolean => IsSet(GetUserContentElement(element));

const getUserContentURL = (element : HTMLElement, isShared : boolean) : string =>
    `${location.origin}/${element.classList[0]}/${isShared ? "shared/" : ""}${element.id}${isShared ? `/${Auth.UserId}` : ""}`;

const CreateUserContent = (type : string, name : string, id : string, shared : boolean, starred : boolean, trashed : boolean) : HTMLElement =>
{
    if (type !== "file" && type !== "folder") return;

    const language = Linguist.Get(<string>Linguist.Detect(name, type === "file"));

    const element = new Component("div", {
        class: type,
        id,
        title: name,
        data: {
            shared,
            starred,
            trashed
        },
        children: [
            new Component("div", {
                class: "icon",
                children: [
                    new Component("i", {
                        style: { backgroundImage: `url("/assets/img/icons/languages/${language.iconName ?? language.name}.svg?v=2")` }
                    }).element
                ]
            }).element,
            new Component("div", {
                class: "name",
                children: [
                    new Component("p", {
                        innerText: name
                    }).element
                ]
            }).element,
            new Component("div", {
                class: "menu-button",
                children: [
                    new Component("button", {
                        children: [
                            new Component("i", {
                                class: "fas fa-ellipsis-v fa-fw"
                            }).element
                        ]
                    }).element
                ]
            }).element,
        ]
    }).element;
        
    if (type === "file") filesContainer.insertAdjacentElement("beforeend", element);
    else foldersContainer.insertAdjacentElement("beforeend", element);
        
    addUserContentEvents();
    
    HideElement(emptyFolder);

    return element;
}

const CreateEditor = (id : string, value : string, language : string, isActive ?: boolean) : void =>
{
    RemoveClass(document.documentElement, "wait");
    RemoveClass(document.documentElement, "file-loading");

    preventWindowUnload.editor = false;

    editorSavedValue = value;

    if (!editor)
        editor = (<any>window).monaco.editor.create(editorElement, {
            model: null,
            theme: "vs-dark",
            automaticLayout: true,
            readOnly: !Auth.IsSignedIn
        });

    const model = (<any>window).monaco.editor.createModel(value, language);

    if (isActive) editor.setModel(model);

    editorModels.set(id, model);

    editor.onDidChangeModelContent(() =>
    {
        preventWindowUnload.editor = editorSavedValue !== editor.getValue();

        if (preventWindowUnload.editor) AddClass(editorTabs.querySelector(".active"), "modified");
        else RemoveClass(editorTabs.querySelector(".active"), "modified");
    });
}

const ShowFile = (id : string, skipFileLoading ?: boolean, forceDownload ?: boolean, isMultipleFileEditor ?: boolean) : void =>
{
    AddClass(document.documentElement, "wait");
    AddClass(document.documentElement, "file-open");

    ShowElement(showFile);

    header.style.backgroundColor = getComputedStyle(showFile).getPropertyValue("background-color");

    // If the user is on a file URL but the Auth.UserId is not yet ready
    if (skipFileLoading) return;

    AddClass(document.documentElement, "file-loading");

    const ShowForceDownloadButton = (id : string) =>
    {
        editorElement.innerHTML = "";
        editorElement.insertAdjacentElement("afterbegin", new Component("button", {
            class: "force-download",
            children: [
                new Component("i", { class: "fas fa-download" }).element,
                new Component("span", { innerText: ` ${Translation.Get("generic->download")}` }).element
            ]
        }).element);

        editorElement.querySelector(".force-download").addEventListener("click", () =>
        {
            editorTabs.querySelector(".active").setAttribute("data-force-download", "false");

            ShowFile(id, false, true, isMultipleFileEditor);
        });

        RemoveClass(document.documentElement, "wait");
        RemoveClass(document.documentElement, "file-loading");
    }

    db.collection(`users/${Auth.UserId}/files`).doc(id).get().then((doc : any) =>
    {
        const name : string = doc.data().name;
        const language = <string>Linguist.Detect(name, true);
        const size = doc.data().size;

        // If forceDownload the file tab has already been appended
        if (!forceDownload)
        {
            const language = Linguist.Get(<string>Linguist.Detect(name, true));

            const tab = new Component("div", {
                id: `tab-${id}`,
                class: "tab" + (editorTabs.querySelector(".tab.active") === null ? " active" : ""),
                children: [
                    new Component("div", {
                        class: "icon",
                        children: [
                            new Component("i", {
                                style: { backgroundImage: `url("/assets/img/icons/languages/${language.iconName ?? language.name}.svg?v=2")` }
                            }).element
                        ]
                    }).element,
                    new Component("p", { class: "name", innerText: name }).element,
                    new Component("button", { class: "menu", children: [ new Component("i", { class: "fas fa-ellipsis-v fa-fw" }).element ] }).element,
                    new Component("button", { class: "close", children: [ new Component("i", { class: "fas fa-times fa-fw" }).element ] }).element
                ]
            }).element;
    
            tab.addEventListener("click", e =>
            {
                const target = (<HTMLElement>e.target);
    
                if (target.closest(".close") !== null) return;
    
                const id = target.closest(".tab").id;
    
                editor?.setModel(editorModels.get(id.split("-")[1]));
    
                RemoveClass(editorTabs.querySelector(".active"), "active");
    
                AddClass(editorTabs.querySelector(`#${id}`), "active");

                editorElement.querySelector(".force-download")?.remove();

                if (tab.getAttribute("data-force-download") === "true") ShowForceDownloadButton(id.split("-")[1]);
            });

            (<HTMLButtonElement>tab.querySelector(".menu")).addEventListener("click", showContextMenu);
    
            tab.querySelector(".close").addEventListener("click", () =>
            {
                editorModels.get(id)?.dispose();
    
                editorModels.delete(id);
    
                tab.remove();
    
                if (editorModels.size === 0 && editorTabs.childElementCount === 0)
                {
                    CloseEditor();
    
                    return;
                }
    
                if (!HasClass(tab, "active")) return;
    
                editor?.setModel(Array.from(editorModels.values())[0]);
    
                AddClass(editorTabs.querySelector(`#tab-${Array.from(editorModels.keys())[0]}`) ?? <HTMLElement>editorTabs.children[0], "active");

                editorElement.querySelector(".force-download")?.remove();

                if (editorTabs.querySelector(".active").getAttribute("data-force-download") === "true")
                    ShowForceDownloadButton(editorTabs.querySelector(".active").id.split("-")[1]);
            });

            if (!Auth.IsAuthenticated && !IS_SHARED_FOLDER) HideElement(tab.querySelector(".close"));
    
            editorTabs.appendChild(tab);
        }

        if (!isMultipleFileEditor)
            (<HTMLTitleElement>document.head.querySelector("[data-update-field=folder-name]")).innerText = name;

        LogPageViewEvent();

        if (!navigator.onLine)
        {
            editorElement.innerHTML = "";
            editorElement.insertAdjacentElement("afterbegin", new Component("p", { innerText: Translation.Get("errors->offline") }).element);

            RemoveClass(document.documentElement, "wait");
            RemoveClass(document.documentElement, "file-loading");

            return;
        }

        const fileRef = storage.ref(`${Auth.UserId}/${id}`);

        fileRef.getMetadata().then((metadata : any) =>
        {
            const contentType = metadata.contentType;

            editorTabs.querySelector(`#tab-${id}`).setAttribute("content-type", contentType);

            if (contentType.startsWith("image/")) ShowElement(contextMenuDisplayImage);
            else if (contentType === "application/pdf") ShowElement(contextMenuDisplayPdf);
        });

        // If the user enabled the Data Saving option do not allow downloading files bigger than 1MB
        // If the size of the file to be downloaded is bigger than what the user can download in one second
        if (((<any>navigator).connection?.saveData && size > 1 * 1000 * 1000 || size > ((<any>navigator).connection?.downlink / 8) * 1000 * 1000) && !forceDownload)
        {
            ShowForceDownloadButton(id);

            editorTabs.querySelector(`#tab-${id}`).setAttribute("data-force-download", "true");

            return;
        }

        if (forceDownload) editorElement.querySelector(".force-download").remove();

        fileRef.getDownloadURL().then((url : string) =>
            fetch(url).then(async response =>
            {
                const reader = response.body.getReader();

                let chunks : Uint8Array[] = [];

                const downloadSize = parseInt(response.headers.get("Content-Length"));
                let downloadedBytes = 0;

                let value = "";

                if (size > 0)
                {
                    const modal = new DownloadModal(name, downloadSize);
                    
                    while (true)
                    {
                        const { done, value } = await reader.read();
                        
                        if (done) break;

                        downloadedBytes += value.length;
                        
                        chunks.push(value);
                        
                        const progress = (downloadedBytes / downloadSize) * 100;
                        
                        modal.ProgressBar.style.width = progress + "%";
                        modal.TransferSize.innerText = FormatStorage(downloadedBytes);
                    }
                    
                    modal.Remove();

                    value = new TextDecoder().decode(Uint8Array.from(chunks.reduce((previousValue, currentValue) => [...previousValue, ...currentValue], [])));
                }

                CreateEditor(id, value, language, forceDownload || editorTabs.querySelector(".active").id.split("-")[1] === id);

                // These are handled with the downloaded data, so they need to be put here and not in getMetadata()
                if (name.endsWith(".xml")) ShowElement(contextMenuValidateXml);
                else if (name.endsWith(".json")) ShowElement(contextMenuValidateJson);
            })).catch((err : any) => err);
    });
}

const GetFolderUrl = (id : string, isShared : boolean) : string => (id !== "root" && id !== "shared" && id !== "starred" && id !== "trash" && id !== "vault")
    ? getUserContentURL(<HTMLElement><unknown>{classList: ["folder"], id: id}, isShared)
    : location.origin + `/account${id !== "root" ? `/${id}` : ""}`;

const UploadFolder = async (files : File[], name : string, path : string, parentId : string, depth : number) : Promise<void> =>
{
    if (depth === 0) // Duplicate checks are only useful with the uploaded folder
        name = await CheckElementNameValidity(name, "folder", parentId);

    if (parentId === "shared" || parentId === "starred" || parentId === "trash") parentId = "root";

    db.collection(`users/${Auth.UserId}/folders`).add({
        name,
        parentId,
        shared: false,
        starred: false,
        trashed: false,
        inVault: await vaultOnly(),
        created: GetFirestoreServerTimestamp(),
        ...GetFirestoreUpdateTimestamp()
    }).then((ref : any) =>
    {
        const id = ref.id;

        let folders : Set<string> = new Set();

        analytics.logEvent(depth === 0 ? "upload" : "create", {
            content_type: "folder",
            content_id: id
        });

        depth++;

        files.forEach((file : File) =>
        {
            if (depth < (<any>file).webkitRelativePath.split("/").length - 1) folders.add((<any>file).webkitRelativePath.split("/")[depth]);
        });

        Array
            .from(folders)
            .filter(folder => folder.length > 0)
            .forEach(folder => UploadFolder(files.filter((file : File) =>
                (<any>file).webkitRelativePath.indexOf(path + folder + "/") === 0), folder, path + folder + "/", id, depth));

        UploadFiles(files.filter((file : File) => (<any>file).webkitRelativePath.substr(path.length) === file.name), id);
    });
}

const UploadFiles = async (files : File[], parentId : string) : Promise<void> => { for await (const file of files) UploadFile(file, file.name, file.size, parentId); }

const GetFolderEntries = (folder : DataTransferItem, path : string, entries : File[]) : File[] =>
{
    var dirReader = (<any>folder).createReader();

    const ReadEntries = () =>
    {
        dirReader.readEntries((items : any) =>
        {
            if (items.length)
            {
                ReadEntries();

                items.forEach((entry : any) =>
                {
                    if (entry.isDirectory) GetFolderEntries(entry, path + entry.name + "/", entries);
                    else if (entry.isFile)
                    {
                        entry.file((file : File) =>
                        {
                            // Allow overwriting the webkitRelativePath property that by default is readonly
                            Object.defineProperties(file, {
                                "webkitRelativePath": {
                                    "writable": true,
                                },
                            });

                            Object.assign(file, {
                                "webkitRelativePath": path + entry.name,
                            });

                            entries.push(file);
                        });
                    }
                });
            }
        });
    }

    ReadEntries();

    return entries;
}

const AreUserContentContainersEmpty = () : boolean => foldersContainer.innerHTML.trim() === "" && filesContainer.innerHTML.trim() === "";

const EmptyUserContentContainers = () : void => { foldersContainer.innerHTML = filesContainer.innerHTML = ""; }

const IsShared = () : boolean => !Auth.IsAuthenticated || location.pathname.indexOf("/shared") > -1;

const UpdateBottomSectionBar = (selectedItem : HTMLElement) : void =>
{
    RemoveClass(viewMyAccount, "selected");
    RemoveClass(viewSharedContent, "selected");
    RemoveClass(viewStarredContent, "selected");
    RemoveClass(viewRecentContent, "selected");
    RemoveClass(viewTrashedContent, "selected");

    AddClass(selectedItem, "selected");

    searchBar.value = "";
}

const GetUserContentElement = (target : HTMLElement) : HTMLElement => target?.closest(`${folderSelector}, ${fileSelector}`);

const DownloadContent = async (id : string, name : string, isFolder : boolean, format ?: string) =>
{
    let timestamp : number;

    if (isFolder && (!IsSet(format) || !["zip", "tar", "tar.gz"].includes(format))) format = "zip";

    if (isFolder)
    {
        const modalCompressingFolder = new Modal({
            subtitle: Translation.Get("api->messages->folder->compressing"),
            allow: [ "close" ],
            floating: true,
            aside: true
        });
    
        modalCompressingFolder.Show();
    
        await functions.httpsCallable("createFolderArchive")({
            id,
            userId: Auth.UserId,
            format
        }).then((result : any) => timestamp = result.data.timestamp)
        .finally(() => modalCompressingFolder.HideAndRemove());

        name += `.${format}`;
    }

    const fileRef = storage.ref(`${Auth.UserId}/${id}${isFolder ? `.${timestamp}.${format}` : ""}`);

    fileRef.getDownloadURL().then((url : string) =>
        fetch(url).then(async response =>
        {
            const reader = response.body.getReader();

            let chunks : Uint8Array[] = [];

            const downloadSize = parseInt(response.headers.get("Content-Length"));
            let downloadedBytes = 0;

            const modal = new DownloadModal(name, downloadSize);

            preventWindowUnload.fileDownload = true;

            while (true)
            {
                const { done, value } = await reader.read();

                if (done) break;

                downloadedBytes += value.length;

                chunks.push(value);

                const progress = (downloadedBytes / downloadSize) * 100;

                modal.ProgressBar.style.width = progress + "%";
                modal.TransferSize.innerText = FormatStorage(downloadedBytes);
            }

            modal.Remove();

            return new Blob(chunks);
        }).then(blob =>
        {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.download = name;
            a.href = blobUrl;

            document.body.appendChild(a); // If it isn't appended it won't work in Firefox
                    
            a.click();
            a.remove();

            preventWindowUnload.fileDownload = false;

            if (isFolder) fileRef.delete();
        }));
}

const sharedOnly = () : boolean => location.pathname === "/account/shared" || !Auth.IsAuthenticated;
const starredOnly = () : boolean => location.pathname === "/account/starred";
const recentsOnly = () : boolean => location.pathname === "/account/recents";
const trashedOnly = () : boolean => location.pathname === "/account/trash";
const vaultOnly = async (checkCurrentFolder ?: boolean) : Promise<boolean> =>
    (location.pathname === "/account/vault" && GetCurrentFolderId(true) === "vault") ||
    (((!IsSet(checkCurrentFolder) || checkCurrentFolder) &&
    await GetCurrentFolderIdAsync() !== "root" &&
    (await db.collection(`users/${Auth.UserId}/folders`).doc(await GetCurrentFolderIdAsync()).get()).data().inVault));

/**
 * @returns string The new name for the element
 */
const CheckElementNameValidity = async (name : string, type : string, parentId : string) : Promise<string> =>
{
    const nameWithNoExt = name.indexOf(".") > -1 && type === "file" ? name.substr(0, name.lastIndexOf(".")) : name;

    const end = nameWithNoExt.replace(/.$/, (c : string) => String.fromCharCode(c.charCodeAt(0) + 1));

    const tempSnapshot = await db
        .collection(`users/${Auth.UserId}/${type}s`)
        .where("inVault", "==", parentId === "vault")
        .where("parentId", "==", parentId)
        .where("name", ">=", nameWithNoExt)
        .where("name", "<", end)
        .get();
    
    // Same name, different extension
    if (tempSnapshot.size > 0 && tempSnapshot.docs.filter((doc : any) => doc.data().name === name).length > 0)
    {
        let i = 1;
        let tempName : string;

        do
            if (type === "file")
                tempName = (name.substring(0, name.lastIndexOf(".") > -1 ? name.lastIndexOf(".") : undefined) +
                    ` (${i++})` +
                    (name.indexOf(".") > -1 ? "." : "") +
                    (name.indexOf(".") > -1 ? name.split(".").pop() : "")).trim();
            else tempName = name + ` (${i++})`;
        while (tempSnapshot.docs.filter((doc : any) => doc.data().name === tempName).length > 0);
                    
        name = tempName;
    }

    return name;
}

const MoveElements = async (elements: HTMLElement[], parentId : string) : Promise<void> =>
{
    const batch = db.batch();

    for (const item of elements)
    {
        const type = item.classList[0];
        const id = item.id;

        const docRef = db.collection(`users/${Auth.UserId}/${type}s`).doc(id);

        let name = (await docRef.get()).data().name;

        name = await CheckElementNameValidity(name, type, parentId);

        batch.update(docRef, {
            name,
            parentId,
            inVault: parentId === "vault",
            ...GetFirestoreUpdateTimestamp()
        });
    }

    batch.commit();
}

const IsShowFileVisible = () : boolean => getComputedStyle(showFile).getPropertyValue("display") !== "none";

const CloseEditor = () =>
{
    if (preventWindowUnload?.editor && !confirm(Translation.Get("generic->are_you_sure"))) return;

    editorModels.forEach(model => model.dispose());

    editorModels.clear();

    editorElement.innerHTML = "";

    editorTabs.innerHTML = "";

    header.style.backgroundColor = "";

    editor = null;

    preventWindowUnload.editor = false;

    const url = GetFolderUrl(GetCurrentFolderId(true), IsShared());

    HideElements([ showFile, filePreviewContainer ]);

    RemoveClass(document.documentElement, "wait");
    RemoveClass(document.documentElement, "file-loading");
    RemoveClass(document.documentElement, "file-open");

    if (!HasClass(viewRecentContent, "selected"))
    {
        if (location.href !== url) history.pushState(null, "", url);

        GetUserContent();
    }
    else viewRecentContent.click();
}

if (location.pathname.indexOf("/account") > -1 || location.pathname.indexOf("/folder/") > -1 || location.pathname.indexOf("/file/") > -1)
{
    let currentFolderId = "root";

    if (location.pathname.indexOf("/folder/") > -1)
    {
        if (location.pathname.indexOf("/shared/") === -1)
        {
            currentFolderId = location.pathname.substr(8);

            if (currentFolderId.indexOf("/") > -1) currentFolderId = currentFolderId.substr(0, currentFolderId.indexOf("/"));
        }
        else
        {
            currentFolderId = location.pathname.substr(15);

            if (currentFolderId.indexOf("/") > -1) currentFolderId = currentFolderId.substr(0, currentFolderId.indexOf("/"));
        }

        AddClass(location.href.indexOf("/shared/") === -1 ? viewMyAccount : viewSharedContent, "selected");
    }
    else if (location.pathname.indexOf("/file/") > -1)
    {
        currentFolderId = ""; // Avoid loading the root content if this file's parentId is unknown

        AddClass(location.href.indexOf("/shared/") === -1 ? viewMyAccount : viewSharedContent, "selected");

        let id = location.href.indexOf("/shared/") > -1
            ? location.href.substr(location.href.indexOf("/file/shared/") + 13)
            : location.href.substr(location.href.indexOf("/file/") + 6);

        if (id.indexOf("/") > -1) id = id.substr(0, id.indexOf("/"));

        ShowFile(id, true);
    }
    else if (location.pathname === "/account/shared")
    {
        currentFolderId = "shared";

        AddClass(viewSharedContent, "selected");
    }
    else if (location.pathname === "/account/starred")
    {
        currentFolderId = "starred";

        AddClass(viewStarredContent, "selected");
    }
    else if (location.pathname === "/account/recents")
    {
        AddClass(viewRecentContent, "selected");
    }
    else if (location.pathname === "/account/trash")
    {
        currentFolderId = "trash";

        AddClass(viewTrashedContent, "selected");
    }
    else if (location.pathname === "/account/vault")
    {
        currentFolderId = "vault";

        AddClass(viewMyAccount, "selected");
    }
    else if (location.pathname === "/account/storage/info")
    {
        AddClass(viewMyAccount, "selected");
    }
    else AddClass(viewMyAccount, "selected");

    SetCurrentFolderId(currentFolderId);
}