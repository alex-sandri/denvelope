import { Modal, ModalOptions } from "../scripts/Modal";
import {
	HasClass,
	RemoveClass,
	AddClass,
	HideElements,
	ShowElements,
} from "../scripts/Utilities";
import { Component } from "../scripts/Component";
import Translation from "../scripts/Translation";

type SettingRegistration =
{
	button: HTMLElement,
	/**
	 * @returns The success status
	 */
	callback: (content?: HTMLElement) => Promise<{
		valid: boolean,
		errors?: {
			element: HTMLElement,
			message: string,
		}[],
	} | void> | void,
	options?: SettingRegistrationOptions,
}

type SettingRegistrationOptions =
{
	excludeTargets?: HTMLElement[],
	modal?: {
		action: "confirm" | "update",
		content?: () => HTMLElement[],
		validators?: SettingRegistrationModalValidator[],
		/**
		 * Use only if you need to override some options
		 */
		override?: ModalOptions,
		overrideCallback?: () => ModalOptions,
		/**
		 * If `true` the modal will not be displayed and `options.callback` will be invoked immediately
		 */
		preventDefault?: () => boolean,
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
		reg.button.addEventListener("click", e =>
		{
			if (reg.options?.excludeTargets?.some(target => target.contains(<HTMLElement>e.target)))
				return;

			if (reg.options?.modal && !reg.options.modal.preventDefault?.())
			{
				const modal = new Modal({
					titleTranslationId: reg.button.closest(".setting")?.querySelector("h1")?.getAttribute("data-translation") ?? undefined,
					subtitleTranslationId: reg.button.getAttribute("data-translation") ?? undefined, // undefined is accepted but not null
					action: reg.options.modal.action,
					...reg.options.modal.override,
					...reg.options.modal.overrideCallback?.(),
				});

				const actionButton = reg.options.modal.action === "confirm" ? modal.ConfirmButton : modal.UpdateButton;

				if (reg.options.modal.content) modal.AppendContent(reg.options.modal.content());

				if (reg.options.modal.validators)
				{
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

				const actionButtonClickHandler = async () =>
				{
					reg.options?.modal?.validators?.forEach(validator =>
					{
						const target = <HTMLElement | null>modal.Content.querySelector(validator.target);

						if (!target) return;

						if (HasClass(target, "error")) target.nextElementSibling?.remove();

						RemoveClass(target, "error");
					});

					HideElements([ modal.Content, actionButton ]);

					modal.ShowSpinner();

					const result = await reg.callback(modal.Content);

					if (!result || result.valid) modal.HideAndRemove();
					else if (result.errors)
					{
						result.errors.forEach(error =>
						{
							AddClass(error.element, "error");

							const errorParagraph = new Component("p", { class: "input-error" }).element;

							Translation.Register(error.message, errorParagraph);

							error.element.insertAdjacentElement("afterend", errorParagraph);
						});

						modal.HideSpinner();

						ShowElements([ modal.Content, actionButton ]);
					}
				};

				if (reg.options.modal.action === "confirm") modal.OnConfirm = actionButtonClickHandler;
				else if (reg.options.modal.action === "update") modal.OnUpdate = actionButtonClickHandler;

				modal.Show(true);
			}
			else reg.callback();
		});
	}
}