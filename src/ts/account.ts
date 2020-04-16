export {};

import * as loadEvents from "./scripts/load-events";
import * as genericMessage from "./scripts/generic-message";
import { Utilities } from "./scripts/Utilities";
import { Modal, UploadModal, DownloadModal } from "./scripts/Modal";
import { Auth } from './scripts/Auth';
import { Linguist } from './scripts/Linguist';
import { Component, Input, Spinner, InputWithIcon } from './scripts/Component';
import { Translation } from './scripts/Translation';
import { loggedInNavMenu, HideHeaderMenu, header } from "./scripts/header";

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
const showFileName : HTMLHeadingElement = showFile.querySelector(".name")
const editorMenuSelector : string = ".show-file .editor-head .menu";
const editorMenu : HTMLButtonElement = document.querySelector(editorMenuSelector);
const editorClose : HTMLButtonElement = showFile.querySelector(".close");
const editorElement : HTMLDivElement = document.querySelector("#editor");
let editor : any;

const contextMenu : HTMLDivElement = document.querySelector(".context-menu");

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
const filePreviewSpinner : HTMLElement = filePreviewContainer.querySelector(".spinner");

let unsubscribeFoldersListener : any = null;
let unsubscribeFilesListener : any = null;

let folderShared : boolean = false;

