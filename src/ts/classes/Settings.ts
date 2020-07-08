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
	callback: () => Promise<{
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
        validator?: SettingRegistrationModalValidator,
    },
}

type SettingRegistrationModalValidator =
{
    on: string,
    targets: HTMLElement[],
    callback: () => boolean,
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
                action: reg.options.modal.action
            });

            if (reg.options.modal.content) modal.AppendContent(reg.options.modal.content);

            if (reg.options.modal.validator)
            {
                const actionButton = reg.options.modal.action === "confirm" ? modal.ConfirmButton : modal.UpdateButton;

                actionButton.disabled = true;

                reg.options.modal.validator.targets.forEach(target => target.addEventListener((<SettingRegistrationModalValidator>reg.options.modal.validator).on, () =>
                {
                    actionButton.disabled = !(<SettingRegistrationModalValidator>reg.options.modal.validator).callback();
                }));
            }

            modal.OnConfirm = modal.OnUpdate = async () =>
            {
                reg.options.modal.validator?.targets.forEach(target =>
                {
                    if (HasClass(target, "error")) target.previousElementSibling?.remove();

                    RemoveClass(target, "error");
                });

                modal.Hide();

                const result = await reg.callback();

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
            }

            modal.Show(true);
        }
    }
}