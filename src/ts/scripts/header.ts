import { HideElement, ShowElement } from "./Utilities";

export const header : HTMLElement = document.querySelector("header");

export const accountMenuToggle : HTMLButtonElement = header.querySelector(".menu-toggle button");
export const accountMenuContainer : HTMLDivElement = document.querySelector(".menu-container");
export const accountMenu : HTMLDivElement = accountMenuContainer.querySelector(".menu");

export const upgradePlan : HTMLAnchorElement = accountMenu.querySelector(".upgrade-plan");
export const whatIsTakingUpSpace : HTMLAnchorElement = accountMenu.querySelector(".storage-info");

export const signOutButton : HTMLButtonElement = accountMenu.querySelector(".sign-out");

export const userPhoto : NodeListOf<HTMLImageElement> = document.querySelectorAll("[data-update-field=photo]");
export const userName : HTMLParagraphElement = document.querySelector("[data-update-field=name]");
export const userEmail : HTMLParagraphElement = document.querySelector("[data-update-field=email]");

export const HideHeaderMenu = () => HideElement(accountMenuContainer);

accountMenuToggle.addEventListener("click", () => (accountMenuContainer.style.display === "flex") ? HideHeaderMenu() : ShowElement(accountMenuContainer, "flex"));

document.addEventListener("click", e =>
{
    if (!accountMenu.contains(<HTMLElement>e.target) && !accountMenuToggle.contains(<HTMLElement>e.target)) HideHeaderMenu();
});