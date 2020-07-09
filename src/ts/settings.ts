import type { firestore as firebaseFirestore, functions as firebaseFunctions } from "firebase";

import Init from "./scripts/load-events";

import {
	AddClass,
	RemoveClass,
	HasClass,
	FormatDate,
	ClearFirestoreCache,
	ShowElement,
	ShowElements,
	HideElements,
	FormatStorage,
	IsFreePlan,
} from "./scripts/Utilities";
import { Modal } from "./scripts/Modal";
import Auth from "./scripts/Auth";
import Translation from "./scripts/Translation";
import { Component, Input } from "./scripts/Component";
import * as genericMessage from "./scripts/generic-message";
import { Config } from "./config/Config";
import Settings from "./classes/Settings";

Init();

declare const firebase: any;
declare const Stripe: stripe.StripeStatic;

const db: firebaseFirestore.Firestore = firebase.firestore();
const functions: firebaseFunctions.Functions = firebase.app().functions("europe-west1");

const stripe = Stripe("pk_live_t7rK1HslRtmyqcEo0C3JfmLz00blc0Ik6P", { locale: Translation.Language });

let userDateFormatOptions: Intl.DateTimeFormatOptions | undefined;

const settingsMenu: HTMLElement = <HTMLElement>document.querySelector("aside");
const settingsMenuButtons = settingsMenu.querySelectorAll("button");

const settingsSections: NodeListOf<HTMLElement> = document.querySelectorAll(".settings-section");

const changeBackground: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#change-background .edit");
const resetBackground: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#change-background .reset");

const changeDateFormat: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#date-format .edit");
const resetDateFormat: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#date-format .reset");

const changePlan: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#change-plan .change");
const manageSubscription: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#change-plan .manage-subscription");
const plans: HTMLDivElement = <HTMLDivElement>document.querySelector("#change-plan .plans");
const currentPlan: HTMLElement = <HTMLElement>document.querySelector("#change-plan .current-plan .value");
const currentBillingPeriod: HTMLElement = <HTMLElement>document.querySelector("#change-plan .current-billing-period .value");
const nextRenewal: HTMLElement = <HTMLElement>document.querySelector("#change-plan .next-renewal .value");
const nextPeriodPlan: HTMLElement = <HTMLElement>document.querySelector("#change-plan .next-period-plan .value");
const nextBillingPeriod: HTMLElement = <HTMLElement>document.querySelector("#change-plan .next-billing-period .value");

(<NodeListOf<HTMLElement>>plans.querySelectorAll(".plan")).forEach(plan =>
{
	const SelectPlan = () =>
	{
		const currentPlanElement = plans.querySelector(".current");
		const previouslySelectedPlanElement = plans.querySelector(".selected");

		previouslySelectedPlanElement?.classList.remove("selected");

		if (previouslySelectedPlanElement !== plan) AddClass(plan, "selected");

		// If the user is on the free plan and has changed the selected billing period
		if ([ currentPlanElement, plans.querySelector(".selected") ].every(element => element?.matches(":first-child") ?? true))
		{
			changePlan.disabled = true;

			return;
		}

		changePlan.disabled = (plans.querySelector(".selected") ?? currentPlanElement) === currentPlanElement
			&& currentBillingPeriod.innerText === (<HTMLButtonElement>document.querySelector(".billing-periods .selected")).innerText;
	};

	plan.addEventListener("click", SelectPlan);

	plan.addEventListener("keydown", e =>
	{
		if (e.key === "Enter") SelectPlan();
	});
});

Array.from((<HTMLElement>document.querySelector(".billing-periods")).children).forEach(billingPeriod =>
	billingPeriod.addEventListener("click", () => (<HTMLElement>plans.querySelector(".current")).click()));

const signOutFromAllDevices: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#sign-out-from-all-devices .sign-out");
const changeVaultPin: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#vault .change-pin");
const deleteVault: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#vault .delete");
const generateVaultRecoveryCode: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#vault .generate-recovery-code");

