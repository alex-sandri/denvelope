import { Utilities } from "./Utilities";

const genericMessage : HTMLDivElement = document.querySelector(".generic-message");
const content : HTMLDivElement = genericMessage.querySelector("p");
const actionButton : HTMLButtonElement = genericMessage.querySelector(".action");
const dismiss : HTMLButtonElement = genericMessage.querySelector(".dismiss");

let timeout : number;

export const Show = (message : string, actionButtonText ?: string, duration : number = 2000) : Promise<void> => new Promise((resolve, reject) =>
{
    content.innerText = message;

    if (Utilities.IsSet(actionButtonText))
    {
        actionButton.innerText = actionButtonText;

        Utilities.ShowElement(actionButton, "block");
    }
    else Utilities.HideElement(actionButton);

    Utilities.ShowElement(genericMessage, "flex");

    if (duration >= 0) timeout = setTimeout(Hide, duration);

    dismiss.addEventListener("click", () =>
    {
        clearTimeout(timeout);

        Hide();
    });

    actionButton.addEventListener("click", () =>
    {
        resolve();

        clearTimeout(timeout);

        Hide();
    });
});

export const ShowSpinner = () : void =>
{
    Show("", null, -1);

    Utilities.HideElement(dismiss);

    Utilities.ShowElement(genericMessage.querySelector(".spinner"), "block");
}

const Hide = () : void => Utilities.HideElement(genericMessage);