let preventWindowUnload : any = {};

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

            modal.AppendContent([input.parentElement]);

            input.focus();

            modal.OnConfirm = () =>
            {
                const name = input.value;

                modal.element.querySelectorAll(".input-error").forEach(element => element.remove());

                Utilities.RemoveClass(input, "error");

                if (name.length > 0)
                {
                    isFile ? UploadFile("", name, 0, Utilities.GetCurrentFolderId()) : UploadFolder([], name, "/", Utilities.GetCurrentFolderId(), 0);

                    modal.HideAndRemove();
                }
                else
                {
                    input.parentElement.insertAdjacentElement("beforebegin", new Component("p", {
                        innerHTML: Translation.Get("errors->empty"),
                        class: "input-error"
                    }).element);

                    Utilities.AddClass(input, "error");
                }
            }

            modal.Show(true);
        }));

    viewMyAccount.addEventListener("click", () =>
    {
        Utilities.SetCurrentFolderId("root");

        history.pushState(null, "", GetFolderUrl(Utilities.GetCurrentFolderId(), false));

        GetUserContent();

        UpdateBottomSectionBar(viewMyAccount);
    });

    viewSharedContent.addEventListener("click", () =>
    {
        history.pushState(null, "", "/account/shared");

        Utilities.SetCurrentFolderId("shared");

        GetUserContent();

        UpdateBottomSectionBar(viewSharedContent);
    });

    viewStarredContent.addEventListener("click", () =>
    {
        history.pushState(null, "", "/account/starred");

        Utilities.SetCurrentFolderId("starred");

        GetUserContent();

        UpdateBottomSectionBar(viewStarredContent);
    });

    viewTrashedContent.addEventListener("click", () =>
    {
        history.pushState(null, "", "/account/trash");

        Utilities.SetCurrentFolderId("trash");

        GetUserContent();

        UpdateBottomSectionBar(viewTrashedContent);

        emptyTrashButton.disabled = true;
    });

    searchBar.addEventListener("input", () => GetUserContent(searchBar.value));

    searchBar.addEventListener("focusin", () => Utilities.HideElement(loggedInNavMenu));

    addContent.addEventListener("click", () =>
    {
        const modal = new Modal({ allow: [ "close" ] });

        modal.AppendContent([addContentOptions]);

        Utilities.ShowElement(modal.Content.querySelector(".add-content-options"));

        addContent.blur();

        addContentOptions.querySelectorAll("button").forEach(element => element.addEventListener("click", () => modal.HideAndRemove()));

        modal.Show(true);
    });

    moreOptions.addEventListener("click", showContextMenu);

    fileInput.addEventListener("change", (e) =>
    {
        const files : FileList = (<HTMLInputElement>e.target).files;

        UploadFiles(Array.from(files), Utilities.GetCurrentFolderId());

        fileInput.value = null;
    });

    folderInput.addEventListener("change", (e) =>
    {
        const files : FileList = (<HTMLInputElement>e.target).files;
        const folderName : string = (<any>files[0]).webkitRelativePath.split("/")[0];

        UploadFolder(Array.from(files), folderName, folderName + "/", Utilities.GetCurrentFolderId(), 0);

        folderInput.value = null;
    });

    contextMenuView.addEventListener("click", () => HandlePageChangeAndLoadUserContent(null, contextMenuItem));

    contextMenuSave.addEventListener("click", () =>
    {
        const value = editor.getValue();
        const id = showFile.id;

        UploadFile(value, showFile.querySelector(".editor-head .name").innerHTML, value.length, Utilities.GetCurrentFolderId(), id);

        db.collection(`users/${Auth.UserId}/files`).doc(id).update({ ...Utilities.GetFirestoreUpdateTimestamp() });

        preventWindowUnload.editor = false;
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
            ...Utilities.GetFirestoreUpdateTimestamp()
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
        text: `${Translation.Get("share->check_out")} ${contextMenuItem.querySelector(".name p").innerHTML} ${Translation.Get("share->on_denvelope")}`,
        url: getUserContentURL(contextMenuItem, true),
    }));

    contextMenuCopyShareableLink.addEventListener("click", () => navigator.clipboard.writeText(getUserContentURL(contextMenuItem, true)));

    contextMenuUnshare.addEventListener("click", () =>
    {
        const id = contextMenuItem.id;
        const type = contextMenuItem.classList[0];

        db.collection(`users/${Auth.UserId}/${type}s`).doc(id).update({
            shared: false,
            ...Utilities.GetFirestoreUpdateTimestamp()
        });

        if (type === "folder") functions.httpsCallable("shareFolder")({ id, shared: false });
    });

    contextMenuMove.addEventListener("click", async () =>
    {
        const tempArray = [...contextMenuItems, contextMenuItem].filter(Boolean);

        Utilities.HideElements([
            contextMenuContent,
            contextMenuGeneric
        ]);

        Utilities.ShowElements([
            contextMenuMoveSelector,
            contextMenuMoveSelector.querySelector(".spinner")
        ]);

        contextMenuMoveSelectorOptions.innerHTML = "";

        db.collection(`users/${Auth.UserId}/folders`).where("inVault", "==", await vaultOnly()).where("parentId", "==", Utilities.GetCurrentFolderId()).get().then((docs : any) =>
        {
            Utilities.HideElement(contextMenuMoveSelector.querySelector(".spinner"));

            docs.forEach((doc : any) =>
            {
                if (tempArray.filter(element => element.id === doc.id).length === 0)
                {
                    const element = <HTMLButtonElement>new Component("button", {
                        innerHTML: `<i class="fas fa-folder"></i> ${doc.data().name}`,
                        id: doc.id
                    }).element;

                    contextMenuMoveSelectorOptions.appendChild(element);
    
                    element.addEventListener("click", async () => MoveElements(tempArray, element.id));
                }
            });

            if (contextMenuMoveSelectorOptions.innerHTML.trim().length === 0)
                contextMenuMoveSelectorOptions.appendChild(new Component("p", {
                    innerHTML: Translation.Get("account->context_menu->move->impossible")
                }).element);
        });
    });

    [contextMenuAddToFavourites, contextMenuRemoveFromFavourites].forEach(element => element.addEventListener("click", () =>
    {
        const batch = db.batch();

        [...contextMenuItems, contextMenuItem].filter(Boolean).forEach(item =>
            batch.update(db.collection(`users/${Auth.UserId}/${item.classList[0]}s`).doc(item.id), {
                starred: contextMenuAddToFavourites.contains(element),
                ...Utilities.GetFirestoreUpdateTimestamp()
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

        modal.AppendContent([
            new Input({
                attributes: {
                    class: "name",
                    placeholder: Translation.Get("generic->name")
                }
            }).element
        ]);

        const nameElement : HTMLInputElement = modal.Content.querySelector(".name");

        nameElement.value = Utilities.UnescapeHtml(contextMenuItem.querySelector(".name p").innerHTML);

        nameElement.focus();

        modal.OnUpdate = async () =>
        {
            const name = nameElement.value;

            modal.element.querySelectorAll(".input-error").forEach(element => element.remove());

            Utilities.RemoveClass(nameElement, "error");

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
                    ...Utilities.GetFirestoreUpdateTimestamp()
                });

                modal.HideAndRemove();
            }
            else
            {
                modal.Show(true);

                nameElement.parentElement.insertAdjacentElement("beforebegin", new Component("p", {
                    innerHTML: Translation.Get(`errors->${name.length === 0 ? "empty" : "user_content->already_exists"}`),
                    class: "input-error"
                }).element);

                Utilities.AddClass(nameElement, "error");
            }
        }

        modal.Show(true);
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

            modal.Title = Utilities.EscapeHtml(name);

            let dateFormatOptions = (await db.collection(`users/${Auth.UserId}/config`).doc("preferences").get()).data().dateFormatOptions;

            for (const entry in dateFormatOptions)
                if (dateFormatOptions[entry] === "undefined")
                    dateFormatOptions[entry] = undefined;

            if (dateFormatOptions === "default") dateFormatOptions = null;

            modal.AppendContent([
                new Component("p", {
                    innerHTML: `<span data-translation="generic->id"></span><span>${doc.id}</span>`
                }).element,
                new Component("p", {
                    innerHTML:  `<span data-translation="generic->name"></span><span>${Utilities.EscapeHtml(name)}</span>`
                }).element,
                new Component("p", {
                    innerHTML: `<span data-translation="generic->type"></span><span>${Linguist.GetDisplayName(<string>Linguist.Detect(name, type === "file")) || Translation.Get(`generic->${type}`)}</span>`
                }).element,
                new Component("p", {
                    innerHTML: `<span data-translation="generic->created"></span><span>${Utilities.FormatDate(data.created.seconds * 1000, dateFormatOptions)}</span>`
                }).element,
                new Component("p", {
                    innerHTML: `<span data-translation="generic->last_modified"></span><span>${Utilities.FormatDate(data.updated.seconds * 1000, dateFormatOptions)}</span>`
                }).element,
                type === "file"
                    ? new Component("p", {
                        innerHTML: `<span data-translation="generic->size"></span><span>${Utilities.FormatStorage(data.size || 0)}</span>`
                    }).element
                    : null
            ]);

            Translation.Init(modal.Content);
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

            DownloadContent(id, Utilities.UnescapeHtml((<HTMLParagraphElement>item.querySelector(".name p")).innerText) + (type === "folder" ? `.${folderFormat}` : ""), type === "folder");
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
                    ...Utilities.GetFirestoreUpdateTimestamp()
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

        if (Utilities.IsSet(contextMenuItem) || contextMenuItems?.length === 1)
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

            editorClose.click();
        }
    }));

    contextMenuDisplayImage.addEventListener("click", async () =>
    {
        Utilities.ShowElement(filePreviewContainer, "flex");

        const img = new Image();

        img.onload = () =>
        {
            Utilities.HideElement(filePreviewSpinner);

            filePreviewContainer.appendChild(img);
        };

        img.onerror = () => filePreviewContainer.click();

        img.src = await storage.ref(`${Auth.UserId}/${contextMenuItem.id}`).getDownloadURL();

        let scale = 1;

        const ScaleImage = (e : WheelEvent) =>
        {
            scale += e.deltaY < 0 ? /* UP (zoom in) */ 0.1 : -0.1 ;

            if (scale < 0.1) return;

            const scaleString = `scale(${scale})`;

            img.style.transform = img.style.transform.split(" ").map(value =>
                {
                    return value.indexOf("scale") > -1 ? scaleString : value;
                }).join(" ");
        
            if (img.style.transform.indexOf("scale") === -1) img.style.transform += scaleString;
        }

        let rotateAngle = 0;

        const RotateImage = (e : KeyboardEvent) =>
        {
            if (e.key.toLowerCase() !== "r" || e.ctrlKey) return;

            rotateAngle += e.shiftKey ? -90 : 90;

            const rotateString = `rotate(${rotateAngle}deg)`;

            img.style.transform = img.style.transform.split(" ").map(value =>
            {
                return value.indexOf("rotate") > -1 ? rotateString : value;
            }).join(" ");

            if (img.style.transform.indexOf("rotate") === -1) img.style.transform += rotateString;
        }

        const RemoveContent = (e : MouseEvent) =>
        {
            if (!img.contains(<HTMLElement>e.target))
            {
                Utilities.HideElement(filePreviewContainer);

                filePreviewContainer.querySelector("img").remove();

                document.removeEventListener("wheel", ScaleImage);
                document.removeEventListener("keydown", RotateImage);

                filePreviewContainer.removeEventListener("click", RemoveContent);
            }
        }

        filePreviewContainer.addEventListener("click", RemoveContent);

        document.addEventListener("wheel", ScaleImage);
        document.addEventListener("keydown", RotateImage);
    });

    contextMenuDisplayPdf.addEventListener("click", async () =>
    {
        Utilities.ShowElement(filePreviewContainer, "flex");

        const iframe = document.createElement("iframe");

        iframe.src = await storage.ref(`${Auth.UserId}/${contextMenuItem.id}`).getDownloadURL();
        iframe.frameBorder = "0";

        iframe.onload = () =>
        {
            Utilities.HideElement(filePreviewSpinner);

            Utilities.ShowElement(iframe);
        };

        iframe.onerror = () => filePreviewContainer.click();

        Utilities.HideElement(iframe);

        filePreviewContainer.appendChild(iframe);

        const RemoveContent = (e : MouseEvent) =>
        {
            if (!iframe.contains(<HTMLElement>e.target))
            {
                Utilities.HideElement(filePreviewContainer);

                filePreviewContainer.querySelector("iframe").remove();

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
        Utilities.HideElement(emptyFolder);

        Utilities.ShowElement(userContentLoadingSpinner);

        EmptyUserContentContainers();

        folderNavigation.querySelector("[data-update-field=folder-name]").innerHTML = "";
        folderNavigation.querySelector("[data-update-field=folder-name]").insertAdjacentElement("afterbegin", new Spinner().element);

        if (await vaultOnly(false))
        {
            viewMyAccount.click();
            
            return;
        }

        db.collection(`users/${Auth.UserId}/folders`).doc(Utilities.GetCurrentFolderId()).get().then((doc : any) =>
        {
            const parentId = doc.data().parentId;

            if (parentId === "vault")
            {
                vault.click();

                return;
            }

            Utilities.SetCurrentFolderId(parentId);

            history.pushState(null, "", GetFolderUrl(Utilities.GetCurrentFolderId(), IsShared()));

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

    editorClose.addEventListener("click", () =>
    {
        if (preventWindowUnload?.editor && !confirm(Translation.Get("generic->are_you_sure"))) return;

        editorElement.innerHTML = "";

        Utilities.RemoveAllClasses(editorElement, { "except": "editor" });

        Utilities.RemoveAllAttributes(editorElement, { "except": [ "class", "id" ] });

        showFile.id = "";
        showFile.setAttribute("content-type", "");
        showFile.querySelector(".name").innerHTML = "";

        header.style.backgroundColor = "";

        editor = null;

        preventWindowUnload.editor = false;

        history.pushState(null, "", GetFolderUrl(Utilities.GetCurrentFolderId(true), IsShared()));

        GetUserContent();

        Utilities.HideElement(showFile);

        Utilities.RemoveClass(document.documentElement, "wait");
        Utilities.RemoveClass(document.documentElement, "file-loading");
    });

    document.addEventListener("click", e =>
    {
        const target = <HTMLElement>e.target;

        if(target.closest(`${folderSelector} .menu-button, ${fileSelector} .menu-button, .vault .menu-button`) === null &&
            target.closest(editorMenuSelector) === null && target.closest("#cm-move") === null && !moreOptions.contains(target)) HideContextMenu();

        if ((<HTMLElement[]>[...foldersContainer.children, ...filesContainer.children]).filter(element => Utilities.HasClass(element, "selected")).length === 0)
            contextMenuItems = [];
    });

    document.addEventListener("scroll", () => HideContextMenu());

    document.addEventListener("contextmenu", e =>
        // Allow custom context menu only in non-touch devices, outside of any .allow-context-menu and inside .user-content
        (!Utilities.IsTouchDevice() && (<HTMLElement>e.target).closest(".allow-context-menu") === null && (<HTMLElement>e.target).closest(".user-content") !== null)
            ? showContextMenu(e)
            : HideContextMenu());

    document.addEventListener("drop", e =>
    {
        const items : DataTransferItemList = e.dataTransfer.items;

        Array.from(items).map(item => item.webkitGetAsEntry()).forEach((item : any) =>
        {
            if (item.isFile) item.file((file : File) => UploadFile(file, file.name, file.size, Utilities.GetCurrentFolderId()));
            else if (item.isDirectory)
            {
                const entries : File[] = [];

                GetFolderEntries(item, item.name + "/", entries);

                UploadFolder(entries, item.name, item.name + "/", Utilities.GetCurrentFolderId(), 0);
            }
        });
    });

    foldersContainer.parentElement.addEventListener("mousedown", e =>
    {
        if (isUserContentElement(<HTMLElement>e.target) && e.button === 2 && !Utilities.HasClass(GetUserContentElement(<HTMLElement>e.target), "selected"))
            (<HTMLElement[]>[...foldersContainer.children, ...filesContainer.children]).forEach(element => Utilities.RemoveClass(element, "selected"));

        if (isUserContentElement(<HTMLElement>e.target)) return;
        
        (<HTMLElement[]>[...foldersContainer.children, ...filesContainer.children]).forEach(element => Utilities.RemoveClass(element, "selected"));

        HideHeaderMenu();

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
            Utilities.ShowElement(multipleContentSelector);

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
                    Utilities.AddClass(element, "selected");
                else Utilities.RemoveClass(element, "selected");
            });

            contextMenuItem = null;
            contextMenuItems = (<HTMLElement[]>[...foldersContainer.children, ...filesContainer.children]).filter(element => Utilities.HasClass(element, "selected"));
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
                history.pushState(null, "", "/account/vault");

                Utilities.SetCurrentFolderId("vault");

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

            modal.AppendContent([ vaultPinInput ]);

            modal.OnConfirm = async () =>
            {
                const pin = input.value;

                if (Utilities.HasClass(input, "error")) vaultPinInput.previousElementSibling.remove();

                Utilities.RemoveClass(input, "error");

                if (pin.length < 4)
                {
                    Utilities.AddClass(input, "error");

                    vaultPinInput.insertAdjacentElement("beforebegin", new Component("p", {
                        class: "input-error",
                        innerText: Translation.Get("errors->vault_pin_too_short")
                    }).element);

                    return;
                }

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
                        vaultPinInput.insertAdjacentElement("beforebegin", new Component("p", {
                            class: "input-error",
                            innerText: Translation.Get("api->messages->vault->wrong_pin")
                        }).element);

                        modal.Show(true);
                    }
                });
            }

            input.focus();

            modal.Show(true);
        });
    });

    navigator.serviceWorker.addEventListener("message", e =>
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

    navigator.serviceWorker.controller?.postMessage("ready");

    if (location.href.indexOf("/file/") > -1)
    {
        let id = location.href.indexOf("/shared/") > -1
            ? location.href.substr(location.href.indexOf("/file/shared/") + 13)
            : location.href.substr(location.href.indexOf("/file/") + 6);

        if (id.indexOf("/") > -1) id = id.substr(0, id.indexOf("/"));

        ShowFile(id);

        await db.collection(`users/${Auth.UserId}/files`).doc(id).get().then((doc : any) =>
        {
            Utilities.SetCurrentFolderId(doc.data().parentId);

            GetUserContent();
        });

        if (!Auth.IsAuthenticated && location.pathname.indexOf("/shared/") > -1) Utilities.HideElement(editorClose);
    }

    if (await vaultOnly()) Auth.RefreshToken();

    GetUserContent();

    if (Auth.IsAuthenticated)
        db.collection(`users/${Auth.UserId}/config`).doc("preferences").onSnapshot((user : any) =>
        {
            const backgroundImageUrl = user.data().backgroundImageUrl;
            
            document.body.style.backgroundImage = backgroundImageUrl ? `url(${backgroundImageUrl})` : "";
        });
});

