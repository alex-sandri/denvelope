export class Utilities
{
    public static ShowElement = (element : HTMLElement, displayType ?: string) : void => {element.style.display = displayType ?? "block";}

    public static ShowElements = (elements : Array<HTMLElement>, displayType ?: string) : void => elements.forEach(element => Utilities.ShowElement(element, displayType));

    public static HideElement = (element : HTMLElement) : void => {element.style.display = "none";}

    public static HideElements = (elements : HTMLElement[] | NodeListOf<HTMLElement>) : void => elements.forEach((element : HTMLElement) => Utilities.HideElement(element));

    public static RemoveAllElements = (selector : string) : void => document.querySelectorAll(selector).forEach(element => element.remove());

    public static AddClass = (element : HTMLElement, className : string) : void => element.classList.add(className);

    public static AddClasses = (element : HTMLElement, classes : string[]) : void => classes.filter(element => element.length > 0)
        .forEach(className => Utilities.AddClass(element, className));

    public static RemoveClass = (element : HTMLElement, className : string) : void => element.classList.remove(className);

    public static HasClass = (element : HTMLElement, className : string) : boolean => element.classList.contains(className);

    public static IsSet = (object : any) : boolean => object !== null && object !== undefined;

    public static PreventDragEvents = () : void =>
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

    public static SetCookie = (name : string, value : string, months : number) =>
    {
        const d = new Date();

        d.setTime(d.getTime() + months * 30 * 24 * 60 * 60 * 1000);

        document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
    }

    public static GetCookie = (name : string) => document.cookie.substr(document.cookie.indexOf(name)).substr(name.length + 1).split(";")[0] || null;

    public static DeleteCookie = (name : string) => Utilities.SetCookie(name, null, -1);

    public static IsSetCookie = (name : string) : boolean => document.cookie.indexOf(name + "=") > -1;

    public static DispatchEvent = (name : string) => window.dispatchEvent(new Event(name));

    public static FormatStorage  = (bytes : number) : string =>
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
    public static FormatDate = (milliseconds : number, options ?: Intl.DateTimeFormatOptions) : string =>
        new Date(milliseconds).toLocaleDateString(document.documentElement.lang, options || {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZoneName: "short",
        });

    public static GetCurrentFolderId = (allowFakeFolderIds ?: boolean) : string =>
    {
        let folderId = (<HTMLInputElement>document.querySelector("input[name=folder-id]")).value;

        if ((folderId === "trash" || folderId === "starred" || folderId === "shared" || folderId === "vault") &&
            (!Utilities.IsSet(allowFakeFolderIds) || !allowFakeFolderIds))
                folderId = "root";

        return folderId;
    }

    public static GetCurrentFolderIdAsync = async (allowFakeFolderIds ?: boolean) : Promise<string> => new Promise<string>(resolve =>
    {
        if (Utilities.GetCurrentFolderId(allowFakeFolderIds).trim() !== "") resolve(Utilities.GetCurrentFolderId(allowFakeFolderIds));

        (<HTMLInputElement>document.querySelector("input[name=folder-id]")).addEventListener(
            "change",
            () => resolve(Utilities.GetCurrentFolderId(allowFakeFolderIds)),
            { once: true });
    });

    public static SetCurrentFolderId = (id : string) : void => {(<HTMLInputElement>document.querySelector("input[name=folder-id]")).value = id;}

    public static GetFirestoreServerTimestamp = () : any => (<any>window).firebase.firestore.FieldValue.serverTimestamp();

    public static GetFirestoreUpdateTimestamp = () : Object => ({
        updated: Utilities.GetFirestoreServerTimestamp(),
        lastClientUpdateTime: new (<any>window).firebase.firestore.Timestamp.now()
    });

    public static IsTouchDevice = () : boolean => "ontouchstart" in window;

    public static EscapeHtml = (string : string) =>
        string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&#039;").replace(/\//g, "&#x2F;");
    
    public static UnescapeHtml = (string : string) =>
        string.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#039;/g, "'").replace(/&#x2F;/g, "/");

    public static CamelCaseToKebabCase = (string : string) => string.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();

    public static LogPageViewEvent = () =>
        (<any>window).firebase.analytics().logEvent("page_view", {
            page_location: location.href,
            page_path: location.pathname,
            page_title: document.title,
            offline: !navigator.onLine,
            isPwa: (<any>navigator).standalone || window.matchMedia("(display-mode: standalone)").matches
        });

    public static ClearCache = () =>
    {
        console.log("cleared");
    }
}