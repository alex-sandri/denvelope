export {};

import * as loadEvents from './scripts/load-events';

import { Utilities } from "./scripts/Utilities";
import { Modal } from "./scripts/Modal";
import { Auth } from './scripts/Auth';
import { Translation } from './scripts/Translation';

loadEvents.Init();

const functions = (<any>window).firebase.app().functions("europe-west1");

const settingsMenu = document.querySelector(".settings-menu");
const settingsMenuButtons = settingsMenu.querySelectorAll("button");

const settingsSections : NodeListOf<HTMLElement> = document.querySelectorAll(".settings-section");

const languageSetting : HTMLDivElement = document.querySelector("#language-setting");
const languageSelect : HTMLSelectElement = document.querySelector("#language-select");

const signOutFromAllSetting : HTMLDivElement = document.querySelector("#sign-out-from-all-setting");

const deleteAccountSetting : HTMLDivElement = document.querySelector("#delete-account-setting");

const termsOfServiceSetting : HTMLDivElement = document.querySelector("#tos-setting");
const privacyPolicySetting : HTMLDivElement = document.querySelector("#pp-setting");
const cookiePolicySetting : HTMLDivElement = document.querySelector("#cp-setting");

languageSelect.selectedIndex = <number><unknown>(<HTMLOptionElement>languageSelect.querySelector(`[data-language=${Utilities.GetCookie("lang") ?? navigator.language}]`)).value;

let section : string = "general";

if (location.pathname.indexOf("/settings/") > -1)
{
    section = location.pathname.substr(10);

    if (section.indexOf("/") > -1) section = section.substr(0, section.indexOf("/"));

    if (section !== "general" && section !== "security" && section !== "advanced" && section !== "info")
        section = "general";
}

[document.querySelector(`[data-sect=${section}]`), document.querySelector(`#${section}`)].forEach(element => Utilities.AddClass(<HTMLElement>element, "selected"));

settingsMenuButtons.forEach(element =>
{
    element.addEventListener("click", (e) =>
    {
        let button : HTMLButtonElement;

        // Clicked element is the button
        if ((<HTMLElement>e.target).querySelector("i")) button = (<HTMLButtonElement>e.target);
        // Clicked element is the icon
        else button = (<HTMLButtonElement>(<HTMLElement>e.target).parentNode);

        settingsMenuButtons.forEach(element => Utilities.RemoveClass(element, "selected"));

        settingsSections.forEach(element => Utilities.RemoveClass(element, "selected"));

        Utilities.AddClass(button, "selected");

        let section = button.getAttribute("data-sect");

        Utilities.AddClass(document.querySelector("#" + section), "selected")

        history.pushState(null, "", location.origin + "/settings/" + section);
    });
});

languageSetting.addEventListener("click", () =>
{
    const modal = new Modal({
        title: languageSetting.querySelector("h2").innerText,
        allow: [
            "close",
            "confirm"
        ]
    });

    modal.AppendContent([languageSelect]);

    modal.OnConfirm = () =>
    {
        UpdateLanguage();

        modal.HideAndRemove();
    }

    modal.Show(true);
});

signOutFromAllSetting.addEventListener("click", () =>
{
    const modal = new Modal({
        title: signOutFromAllSetting.querySelector("h2").innerText,
        allow: [
            "close",
            "confirm"
        ],
        loading: false
    });

    modal.OnConfirm = () =>
    {
        functions.httpsCallable("signOutUserFromAllDevices")({});

        // Use the SignOut() method to sign out immediately and not wait for the user to refresh the page
        Auth.SignOut();

        modal.HideAndRemove();
    }

    modal.Show(true);
});

deleteAccountSetting.addEventListener("click", () =>
{
    const modal = new Modal({
        title: deleteAccountSetting.querySelector("h2").innerText,
        allow: [
            "close",
            "confirm"
        ],
        loading: false
    });

    modal.OnConfirm = () =>
    {
        Auth.DeleteUser();

        modal.HideAndRemove();
    }

    modal.Show(true);
});

[termsOfServiceSetting, privacyPolicySetting, cookiePolicySetting].forEach(element => element.addEventListener("click", e =>
{
    const anchor = element.querySelector("a");

    if (!anchor.contains(<HTMLElement>e.target)) anchor.click();
}));

window.addEventListener("popstate", () =>
{
    let url = window.location.href;

    const section = url[url.length - 1] === "/"
        ? (url = url.substr(0, url.length - 1)).substr(url.lastIndexOf("/") + 1)
        : url.substr(url.lastIndexOf("/") + 1);

    (<HTMLButtonElement>document.querySelector("button[data-sect=" + (section === "settings" ? "general" : section) + "]")).click();
});

const UpdateLanguage = () : void =>
{
    languageSetting.querySelector("p").innerText = languageSelect.selectedOptions[0].text;

    Translation.Init(null, languageSelect.selectedOptions[0].getAttribute("data-language"));
};

UpdateLanguage();