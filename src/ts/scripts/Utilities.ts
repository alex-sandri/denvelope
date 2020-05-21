export const ShowElement = (element: HTMLElement, displayType?: string): void => { element.style.display = displayType ?? "block"; }

export const ShowElements = (elements: Array<HTMLElement>, displayType?: string): void => elements.forEach(element => ShowElement(element, displayType));

export const HideElement = (element: HTMLElement): void => { element.style.display = "none"; }

export const HideElements = (elements: HTMLElement[] | NodeListOf<HTMLElement>): void => elements.forEach((element: HTMLElement) => HideElement(element));

export const RemoveAllElements = (selector: string): void => document.querySelectorAll(selector).forEach(element => element.remove());

export const AddClass = (element: HTMLElement, className: string): void => element.classList.add(className);

export const AddClasses = (element: HTMLElement, classes: string[]): void => classes.filter(element => element.length > 0)
    .forEach(className => AddClass(element, className));

export const RemoveClass = (element: HTMLElement, className: string): void => element.classList.remove(className);

export const HasClass = (element: HTMLElement, className: string): boolean => element.classList.contains(className);

export const IsSet = (object: any): boolean => object !== null && object !== undefined;

export const PreventDragEvents = (): void =>
{
    document.addEventListener("drag", e => e.preventDefault());
    document.addEventListener("dragend", e => e.preventDefault());
    document.addEventListener("dragenter", e => e.preventDefault());
    document.addEventListener("dragexit", e => e.preventDefault());
    document.addEventListener("dragleave", e => e.preventDefault());
    document.addEventListener("dragover", e => e.preventDefault());
    document.addEventListener("dragstart", e => e.preventDefault());
    document.addEventListener("drop", e => e.preventDefault());
}

export const SetCookie = (name: string, value: string, months: number) =>
{
    const d = new Date();

    d.setTime(d.getTime() + months * 30 * 24 * 60 * 60 * 1000);

    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

export const GetCookie = (name: string) => document.cookie.substr(document.cookie.indexOf(name)).substr(name.length + 1).split(";")[0] || null;

export const DeleteCookie = (name: string) => SetCookie(name, null, -1);

export const IsSetCookie = (name: string): boolean => document.cookie.indexOf(name + "=") > -1;

export const DispatchEvent = (name: string) => window.dispatchEvent(new Event(name));

export const FormatStorage = (bytes: number): string =>
{
    let unit = "";

    for (var i = 0; bytes >= 1000; i++) bytes /= 1000;

    switch (i)
    {
        case 0:
            unit = "B"; // Byte 
            break;
        case 1:
            unit = "KB"; // KiloByte
            break;
        case 2:
            unit = "MB"; // MegaByte
            break;
        case 3:
            unit = "GB"; //GigaByte
            break;
        case 4:
            unit = "TB"; // TeraByte
            break;
        case 5:
            unit = "PB"; // PetaByte
            break;
        case 6:
            unit = "EB"; // ExaByte
            break;
        case 7:
            unit = "ZB"; // ZettaByte
            break;
        case 8:
            unit = "YB"; // YottaByte
            break;
        default:
            break;
    }

    // The plus is needed to remove any useless zeros (0.00 -> 0)
    return +bytes.toFixed(2) + unit;
}

/**
 * @param milliseconds The number of milliseconds since the unix epoch
 */
export const FormatDate = (milliseconds: number, options?: Intl.DateTimeFormatOptions): string =>
    new Date(milliseconds).toLocaleDateString(document.documentElement.lang, options || {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZoneName: "short",
    });

export const GetCurrentFolderId = (allowFakeFolderIds?: boolean): string =>
{
    let folderId = (<HTMLInputElement>document.querySelector("input[name=folder-id]")).value;

    if ((folderId === "trash" || folderId === "starred" || folderId === "shared" || folderId === "vault") &&
        (!IsSet(allowFakeFolderIds) || !allowFakeFolderIds))
        folderId = "root";

    return folderId;
}

export const GetCurrentFolderIdAsync = async (allowFakeFolderIds?: boolean): Promise<string> => new Promise<string>(resolve =>
{
    if (GetCurrentFolderId(allowFakeFolderIds).trim() !== "") resolve(GetCurrentFolderId(allowFakeFolderIds));

    (<HTMLInputElement>document.querySelector("input[name=folder-id]")).addEventListener(
        "change",
        () => resolve(GetCurrentFolderId(allowFakeFolderIds)),
        { once: true });
});

export const SetCurrentFolderId = (id: string): void => { (<HTMLInputElement>document.querySelector("input[name=folder-id]")).value = id; }

export const GetFirestoreServerTimestamp = (): any => (<any>window).firebase.firestore.FieldValue.serverTimestamp();

export const GetFirestoreUpdateTimestamp = (): Object =>
({
    updated: GetFirestoreServerTimestamp(),
    lastClientUpdateTime: new (<any>window).firebase.firestore.Timestamp.now()
});

export const IsTouchDevice = (): boolean => "ontouchstart" in window;

export const EscapeHtml = (string: string) =>
    string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&#039;").replace(/\//g, "&#x2F;");

export const UnescapeHtml = (string: string) =>
    string.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#039;/g, "'").replace(/&#x2F;/g, "/");

export const CamelCaseToKebabCase = (string: string) => string.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();

export const LogPageViewEvent = () =>
    (<any>window).firebase.analytics().logEvent("page_view", {
        page_location: location.href,
        page_path: location.pathname,
        page_title: document.title,
        offline: !navigator.onLine,
        isPwa: (<any>navigator).standalone || window.matchMedia("(display-mode: standalone)").matches
    });

export const ClearFirestoreCache = () =>
    // Firebase Cloud Firestore DB to keep persisted data for offline usage
    indexedDB.deleteDatabase("firestore/[DEFAULT]/denvelope-firebase/main");

export const ClearCache = () => // This method is to be used when signing out the user
{
    ClearFirestoreCache();

    // Firebase Auth DB to keep the auth token
    indexedDB.deleteDatabase("firebase-installations-database");

    // Firebase Auth DB to keep informations about the signed in user
    indexedDB.deleteDatabase("firebaseLocalStorageDb");

    // Clear localStorage, it contains all Firestore pending writes and its cache size
    localStorage.clear();
}