import { Modal } from "../scripts/Modal";
import { HasClass, RemoveClass, AddClass } from "../scripts/Utilities";
import { Component } from "../scripts/Component";
import Translation from "../scripts/Translation";

type SettingRegistration =
{
	button: HTMLButtonElement,
	/**
	 * @returns The success status
	 */
	callback: (content?: HTMLElement) => Promise<{
		valid: boolean,
		errors?: {
			element: HTMLElement,
			message: string,
		}[],
	}>,
	options: SettingRegistrationOptions,
}

type SettingRegistrationOptions =
{
	modal: {
		required: boolean,
		action: "confirm" | "update",
		content?: HTMLElement[],
		validators?: SettingRegistrationModalValidator[],
	},
}

type SettingRegistrationModalValidator =
{
	on: string,
	/**
	 * The target's CSS selector
	 */
	target: string,
	callback: (element: HTMLElement) => boolean,
}

export default class Settings
{
	public static Register = (reg: SettingRegistration) =>
	{
		if (reg.options.modal.required)
		{
			const modal = new Modal({
				titleTranslationId: <string>(<HTMLElement>(<HTMLElement>reg.button.closest(".setting")).querySelector("h1")).getAttribute("data-translation"),
				subtitleTranslationId: <string>reg.button.getAttribute("data-translation"),
				action: reg.options.modal.action,
			});

			if (reg.options.modal.content) modal.AppendContent(reg.options.modal.content);

			if (reg.options.modal.validators)
			{
				const actionButton = reg.options.modal.action === "confirm" ? modal.ConfirmButton : modal.UpdateButton;

				actionButton.disabled = true;

				reg.options.modal.validators.forEach(validator =>
				{
					const target = <HTMLElement | null>modal.Content.querySelector(validator.target);

					target?.addEventListener(validator.on, () =>
					{
						actionButton.disabled = !validator.callback(target);
					});
				});
			}

			modal.OnConfirm = modal.OnUpdate = async () =>
			{
				reg.options.modal.validators?.forEach(validator =>
				{
					const target = <HTMLElement | null>modal.Content.querySelector(validator.target);

					if (!target) return;

					if (HasClass(target, "error")) target.previousElementSibling?.remove();

					RemoveClass(target, "error");
				});

				modal.Hide();

				const result = await reg.callback(modal.Content);

				if (result.valid) modal.Remove();
				else if (result.errors)
				{
					result.errors.forEach(error =>
					{
						AddClass(error.element, "error");

						const errorParagraph = new Component("p", { class: "input-error" }).element;

						Translation.Register(error.message, errorParagraph);

						error.element.insertAdjacentElement("beforebegin", errorParagraph);
					});

					modal.Show(true);
				}
			};

			modal.Show(true);
		}
		else reg.callback();
	}
}