const changeCacheSize: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#cache-size .edit");
const resetCacheSize: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#cache-size .reset");
const currentCacheSize: HTMLElement = <HTMLElement>document.querySelector("#cache-size .current-cache-size .value");

const deleteAccount: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#delete-account .delete");

const clearCache: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#clear-cache .clear");

let section : string = "general";

if (location.pathname.indexOf("/settings/") > -1)
{
	section = location.pathname.substr(10);

	if (section.indexOf("/") > -1) section = section.substr(0, section.indexOf("/"));

	if (![ "general", "plan", "security", "advanced", "privacy", "info" ].includes(section)) section = "general";
}

[ document.querySelector(`[data-sect=${section}]`), document.querySelector(`#${section}`) ].forEach(element => AddClass(<HTMLElement>element, "selected"));

const defaultCacheSize : number = parseInt((<HTMLOptionElement>document.querySelector("#cache-size .cache-size-options .default")).value, 10) * 1000 * 1000;

settingsMenuButtons.forEach(element =>
{
	element.addEventListener("click", e =>
	{
		let button : HTMLButtonElement;

		// Clicked element is the button
		if ((<HTMLElement>e.target).querySelector("i")) button = (<HTMLButtonElement>e.target);
		// Clicked element is the icon
		else button = (<HTMLButtonElement>(<HTMLElement>e.target).parentNode);

		settingsMenuButtons.forEach(menuButton => RemoveClass(menuButton, "selected"));

		settingsSections.forEach(settingSection => RemoveClass(settingSection, "selected"));

		AddClass(button, "selected");

		const selectedSection = button.getAttribute("data-sect");

		AddClass(<HTMLElement>document.querySelector(`#${selectedSection}`), "selected");

		history.pushState(null, "", `${location.origin}/settings/${selectedSection}`);
	});
});

