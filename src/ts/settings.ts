import type {
	analytics as firebaseAnalytics,
	firestore as firebaseFirestore,
	functions as firebaseFunctions,
} from "firebase";

import Init from "./scripts/load-events";

import {
	AddClass,
	RemoveClass,
	HasClass,
	FormatDate,
	ClearFirestoreCache,
	ShowElement,
	ShowElements,
	HideElement,
	HideElements,
	FormatStorage,
	IsFreePlan,
} from "./scripts/Utilities";
import { Modal } from "./scripts/Modal";
import Auth from "./scripts/Auth";
import Translation from "./scripts/Translation";
import { Component, InputWithIcon } from "./scripts/Component";
import * as genericMessage from "./scripts/generic-message";
import { header } from "./scripts/header";

Init();

declare const firebase: any;
declare const Stripe: stripe.StripeStatic;

const db: firebaseFirestore.Firestore = firebase.firestore();
const functions: firebaseFunctions.Functions = firebase.app().functions("europe-west1");
const analytics: firebaseAnalytics.Analytics = firebase.analytics();

const stripe = Stripe("pk_live_t7rK1HslRtmyqcEo0C3JfmLz00blc0Ik6P", { locale: Translation.Language });
const stripeElements = stripe.elements({
	fonts: [ {
		family: "Source Code Variable",
		src: "url(/assets/font/SourceCodeVariable.woff2)",
	} ],
	locale: Translation.Language,
});

const paymentRequest = stripe.paymentRequest({
	country: "IT",
	currency: Translation.Get("settings->plan->currency").toLowerCase(),
	total: { label: "Denvelope", amount: 0 },
});

window.addEventListener("translationlanguagechange", () =>
{
	const selectedPlanMaxStorage = plans.querySelector(".selected")?.getAttribute("data-max-storage");

	if (!selectedPlanMaxStorage) return;

	paymentRequest.update({
		currency: Translation.Get("settings->plan->currency").toLowerCase(),
		total: {
			label: `Denvelope ${selectedPlanMaxStorage}`,
			amount: parseInt(Translation.Get(`settings->plan->plans->${selectedPlanMaxStorage}->price->month`), 10) * 100, // In cents
		},
	});
});

paymentRequest.on("paymentmethod", async e =>
{
	const paymentMethod = e.paymentMethod.id;

	await functions.httpsCallable("createSubscription")({
		maxStorage: plans.querySelector(".selected").getAttribute("data-max-storage"),
		currency: Translation.Get("settings->plan->currency"),
		billingPeriod: document.querySelector(".billing-periods .selected").classList[0],
		paymentMethod,
	});

	e.complete("success");
});

let userAlreadyHasCardInformation : boolean = false;

let userDateFormatOptions : Intl.DateTimeFormatOptions;

const settingsMenu : HTMLElement = document.querySelector(".settings-menu");
const settingsMenuButtons = settingsMenu.querySelectorAll("button");

const settingsSections : NodeListOf<HTMLElement> = document.querySelectorAll(".settings-section");

const changeBackground : HTMLButtonElement = document.querySelector("#change-background .edit");
const resetBackground : HTMLButtonElement = document.querySelector("#change-background .reset");

const changeDateFormat : HTMLButtonElement = document.querySelector("#date-format .edit");
const resetDateFormat : HTMLButtonElement = document.querySelector("#date-format .reset");

const changePlan : HTMLButtonElement = document.querySelector("#change-plan .change");
const deletePlan : HTMLButtonElement = document.querySelector("#change-plan .delete");
const cancelDowngrade : HTMLButtonElement = document.querySelector("#change-plan .cancel-downgrade");
const reactivateSubscription : HTMLButtonElement = document.querySelector("#change-plan .reactivate");
const plans : HTMLDivElement = document.querySelector("#change-plan .plans");
const addPaymentMethod : HTMLButtonElement = document.querySelector("#payment-methods .add");
const currentPlan : HTMLElement = document.querySelector("#change-plan .current-plan .value");
const currentBillingPeriod : HTMLElement = document.querySelector("#change-plan .current-billing-period .value");
const nextRenewal : HTMLElement = document.querySelector("#change-plan .next-renewal .value");
const nextPeriodPlan : HTMLElement = document.querySelector("#change-plan .next-period-plan .value");
const nextBillingPeriod : HTMLElement = document.querySelector("#change-plan .next-billing-period .value");
const completePayment : HTMLAnchorElement = document.querySelector("#change-plan .complete-payment");
const paymentMethodsContainer : HTMLElement = document.querySelector("#payment-methods .payment-methods-container");
const noPaymentMethod : HTMLParagraphElement = document.querySelector("#payment-methods .no-payment-method");

