import { Utilities } from "./Utilities";
import { Auth } from "./Auth";

export const header : HTMLElement = document.querySelector("header");

export const loggedInNav : HTMLButtonElement = header.querySelector("nav.logged-in");
export const loggedInMenuToggle : HTMLButtonElement = document.querySelector("nav.logged-in + .menu-toggle button");
export const loggedInNavMenu : HTMLDivElement = loggedInNav.querySelector(".menu");

const signInButton : HTMLButtonElement = header.querySelector(".sign-in");
export const signOutButton : HTMLButtonElement = loggedInNavMenu.querySelector(".sign-out");

export const userPhoto : NodeListOf<HTMLImageElement> = header.querySelectorAll("[data-update-field=photo]");
export const userName : HTMLParagraphElement = header.querySelector("[data-update-field=name]");
export const userEmail : HTMLParagraphElement = header.querySelector("[data-update-field=email]");

export const HideHeaderMenu = () : void => Utilities.HideElement(loggedInNavMenu);

loggedInMenuToggle.addEventListener("click", () => (loggedInNavMenu.style.display === "block") ? HideHeaderMenu() : Utilities.ShowElement(loggedInNavMenu, "block"));

document.addEventListener("click", e =>
{
    if (!loggedInNavMenu.contains(<HTMLElement>e.target) && !loggedInMenuToggle.contains(<HTMLElement>e.target)) HideHeaderMenu();
});

signInButton.addEventListener("click", () => location.href = "/");

document.addEventListener("scroll", HideHeaderMenu);

document.addEventListener("contextmenu", HideHeaderMenu);

window.addEventListener("resize", HideHeaderMenu);