window.addEventListener("userready", () =>
{
	Settings.Register({
		button: changeBackground,
		callback: async content =>
		{
			const backgroundImageUrlInput = <HTMLInputElement>(<HTMLElement>content).querySelector("input");

			await db.collection(`users/${Auth.UserId}/config`).doc("preferences").set({ backgroundImageUrl: backgroundImageUrlInput.value }, { merge: true });

			return { valid: true };
		},
		options: {
			modal: {
				content: () => ([
					new Input({
						labelTranslationId: "account->image_address",
						attributes: { type: "url" },
					}).element,
				]),
				validators: [
					{
						on: "input",
						target: "input",
						callback: input =>
						{
							let valid = true;

							try
							{
								const url = new URL((<HTMLInputElement>input).value);

								valid = url.protocol === "https:";
							}
							catch (err) { valid = false; }

							return valid;
						},
					},
				],
			},
		},
	});

	Settings.Register({
		button: resetBackground,
		callback: async () =>
		{
			await db.collection(`users/${Auth.UserId}/config`).doc("preferences").update({ backgroundImageUrl: firebase.firestore.FieldValue.delete() });
		},
	});

	const GetDateTimeFormatOptions = (
		dateFormatOptionsElement: HTMLElement,
	): Intl.DateTimeFormatOptions =>
		({
			weekday: (<HTMLInputElement>dateFormatOptionsElement.querySelector("#show-weekday")).checked
				? (<HTMLSelectElement>dateFormatOptionsElement.querySelector("#weekday")).selectedOptions[0].value
				: undefined,
			year: (<HTMLSelectElement>dateFormatOptionsElement.querySelector("#year")).selectedOptions[0].value,
			month: (<HTMLSelectElement>dateFormatOptionsElement.querySelector("#month")).selectedOptions[0].value,
			day: (<HTMLSelectElement>dateFormatOptionsElement.querySelector("#day")).selectedOptions[0].value,
			hour: (<HTMLSelectElement>dateFormatOptionsElement.querySelector("#hour")).selectedOptions[0].value,
			minute: (<HTMLSelectElement>dateFormatOptionsElement.querySelector("#minute")).selectedOptions[0].value,
			second: (<HTMLInputElement>dateFormatOptionsElement.querySelector("#show-second")).checked
				? (<HTMLSelectElement>dateFormatOptionsElement.querySelector("#second")).selectedOptions[0].value
				: undefined,
			timeZoneName: (<HTMLInputElement>dateFormatOptionsElement.querySelector("#show-timeZoneName")).checked
				? (<HTMLSelectElement>dateFormatOptionsElement.querySelector("#timeZoneName")).selectedOptions[0].value
				: undefined,
		});

	Settings.Register({
		button: changeDateFormat,
		callback: async content =>
		{
			db.collection(`users/${Auth.UserId}/config`).doc("preferences").set({
				dateFormatOptions: GetDateTimeFormatOptions(<HTMLElement>(<HTMLElement>content).querySelector(".date-format-options")),
			}, { merge: true });
		},
		options: {
			modal: {
				content: () =>
				{
					const dateFormatOptions: HTMLDivElement = <HTMLDivElement>(<HTMLDivElement>document.querySelector("#date-format .date-format-options")).cloneNode(true);

					if (userDateFormatOptions)
						Array.from(dateFormatOptions.children).forEach(dateFormatOption =>
						{
							const showOption: HTMLInputElement = <HTMLInputElement>dateFormatOption.querySelector("input[type=checkbox]");
							const optionSelect: HTMLSelectElement = <HTMLSelectElement>dateFormatOption.querySelector("select");

							const dateFormatOptionName: string = optionSelect.id;

							if (showOption)
								showOption.checked = !!(<any>userDateFormatOptions)[dateFormatOptionName];

							if ((<any>userDateFormatOptions)[dateFormatOptionName])
								(<HTMLSelectElement>dateFormatOptions.querySelector(`#${dateFormatOptionName}`)).selectedIndex
									= (<HTMLOptionElement>dateFormatOptions.querySelector(`[value="${(<any>userDateFormatOptions)[dateFormatOptionName]}"]`)).index;
						});

					const exampleDateElement = Translation.GetDateElement(new Date(), userDateFormatOptions);

					[ ...dateFormatOptions.querySelectorAll("select"), ...dateFormatOptions.querySelectorAll("input[type=checkbox]") ]
						.forEach(element => element.addEventListener("change", () =>
						{
							exampleDateElement.innerText
								= FormatDate(Date.now(), GetDateTimeFormatOptions(dateFormatOptions));
						}));

					return [
						new Component("p", {
							children: [
								Translation.GetElement("generic->reference"),
								new Component("a", {
									innerText: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/DateTimeFormat",
									href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/DateTimeFormat",
									target: "_blank",
								}).element,
							],
						}).element,
						new Component("p", {
							children: [
								Translation.GetElement("generic->example"),
								exampleDateElement,
							],
						}).element,
						dateFormatOptions,
					];
				},
			},
		},
	});

	Settings.Register({
		button: resetDateFormat,
		callback: async () =>
		{
			await db.collection(`users/${Auth.UserId}/config`).doc("preferences").set({ dateFormatOptions: firebase.firestore.FieldValue.delete() }, { merge: true });
		},
	});

	Settings.Register({
		button: changePlan,
		callback: async () =>
		{
			const { data } = await functions.httpsCallable("createCheckoutSession")({
				maxStorage: (<HTMLElement>plans.querySelector(".selected")).getAttribute("data-max-storage"),
				currency: Translation.Currency,
				billingPeriod: (<HTMLElement>document.querySelector(".billing-periods .selected")).classList[0],
			});

			stripe.redirectToCheckout({ sessionId: data.sessionId });
		},
	});

	Settings.Register({
		button: manageSubscription,
		callback: async () =>
		{
			const { data } = await functions.httpsCallable("createBillingPortalSession")();

			open(data.session.url);
		},
	});

	signOutFromAllDevices.addEventListener("click", () =>
	{
		const modal = new Modal({
			titleTranslationId: <string>(<HTMLElement>(<HTMLElement>signOutFromAllDevices.closest(".setting")).querySelector("h1")).getAttribute("data-translation"),
			action: "confirm",
			loading: false,
		});

		modal.OnConfirm = () =>
		{
			functions.httpsCallable("signOutUserFromAllDevices")({});

			Auth.SignOut();

			modal.HideAndRemove();
		};

		modal.Show(true);
	});

	changeVaultPin.addEventListener("click", () =>
	{
		const modal = new Modal({
			titleTranslationId: <string>(<HTMLElement>(<HTMLElement>changeVaultPin.closest(".setting")).querySelector("h1")).getAttribute("data-translation"),
			subtitleTranslationId: <string>changeVaultPin.getAttribute("data-translation"),
			action: "confirm",
			loading: false,
		});

		const currentVaultPinInput = new Input({
			labelTranslationId: "settings->security->change_vault_pin->current_or_recovery_code",
			attributes: { type: "password" },
		});

		const newVaultPinInput = new Input({
			labelTranslationId: "settings->security->change_vault_pin->new",
			attributes: { type: "password" },
		});

		const currentPinInput = currentVaultPinInput.input;
		const newPinInput = newVaultPinInput.input;

		[ currentPinInput, newPinInput ].forEach(input =>
			input.addEventListener("input", () =>
			{
				modal.ConfirmButton.disabled = currentPinInput.value.length < 4
					|| newPinInput.value.length < 4;
			}));

		modal.ConfirmButton.disabled = true;

		modal.AppendContent([ currentVaultPinInput.element, newVaultPinInput.element ]);

		modal.OnConfirm = async () =>
		{
			const currentPin = currentPinInput.value;
			const newPin = newPinInput.value;

			if (HasClass(currentPinInput, "error")) currentVaultPinInput.element.previousElementSibling?.remove();
			if (HasClass(newPinInput, "error")) newVaultPinInput.element.previousElementSibling?.remove();

			RemoveClass(currentPinInput, "error");
			RemoveClass(newPinInput, "error");

			modal.Hide();

			functions.httpsCallable("changeVaultPin")({ currentPin, newPin }).then(result =>
			{
				if (result.data.success) modal.Remove();
				else
				{
					AddClass(currentPinInput, "error");

					const errorParagraph = new Component("p", { class: "input-error" }).element;

					Translation.Register("api->messages->vault->wrong_pin", errorParagraph);

					currentVaultPinInput.element.insertAdjacentElement("beforebegin", errorParagraph);

					modal.Show(true);
				}
			});
		};

		modal.Show(true);
	});

	deleteVault.addEventListener("click", () =>
	{
		const modal = new Modal({
			titleTranslationId: <string>(<HTMLElement>(<HTMLElement>deleteVault.closest(".setting")).querySelector("h1")).getAttribute("data-translation"),
			subtitleTranslationId: <string>deleteVault.getAttribute("data-translation"),
			action: "confirm",
		});

		const { element, input } = new Input({
			labelTranslationId: "api->messages->vault->pin_or_recovery_code",
			attributes: { type: "password" },
		});

		input.addEventListener("input", () => { modal.ConfirmButton.disabled = input.value.length < 4; });

		modal.ConfirmButton.disabled = true;

		modal.AppendContent([ element ]);

		modal.OnConfirm = async () =>
		{
			const pin = input.value;

			if (HasClass(input, "error")) element.previousElementSibling?.remove();

			RemoveClass(input, "error");

			modal.Hide();

			functions.httpsCallable("deleteVault")({ pin }).then(result =>
			{
				if (result.data.success) modal.Remove();
				else
				{
					AddClass(input, "error");

					const errorParagraph = new Component("p", { class: "input-error" }).element;

					Translation.Register("api->messages->vault->wrong_pin", errorParagraph);

					element.insertAdjacentElement("beforebegin", errorParagraph);

					modal.Show(true);
				}
			});
		};

		modal.Show(true);
	});

	generateVaultRecoveryCode.addEventListener("click", () =>
	{
		const modal = new Modal({
			titleTranslationId: <string>(<HTMLElement>(<HTMLElement>generateVaultRecoveryCode.closest(".setting")).querySelector("h1")).getAttribute("data-translation"),
			subtitleTranslationId: <string>generateVaultRecoveryCode.getAttribute("data-translation"),
			action: "confirm",
		});

		const { element, input } = new Input({
			labelTranslationId: "api->messages->vault->pin_or_recovery_code",
			attributes: { type: "password" },
		});

		input.addEventListener("input", () => { modal.ConfirmButton.disabled = input.value.length < 4; });

		modal.ConfirmButton.disabled = true;

		modal.AppendContent([
			new Component("p", {
				class: "multiline",
				children: [ Translation.GetElement("settings->security->vault->recovery_code_info") ],
			}).element,
			element,
		]);

		modal.OnConfirm = async () =>
		{
			const pin = input.value;

			if (HasClass(input, "error")) element.previousElementSibling?.remove();

			RemoveClass(input, "error");

			modal.Hide();

			functions.httpsCallable("generateVaultRecoveryCode")({ pin }).then(result =>
			{
				if (result.data.success)
				{
					modal.Remove();

					const blobUrl = URL.createObjectURL(new Blob([ result.data.recoveryCode ], { type: "text/plain" }));
					const a = document.createElement("a");

					a.download = "denvelope-vault-recovery-code.txt";
					a.href = blobUrl;

					document.body.appendChild(a);

					a.click();
					a.remove();
				}
				else
				{
					AddClass(input, "error");

					const errorParagraph = new Component("p", { class: "input-error" }).element;

					Translation.Register("api->messages->vault->wrong_pin", errorParagraph);

					element.insertAdjacentElement("beforebegin", errorParagraph);

					modal.Show(true);
				}
			});
		};

		modal.Show(true);
	});

	changeCacheSize.addEventListener("click", () =>
	{
		const modal = new Modal({
			titleTranslationId: <string>(<HTMLElement>(<HTMLElement>changeCacheSize.closest(".setting")).querySelector("h1")).getAttribute("data-translation"),
			action: "confirm",
			loading: false,
		});

		const cacheSizeOptions : HTMLSelectElement = <HTMLSelectElement>(<HTMLSelectElement>document.querySelector("#cache-size .cache-size-options")).cloneNode(true);

		Translation.Register("generic->default", (<HTMLOptionElement>cacheSizeOptions.querySelector(".default")), {
			before: `${(<HTMLOptionElement>cacheSizeOptions.querySelector(".default")).innerText} (`,
			after: ")",
		});

		const cacheSizeBytes : number = parseInt(<string>localStorage.getItem("cache-size"), 10);

		if (cacheSizeBytes) cacheSizeOptions.selectedIndex = (<HTMLOptionElement>cacheSizeOptions.querySelector(`[value="${cacheSizeBytes / 1000 / 1000}"]`)).index;

		modal.AppendContent([ cacheSizeOptions ]);

		modal.OnConfirm = () =>
		{
			modal.HideAndRemove();

			UpdateCacheSize(parseInt(cacheSizeOptions.selectedOptions[0].value, 10) * 1000 * 1000);

			genericMessage.Show(Translation.Get("settings->changes_will_be_applied_at_the_next_page_load"));
		};

		modal.Show(true);
	});

	resetCacheSize.addEventListener("click", () =>
	{
		UpdateCacheSize(defaultCacheSize);

		genericMessage.Show(Translation.Get("settings->changes_will_be_applied_at_the_next_page_load"));
	});

	deleteAccount.addEventListener("click", () =>
	{
		const modal = new Modal({
			titleTranslationId: <string>(<HTMLElement>(<HTMLElement>deleteAccount.closest(".setting")).querySelector("h1")).getAttribute("data-translation"),
			action: "confirm",
			loading: false,
		});

		modal.OnConfirm = () =>
		{
			Auth.DeleteUser();

			modal.HideAndRemove();
		};

		modal.Show(true);
	});

	clearCache.addEventListener("click", ClearFirestoreCache);

	db.collection("users").doc(Auth.UserId).onSnapshot(user =>
	{
		const data: Config.Data.User = <Config.Data.User>user.data();

		const { maxStorage } = data;
		const userNextPeriodMaxStorage: number | undefined = data.stripe?.nextPeriodMaxStorage;

		const billingPeriod: "month" | "year" = data.stripe?.billingPeriod ?? "month";
		const userNextBillingPeriod : "month" | "year" | undefined = data.stripe?.nextBillingPeriod;

		const userCanceledSubscription: boolean | undefined = data.stripe?.cancelAtPeriodEnd;
		const subscriptionNextRenewalOrEndDate: number | undefined = data.stripe?.nextRenewal;

		UpdatePlan(maxStorage, billingPeriod);

		HideElements([
			<HTMLElement>nextRenewal.parentElement,
			<HTMLElement>nextPeriodPlan.parentElement,
			<HTMLElement>nextBillingPeriod.parentElement,
			manageSubscription,
			plans,
		]);

		if (!IsFreePlan(maxStorage))
		{
			nextRenewal.innerHTML = "";
			nextRenewal.appendChild(Translation.GetDateElement(
				new Date(<number>subscriptionNextRenewalOrEndDate * 1000),
				userDateFormatOptions,
			));

			ShowElements([ <HTMLElement>nextRenewal.parentElement, manageSubscription ]);

			if (!userCanceledSubscription)
			{
				if (userNextPeriodMaxStorage && userNextPeriodMaxStorage < maxStorage)
				{
					nextPeriodPlan.innerText = FormatStorage(userNextPeriodMaxStorage);

					ShowElement(<HTMLElement>nextPeriodPlan.parentElement);
				}

				if (userNextBillingPeriod && userNextBillingPeriod !== billingPeriod)
				{
					Translation.Register(`generic->${userNextBillingPeriod}`, nextBillingPeriod);

					ShowElement(<HTMLElement>nextBillingPeriod.parentElement);
				}
			}
		}
		else ShowElement(plans);
	});

	db.collection(`users/${Auth.UserId}/config`).doc("preferences").onSnapshot(preferences =>
	{
		if (!preferences.data()) return;

		const { backgroundImageUrl, dateFormatOptions } = <Config.Data.Preferences>preferences.data();

		resetBackground.disabled = !backgroundImageUrl;

		userDateFormatOptions = dateFormatOptions;

		resetDateFormat.disabled = !userDateFormatOptions;
	});

	db.collection(`users/${Auth.UserId}/vault`).doc("status").onSnapshot(snapshot =>
	{
		changeVaultPin.disabled
			= deleteVault.disabled
			= generateVaultRecoveryCode.disabled
			= !snapshot.exists;

		Auth.RefreshToken();
	});
});

