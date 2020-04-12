import { Utilities } from "./Utilities";

export const header : HTMLElement = document.querySelector("header");

export const loggedInMenuToggle : HTMLButtonElement = header.querySelector(".menu-toggle button");
export const loggedInNavMenu : HTMLDivElement = document.querySelector(".menu.logged-in");

export const signOutButton : HTMLButtonElement = loggedInNavMenu.querySelector(".sign-out");

export const userPhoto : NodeListOf<HTMLImageElement> = document.querySelectorAll("[data-update-field=photo]");
export const userName : HTMLParagraphElement = document.querySelector("[data-update-field=name]");
export const userEmail : HTMLParagraphElement = document.querySelector("[data-update-field=email]");

export const HideHeaderMenu = () : void => Utilities.HideElement(loggedInNavMenu);

loggedInMenuToggle.addEventListener("click", () => (loggedInNavMenu.style.display === "block") ? HideHeaderMenu() : Utilities.ShowElement(loggedInNavMenu, "block"));

document.addEventListener("click", e =>
{
    if (!loggedInNavMenu.contains(<HTMLElement>e.target) && !loggedInMenuToggle.contains(<HTMLElement>e.target)) HideHeaderMenu();
});

document.addEventListener("contextmenu", HideHeaderMenu);