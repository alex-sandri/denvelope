import { en_US } from "../translations/en-US";
import { it_IT } from "../translations/it-IT";
import { DispatchEvent } from "../scripts/Utilities";

export class Translation
{
    public static get Language () : string { return localStorage.getItem("lang").toLowerCase(); }

    public static Init = (language ?: string) : void =>
    {
        if (!language)
        {
            if ([ "/en", "/it" ].includes(location.pathname)) language = location.pathname.substr(1);
            else if (localStorage.getItem("lang")) language = localStorage.getItem("lang");
            else if (navigator.languages) language = navigator.languages[0];
            else if (navigator.language) language = navigator.language;
            else language = "en";
        }

        if (!Translation.IsSupportedLanguage(language)) language = "en";

        localStorage.setItem("lang", language);

        document.documentElement.lang = Translation.Language;

        const ids = Array.from(new Set(
            Array.from(document.querySelectorAll("*"))
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

        document.querySelectorAll("[data-use=translation]").forEach(element => element.remove());

        const createTranslationElement = (text: string): HTMLElement =>
        {
            const span = document.createElement("span");

            span.setAttribute("data-use", "translation");
            span.innerText = text;

            return span;
        }

        ids
            .forEach(id => document.querySelectorAll(`[data-translation="${id}"]`)
            .forEach(element => element.appendChild(createTranslationElement(Translation.Get(id)))));

        ids
            .forEach(id => document.querySelectorAll(`[data-placeholder-translation="${id}"]`)
            .forEach(element => (<HTMLInputElement>element).placeholder = Translation.Get(id)));

        ids
            .forEach(id => document.querySelectorAll(`[data-content-translation="${id}"]`)
            .forEach(element => (<HTMLMetaElement>element).content = Translation.Get(id)));

        ids
            .forEach(id => document.querySelectorAll(`[data-aria-label-translation="${id}"]`)
            .forEach(element => (<HTMLMetaElement>element).setAttribute("aria-label", Translation.Get(id))));

        ids
            .forEach(id => document.querySelectorAll(`[data-start-translation="${id}"]`)
            .forEach(element => element.insertAdjacentElement("afterbegin", createTranslationElement(Translation.Get(id)))));

        ids
            .forEach(id => (<NodeListOf<HTMLElement>>document.querySelectorAll(`[data-only-translation="${id}"]`))
            .forEach(element => element.innerText = Translation.Get(id)));

        Array.from(<NodeListOf<HTMLElement>>document.querySelectorAll("*"))
            .filter(element => element.hasAttribute("data-keyboard-shortcut"))
            .forEach(element => element.title = `${Translation.Get("generic->keyboard_shortcut")}: ${element.getAttribute("data-keyboard-shortcut").toUpperCase()}`);

        DispatchEvent("translationlanguagechange");
    }

    public static Get = (id : string) : string =>
    {
        const keys = id.split("->");
        let array : any;

        switch (Translation.Language)
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

    public static IsSupportedLanguage = (lang : string) => [ "en", "en-us", "it", "it-it" ].includes(lang.toLowerCase());
}