window.addEventListener("resize", () => HideContextMenu());

window.addEventListener("popstate", async () =>
{
    let id : string;

    if (location.href.indexOf("/account/") === -1)
    {
        if (location.pathname === "/account") id = "root";
        else if (location.pathname.indexOf("/folder/") > -1) id = location.href.substr(location.href.indexOf("/folder/") + 8);
        else if (location.pathname.indexOf("/file/") > -1)
        {
            id = location.href.substr(location.href.indexOf("/file/") + 6);

            if (id.indexOf("/") > -1) id = id.substr(0, id.indexOf("/"));

            id = (await db.collection(`users/${Auth.UserId}/folders`).doc((await db.collection(`users/${Auth.UserId}/files`).doc(id).get()).data().parentId).get()).id;
        }
    }
    else
    {
        if (location.pathname === "/account/shared") id = "shared";
        else if (location.pathname.indexOf("/account/shared/") > -1) id = location.href.substr(location.href.indexOf("/account/shared/") + 16);
        else if (location.pathname === "/account/starred") id = "starred";
        else if (location.pathname === "/account/trash") id = "trash";
    }

    if (id.indexOf("/") > -1) id = id.substr(0, id.indexOf("/"));

    Utilities.SetCurrentFolderId(id);

    GetUserContent();
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
    else if (key === "t")
    {
        if (!e.ctrlKey) viewTrashedContent.click();
    }
    else if (key === "delete") contextMenuDelete.click();
    else if (key === "backspace") contextMenuItems?.length > 0 ? contextMenuDelete.click() : (Utilities.GetCurrentFolderId() !== "root" ? navigationBackButton.click() : null);
    else if (key === "d") DownloadContent(Utilities.GetCurrentFolderId(), Utilities.UnescapeHtml(document.title), true);
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
    if (document.visibilityState === "hidden" && await vaultOnly()) Utilities.ShowElement(hideVaultContent, "flex");
    else Utilities.HideElement(hideVaultContent);
});

