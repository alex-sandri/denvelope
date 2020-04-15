export {};

import * as loadEvents from './scripts/load-events';

import { Utilities } from "./scripts/Utilities";
import { Modal } from "./scripts/Modal";
import { Auth } from "./scripts/Auth";
import { Translation } from "./scripts/Translation";
import { Component, InputWithIcon } from "./scripts/Component";

loadEvents.Init();

const db = (<any>window).firebase.firestore();
const functions = (<any>window).firebase.app().functions("europe-west1");

const settingsMenu = document.querySelector(".settings-menu");
const settingsMenuButtons = settingsMenu.querySelectorAll("button");

const settingsSections : NodeListOf<HTMLElement> = document.querySelectorAll(".settings-section");

const changeLanguage : HTMLButtonElement = document.querySelector("#change-language .edit");
const languageSelect : HTMLSelectElement = document.querySelector("#language-select");

const changeBackground : HTMLButtonElement = document.querySelector("#change-background .edit");
const resetBackground : HTMLButtonElement = document.querySelector("#change-background .reset");

const changeDateFormat : HTMLButtonElement = document.querySelector("#date-format .edit");
const resetDateFormat : HTMLButtonElement = document.querySelector("#date-format .reset");

const signOutFromAllDevices : HTMLButtonElement = document.querySelector("#sign-out-from-all-devices .sign-out");

const deleteAccount : HTMLButtonElement = document.querySelector("#delete-account .delete");

languageSelect.selectedIndex = <number><unknown>(<HTMLOptionElement>languageSelect.querySelector(`[data-language=${Utilities.GetCookie("lang") ?? navigator.language}]`)).value;

let section : string = "general";

if (location.pathname.indexOf("/settings/") > -1)
{
    section = location.pathname.substr(10);

    if (section.indexOf("/") > -1) section = section.substr(0, section.indexOf("/"));

    if (section !== "general" && section !== "security" && section !== "advanced" && section !== "info")
        section = "general";
}

[ document.querySelector(`[data-sect=${section}]`), document.querySelector(`#${section}`) ].forEach(element => Utilities.AddClass(<HTMLElement>element, "selected"));

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

window.addEventListener("userready", () =>
{
    changeLanguage.addEventListener("click", () =>
    {
        const modal = new Modal({
            title: changeLanguage.closest(".setting").querySelector("h1").innerText,
            allow: [ "close", "confirm" ]
        });

        modal.AppendContent([ languageSelect ]);

        modal.OnConfirm = () =>
        {
            UpdateLanguage();

            modal.HideAndRemove();
        }

        modal.Show(true);
    });

    changeBackground.addEventListener("click", () =>
    {
        const modal = new Modal({ title: changeBackground.closest(".setting").querySelector("h1").innerText, allow: [ "close", "confirm" ] });

        const backgroundImageUrlInput = new InputWithIcon({
            attributes: {
                id: "background-image-url",
                placeholder: Translation.Get("account->image_address"),
                type: "url"
            },
            iconClassName: "fas fa-link fa-fw"
        }).element;

        modal.AppendContent([ backgroundImageUrlInput ]);

        const input = backgroundImageUrlInput.querySelector("input");

        modal.OnConfirm = () =>
        {
            let error : string;
            let url : URL;

            if (Utilities.HasClass(input, "error")) backgroundImageUrlInput.previousElementSibling.remove();

            Utilities.RemoveClass(input, "error");

            try
            {
                url = new URL(input.value);

                if (url.protocol !== "https:") error = Translation.Get("errors->url_must_be_https");
            }
            catch (err)
            {
                error = Translation.Get("errors->invalid_url");
            }

            if (error)
            {
                Utilities.AddClass(input, "error");

                backgroundImageUrlInput.insertAdjacentElement("beforebegin", new Component("p", { class: "input-error", innerText: error }).element);

                return;
            }

            modal.HideAndRemove();

            db.collection(`users/${Auth.UserId}/config`).doc("preferences").set({ backgroundImageUrl: url.href }, { merge: true });
        }

        input.focus();

        modal.Show(true);
    });

    resetBackground.addEventListener("click", () =>
        db.collection(`users/${Auth.UserId}/config`).doc("preferences").set({ backgroundImageUrl: "" }, { merge: true }));

    changeDateFormat.addEventListener("click", () =>
    {
        const modal = new Modal({ title: changeDateFormat.closest(".setting").querySelector("h1").innerText, allow: [ "close", "confirm" ] });

        modal.AppendContent([ new Component("p", { children: [
            new Component("span", { innerText: Translation.Get("generic->example") + ": " }).element,
            new Component("span", { innerText: Utilities.FormatDate(0) }).element
        ] }).element ]);

        modal.OnConfirm = () =>
        {
            
        }

        modal.Show(true);
    });

    resetDateFormat.addEventListener("click", () =>
        null);

    signOutFromAllDevices.addEventListener("click", () =>
    {
        const modal = new Modal({
            title: signOutFromAllDevices.closest(".setting").querySelector("h1").innerText,
            allow: [ "close", "confirm" ],
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

    deleteAccount.addEventListener("click", () =>
    {
        const modal = new Modal({
            title: deleteAccount.closest(".setting").querySelector("h1").innerText,
            allow: [ "close", "confirm" ],
            loading: false
        });

        modal.OnConfirm = () =>
        {
            Auth.DeleteUser();

            modal.HideAndRemove();
        }

        modal.Show(true);
    });

    if (Auth.IsAuthenticated)
        db.collection(`users/${Auth.UserId}/config`).doc("preferences").onSnapshot((user : any) =>
        {
            const backgroundImageUrl = user.data().backgroundImageUrl;

            document.body.style.backgroundImage = backgroundImageUrl ? `url(${backgroundImageUrl})` : "";

            resetBackground.disabled = !backgroundImageUrl;
        });
});

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
    Translation.Init(null, languageSelect.selectedOptions[0].getAttribute("data-language"));

    changeLanguage.parentElement.querySelector("p").innerHTML = `${Translation.Get("generic->current")}: <span>${languageSelect.selectedOptions[0].text}</span>`;
};

UpdateLanguage();