import { HideElement, ShowElement } from "./Utilities";

export const header: HTMLElement = <HTMLElement>document.querySelector("header");

export const accountMenuToggle: HTMLButtonElement = <HTMLButtonElement>header.querySelector(".menu-toggle button");
export const accountMenuContainer: HTMLDivElement = <HTMLDivElement>document.querySelector(".menu-container");
export const accountMenu: HTMLDivElement = <HTMLDivElement>accountMenuContainer.querySelector(".menu");

export const upgradePlan: HTMLAnchorElement = <HTMLAnchorElement>accountMenu.querySelector(".upgrade-plan");
export const whatIsTakingUpSpace: HTMLAnchorElement = <HTMLAnchorElement>accountMenu.querySelector(".storage-info");

export const signOutButton: HTMLButtonElement = <HTMLButtonElement>accountMenu.querySelector(".sign-out");

export const userPhoto: NodeListOf<HTMLImageElement> = document.querySelectorAll("[data-update-field=photo]");
export const userName: HTMLParagraphElement = <HTMLParagraphElement>document.querySelector("[data-update-field=name]");
export const userEmail: HTMLParagraphElement = <HTMLParagraphElement>document.querySelector("[data-update-field=email]");

export const HideHeaderMenu = () => HideElement(accountMenuContainer);

accountMenuToggle.addEventListener("click", () =>
	((accountMenuContainer.style.display === "flex")
		? HideHeaderMenu()
		: ShowElement(accountMenuContainer, "flex")));

document.addEventListener("click", e =>
{
	const target : HTMLElement = <HTMLElement>e.target;

	if (!accountMenu.contains(target) && !accountMenuToggle.contains(target)) HideHeaderMenu();
});