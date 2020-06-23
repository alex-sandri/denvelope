import { Modal } from "./Modal";

export default class ContextMenu
{
	private static modal: Modal;

	private static items: HTMLElement[];

	public static set Items(items: HTMLElement[])
	{
		ContextMenu.items = items;
	}

	public static get Items()
	{
		const { items } = ContextMenu;

		// This property can only be read once after setting it
		ContextMenu.Items = [];

		return items;
	}

	public static get Item(): HTMLElement
	{
		return ContextMenu.Items[0];
	}

	public static Show(items: ContextMenuItem[])
	{
		ContextMenu.modal = new Modal();

		ContextMenu.modal.AppendContent(items);

		ContextMenu.modal.Show(true);

		ContextMenu.modal.Content.querySelectorAll("button").forEach(button => button.addEventListener("click", ContextMenu.Hide));
	}

	public static Hide()
	{
		ContextMenu.modal.HideAndRemove();
	}
}

export type ContextMenuItem = HTMLButtonElement;

export class ContextMenuItems
{
	public static View: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-view");

	public static Save: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-save");

	public static SaveToMyAccount: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-save-to-my-account");

	public static Share: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-share");

	public static SharingOptions: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-sharing-options");

	public static CopyShareableLink: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-copy-shareable-link");

	public static Unshare: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-unshare");

	public static Move: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-move");

	public static AddToStarred: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-add-to-starred");

	public static RemoveFromStarred: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-remove-from-starred");

	public static Rename: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-rename");

	public static Info: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-info");

	public static Download: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-download");

	public static Restore: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-restore");

	public static Delete: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-delete");

	public static DisplayImage: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-display-image");

	public static DisplayPdf: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-display-pdf");

	public static ValidateXml: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-validate-xml");

	public static ValidateJson: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-validate-json");

	public static AddFiles: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-add-files");

	public static AddFolder: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-add-folder");

	public static CreateFile: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-create-file");

	public static CreateFolder: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-create-folder");

	public static CreateVault: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-create-vault");

	public static UnlockVault: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-unlock");

	public static LockVault: ContextMenuItem = <HTMLButtonElement>document.querySelector("#cm-lock");
}