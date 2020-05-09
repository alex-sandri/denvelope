import { Utilities } from "./Utilities";

import { en_US } from "../translations/en-US";
import { it_IT } from "../translations/it-IT";

export class Translation
{
    private static language : string;

    public static get Language () : string { return Translation.language; }

    public static Init = (element ?: HTMLElement, language ?: string) : void =>
    {
        if (!Utilities.IsSet(element)) (<any>element) = document;

        if (!Utilities.IsSet(language)) language = localStorage.getItem("lang") ?? navigator.language;

        localStorage.setItem("lang", language);

        document.documentElement.lang = Translation.language = language;

        const ids = Array.from(new Set(
            Array.from(element.querySelectorAll("*"))
                .filter(element =>
                    element.hasAttribute("data-translation") ||
                    element.hasAttribute("data-placeholder-translation") ||
                    element.hasAttribute("data-content-translation") ||
                    element.hasAttribute("data-aria-label-translation") ||
                    element.hasAttribute("data-start-translation") ||
                    element.hasAttribute("data-only-translation"))
                .map(element =>
                    element.getAttribute("data-translation") ||
                    element.getAttribute("data-placeholder-translation") ||
                    element.getAttribute("data-content-translation") ||
                    element.getAttribute("data-aria-label-translation") ||
                    element.getAttribute("data-start-translation") ||
                    element.getAttribute("data-only-translation"))
        ));

        element.querySelectorAll("[data-use=translation]").forEach(element => element.remove());

        ids.forEach(id => element.querySelectorAll(`[data-translation="${id}"]`).forEach(element =>
            element.innerHTML += ` <span data-use="translation">${Translation.Get(id)}</span>`));
        ids.forEach(id => element.querySelectorAll(`[data-placeholder-translation="${id}"]`)
            .forEach(element => (<HTMLInputElement>element).placeholder = Translation.Get(id)));
        ids.forEach(id => element.querySelectorAll(`[data-content-translation="${id}"]`).forEach(element => (<HTMLMetaElement>element).content = Translation.Get(id)));
        ids.forEach(id => element.querySelectorAll(`[data-aria-label-translation="${id}"]`).forEach(element =>
            (<HTMLMetaElement>element).setAttribute("aria-label", Translation.Get(id))));
        ids.forEach(id => element.querySelectorAll(`[data-start-translation="${id}"]`).forEach(element =>
            element.innerHTML = `<span data-use="translation">${Translation.Get(id)}</span>` + element.innerHTML));
        ids.forEach(id => element.querySelectorAll(`[data-only-translation="${id}"]`).forEach(element => element.innerHTML = Translation.Get(id)));

        Array.from(<NodeListOf<HTMLElement>>element.querySelectorAll("*"))
            .filter(element => element.hasAttribute("data-keyboard-shortcut"))
            .forEach(element => element.title = `${Translation.Get("generic->keyboard_shortcut")}: ${element.getAttribute("data-keyboard-shortcut").toUpperCase()}`);
    }

    public static Get = (id : string) : string =>
    {
        const keys = id.split("->");
        let array : any;

        switch (Translation.Language.toLowerCase()) // Safari returns it in lower-case
        {
            case "it-it":
            case "it":
                array = it_IT;
            break;
            default:
                array = en_US;
            break;
        }

        for (let i = 0; i < keys.length - 1; i++) array = array[keys[i]];

        return array[keys[keys.length - 1]];
    }
}