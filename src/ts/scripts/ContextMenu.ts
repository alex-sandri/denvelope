import { Modal } from "./Modal";

type ContextMenuItem =
{
	id: string,
	type: "folder" | "file",
}

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
		return ContextMenu.items;
	}

	public static get Item(): HTMLElement
	{
		return ContextMenu.Items[0];
	}

	public static GetItemInfo(item: HTMLElement): ContextMenuItem
	{
		return { id: item.id, type: <"folder" | "file">item.classList[0] };
	}

	public static Show(items: ContextMenuButton[])
	{
		ContextMenu.modal = new Modal();

		ContextMenu.modal.AppendContent(items.sort((a, b) =>
			parseInt(a.getAttribute("data-index"), 10) - parseInt(b.getAttribute("data-index"), 10)));

		ContextMenu.modal.Show(true);

		ContextMenu.modal.Content.querySelectorAll("button").forEach(button => button.addEventListener("click", e =>
		{
			const target: HTMLElement = <HTMLElement>e.target;

			if (!ContextMenuButtons.Move.contains(target)
				&& !ContextMenuButtons.MoveSelector.contains(target)) ContextMenu.Hide();
		}));

		ContextMenu.modal.OnClose = () =>
		{
			ContextMenu.Items.forEach(item => item.classList.remove("selected"));

			ContextMenu.Items = [];
		};
	}

	public static Hide()
	{
		ContextMenu.modal?.HideAndRemove();

		ContextMenu.modal = null;
	}
}

export type ContextMenuButton = HTMLButtonElement | HTMLDivElement;

export class ContextMenuButtons
{
	public static View: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-view");

	public static Save: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-save");

	public static SaveToMyAccount: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-save-to-my-account");

	public static Share: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-share");

	public static SharingOptions: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-sharing-options");

	public static CopyShareableLink: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-copy-shareable-link");

	public static Unshare: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-unshare");

	public static Move: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-move");

	public static MoveSelector: ContextMenuButton = <HTMLDivElement>document.querySelector("#move-selector");

	public static MoveSelectorOptions: ContextMenuButton = <HTMLDivElement>ContextMenuButtons.MoveSelector.querySelector(".options");

	public static AddToStarred: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-add-to-starred");

	public static RemoveFromStarred: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-remove-from-starred");

	public static Rename: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-rename");

	public static Info: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-info");

	public static Download: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-download");

	public static Restore: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-restore");

	public static Delete: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-delete");

	public static DisplayImage: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-display-image");

	public static DisplayPdf: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-display-pdf");

	public static ValidateXml: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-validate-xml");

	public static ValidateJson: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-validate-json");

	public static AddFiles: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-add-files");

	public static AddFolder: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-add-folder");

	public static CreateFile: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-create-file");

	public static CreateFolder: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-create-folder");

	public static CreateVault: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-create-vault");

	public static UnlockVault: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-unlock");

	public static LockVault: ContextMenuButton = <HTMLButtonElement>document.querySelector("#cm-lock");
}