window.addEventListener("popstate", () =>
{
	let url = window.location.href;

	section = url[url.length - 1] === "/"
		? (url = url.substr(0, url.length - 1)).substr(url.lastIndexOf("/") + 1)
		: url.substr(url.lastIndexOf("/") + 1);

	(<HTMLButtonElement>document.querySelector(`button[data-sect=${section === "settings" ? "general" : section}]`)).click();
});

const UpdateCacheSize = (bytes: number) =>
{
	localStorage.setItem("cache-size", bytes.toString());

	currentCacheSize.innerText = `${bytes / 1000 / 1000}MB`;

	resetCacheSize.disabled = bytes === null || defaultCacheSize === bytes;
};

const UpdatePlan = (maxStorage: number, billingPeriod: "month" | "year") =>
{
	currentPlan.innerText = FormatStorage(maxStorage);

	Translation.Register(`generic->${billingPeriod}`, currentBillingPeriod);

	plans.querySelector(".current")?.classList.remove("current");

	AddClass(<HTMLElement>plans.querySelector(`[data-max-storage="${FormatStorage(maxStorage)}"]`), "current");

	plans.querySelector(".selected")?.classList.remove("selected");

	(<HTMLButtonElement>document.querySelector(`.billing-periods .${billingPeriod}`)).click();

	changePlan.disabled = true;
};

UpdateCacheSize(parseInt(localStorage.getItem("cache-size") ?? "0", 10) || defaultCacheSize);