import { IsSet, ShowElement, HideElement } from "./Utilities";

const genericMessage : HTMLDivElement = document.querySelector(".generic-message");
const content : HTMLDivElement = genericMessage.querySelector("p");
const actionButton : HTMLButtonElement = genericMessage.querySelector(".action");
const dismiss : HTMLButtonElement = genericMessage.querySelector(".dismiss");

let timeout : NodeJS.Timeout;

export const Show = (message : string, actionButtonText ?: string, duration : number = 2000) : Promise<void> =>
	new Promise(resolve =>
	{
		content.innerText = message;

		if (IsSet(actionButtonText))
		{
			actionButton.innerText = actionButtonText;

			ShowElement(actionButton, "block");
		}
		else HideElement(actionButton);

		ShowElement(genericMessage, "flex");

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

	HideElement(dismiss);

	ShowElement(genericMessage.querySelector(".spinner"), "block");
};

const Hide = () : void => HideElement(genericMessage);