const paymentRequestButton = stripeElements.create("paymentRequestButton", {
	paymentRequest,
	style: {
		paymentRequestButton: {
			type: "default",
			theme: "dark",
			height: "49px",
		},
	},
});

paymentRequestButton.on("click", e =>
{
	if (changePlan.disabled) e.preventDefault();
});

(async () =>
{
	if (await paymentRequest.canMakePayment()) paymentRequestButton.mount("#payment-request-button");
	else HideElement(document.getElementById("payment-request-button"));
})();

(<NodeListOf<HTMLElement>>plans.querySelectorAll(".plan")).forEach(plan =>
{
	const SelectPlan = () =>
	{
		const currentPlanElement = plans.querySelector(".current");
		const previouslySelectedPlanElement = plans.querySelector(".selected");

		previouslySelectedPlanElement?.classList.remove("selected");

		if (previouslySelectedPlanElement !== plan)
		{
			AddClass(plan, "selected");

			const selectedPlanMaxStorage = plan.getAttribute("data-max-storage");

			paymentRequest.update({
				currency: Translation.Get("settings->plan->currency").toLowerCase(),
				total: {
					label: `Denvelope ${selectedPlanMaxStorage}`,
					amount: parseInt(Translation.Get(`settings->plan->plans->${selectedPlanMaxStorage}->price->month`), 10) * 100, // In cents
				},
			});
		}

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

Array.from(document.querySelector(".billing-periods").children).forEach(billingPeriod =>
	billingPeriod.addEventListener("click", () => (<HTMLElement>plans.querySelector(".current")).click()));

const signOutFromAllDevices : HTMLButtonElement = document.querySelector("#sign-out-from-all-devices .sign-out");
const changeVaultPin : HTMLButtonElement = document.querySelector("#vault .change-pin");
const deleteVault : HTMLButtonElement = document.querySelector("#vault .delete");
const generateVaultRecoveryCode : HTMLButtonElement = document.querySelector("#vault .generate-recovery-code");

const changeCacheSize : HTMLButtonElement = document.querySelector("#cache-size .edit");
const resetCacheSize : HTMLButtonElement = document.querySelector("#cache-size .reset");
const currentCacheSize : HTMLElement = document.querySelector("#cache-size .current-cache-size .value");

const deleteAccount : HTMLButtonElement = document.querySelector("#delete-account .delete");

const clearCache : HTMLButtonElement = document.querySelector("#clear-cache .clear");
const updateTracking : HTMLButtonElement = document.querySelector("#tracking .update");

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

		AddClass(document.querySelector(`#${selectedSection}`), "selected");

		history.pushState(null, "", `${location.origin}/settings/${selectedSection}`);
	});
});

// TODO: Find a way to avoid this crap
const SetMainHeight = () => { settingsSections[0].parentElement.style.height = `${innerHeight - header.offsetHeight - settingsMenu.offsetHeight}px`; };

SetMainHeight();

window.addEventListener("resize", SetMainHeight);

