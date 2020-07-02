import { ShowElement, HideElement } from "./Utilities";

const genericMessage: HTMLDivElement = <HTMLDivElement>document.querySelector(".generic-message");
const content: HTMLDivElement = <HTMLDivElement>genericMessage.querySelector("p");
const actionButton: HTMLButtonElement = <HTMLButtonElement>genericMessage.querySelector(".action");
const dismiss: HTMLButtonElement = <HTMLButtonElement>genericMessage.querySelector(".dismiss");

let timeout : NodeJS.Timeout;

export const Show = (
	message : string,
	actionButtonText ?: string,
	duration : number = 2000,
) : Promise<void> =>
	new Promise(resolve =>
	{
		content.innerText = message;

		if (actionButtonText)
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
	Show("", undefined, -1);

	HideElement(dismiss);

	ShowElement(<HTMLElement>genericMessage.querySelector(".spinner"), "block");
};

const Hide = () : void => HideElement(genericMessage);