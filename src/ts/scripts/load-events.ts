import type { analytics as firebaseAnalytics, firestore as firebaseFirestore } from "firebase";

import {
	LogPageViewEvent,
	ShowElement,
	HideElement,
	PreventDragEvents,
	RemoveClass,
	FormatStorage,
	IsFreePlan,
	AddClass,
} from "./Utilities";
import Auth from "./Auth";
import { signOutButton, whatIsTakingUpSpace, upgradePlan } from "./header";
import ServiceWorkerController from "../service_workers/ServiceWorkerController";
import Translation from "./Translation";
import { Modal } from "./Modal";
import Shortcuts from "./Shortcuts";
import { Config } from "../config/Config";

declare const firebase: any;

export default () : void =>
{
	const db: firebaseFirestore.Firestore = firebase.firestore();
	const analytics: firebaseAnalytics.Analytics = firebase.analytics();

	const cacheSizeBytes : number = parseInt(localStorage.getItem("cache-size"), 10);

	if (cacheSizeBytes) db.settings({ cacheSizeBytes, ignoreUndefinedProperties: true });

	// Enable caching firestore queries for offline support and enable synchronization between tabs
	db.enablePersistence({ synchronizeTabs: true });

	ServiceWorkerController.Register();

	if (document.body.classList.contains("account") || document.body.classList.contains("settings"))
		document.body.style.backgroundImage = `url(${localStorage.getItem("background-image-url") ?? ""})`;

	// Used in plans page and in plan settings
	const updatePlans = () =>
		document
			.querySelectorAll(".plans .plan")
			.forEach(plan =>
			{
				const billingPeriod: Config.BillingPeriod = <Config.BillingPeriod>document.querySelector(".billing-periods .selected").classList[0];

				(<HTMLSpanElement>plan.querySelector(".price")).innerText = Intl.NumberFormat(Translation.CurrencyLocale, { style: "currency", currency: Translation.Currency, minimumFractionDigits: 0 })
					.format(Config.Pricing.Plan(<Config.PlanName>plan.getAttribute("data-max-storage")).Price(Translation.Currency, billingPeriod))
					.replace(/\s/, "");

				(<HTMLSpanElement>plan.querySelector(".billing-period")).innerText = ` / ${Translation.Get(`generic->${billingPeriod}`).toLowerCase()}`;

				(<HTMLElement>plan.querySelector(".storage")).innerText = plan.getAttribute("data-max-storage");
			});

	window.addEventListener("translationlanguagechange", updatePlans);
	window.addEventListener("currencychange", updatePlans);

	(<HTMLElement[]>Array.from(document.querySelector(".billing-periods")?.children ?? [])).forEach(billingPeriod =>
		billingPeriod.addEventListener("click", () =>
		{
			billingPeriod.parentElement.querySelector(".selected")?.classList.remove("selected");

			AddClass(billingPeriod, "selected");

			updatePlans();
		}));

	Translation.Init();

	Shortcuts.Init();

	const changeLanguage : HTMLButtonElement = document.querySelector("#change-language .edit");
	const languageSelect : HTMLSelectElement = document.querySelector("#language-select");

	changeLanguage?.addEventListener("click", () =>
	{
		const modal = new Modal({
			titleTranslationId: "generic->language",
			action: "confirm",
		});

		modal.AppendContent([ languageSelect ]);

		languageSelect.selectedIndex = (<HTMLOptionElement>languageSelect.querySelector(`[value^=${Translation.Language}]`)).index;

		modal.OnConfirm = async () =>
		{
			Translation.Init(languageSelect.selectedOptions[0].value);

			modal.HideAndRemove();
		};

		modal.Show(true);
	});

	Auth.Init();

	// This needs to wait for the translation to be completed
	LogPageViewEvent();

	const cookieBanner : HTMLElement = document.querySelector(".cookie-banner");

	if (!localStorage.getItem("cookie-consent"))
	{
		ShowElement(cookieBanner, "flex");

		cookieBanner.querySelector("i:last-child").addEventListener("click", () => HideElement(document.querySelector(".cookie-banner")));
	}

	localStorage.setItem("cookie-consent", "true");

	PreventDragEvents();

	document.addEventListener("contextmenu", e =>
	{
		if ((<HTMLElement>e.target).closest(".allow-context-menu") === null) e.preventDefault();
	});

	const firebaseUiAuthContainer : HTMLElement = document.querySelector(".firebaseui-auth-container");

	document.querySelectorAll(".sign-in").forEach(element => element.addEventListener("click", () =>
	{
		firebaseUiAuthContainer.style.display = "flex";
	}));

	firebaseUiAuthContainer.addEventListener("click", e =>
	{
		const target = <HTMLElement>e.target;

		if (![ "button", "a", "p" ].includes(target.tagName.toLowerCase())) firebaseUiAuthContainer.style.display = "none";
	});

	signOutButton.addEventListener("click", () => Auth.SignOut());

	window.addEventListener("load", () => RemoveClass(document.body, "preload"));

	Shortcuts.Register("h", () => { location.href = "/"; });

	window.addEventListener("userready", () =>
	{
		if (Auth.IsAuthenticated)
		{
			db.collection(`users/${Auth.UserId}/config`).doc("preferences").onSnapshot(preferences =>
			{
				if (location.pathname.startsWith("/account") || location.pathname.startsWith("/settings"))
				{
					const backgroundImageUrl = preferences.data()?.backgroundImageUrl;

					document.body.style.backgroundImage = backgroundImageUrl ? `url(${backgroundImageUrl})` : "";

					localStorage.setItem("background-image-url", backgroundImageUrl);
				}

				const trackingEnabled : boolean = preferences.data()?.trackingEnabled
					?? (!navigator.doNotTrack && !window.doNotTrack);

				localStorage.setItem("tracking-enabled", `${trackingEnabled}`);

				analytics.setAnalyticsCollectionEnabled(trackingEnabled);

				Translation.Init(preferences.data()?.language ?? Translation.Language);
			});

			db.collection("users").doc(Auth.UserId).onSnapshot(doc =>
			{
				// It could not exist if the user just signed up
				if (!doc.exists) return;

				const { usedStorage } = doc.data();
				const { maxStorage } = doc.data();

				const percent = `${+((usedStorage / maxStorage) * 100).toFixed(2)}%`;

				const usedStorageElement = document.querySelector("[data-update-field=used-storage]");
				const maxStorageElement = document.querySelector("[data-update-field=max-storage]");

				usedStorageElement.innerHTML = FormatStorage(usedStorage);
				usedStorageElement.setAttribute("data-bytes", usedStorage);

				maxStorageElement.innerHTML = FormatStorage(maxStorage);
				maxStorageElement.setAttribute("data-bytes", maxStorage);

				document.querySelector("[data-update-field=used-storage-percent]").innerHTML = `(${percent})`;

				(<HTMLElement>document.querySelector(".storage .used")).style.width = percent;

				if (usedStorage > 0) ShowElement(whatIsTakingUpSpace);
				else HideElement(whatIsTakingUpSpace);

				if (IsFreePlan(maxStorage)) ShowElement(upgradePlan);
				else HideElement(upgradePlan);
			});
		}
	});
};