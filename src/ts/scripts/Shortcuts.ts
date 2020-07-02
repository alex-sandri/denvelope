import Translation from "./Translation";

type ShortcutRegistrationOptions =
{
	ignoreInInput: boolean,
}

type ShortcutRegistration =
{
	shortcut: string,
	callback: (e: KeyboardEvent) => void,
	options: ShortcutRegistrationOptions,
}

export default class Shortcuts
{
	public static Init = () : void =>
	{
		const elementsWithShortcuts : HTMLElement[] = Array.from(document.querySelectorAll("[data-keyboard-shortcut]"));

		elementsWithShortcuts
			.forEach(element =>
			{
				element.title = `${Translation.Get("generic->keyboard_shortcut")}: ${
					(<string>element.getAttribute("data-keyboard-shortcut"))
						.replace("control", "ctrl")
						.split("+")
						.join(" + ")
						.toUpperCase()
				}`;

				Shortcuts.Register(<string>element.getAttribute("data-keyboard-shortcut"), () =>
				{
					if (element instanceof HTMLButtonElement
						|| element instanceof HTMLAnchorElement) element.click();
					else if (element instanceof HTMLInputElement) element.focus();
				});
			});

		window.addEventListener("keydown", e =>
		{
			const key = e.key.toLowerCase();

			const keyCombination = (e.ctrlKey && key !== "control" ? "control+" : "")
				+ (e.shiftKey && key !== "shift" ? "shift+" : "")
				+ key;

			Shortcuts.ShortcutRegistrations.forEach(registration =>
			{
				if (registration.options.ignoreInInput && [ "input", "textarea" ].includes((<HTMLElement>document.activeElement).tagName.toLowerCase())) return;

				if (registration.shortcut !== keyCombination) return;

				if (keyCombination !== "enter") e.preventDefault();

				registration.callback(e);
			});
		});
	}

	private static ShortcutRegistrations: ShortcutRegistration[] = [];

	public static Register = (
		shortcut: string,
		callback: (e : KeyboardEvent) => void,
		options: ShortcutRegistrationOptions = { ignoreInInput: true },
	) => Shortcuts.ShortcutRegistrations.push({ shortcut, callback, options });
}