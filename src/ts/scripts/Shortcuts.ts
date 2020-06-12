import Translation from "./Translation";

export default class Shortcuts
{
	public static Init = () : void =>
	{
		const elementsWithShortcuts : HTMLElement[] = Array.from(document.querySelectorAll("[data-keyboard-shortcut]"));

		elementsWithShortcuts
			.forEach(element =>
			{
				element.title = `${Translation.Get("generic->keyboard_shortcut")}: ${
					element
						.getAttribute("data-keyboard-shortcut")
						.replace("control", "ctrl")
						.split("+")
						.join(" + ")
						.toUpperCase()
				}`;
			});

		window.addEventListener("keydown", e =>
		{
			const key = e.key.toLowerCase();

			if ([ "input", "textarea" ].includes(document.activeElement.tagName.toLowerCase())) return;

			const keyCombination = (e.ctrlKey && key !== "control" ? "control+" : "")
				+ (e.shiftKey && key !== "shift" ? "shift+" : "")
				+ key;

			const element : HTMLElement = elementsWithShortcuts
				.find(elementWithShortcut =>
					elementWithShortcut.getAttribute("data-keyboard-shortcut") === keyCombination);

			if (!element) return;

			// Do not prevent if the pressed key is ENTER, as this breaks keyboard navigation
			if (keyCombination !== "enter") e.preventDefault();

			if (element instanceof HTMLButtonElement
				|| element instanceof HTMLAnchorElement) element.click();
			else if (element instanceof HTMLInputElement) element.focus();
		});
	}

	public static Register = (
		shortcut : string,
		callback : (e : KeyboardEvent) => void,
		options : { ignoreInInput ?: boolean } = { ignoreInInput: true },
	) : void =>
	{
		window.addEventListener("keydown", e =>
		{
			const key = e.key.toLowerCase();

			if (options.ignoreInInput && [ "input", "textarea" ].includes(document.activeElement.tagName.toLowerCase())) return;

			const keyCombination = (e.ctrlKey && key !== "control" ? "control+" : "")
				+ (e.shiftKey && key !== "shift" ? "shift+" : "")
				+ key;

			if (shortcut !== keyCombination) return;

			e.preventDefault();

			callback(e);
		});
	}
}