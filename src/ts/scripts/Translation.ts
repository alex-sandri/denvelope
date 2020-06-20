import type { firestore as firebaseFirestore } from "firebase";

import enUS from "../translations/en-US";
import itIT from "../translations/it-IT";
import { DispatchEvent } from "./Utilities";
import Auth from "./Auth";
import { Config } from "../config/Config";

declare const firebase: any;

const db: firebaseFirestore.Firestore = firebase.firestore();

type TranslationElementOptions =
{
	initialSpace?: boolean,
	before?: string,
	after?: string,
	standalone?: boolean,
}

export default class Translation
{
	public static get Language(): Config.Locale { return <Config.Locale>localStorage.getItem("lang").toLowerCase(); }

	public static Init = (language ?: Config.Locale, allowPreferenceUpdate?: boolean) : void =>
	{
		let translationLanguage : string = language;

		if (!translationLanguage) if ([ "/en", "/it" ].includes(location.pathname)) translationLanguage = location.pathname.substr(1);
		else if (localStorage.getItem("lang")) translationLanguage = localStorage.getItem("lang");
		// Takes the first item, equivalent to: language = navigator.languages[0]
		else if (navigator.languages) [ translationLanguage ] = navigator.languages;
		else if (navigator.language) translationLanguage = navigator.language;
		else translationLanguage = "en";

		if (!Translation.IsSupportedLanguage(translationLanguage)) translationLanguage = "en";

		localStorage.setItem("lang", translationLanguage);

		document.documentElement.lang = Translation.Language;

		const ids = Array.from(new Set(
			Array
				.from(document.querySelectorAll("[data-translation], [data-placeholder-translation], [data-content-translation], [data-aria-label-translation], [data-start-translation], [data-only-translation]"))
				.map(element =>
					element.getAttribute("data-translation")
					|| element.getAttribute("data-placeholder-translation")
					|| element.getAttribute("data-content-translation")
					|| element.getAttribute("data-aria-label-translation")
					|| element.getAttribute("data-start-translation")
					|| element.getAttribute("data-only-translation")),
		));

		document.querySelectorAll("[data-use=translation]").forEach(element => element.remove());

		ids
			.forEach(id => document.querySelectorAll(`[data-translation="${id}"]`)
				.forEach(element =>
					element.appendChild(Translation.GetElement(id, { initialSpace: true }))));

		ids
			.forEach(id => document.querySelectorAll(`[data-placeholder-translation="${id}"]`)
				.forEach(element => { (<HTMLInputElement>element).placeholder = Translation.Get(id); }));

		ids
			.forEach(id => document.querySelectorAll(`[data-content-translation="${id}"]`)
				.forEach(element => { (<HTMLMetaElement>element).content = Translation.Get(id); }));

		ids
			.forEach(id => document.querySelectorAll(`[data-aria-label-translation="${id}"]`)
				.forEach(element => (<HTMLMetaElement>element).setAttribute("aria-label", Translation.Get(id))));

		ids
			.forEach(id => document.querySelectorAll(`[data-start-translation="${id}"]`)
				.forEach(element => element.insertAdjacentElement("afterbegin", Translation.GetElement(id))));

		ids
			.forEach(id => (<NodeListOf<HTMLElement>>document.querySelectorAll(`[data-only-translation="${id}"]`))
				.forEach(element => { element.innerText = Translation.Get(id); }));

		DispatchEvent("translationlanguagechange");

		console.log(Auth.IsSignedIn, allowPreferenceUpdate, Translation.Language);

		if (Auth.IsSignedIn && allowPreferenceUpdate)
			db.collection(`users/${Auth.UserId}/config`).doc("preferences").set({
				language: Translation.Language,
			}, { merge: true });
	}

	public static Get = (id : string) : string =>
	{
		const keys = id.split("->");
		let array : any;

		switch (Translation.Language)
		{
			case "it-it":
			case "it":
				array = itIT;
				break;
			default:
				array = enUS;
				break;
		}

		for (let i = 0; i < keys.length - 1; i++) array = array[keys[i]];

		return array[keys[keys.length - 1]];
	}

	public static GetElement = (
		id: string,
		options: TranslationElementOptions = {
			initialSpace: false,
			before: "",
			after: "",
			standalone: false,
		},
	): HTMLElement =>
	{
		const span = document.createElement("span");

		const UpdateElement = () =>
		{
			span.innerText = Translation.GetFormattedTranslatedText(id, options);
		};

		UpdateElement();

		if (options.standalone) window.addEventListener("translationlanguagechange", UpdateElement);
		else span.setAttribute("data-use", "translation");

		return span;
	}

	public static Register = (
		id: string,
		element: HTMLElement,
		options?: TranslationElementOptions,
	) =>
	{
		const UpdateElement = () =>
		{
			element.innerText = Translation.GetFormattedTranslatedText(id, options);
		};

		UpdateElement();

		element.setAttribute("data-translation-registered", "true");

		if (element.hasAttribute("data-translation-registered")) window.addEventListener("translationlanguagechange", UpdateElement);
		else window.removeEventListener("translationlanguagechange", UpdateElement);
	};

	private static GetFormattedTranslatedText = (id: string, options?: TranslationElementOptions) =>
		(options?.initialSpace ? " " : "") + (options?.before ?? "") + Translation.Get(id) + (options?.after ?? "");

	public static Unregister = (element: HTMLElement) => element.removeAttribute("data-translation-registered");

	public static IsSupportedLanguage = (lang : string) => [ "en", "en-us", "it", "it-it" ].includes(lang.toLowerCase());

	private static currency: Config.Currency;

	public static get Currency(): Config.Currency { return Translation.currency ?? <Config.Currency>Translation.Get("settings->plan->currency"); }

	public static set Currency(currency: Config.Currency)
	{
		Translation.currency = currency;

		DispatchEvent("currencychange");
	}

	public static get CurrencyLocale(): Config.Locale
	{
		let locale: Config.Locale;

		switch (Translation.Currency)
		{
			case "EUR": locale = "it-it"; break;
			default: locale = "en-us"; break;
		}

		return locale;
	}
}