window.addEventListener("userready", () =>
{
	changeBackground.addEventListener("click", () =>
	{
		const modal = new Modal({ title: changeBackground.closest(".setting").querySelector("h1").innerText, allow: [ "confirm" ] });

		const backgroundImageUrlInput = new InputWithIcon({
			attributes: {
				id: "background-image-url",
				placeholder: Translation.Get("account->image_address"),
				type: "url",
			},
			iconClassName: "fas fa-link fa-fw",
		}).element;

		const input = backgroundImageUrlInput.querySelector("input");

		input.addEventListener("input", () =>
		{
			let valid : boolean = true;

			try
			{
				const url = new URL(input.value);

				valid = url.protocol === "https:";
			}
			catch (err) { valid = false; }

			modal.ConfirmButton.disabled = !valid;
		});

		modal.ConfirmButton.disabled = true;

		modal.AppendContent([ backgroundImageUrlInput ]);

		modal.OnConfirm = () =>
		{
			if (HasClass(input, "error")) backgroundImageUrlInput.previousElementSibling.remove();

			RemoveClass(input, "error");

			modal.HideAndRemove();

			db.collection(`users/${Auth.UserId}/config`).doc("preferences").set({ backgroundImageUrl: input.value }, { merge: true });
		};

		modal.Show(true);
	});

	resetBackground.addEventListener("click", () =>
		db.collection(`users/${Auth.UserId}/config`).doc("preferences").set({ backgroundImageUrl: "" }, { merge: true }));

	changeDateFormat.addEventListener("click", async () =>
	{
		const modal = new Modal({ title: changeDateFormat.closest(".setting").querySelector("h1").innerText, allow: [ "confirm" ] });

		const dateFormatOptions : HTMLDivElement = <HTMLDivElement>document.querySelector("#date-format .date-format-options").cloneNode(true);

		if (userDateFormatOptions && userDateFormatOptions !== "default")
			Array.from(dateFormatOptions.children).forEach(dateFormatOption =>
			{
				const showOption: HTMLInputElement = dateFormatOption.querySelector("input[type=checkbox]");
				const optionSelect: HTMLSelectElement = dateFormatOption.querySelector("select");

				const dateFormatOptionName: string = optionSelect.id;

				if (showOption) showOption.checked = !!(<any>userDateFormatOptions)[dateFormatOptionName];

				if ((<any>userDateFormatOptions)[dateFormatOptionName])
					(<HTMLSelectElement>dateFormatOptions.querySelector(`#${dateFormatOptionName}`)).selectedIndex
						= (<HTMLOptionElement>dateFormatOptions.querySelector(`[value="${(<any>userDateFormatOptions)[dateFormatOptionName]}"]`)).index;
			});

		modal.AppendContent([
			new Component("p", {
				children: [
					new Component("span", { innerText: Translation.Get("generic->reference") }).element,
					new Component("a", {
						innerText: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/DateTimeFormat",
						href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/DateTimeFormat",
						target: "_blank",
					}).element,
				],
			}).element,
			new Component("p", {
				children: [
					new Component("span", { innerText: Translation.Get("generic->example") }).element,
					new Component("span", {
						id: "example-date",
						innerText: FormatDate(Date.now(), userDateFormatOptions !== "default"
							? userDateFormatOptions
							: null),
					}).element,
				],
			}).element,
			dateFormatOptions,
		]);

		const GetDateTimeFormatOptions = () : Intl.DateTimeFormatOptions =>
			({
				weekday: (<HTMLInputElement>dateFormatOptions.querySelector("#show-weekday")).checked
					? (<HTMLSelectElement>dateFormatOptions.querySelector("#weekday")).selectedOptions[0].value
					: undefined,
				era: (<HTMLInputElement>dateFormatOptions.querySelector("#show-era")).checked
					? (<HTMLSelectElement>dateFormatOptions.querySelector("#era")).selectedOptions[0].value
					: undefined,
				year: (<HTMLSelectElement>dateFormatOptions.querySelector("#year")).selectedOptions[0].value,
				month: (<HTMLSelectElement>dateFormatOptions.querySelector("#month")).selectedOptions[0].value,
				day: (<HTMLSelectElement>dateFormatOptions.querySelector("#day")).selectedOptions[0].value,
				hour: (<HTMLSelectElement>dateFormatOptions.querySelector("#hour")).selectedOptions[0].value,
				minute: (<HTMLSelectElement>dateFormatOptions.querySelector("#minute")).selectedOptions[0].value,
				second: (<HTMLInputElement>dateFormatOptions.querySelector("#show-second")).checked
					? (<HTMLSelectElement>dateFormatOptions.querySelector("#second")).selectedOptions[0].value
					: undefined,
				timeZoneName: (<HTMLInputElement>dateFormatOptions.querySelector("#show-timeZoneName")).checked
					? (<HTMLSelectElement>dateFormatOptions.querySelector("#timeZoneName")).selectedOptions[0].value
					: undefined,
			});

		[ ...dateFormatOptions.querySelectorAll("select"), ...dateFormatOptions.querySelectorAll("input[type=checkbox]") ]
			.forEach(element => element.addEventListener("change", () =>
			{
				(<HTMLSpanElement>modal.Content.querySelector("#example-date")).innerText = FormatDate(Date.now(), GetDateTimeFormatOptions());
			}));

		modal.OnConfirm = () =>
		{
			db.collection(`users/${Auth.UserId}/config`).doc("preferences").set({ dateFormatOptions: GetDateTimeFormatOptions() }, { merge: true });

			modal.HideAndRemove();
		};

		modal.Show(true);
	});

	resetDateFormat.addEventListener("click", () =>
		db.collection(`users/${Auth.UserId}/config`).doc("preferences").set({ dateFormatOptions: "default" }, { merge: true }));

	[ changePlan, addPaymentMethod ].forEach(button => button.addEventListener("click", () =>
	{
		const modal = new Modal({
			title: button.closest(".setting").querySelector("h1").innerText,
			subtitle: button.innerText,
			allow: [ "confirm" ],
			loading: false,
		});

		let cardElement: stripe.elements.Element;

		const showCreditCardInput : boolean = !userAlreadyHasCardInformation
			|| button === addPaymentMethod;

		if (button === changePlan) modal.AppendContent([
			new Component("p", {
				children: [
					new Component("span", { innerText: Translation.Get("generic->from") }).element,
					new Component("span", { innerText: (<HTMLElement>plans.querySelector(".current > .storage")).innerText }).element,
				],
			}).element,
			new Component("p", {
				children: [
					new Component("span", { innerText: Translation.Get("generic->to") }).element,
					new Component("span", { innerText: (<HTMLElement>plans.querySelector(".selected > .storage")).innerText }).element,
				],
			}).element,
		]);

		if (showCreditCardInput)
		{
			modal.ConfirmButton.disabled = true;

			cardElement = stripeElements.create("card", {
				style: {
					base: {
						iconColor: "#efcb68",
						color: "#efcb68",
						fontFamily: "Source Code Variable, monospace",
						fontSize: "16px",
						"::placeholder": {
							color: "#efcb68",
						},
					},
					invalid: {
						iconColor: "red",
						color: "red",
					},
				},
				hidePostalCode: false,
			});

			cardElement.on("change", e =>
			{
				modal.ConfirmButton.disabled = !e.complete;

				modal.Content.querySelector(".input-error")?.remove();

				if (e.error) modal.Content.insertAdjacentHTML("afterbegin", `<p class="input-error">${e.error.message}</p>`);
			});

			cardElement.on("ready", () => cardElement.focus());

			modal.AppendContent([ document.createElement("div") ]);

			cardElement.mount(modal.Content.querySelector("div"));
		}

		modal.OnConfirm = async () =>
		{
			let result : stripe.PaymentMethodResponse;

			modal.HideAndRemove();

			if (showCreditCardInput) result = await stripe.createPaymentMethod({ type: "card", card: cardElement });

			if (button === changePlan) functions.httpsCallable("createSubscription")({
				maxStorage: plans.querySelector(".selected").getAttribute("data-max-storage"),
				currency: Translation.Get("settings->plan->currency"),
				billingPeriod: document.querySelector(".billing-periods .selected").classList[0],
				// Not needed if the user already has a default payment method
				paymentMethod: result?.paymentMethod.id,
			});
			else
			{
				functions.httpsCallable("addPaymentMethod")({ paymentMethod: result.paymentMethod.id });

				analytics.logEvent("add_payment_info");
			}
		};

		modal.Show(true);
	}));

	deletePlan.addEventListener("click", () =>
	{
		const modal = new Modal({
			title: deletePlan.closest(".setting").querySelector("h1").innerText,
			subtitle: deletePlan.innerText,
			allow: [ "confirm" ],
			loading: false,
		});

		modal.AppendContent([ new Component("p", { innerText: Translation.Get("settings->plan->delete_plan->message") }).element ]);

		modal.OnConfirm = () =>
		{
			functions.httpsCallable("cancelSubscription")({});

			modal.HideAndRemove();
		};

		modal.Show(true);
	});

	[ cancelDowngrade, reactivateSubscription ].forEach(button => button.addEventListener("click", () =>
	{
		const modal = new Modal({
			title: button.closest(".setting").querySelector("h1").innerText,
			subtitle: button.innerText,
			allow: [ "confirm" ],
			loading: false,
		});

		modal.OnConfirm = () =>
		{
			let params = {};

			if (button === cancelDowngrade) params = {
				maxStorage: plans.querySelector(".current").getAttribute("data-max-storage"),
				currency: Translation.Get("settings->plan->currency"),
				billingPeriod: document.querySelector(".billing-periods .selected").classList[0],
			};

			functions.httpsCallable(button === cancelDowngrade ? "createSubscription" : "reactivateSubscription")(params);

			modal.HideAndRemove();
		};

		modal.Show(true);
	}));

	signOutFromAllDevices.addEventListener("click", () =>
	{
		const modal = new Modal({
			title: signOutFromAllDevices.closest(".setting").querySelector("h1").innerText,
			allow: [ "confirm" ],
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
			title: changeVaultPin.closest(".setting").querySelector("h1").innerText,
			subtitle: changeVaultPin.innerText,
			allow: [ "confirm" ],
			loading: false,
		});

		const currentVaultPinInput = new InputWithIcon({
			attributes: {
				id: "current-vault-pin",
				placeholder: Translation.Get("settings->security->change_vault_pin->current_or_recovery_code"),
				type: "password",
			},
			iconClassName: "fas fa-key fa-fw",
		}).element;

		const newVaultPinInput = new InputWithIcon({
			attributes: {
				id: "new-vault-pin",
				placeholder: Translation.Get("settings->security->change_vault_pin->new"),
				type: "password",
			},
			iconClassName: "fas fa-key fa-fw",
		}).element;

		const currentPinInput = currentVaultPinInput.querySelector("input");
		const newPinInput = newVaultPinInput.querySelector("input");

		[ currentPinInput, newPinInput ].forEach(input =>
			input.addEventListener("input", () =>
			{
				modal.ConfirmButton.disabled = currentPinInput.value.length < 4
					|| newPinInput.value.length < 4;
			}));

		modal.ConfirmButton.disabled = true;

		modal.AppendContent([ currentVaultPinInput, newVaultPinInput ]);

		modal.OnConfirm = async () =>
		{
			const currentPin = currentPinInput.value;
			const newPin = newPinInput.value;

			if (HasClass(currentPinInput, "error")) currentVaultPinInput.previousElementSibling.remove();
			if (HasClass(newPinInput, "error")) newVaultPinInput.previousElementSibling.remove();

			RemoveClass(currentPinInput, "error");
			RemoveClass(newPinInput, "error");

			modal.Hide();

			functions.httpsCallable("changeVaultPin")({ currentPin, newPin }).then(result =>
			{
				if (result.data.success) modal.Remove();
				else
				{
					AddClass(currentPinInput, "error");

					currentVaultPinInput.insertAdjacentElement("beforebegin", new Component("p", {
						class: "input-error",
						innerText: Translation.Get("api->messages->vault->wrong_pin"),
					}).element);

					modal.Show(true);
				}
			});
		};

		modal.Show(true);
	});

	deleteVault.addEventListener("click", () =>
	{
		const modal = new Modal({
			title: deleteVault.closest(".setting").querySelector("h1").innerText,
			subtitle: deleteVault.innerText,
			allow: [ "confirm" ],
		});

		const vaultPinInput = new InputWithIcon({
			attributes: {
				id: "vault-pin",
				placeholder: Translation.Get("api->messages->vault->pin_or_recovery_code"),
				type: "password",
			},
			iconClassName: "fas fa-key fa-fw",
		}).element;

		const input = vaultPinInput.querySelector("input");

		input.addEventListener("input", () => { modal.ConfirmButton.disabled = input.value.length < 4; });

		modal.ConfirmButton.disabled = true;

		modal.AppendContent([ vaultPinInput ]);

		modal.OnConfirm = async () =>
		{
			const pin = input.value;

			if (HasClass(input, "error")) vaultPinInput.previousElementSibling.remove();

			RemoveClass(input, "error");

			modal.Hide();

			functions.httpsCallable("deleteVault")({ pin }).then(result =>
			{
				if (result.data.success) modal.Remove();
				else
				{
					AddClass(input, "error");

					vaultPinInput.insertAdjacentElement("beforebegin", new Component("p", {
						class: "input-error",
						innerText: Translation.Get("api->messages->vault->wrong_pin"),
					}).element);

					modal.Show(true);
				}
			});
		};

		modal.Show(true);
	});

	generateVaultRecoveryCode.addEventListener("click", () =>
	{
		const modal = new Modal({
			title: generateVaultRecoveryCode.closest(".setting").querySelector("h1").innerText,
			subtitle: generateVaultRecoveryCode.innerText,
			allow: [ "confirm" ],
		});

		const vaultPinInput = new InputWithIcon({
			attributes: {
				id: "vault-pin",
				placeholder: Translation.Get("api->messages->vault->pin_or_recovery_code"),
				type: "password",
			},
			iconClassName: "fas fa-key fa-fw",
		}).element;

		const input = vaultPinInput.querySelector("input");

		input.addEventListener("input", () => { modal.ConfirmButton.disabled = input.value.length < 4; });

		modal.ConfirmButton.disabled = true;

		modal.AppendContent([
			new Component("p", { class: "multiline", innerText: Translation.Get("settings->security->vault->recovery_code_info") }).element,
			vaultPinInput,
		]);

		modal.OnConfirm = async () =>
		{
			const pin = input.value;

			if (HasClass(input, "error")) vaultPinInput.previousElementSibling.remove();

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

					vaultPinInput.insertAdjacentElement("beforebegin", new Component("p", {
						class: "input-error",
						innerText: Translation.Get("api->messages->vault->wrong_pin"),
					}).element);

					modal.Show(true);
				}
			});
		};

		modal.Show(true);
	});

	changeCacheSize.addEventListener("click", () =>
	{
		const modal = new Modal({
			title: changeCacheSize.closest(".setting").querySelector("h1").innerText,
			allow: [ "confirm" ],
			loading: false,
		});

		const cacheSizeOptions : HTMLSelectElement = <HTMLSelectElement>document.querySelector("#cache-size .cache-size-options").cloneNode(true);

		(<HTMLOptionElement>cacheSizeOptions.querySelector(".default")).innerText += ` (${Translation.Get("generic->default")})`;

		const cacheSizeBytes : number = parseInt(localStorage.getItem("cache-size"), 10);

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
			title: deleteAccount.closest(".setting").querySelector("h1").innerText,
			allow: [ "confirm" ],
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

	updateTracking.addEventListener("click", () =>
	{
		const modal = new Modal({
			title: updateTracking.closest(".setting").querySelector("h1").innerText,
			subtitle: updateTracking.innerText,
			allow: [ "confirm" ],
			loading: false,
		});

		modal.OnConfirm = () =>
		{
			db.collection(`users/${Auth.UserId}/config`).doc("preferences").update("trackingEnabled", updateTracking.getAttribute("data-action") === "enable");

			modal.HideAndRemove();
		};

		modal.Show(true);
	});

	db.collection("users").doc(Auth.UserId).onSnapshot(user =>
	{
		const { maxStorage } = user.data();
		const userNextPeriodMaxStorage : number = user.data().stripe?.nextPeriodMaxStorage;

		const billingPeriod: "month" | "year" = user.data().stripe?.billingPeriod ?? "month";
		const userNextBillingPeriod : "month" | "year" | undefined = user.data().stripe?.nextBillingPeriod;

		const userCanceledSubscription : boolean = user.data().stripe?.cancelAtPeriodEnd;
		const subscriptionNextRenewalOrEndDate : number = user.data().stripe?.nextRenewal;

		const invoiceUrl : string = user.data().stripe?.invoiceUrl;

		UpdatePlan(maxStorage, billingPeriod);

		deletePlan.disabled = IsFreePlan(maxStorage) || userCanceledSubscription;

		HideElements([
			reactivateSubscription,
			nextRenewal.parentElement,
			nextPeriodPlan.parentElement,
			nextBillingPeriod.parentElement,
			paymentMethodsContainer,
			noPaymentMethod,
			completePayment,
			cancelDowngrade,
		]);

		if (userCanceledSubscription) ShowElement(reactivateSubscription);

		if (!IsFreePlan(maxStorage))
		{
			nextRenewal.innerHTML = "";
			nextRenewal.appendChild(new Component("span", {
				data: { date: subscriptionNextRenewalOrEndDate },
				innerText: FormatDate(subscriptionNextRenewalOrEndDate * 1000, userDateFormatOptions),
			}).element);

			ShowElement(nextRenewal.parentElement);

			if (!userCanceledSubscription)
			{
				if (userNextPeriodMaxStorage && userNextPeriodMaxStorage < maxStorage)
				{
					nextPeriodPlan.innerText = FormatStorage(userNextPeriodMaxStorage);

					ShowElements([ nextPeriodPlan.parentElement, cancelDowngrade ]);
				}

				if (userNextBillingPeriod && userNextBillingPeriod !== billingPeriod)
				{
					nextBillingPeriod.setAttribute("data-only-translation", `generic->${userNextBillingPeriod}`);
					nextBillingPeriod.innerText = Translation.Get(nextBillingPeriod.getAttribute("data-translation"));

					ShowElement(nextBillingPeriod.parentElement);
				}
			}
		}

		const userPaymentMethods = user.data().stripe?.paymentMethods;

		userAlreadyHasCardInformation = !!userPaymentMethods && userPaymentMethods?.length > 0;

		if (userAlreadyHasCardInformation)
		{
			const userDefaultPaymentMethod = user.data().stripe?.defaultPaymentMethod;

			paymentMethodsContainer.innerHTML = "";

			ShowElement(paymentMethodsContainer);

			const ShowUserPaymentMethods = (
				paymentMethods : {
					id : string,
					brand : string,
					last4 : string,
					expirationMonth : string,
					expirationYear : string,
				}[],
				defaultPaymentMethod : string,
			) =>
			{
				paymentMethodsContainer.innerHTML = "";

				paymentMethods.forEach(paymentMethod =>
				{
					const isDefaultPaymentMethod = paymentMethod.id === defaultPaymentMethod;

					const setAsDefaultButton : HTMLButtonElement = <HTMLButtonElement> new Component("button", {
						class: "set-as-default",
						innerText: Translation.Get("settings->plan->payment_methods->set_as_default"),
					}).element;

					const deleteButton : HTMLButtonElement = <HTMLButtonElement> new Component("button", {
						class: "delete",
						children: [
							new Component("i", { class: "fas fa-trash" }).element,
							new Component("span", { innerText: ` ${Translation.Get("generic->delete")}` }).element,
						],
					}).element;

					paymentMethodsContainer.appendChild(new Component("div", {
						class: `cc-info ${isDefaultPaymentMethod ? "default" : ""}`,
						id: paymentMethod.id,
						children: [
							new Component("span", { children: [ new Component("i", { class: `fab fa-cc-${paymentMethod.brand}` }).element ] }).element,
							new Component("span", { innerText: `••••${paymentMethod.last4}` }).element,
							new Component("span", { innerText: `${paymentMethod.expirationMonth}/${paymentMethod.expirationYear}` }).element,
							setAsDefaultButton,
							deleteButton,
						],
					}).element);

					[ setAsDefaultButton, deleteButton ].forEach(button => button.addEventListener("click", () =>
					{
						const modal = new Modal({
							title: button.innerText,
							allow: [ "confirm" ],
							loading: false,
						});

						modal.OnConfirm = () =>
						{
							functions.httpsCallable(button === setAsDefaultButton ? "setDefaultPaymentMethod" : "deletePaymentMethod")({ paymentMethod: paymentMethod.id });

							modal.HideAndRemove();
						};

						modal.Show(true);
					}));

					if (isDefaultPaymentMethod)
					{
						if (!IsFreePlan(maxStorage)) deleteButton.disabled = true;

						setAsDefaultButton.disabled = true;

						paymentMethodsContainer
							.querySelector(`#${paymentMethod.id} span:last-of-type`)
							.insertAdjacentElement("afterend", new Component("span", { innerText: `(${Translation.Get("generic->default")})` }).element);
					}
				});
			};

			ShowUserPaymentMethods(userPaymentMethods, userDefaultPaymentMethod);

			window.addEventListener("translationlanguagechange", () => ShowUserPaymentMethods(userPaymentMethods, userDefaultPaymentMethod));
		}
		else ShowElement(noPaymentMethod);

		if (invoiceUrl)
		{
			ShowElement(completePayment);

			completePayment.href = invoiceUrl;
		}
	});

	db.collection(`users/${Auth.UserId}/config`).doc("preferences").onSnapshot(preferences =>
	{
		if (!preferences.data()) return;

		const {
			backgroundImageUrl,
			dateFormatOptions,
			trackingEnabled,
		} = preferences.data();

		resetBackground.disabled = !backgroundImageUrl;

		userDateFormatOptions = dateFormatOptions;

		if (userDateFormatOptions === "default") userDateFormatOptions = null;

		document.querySelectorAll("[data-date]").forEach(element =>
		{
			(<HTMLElement>element).innerText = FormatDate(Number(element.getAttribute("data-date")) * 1000, userDateFormatOptions);
		});

		resetDateFormat.disabled = !userDateFormatOptions || userDateFormatOptions === "default";

		updateTracking.setAttribute("data-action", (trackingEnabled ?? true) ? "disable" : "enable");
		updateTracking.setAttribute("data-translation", `generic->${updateTracking.getAttribute("data-action")}`);

		updateTracking.innerText = ` ${Translation.Get(updateTracking.getAttribute("data-translation"))}`;

		updateTracking.insertAdjacentElement("afterbegin", new Component("i", {
			class: `fas fa-toggle-${updateTracking.getAttribute("data-action") === "disable" ? "off" : "on"}`,
		}).element);
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

const UpdateCacheSize = (bytes : number) =>
{
	localStorage.setItem("cache-size", bytes.toString());

	currentCacheSize.innerText = `${bytes / 1000 / 1000}MB`;

	resetCacheSize.disabled = bytes === null || defaultCacheSize === bytes;
};

const UpdatePlan = (maxStorage : number, billingPeriod: "month" | "year") : void =>
{
	currentPlan.innerText = FormatStorage(maxStorage);

	currentBillingPeriod.setAttribute("data-only-translation", `generic->${billingPeriod}`);
	currentBillingPeriod.innerText = Translation.Get(currentBillingPeriod.getAttribute("data-only-translation"));

	plans.querySelector(".current")?.classList.remove("current");

	AddClass(plans.querySelector(`[data-max-storage="${FormatStorage(maxStorage)}"]`), "current");

	plans.querySelector(".selected")?.classList.remove("selected");

	(<HTMLButtonElement>document.querySelector(`.billing-periods .${billingPeriod}`)).click();

	changePlan.disabled = true;
};

UpdateCacheSize(parseInt(localStorage.getItem("cache-size"), 10) || defaultCacheSize); // If cache-size is null parseInt returns NaN