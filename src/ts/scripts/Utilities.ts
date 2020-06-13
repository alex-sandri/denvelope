import type { firestore as firebaseFirestore, analytics as firebaseAnalytics } from "firebase";

declare const firebase: any;

export const ShowElement = (element: HTMLElement, displayType?: string): void => { element.style.display = displayType ?? "block"; };

export const ShowElements = (elements: Array<HTMLElement>, displayType?: string): void =>
	elements.forEach(element => ShowElement(element, displayType));

export const HideElement = (element: HTMLElement): void => { element.style.display = "none"; };

export const HideElements = (elements: HTMLElement[] | NodeListOf<HTMLElement>): void =>
	elements.forEach((element: HTMLElement) => HideElement(element));

export const RemoveAllElements = (selector: string): void =>
	document.querySelectorAll(selector).forEach(element => element.remove());

export const AddClass = (element: HTMLElement, className: string): void =>
	element.classList.add(className);

export const AddClasses = (element: HTMLElement, classes: string[]): void =>
	classes
		.filter(className => className.length > 0)
		.forEach(className => AddClass(element, className));

export const RemoveClass = (element: HTMLElement, className: string): void =>
	element.classList.remove(className);

export const HasClass = (element: HTMLElement, className: string): boolean =>
	element.classList.contains(className);

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
};

export const DispatchEvent = (name: string) => window.dispatchEvent(new Event(name));

export const FormatStorage = (bytes: number): string =>
{
	let unit : string = "";

	let i : number = 0;
	let tempBytes : number = bytes;

	for (i = 0; tempBytes >= 1000; i++) tempBytes /= 1000;

	switch (i)
	{
		case 0:
			unit = "B";
			break;
		case 1:
			unit = "KB";
			break;
		case 2:
			unit = "MB";
			break;
		case 3:
			unit = "GB";
			break;
		case 4:
			unit = "TB";
			break;
		case 5:
			unit = "PB";
			break;
		case 6:
			unit = "EB";
			break;
		case 7:
			unit = "ZB";
			break;
		case 8:
			unit = "YB";
			break;
		default:
			break;
	}

	// The plus is needed to remove any useless zeros (0.00 -> 0)
	return +tempBytes.toFixed(2) + unit;
};

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

	if ((folderId === "trash" || folderId === "starred" || folderId === "shared" || folderId === "vault")
		&& (!IsSet(allowFakeFolderIds) || !allowFakeFolderIds)) folderId = "root";

	return folderId;
};

export const GetCurrentFolderIdAsync = async (allowFakeFolderIds?: boolean): Promise<string> =>
	new Promise<string>(resolve =>
	{
		if (GetCurrentFolderId(allowFakeFolderIds).trim() !== "") resolve(GetCurrentFolderId(allowFakeFolderIds));

		(<HTMLInputElement>document.querySelector("input[name=folder-id]")).addEventListener(
			"change",
			() => resolve(GetCurrentFolderId(allowFakeFolderIds)),
			{ once: true },
		);
	});

export const SetCurrentFolderId = (id: string): void => { (<HTMLInputElement>document.querySelector("input[name=folder-id]")).value = id; };

export const GetFirestoreServerTimestamp = (): firebaseFirestore.FieldValue =>
	<firebaseFirestore.FieldValue>firebase.firestore.FieldValue.serverTimestamp();

export const GetFirestoreUpdateTimestamp = (): Object =>
	({
		updated: GetFirestoreServerTimestamp(),
		lastClientUpdateTime: <firebaseFirestore.Timestamp>new firebase.firestore.Timestamp.now(),
	});

export const EscapeHtml = (string: string): string =>
	string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")
		.replace(/\//g, "&#x2F;");

export const EscapeHtmlPolicy = (<any>window).trustedTypes?.createPolicy("escapePolicy", { createHTML: (string: string) => EscapeHtml(string) });

export const UnescapeHtml = (string: string): string =>
	string.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"")
		.replace(/&#039;/g, "'")
		.replace(/&#x2F;/g, "/");

export const CamelCaseToKebabCase = (string: string) => string.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();

export const LogPageViewEvent = () =>
	(<firebaseAnalytics.Analytics>firebase.analytics()).logEvent("page_view", {
		page_location: location.href,
		page_path: location.pathname,
		page_title: document.title,
		offline: !navigator.onLine,
		isPwa: (<any>navigator).standalone || window.matchMedia("(display-mode: standalone)").matches,
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

	const lang = localStorage.getItem("lang");

	// Clear localStorage, it contains all Firestore pending writes and its cache size
	localStorage.clear();

	localStorage.setItem("cookie-consent", "true");
	localStorage.setItem("lang", lang);
};

export const GetPlanIndex = (plan : string) : number =>
{
	switch (plan)
	{
		case "1GB": return 1;
		case "10GB": return 2;
		default: return 0;
	}
};

export const IsFreePlan = (maxStorage : number) : boolean =>
	GetPlanIndex(FormatStorage(maxStorage)) === 0;