window.addEventListener("blur", async () =>
{
    if (await vaultOnly()) Utilities.ShowElement(hideVaultContent, "flex");
});

window.addEventListener("focus", async () => Utilities.HideElement(hideVaultContent));

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

    const shared = Utilities.GetCurrentFolderId() === "root" ? false : folderShared;
    const inVault = await vaultOnly();

    const metadata = { customMetadata: { shared: `${shared}`, inVault: `${inVault}` } };

    if (Utilities.IsSet(id) && typeof file === "string")
        ShowFileUploadModal(storage.ref(Auth.UserId + "/" + id).putString(file, (<any>window).firebase.storage.StringFormat.RAW, metadata), name, size, id)
            .then(() => resolveUpload())
            .catch(error => rejectUpload(error));
    else
    {
        if (parentId === "starred" || parentId === "trash") parentId = "root";

        if (await vaultOnly(false)) parentId = "vault";

        name = await CheckElementNameValidity(name, "file", parentId);

        db.collection(`users/${Auth.UserId}/files`).add({
            name,
            parentId,
            shared,
            starred: false,
            trashed: false,
            inVault,
            created: Utilities.GetFirestoreServerTimestamp(),
            ...Utilities.GetFirestoreUpdateTimestamp()
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
            modal.TransferSize.innerHTML = Utilities.FormatStorage(snapshot.bytesTransferred);
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

const GetUserContent = async (searchTerm ?: string) =>
{
    const parentId = Utilities.GetCurrentFolderId(true);

    EmptyUserContentContainers();

    if (parentId === "root" && navigator.onLine && !searchTerm)
    {
        Utilities.ShowElement(vault, "flex");

        db.collection(`users/${Auth.UserId}/vault`).doc("status").onSnapshot((snapshot : any) =>
        {
            if (snapshot.exists)
            {
                const locked : boolean = snapshot.data().locked;

                vault.querySelector(".name p").innerHTML = `${Translation.Get("generic->vault")} <i class="fas fa-lock${locked ? "" : "-open"}"></i>`;

                vault.setAttribute("data-locked", `${locked}`);

                locked ? Utilities.AddClass(vault, "disabled") : Utilities.RemoveClass(vault, "disabled");
            }

            Auth.RefreshToken();
        });
    }
    else Utilities.HideElement(vault);

    Utilities.HideElement(vaultInfo);

    // The user is probably loading a file, this function will be called later when the file parentId is received by the client
    if (parentId === "") return;

    if (Utilities.IsSet(unsubscribeFoldersListener)) unsubscribeFoldersListener();
    if (Utilities.IsSet(unsubscribeFilesListener)) unsubscribeFilesListener();

    if (IsShowFileVisible() && location.pathname.indexOf("/file/") === -1) editorClose.click();

    if ((searchTerm ?? "").length === 0)
    {
        if (parentId !== "root" && Utilities.GetCurrentFolderId(true) !== "shared" && !starredOnly() && !trashedOnly() && location.pathname.indexOf("/file/") === -1)
        {
            if (!await vaultOnly(false)) // If this isn't the vault root directory
            {
                folderNavigation.querySelector("[data-update-field=folder-name]").innerHTML = "";
                folderNavigation.querySelector("[data-update-field=folder-name]").insertAdjacentElement("afterbegin", new Spinner().element);

                await db.collection(`users/${Auth.UserId}/folders`).doc(parentId).get().then((doc : any) =>
                {
                    const data = doc.data();

                    document.querySelectorAll("[data-update-field=folder-name]").forEach(element => (<HTMLElement>element).innerHTML = Utilities.EscapeHtml(data.name));

                    folderShared = data.shared;

                    Utilities.ShowElement(folderNavigation, "flex");

                    Utilities.ShowElement(folderNavigation.querySelector("[data-update-field=folder-name]"));

                    Utilities.HideElements([
                        emptyTrashButton,
                        lockVaultButton
                    ]);

                    if (Auth.IsAuthenticated) Utilities.ShowElement(navigationBackButton, "flex");
                    else
                    {
                        const parentId : string = data.parentId;

                        // A user cannot access another user's root (even if only shared content is shown), only one folder (get operation) is allowed just to get the name
                        if (parentId === "root") Utilities.HideElement(navigationBackButton);
                        else
                        {
                            db.collection(`users/${Auth.UserId}/folders`).doc(parentId).get()
                                .then(() => Utilities.ShowElement(navigationBackButton, "flex")) // If the query succeeds the folder is shared
                                .catch(() => Utilities.HideElement(navigationBackButton)); // Otherwise hide the navigation
                        }
                    }
                });
            }
            else
            {
                document.querySelectorAll("[data-update-field=folder-name]").forEach(element => element.innerHTML = Translation.Get("generic->vault"));
            }

            if (await vaultOnly())
            {
                Utilities.ShowElements([
                    folderNavigation,
                    navigationBackButton,
                    vaultInfo
                ], "flex");

                Utilities.ShowElement(lockVaultButton);

                Utilities.HideElement(emptyTrashButton);
            }
        }
        else
        {
            if (trashedOnly())
            {
                Utilities.ShowElement(folderNavigation, "flex");
                Utilities.ShowElement(emptyTrashButton);

                Utilities.HideElements([
                    navigationBackButton,
                    lockVaultButton,
                    folderNavigation.querySelector("[data-update-field=folder-name]")
                ]);
            }
            else Utilities.HideElement(folderNavigation);

            if (location.pathname.indexOf("file") === -1)
                document.querySelectorAll("[data-update-field=folder-name]").forEach(element => element.innerHTML = Translation.Get("account->title"));
        }
    }

    (<HTMLDivElement>document.querySelector(".user-content")).style.height = `calc(100% - ${document.querySelector(".top-section").clientHeight}px)`;

    Utilities.HideElement(emptyFolder);

    Utilities.ShowElement(userContentLoadingSpinner);

    let callCount = 0; // The number of times UserContentLoaded has been called

    const UserContentLoaded = async (isUpdate : boolean) =>
    {
        callCount++;

        addUserContentEvents();

        if (AreUserContentContainersEmpty() && (callCount === 2 || isUpdate)) // When both folders and files are loaded
        {
            emptyFolder.querySelector("h2").innerHTML = Translation.Get(`api->messages->folder->${
                !navigator.onLine
                    ? "offline"
                    : (searchTerm?.length > 0
                        ? "no_search_results"
                        : (await vaultOnly(false)
                            ? "vault_empty"
                            : "empty"
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
                            : (trashedOnly()
                                ? "trash"
                                : (await vaultOnly(false)
                                    ? "vault"
                                    : "empty"
                                )
                            )
                        )
                    )
            }.svg${await vaultOnly() ? "?v=3" : ""}`;

            Utilities.ShowElement(emptyFolder, "flex");
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

    if (sharedOnly()) foldersRef = foldersRef.where("shared", "==", true);
    else if (starredOnly()) foldersRef = foldersRef.where("starred", "==", true);

    if (!(sharedOnly() && Auth.IsAuthenticated) && !starredOnly() && !trashedOnly() && (searchTerm ?? "").length === 0)
        foldersRef = foldersRef.where("parentId", "==", parentId);

    if (searchTerm?.length > 0)
    {
        foldersRef = foldersRef.where("name", ">=", searchTerm).where("name", "<", end);

        analytics.logEvent("search", { search_term: searchTerm });
    }

    foldersRef = foldersRef.where("inVault", "==", await vaultOnly());

    let foldersUpdateCount = 0;

    unsubscribeFoldersListener = foldersRef.onSnapshot((snapshot : any) =>
    {
        Utilities.HideElement(userContentLoadingSpinner);

        const elements = Array.from(<NodeListOf<HTMLElement>>foldersContainer.querySelectorAll(folderSelector));

        elements.forEach(element => Utilities.AddClass(element, "old"));

        snapshot.docs
            .sort((a : any, b : any) => collator.compare(a.data().name, b.data().name))
            .forEach((doc : any) =>
            {
                CreateUserContent(
                    "folder",
                    doc.data().name,
                    doc.id,
                    doc.data().shared,
                    doc.data().starred,
                    doc.data().trashed
                ).setAttribute("data-search-term", searchTerm ?? "");
            });

        foldersContainer.querySelectorAll(".old").forEach(element => element.remove());

        UserContentLoaded(foldersUpdateCount > 0);

        foldersUpdateCount++;
    });

    let filesRef = db.collection(`users/${Auth.UserId}/files`).where("trashed", "==", trashedOnly());

    if (sharedOnly()) filesRef = filesRef.where("shared", "==", true);
    else if (starredOnly()) filesRef = filesRef.where("starred", "==", true);

    if (!(sharedOnly() && Auth.IsAuthenticated) && !starredOnly() && !trashedOnly() && (searchTerm ?? "").length === 0)
        filesRef = filesRef.where("parentId", "==", parentId);

    if (searchTerm?.length > 0) filesRef = filesRef.where("name", ">=", searchTerm).where("name", "<", end);

    filesRef = filesRef.where("inVault", "==", await vaultOnly() && !trashedOnly());

    let filesUpdateCount = 0;

    unsubscribeFilesListener = filesRef.onSnapshot((snapshot : any) =>
    {
        const elements = <NodeListOf<HTMLElement>>filesContainer.querySelectorAll(fileSelector);

        elements.forEach(element => Utilities.AddClass(element, "old"));

        snapshot.docs
            .sort((a : any, b : any) => collator.compare(a.data().name, b.data().name))
            .forEach((doc : any) =>
            {
                CreateUserContent(
                    "file",
                    doc.data().name,
                    doc.id,
                    doc.data().shared,
                    doc.data().starred,
                    doc.data().trashed
                ).setAttribute("data-search-term", searchTerm ?? "");
            });

        filesContainer.querySelectorAll(".old").forEach(element => element.remove());

        UserContentLoaded(filesUpdateCount > 0);
       
        filesUpdateCount++;
    });

    Utilities.LogPageViewEvent();
}

const showContextMenu = (e : MouseEvent) : void =>
{
    const target = <HTMLElement>e.target;
    const contentTarget = GetUserContentElement(<HTMLElement>e.target);

    contextMenuItem = null;
    contextMenuItems = (<HTMLElement[]>[...foldersContainer.children, ...filesContainer.children]).filter(element => Utilities.HasClass(element, "selected"));

    // Every event would have been fired twice because with length === 1 as contextMenuItem would have been the same element
    if (contextMenuItems?.length === 1) contextMenuItems = [];

    Utilities.HideElements([ contextMenuMoveSelector, contextMenuTools ]);

    if ((isUserContentElement(contentTarget) || target.closest(editorMenuSelector) !== null) && contextMenuItems.length <= 1)
    {
        Utilities.ShowElements(<HTMLElement[]>[contextMenuContent, ...contextMenuContent.children]);

        if (isUserContentElement(contentTarget)) contextMenuItem = contentTarget;
        else contextMenuItem = document.getElementById(showFile.id);

        Utilities.HideElements(<HTMLElement[]>[
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
            Utilities.HideElements([
                contextMenuMove,
                contextMenuRename
            ]);
        else if (Auth.IsAuthenticated)
            Utilities.ShowElements([
                contextMenuMove,
                contextMenuRename
            ]);

        if (contextMenuItem.getAttribute("data-trashed") === "false")
        {
            if (contextMenuItem.getAttribute("data-shared") === "true")
            {
                if ((<any>navigator).share) Utilities.ShowElement(contextMenuSharingOptions);
                
                Utilities.ShowElement(contextMenuCopyShareableLink);

                if (Auth.IsAuthenticated) Utilities.ShowElement(contextMenuUnshare);
            }
            else Utilities.ShowElement(contextMenuShare);

            if (contextMenuItem.getAttribute("data-starred") === "true" && Auth.IsAuthenticated) Utilities.ShowElement(contextMenuRemoveFromFavourites);
            else if (Auth.IsAuthenticated) Utilities.ShowElement(contextMenuAddToFavourites);

            if (target.closest(editorMenuSelector) === null) Utilities.ShowElement(contextMenuView);
            else if (Auth.IsAuthenticated && Utilities.IsSet(editor)) Utilities.ShowElement(contextMenuSave);

            if (Auth.IsAuthenticated) Utilities.ShowElement(contextMenuDelete);
            else if (Auth.IsSignedIn) Utilities.ShowElement(contextMenuSaveToMyAccount);

            Utilities.ShowElement(contextMenuInfo);

            if (navigator.onLine) Utilities.ShowElement(contextMenuDownload);
        }
        else if (Auth.IsAuthenticated)
        {
            Utilities.HideElements([
                contextMenuInfo,
                contextMenuDownload
            ]);

            Utilities.ShowElements([
                contextMenuDelete,
                contextMenuRestore
            ]);
        }
    }
    else if (moreOptions.contains(target))
    {
        Utilities.HideElements([ contextMenuContent, contextMenuGeneric, contextMenuVault ]);

        Utilities.ShowElement(contextMenuTools);
    }
    else if (Auth.IsAuthenticated && contextMenuItems.length === 0)
    {
        Utilities.HideElements([ contextMenuContent, contextMenuGeneric, contextMenuVault ]);

        if (!vault.contains(target)) Utilities.ShowElements(<HTMLElement[]>[contextMenuGeneric, ...contextMenuGeneric.children]);
        else
        {
            const vaultLocked = vault.getAttribute("data-locked");

            Utilities.HideElements(<HTMLElement[]>[ ...contextMenuVault.children ]);

            Utilities.ShowElements([
                contextMenuVault,
                vaultLocked === "true" ? contextMenuUnlockVault : (vaultLocked === "false" ? contextMenuLockVault : contextMenuCreateVault)
            ]);
        }
    }
    else if (contextMenuItems.length > 1)
    {
        Utilities.HideElements(<HTMLElement[]>[...contextMenuContent.children, contextMenuGeneric, contextMenuVault]);

        Utilities.ShowElement(contextMenuContent);

        if (Auth.IsAuthenticated) Utilities.ShowElement(contextMenuDelete);
        else if (Auth.IsSignedIn) Utilities.ShowElement(contextMenuSaveToMyAccount);

        if (contextMenuItems.filter(element => element.getAttribute("data-trashed") === "false").length > 0)
        {
            if (Auth.IsAuthenticated)
            {
                if (contextMenuItems.filter(element => element.getAttribute("data-starred") === "false").length > 0) Utilities.ShowElement(contextMenuAddToFavourites);
                else if (contextMenuItems.filter(element => element.getAttribute("data-starred") === "true").length > 0) Utilities.ShowElement(contextMenuRemoveFromFavourites);

                Utilities.ShowElements([ contextMenuMove ]);
            }

            Utilities.ShowElements([ contextMenuDownload ]);
        }
        else Utilities.ShowElement(contextMenuRestore);
    }

    if (!showFile.getAttribute("content-type")?.startsWith("image/")) Utilities.HideElement(contextMenuDisplayImage);
    
    if (showFile.getAttribute("content-type") !== "application/pdf") Utilities.HideElement(contextMenuDisplayPdf);

    if (!(<HTMLHeadingElement>showFile.querySelector(".name")).innerText.endsWith(".xml")) Utilities.HideElement(contextMenuValidateXml);

    if (!(<HTMLHeadingElement>showFile.querySelector(".name")).innerText.endsWith(".json")) Utilities.HideElement(contextMenuValidateJson);

    Utilities.ShowElement(contextMenu);

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
    Utilities.HideElement(contextMenu);

    contextMenuItem = null;
}

let AllowContentMoveTouchDevice : boolean = false;

const addUserContentEvents = () : void =>
{
    const userContentMenuButtons = (<NodeListOf<HTMLButtonElement>>document.querySelectorAll(folderSelector + " .menu-button button," + fileSelector + " .menu-button button"));
    const userContentElements = (<NodeListOf<HTMLDivElement>>document.querySelectorAll(`${folderSelector}, ${fileSelector}`));

    [ ...userContentMenuButtons, <HTMLButtonElement>vault.querySelector(".menu-button button") ].forEach(element => element.addEventListener("click", showContextMenu));

    editorMenu.addEventListener("click", showContextMenu);

    if (sharedOnly() || starredOnly() || trashedOnly()) return;

    [...userContentElements, navigationBackButton, vault].forEach(element =>
    {
        const HandleTargetElement = (e : MouseEvent | TouchEvent) : void =>
        {
            const targetFromPoint = (<TouchEvent>e).touches && <HTMLElement>document.elementFromPoint((<TouchEvent>e).touches[0].clientX, (<TouchEvent>e).touches[0].clientY);

            if (((e.type === "touchmove" &&
                element.contains(targetFromPoint) && // Avoid making all the folders a target if the element is dragged over the back button or the vault
                (Utilities.IsSet(targetFromPoint?.closest(folderSelector)) || navigationBackButton.contains(targetFromPoint) || vault.contains(targetFromPoint))) ||
                e.type === "mouseenter") &&
                Utilities.IsSet(document.querySelector(".dragging")) &&
                (targetFromPoint?.id || element.id) !== document.querySelector(".dragging").id &&
                !Utilities.HasClass(targetFromPoint?.closest(folderSelector) || element, "placeholder"))
                Utilities.AddClass(targetFromPoint?.closest(folderSelector) || element, "target");
            else Utilities.RemoveClass(element, "target");
        }

        if (Utilities.HasClass(element, "folder") || Utilities.HasClass(element, "back-button") || Utilities.HasClass(element, "vault"))
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

            if (Utilities.IsTouchDevice())
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
const HandlePageChangeAndLoadUserContent = (e : MouseEvent | TouchEvent, targetElement ?: HTMLElement) =>
{
    const target = targetElement ?? (<HTMLElement>e.target);

    if (target.closest(".menu-button") === null &&
        GetUserContentElement(target)?.getAttribute("data-trashed") === "false" &&
        !Utilities.HasClass(GetUserContentElement(target), "placeholder") &&
        !Utilities.HasClass(GetUserContentElement(target), "dragging"))
    {
        const closestFile = target.closest(fileSelector);

        const openInNewWindow = e instanceof MouseEvent && e.button === 1; // Mouse wheel

        HideContextMenu();
        HideHeaderMenu();

        if (openInNewWindow) open(getUserContentURL(GetUserContentElement(target), IsShared()));
        else
        {
            if (closestFile === null)
            {
                Utilities.SetCurrentFolderId(target.closest(folderSelector).id);
    
                GetUserContent();
            }
            else ShowFile(closestFile.id);
    
            history.pushState(null, "", getUserContentURL(GetUserContentElement(target), IsShared()));
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
        if (!Utilities.IsSet(element)) return;

        const top : number = (<MouseEvent>ev).pageY ?? (<TouchEvent>ev).touches[0].pageY;
        const left : number = (<MouseEvent>ev).pageX ?? (<TouchEvent>ev).touches[0].pageX;

        // If this was called by a touchmove event and the user didn't yet reached the context menu
        if (!ignoreMovement && ev.type === "touchmove" && !AllowContentMoveTouchDevice)
        {
            moved = true;

            return;
        }

        HideContextMenu();

        if (Auth.IsAuthenticated)
        {
            if (Utilities.IsTouchDevice()) moved = true;

            if (!ignoreMovement)
            {
                // Set moved=true only if the mouse moved by at least 5px
                if (Math.abs(left - (<MouseEvent>e).pageX ?? (<TouchEvent>e).touches[0].pageX) > 5 || Math.abs(top - (<MouseEvent>e).pageY ?? (<TouchEvent>e).touches[0].pageY) > 5)
                    moved = true;

                if (moved) Utilities.ShowElement(element, "flex");
            }
            else if (Utilities.IsTouchDevice()) Utilities.ShowElement(element, "flex");

            if (moved)
            {
                [foldersContainer, filesContainer].forEach(element =>
                    (<NodeListOf<HTMLDivElement>>element.querySelectorAll(`${folderSelector}, ${fileSelector}`)).forEach(element =>
                        Utilities.AddClasses(element, [ "no-hover", Utilities.HasClass(element, "file") ? "disabled" : "" ])));
    
                Object.assign(element.style, {
                    top: top + "px",
                    left: left + "px"
                });

                Utilities.AddClass(element, "dragging");

                Utilities.AddClass(placeholderElement, "placeholder");
            
                Utilities.AddClass(document.documentElement, "grabbing");
            }
        }
    }

    const ResetElement = async (ev : MouseEvent | TouchEvent) =>
    {
        const target : HTMLElement = foldersContainer.querySelector(".target");

        let parentId = null;

        AllowContentMoveTouchDevice = false;

        [foldersContainer, filesContainer].forEach(element =>
            (<NodeListOf<HTMLDivElement>>element.querySelectorAll(`${folderSelector}, ${fileSelector}`)).forEach(element =>
            {
                Utilities.RemoveClass(element, "no-hover");

                if (Utilities.HasClass(element, "file")) Utilities.RemoveClass(element, "disabled");
            }));

        Utilities.RemoveClass(placeholderElement, "placeholder");

        Utilities.RemoveClass(document.documentElement, "grabbing");

        element.remove();
        element = null;

        if (Utilities.IsSet(target))
        {
            parentId = target.id;

            Utilities.RemoveClass(target, "target");
        }
        else if (Utilities.HasClass(navigationBackButton, "target"))
        {
            parentId = await vaultOnly() ? "root" : (await db.collection(`users/${Auth.UserId}/folders`).doc(Utilities.GetCurrentFolderId()).get()).data().parentId;

            Utilities.RemoveClass(navigationBackButton, "target");
        }
        else if (Utilities.HasClass(vault, "target"))
        {
            if (vault.getAttribute("data-locked") === "false") parentId = "vault";

            Utilities.RemoveClass(vault, "target");
        }

        if (!moved) HandlePageChangeAndLoadUserContent(ev);
        else if (Utilities.IsSet(parentId) && Auth.IsAuthenticated)
            MoveElements(tempArray, parentId);

        document.removeEventListener("mousemove", MoveElement);
        document.removeEventListener("touchmove", MoveElement);
        document.removeEventListener("mouseup", ResetElement);
        document.removeEventListener("touchend", ResetElement);
    }

    if (Utilities.IsSet(element) && e.which !== 3) // Not on right click
    {
        if (!ignoreMovement)
        {
            Utilities.HideElement(element);

            document.body.appendChild(element);

            document.removeEventListener("mousemove", MoveElement);
            document.removeEventListener("touchmove", MoveElement);
            document.removeEventListener("mouseup", ResetElement);
            document.removeEventListener("touchend", ResetElement);

            document.addEventListener("mousemove", MoveElement);
            document.addEventListener("touchmove", MoveElement);
            document.addEventListener("mouseup", ResetElement);
            document.addEventListener("touchend", ResetElement);
        }
        else if (Utilities.IsTouchDevice()) MoveElement(e, true);
    }
}

const isUserContentElement = (element : HTMLElement) : boolean => Utilities.IsSet(GetUserContentElement(element));

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
                        innerHTML: Utilities.EscapeHtml(name)
                    }).element
                ]
            }).element,
            new Component("div", {
                class: "menu-button",
                children: [
                    new Component("button", {
                        children: [
                            new Component("i", {
                                class: "fas fa-ellipsis-v"
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
    
    Utilities.HideElement(emptyFolder);

    return element;
}

const CreateEditor = (value : string, language : string) : void =>
{
    Utilities.RemoveClass(document.documentElement, "wait");
    Utilities.RemoveClass(document.documentElement, "file-loading");

    editorElement.innerHTML = "";

    preventWindowUnload.editor = false;

    editor = (<any>window).monaco.editor.create(editorElement, {
        value: value,
        language: language,
        theme: "vs-dark",
        automaticLayout: true,
        readOnly: !Auth.IsSignedIn
    });

    editor.onDidChangeModelContent(() => preventWindowUnload.editor = value !== editor.getValue());
}

const ShowFile = (id : string, skipFileLoading ?: boolean, forceDownload ?: boolean) : void =>
{
    if (Utilities.HasClass(document.documentElement, "file-loading")) return; // Do not allow multiple clicks

    Utilities.AddClass(document.documentElement, "wait");

    showFileName.innerHTML = "";
    showFileName.insertAdjacentElement("afterbegin", new Spinner().element);

    editorElement.innerHTML = "";
    editorElement.insertAdjacentElement("afterbegin", new Spinner().element);

    showFile.id = id;

    Utilities.ShowElement(showFile);

    header.style.backgroundColor = getComputedStyle(showFile).getPropertyValue("background-color");

    // If the user is on a file URL but the Auth.UserId is not yet ready
    if (skipFileLoading) return;

    Utilities.AddClass(document.documentElement, "file-loading");

    db.collection(`users/${Auth.UserId}/files`).doc(id).get().then((doc : any) =>
    {
        const name : string = doc.data().name;
        const language = <string>Linguist.Detect(name, true);
        const size = doc.data().size;

        showFileName.innerHTML = Utilities.EscapeHtml(name);

        // document.title acts like innerText so it displays the escaped characters and not what the user typed
        document.head.querySelector("[data-update-field=folder-name]").innerHTML = Utilities.EscapeHtml(name);

        Utilities.LogPageViewEvent();

        if (!navigator.onLine)
        {
            editorElement.innerHTML = "";
            editorElement.insertAdjacentElement("afterbegin", new Component("p", { innerText: Translation.Get("errors->offline") }).element);

            Utilities.RemoveClass(document.documentElement, "wait");
            Utilities.RemoveClass(document.documentElement, "file-loading");

            return;
        }

        // If the user enabled the Data Saving option do not allow downloading files bigger than 1MB
        // If the size of the file to be downloaded is bigger than what the user can download in one second
        if (((<any>navigator)?.connection.saveData && size > 1 * 1000 * 1000 || size > ((<any>navigator)?.connection.downlink / 8) * 1000 * 1000) && !forceDownload)
        {
            editorElement.innerHTML = "";
            editorElement.insertAdjacentElement("afterbegin", new Component("button", {
                class: "force-download",
                children: [
                    new Component("i", { class: "fas fa-download" }).element,
                    new Component("span", { innerText: ` ${Translation.Get("generic->download")}` }).element
                ]
            }).element);

            editorElement.querySelector(".force-download").addEventListener("click", () => ShowFile(id, false, true));

            Utilities.RemoveClass(document.documentElement, "wait");
            Utilities.RemoveClass(document.documentElement, "file-loading");

            return;
        }

        storage.ref(`${Auth.UserId}/${id}`).getDownloadURL().then((url : string) =>
            fetch(url).then(async response =>
            {
                const reader = response.body.getReader();

                let chunks : Uint8Array[] = [];

                const downloadSize = parseInt(response.headers.get("Content-Length"));
                let downloadedBytes = 0;

                let value = "";

                const contentType = response.headers.get("Content-Type");

                showFile.setAttribute("content-type", contentType);

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
                        modal.TransferSize.innerText = Utilities.FormatStorage(downloadedBytes);
                    }
                    
                    modal.Remove();

                    value = new TextDecoder().decode(Uint8Array.from(chunks.reduce((previousValue, currentValue) => [...previousValue, ...currentValue], [])));
                }

                CreateEditor(value, language);

                if (contentType.startsWith("image/")) Utilities.ShowElement(contextMenuDisplayImage);
                else if (contentType === "application/pdf") Utilities.ShowElement(contextMenuDisplayPdf);
                else if (name.endsWith(".xml")) Utilities.ShowElement(contextMenuValidateXml);
                else if (name.endsWith(".json")) Utilities.ShowElement(contextMenuValidateJson);
            })).catch((err : any) => err);
    });
}

const GetFolderUrl = (id : string, isShared : boolean) : string => (id !== "root" && id !== "starred" && id !== "trash" && id !== "vault")
    ? getUserContentURL(<HTMLElement><unknown>{classList: ["folder"], id: id}, isShared)
    : location.origin + "/account" + (isShared ? "/shared" : (id === "starred" ? "/starred" : (id === "trash" ? "/trash" : (id === "vault" ? "/vault" : ""))));

const UploadFolder = async (files : File[], name : string, path : string, parentId : string, depth : number) : Promise<void> =>
{
    if (depth === 0) // Duplicate checks are only useful with the uploaded folder
        name = await CheckElementNameValidity(name, "folder", parentId);

    if (await vaultOnly(false)) parentId = "vault";

    db.collection(`users/${Auth.UserId}/folders`).add({
        name,
        parentId,
        shared: false,
        starred: false,
        trashed: false,
        inVault: await vaultOnly(),
        created: Utilities.GetFirestoreServerTimestamp(),
        ...Utilities.GetFirestoreUpdateTimestamp()
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

const EmptyUserContentContainers = () : void => {foldersContainer.innerHTML = filesContainer.innerHTML = "";}

const IsShared = () : boolean => !Auth.IsAuthenticated || location.pathname.indexOf("/shared") > -1;

const UpdateBottomSectionBar = (selectedItem : HTMLElement) : void =>
{
    Utilities.RemoveClass(viewMyAccount, "selected");
    Utilities.RemoveClass(viewSharedContent, "selected");
    Utilities.RemoveClass(viewStarredContent, "selected");
    Utilities.RemoveClass(viewTrashedContent, "selected");

    Utilities.AddClass(selectedItem, "selected");

    searchBar.value = "";
}

const GetUserContentElement = (target : HTMLElement) : HTMLElement => target?.closest(`${folderSelector}, ${fileSelector}`);

const DownloadContent = async (id : string, name : string, isFolder : boolean, format ?: string) =>
{
    if (isFolder && (!Utilities.IsSet(format) || (format !== "zip" && format !== "tar" && format !== "tar.gz"))) format = "zip";

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
            format: format
        }).finally(() => modalCompressingFolder.HideAndRemove());
    }

    preventWindowUnload.fileDownload = true;

    storage.ref(`${Auth.UserId}/${id}${isFolder ? `.${format}` : ""}`).getDownloadURL().then((url : string) =>
        fetch(url).then(async response =>
        {
            const reader = response.body.getReader();

            let chunks : Uint8Array[] = [];

            const downloadSize = parseInt(response.headers.get("Content-Length"));
            let downloadedBytes = 0;

            const modal = new DownloadModal(name, downloadSize);

            while (true)
            {
                const { done, value } = await reader.read();

                if (done) break;

                downloadedBytes += value.length;

                chunks.push(value);

                const progress = (downloadedBytes / downloadSize) * 100;

                modal.ProgressBar.style.width = progress + "%";
                modal.TransferSize.innerText = Utilities.FormatStorage(downloadedBytes);
            }

            modal.Remove();

            return new Blob(chunks);
        }).then(blob =>
        {
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.download = Utilities.UnescapeHtml(name);
            a.href = blobUrl;

            document.body.appendChild(a); // If it isn't appended it won't work in Firefox
                    
            a.click();
            a.remove();

            preventWindowUnload.fileDownload = false;
        }));
}

const sharedOnly = () : boolean => (location.pathname === "/account/shared" && Utilities.GetCurrentFolderId(true) === "shared") || !Auth.IsAuthenticated;
const starredOnly = () : boolean => location.pathname === "/account/starred" && Utilities.GetCurrentFolderId(true) === "starred";
const trashedOnly = () : boolean => location.pathname === "/account/trash" && Utilities.GetCurrentFolderId(true) === "trash";
const vaultOnly = async (checkCurrentFolder ?: boolean) : Promise<boolean> =>
    (location.pathname === "/account/vault" && Utilities.GetCurrentFolderId(true) === "vault") ||
    (((!Utilities.IsSet(checkCurrentFolder) || checkCurrentFolder) &&
    await Utilities.GetCurrentFolderIdAsync() !== "root" &&
    (await db.collection(`users/${Auth.UserId}/folders`).doc(await Utilities.GetCurrentFolderIdAsync()).get()).data().inVault));

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
            ...Utilities.GetFirestoreUpdateTimestamp()
        });
    }

    batch.commit();
}

const IsShowFileVisible = () : boolean => getComputedStyle(showFile).getPropertyValue("display") !== "none";

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

        Utilities.AddClass(location.href.indexOf("/shared/") === -1 ? viewMyAccount : viewSharedContent, "selected");
    }
    else if (location.pathname.indexOf("/file/") > -1)
    {
        currentFolderId = ""; // Avoid loading the root content if this file's parentId is unknown

        Utilities.AddClass(location.href.indexOf("/shared/") === -1 ? viewMyAccount : viewSharedContent, "selected");

        let id = location.href.indexOf("/shared/") > -1
            ? location.href.substr(location.href.indexOf("/file/shared/") + 13)
            : location.href.substr(location.href.indexOf("/file/") + 6);

        if (id.indexOf("/") > -1) id = id.substr(0, id.indexOf("/"));

        ShowFile(id, true);
    }
    else if (location.pathname === "/account/shared")
    {
        currentFolderId = "shared";

        Utilities.AddClass(viewSharedContent, "selected");
    }
    else if (location.pathname === "/account/starred")
    {
        currentFolderId = "starred";

        Utilities.AddClass(viewStarredContent, "selected");
    }
    else if (location.pathname === "/account/trash")
    {
        currentFolderId = "trash";

        Utilities.AddClass(viewTrashedContent, "selected");
    }
    else if (location.pathname === "/account/vault")
    {
        currentFolderId = "vault";

        Utilities.AddClass(viewMyAccount, "selected");
    }
    else Utilities.AddClass(viewMyAccount, "selected");

    Utilities.SetCurrentFolderId(currentFolderId);
}