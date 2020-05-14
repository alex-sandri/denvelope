export {};

import * as loadEvents from './scripts/load-events';

import { Utilities } from "./scripts/Utilities";
import { Modal } from "./scripts/Modal";
import { Auth } from "./scripts/Auth";
import { Translation } from "./scripts/Translation";
import { Component, InputWithIcon } from "./scripts/Component";
import * as genericMessage from "./scripts/generic-message";

loadEvents.Init();

const db = (<any>window).firebase.firestore();
const functions = (<any>window).firebase.app().functions("europe-west1");

const stripe = (<any>window).Stripe("pk_test_Rqpdq6Rg3NdyuTBGzzpkTeGw009ERd4wpw", { locale: Translation.Language });
let userAlreadyHasCardInformation : boolean = false;

const settingsMenu = document.querySelector(".settings-menu");
const settingsMenuButtons = settingsMenu.querySelectorAll("button");

const settingsSections : NodeListOf<HTMLElement> = document.querySelectorAll(".settings-section");

const changeLanguage : HTMLButtonElement = document.querySelector("#change-language .edit");
const languageSelect : HTMLSelectElement = document.querySelector("#language-select");

const changeBackground : HTMLButtonElement = document.querySelector("#change-background .edit");
const resetBackground : HTMLButtonElement = document.querySelector("#change-background .reset");

const changeDateFormat : HTMLButtonElement = document.querySelector("#date-format .edit");
const resetDateFormat : HTMLButtonElement = document.querySelector("#date-format .reset");

const changePlan : HTMLButtonElement = document.querySelector("#change-plan .change");
const deletePlan : HTMLButtonElement = document.querySelector("#change-plan .delete");
const plans : HTMLDivElement = document.querySelector("#change-plan .plans");
const changePaymentMethod : HTMLButtonElement = document.querySelector("#payment-method .edit");
const noPaymentMethod : HTMLParagraphElement = document.querySelector("#payment-method .no-payment-method");

const signOutFromAllDevices : HTMLButtonElement = document.querySelector("#sign-out-from-all-devices .sign-out");
const changeVaultPin : HTMLButtonElement = document.querySelector("#change-vault-pin .edit");
const deleteVault : HTMLButtonElement = document.querySelector("#delete-vault .delete");

const changeCacheSize : HTMLButtonElement = document.querySelector("#cache-size .edit");
const resetCacheSize : HTMLButtonElement = document.querySelector("#cache-size .reset");

const deleteAccount : HTMLButtonElement = document.querySelector("#delete-account .delete");

const clearCache : HTMLButtonElement = document.querySelector("#clear-cache .clear");

languageSelect.selectedIndex = <number><unknown>(<HTMLOptionElement>languageSelect.querySelector(`[value^=${Translation.Language}]`)).index;

let section : string = "general";

if (location.pathname.indexOf("/settings/") > -1)
{
    section = location.pathname.substr(10);

    if (section.indexOf("/") > -1) section = section.substr(0, section.indexOf("/"));

    if (![ "general", "plan", "security", "advanced", "privacy", "info" ].includes(section)) section = "general";
}

[ document.querySelector(`[data-sect=${section}]`), document.querySelector(`#${section}`) ].forEach(element => Utilities.AddClass(<HTMLElement>element, "selected"));

document.querySelectorAll("#plan .plans .plan")
    .forEach(plan =>
    {
        (<HTMLSpanElement>plan.querySelector(".price")).innerText =
        Intl.NumberFormat(Translation.Language, { style: "currency", currency: Translation.Get(`settings->plan->currency`), minimumFractionDigits: 0 })
        .format(parseInt(Translation.Get(`settings->plan->plans->${plan.classList[1]}->price->month`)))
        .replace(/\s/, "");

        (<HTMLSpanElement>plan.querySelector(".billing-period")).innerText = ` / ${Translation.Get("generic->month").toLowerCase()}`;
    });

const defaultCacheSize : number = parseInt((<HTMLOptionElement>document.querySelector("#cache-size .cache-size-options .default")).value) * 1000 * 1000;

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

        languageSelect.selectedIndex = <number><unknown>(<HTMLOptionElement>languageSelect.querySelector(`[value^=${Translation.Language}]`)).index;

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
            if (Utilities.HasClass(input, "error")) backgroundImageUrlInput.previousElementSibling.remove();

            Utilities.RemoveClass(input, "error");

            modal.HideAndRemove();

            db.collection(`users/${Auth.UserId}/config`).doc("preferences").set({ backgroundImageUrl: input.value }, { merge: true });
        }

        modal.Show(true);

        input.focus();
    });

    resetBackground.addEventListener("click", () =>
        db.collection(`users/${Auth.UserId}/config`).doc("preferences").set({ backgroundImageUrl: "" }, { merge: true }));

    changeDateFormat.addEventListener("click", async() =>
    {
        const modal = new Modal({ title: changeDateFormat.closest(".setting").querySelector("h1").innerText, allow: [ "close", "confirm" ] });

        const userDateFormatOptions = (await db.collection(`users/${Auth.UserId}/config`).doc("preferences").get()).data().dateFormatOptions;

        const dateFormatOptions : HTMLDivElement = <HTMLDivElement>document.querySelector("#date-format .date-format-options").cloneNode(true);

        if (userDateFormatOptions !== "default")
        {
            (<HTMLInputElement>dateFormatOptions.querySelector("#show-weekday")).checked = userDateFormatOptions.weekday !== "undefined";

            if (userDateFormatOptions.weekday !== "undefined")
                (<HTMLSelectElement>dateFormatOptions.querySelector("#weekday")).selectedIndex =
                    <number><unknown>(<HTMLOptionElement>dateFormatOptions.querySelector(`[value="${userDateFormatOptions.weekday}"]`)).index;

            (<HTMLInputElement>dateFormatOptions.querySelector("#show-era")).checked = userDateFormatOptions.era !== "undefined";
            
            if (userDateFormatOptions.era !== "undefined")
                (<HTMLSelectElement>dateFormatOptions.querySelector("#era")).selectedIndex =
                    <number><unknown>(<HTMLOptionElement>dateFormatOptions.querySelector(`[value="${userDateFormatOptions.era}"]`)).index;

            (<HTMLSelectElement>dateFormatOptions.querySelector("#year")).selectedIndex =
                <number><unknown>(<HTMLOptionElement>dateFormatOptions.querySelector(`[value="${userDateFormatOptions.year}"]`)).index;

            (<HTMLSelectElement>dateFormatOptions.querySelector("#month")).selectedIndex =
                <number><unknown>(<HTMLOptionElement>dateFormatOptions.querySelector(`[value="${userDateFormatOptions.month}"]`)).index;

            (<HTMLSelectElement>dateFormatOptions.querySelector("#day")).selectedIndex =
                <number><unknown>(<HTMLOptionElement>dateFormatOptions.querySelector(`[value="${userDateFormatOptions.day}"]`)).index;

            (<HTMLSelectElement>dateFormatOptions.querySelector("#hour")).selectedIndex =
                <number><unknown>(<HTMLOptionElement>dateFormatOptions.querySelector(`[value="${userDateFormatOptions.hour}"]`)).index;

            (<HTMLSelectElement>dateFormatOptions.querySelector("#minute")).selectedIndex =
                <number><unknown>(<HTMLOptionElement>dateFormatOptions.querySelector(`[value="${userDateFormatOptions.minute}"]`)).index;

            (<HTMLInputElement>dateFormatOptions.querySelector("#show-second")).checked = userDateFormatOptions.second !== "undefined";
            
            if (userDateFormatOptions.second !== "undefined")
                (<HTMLSelectElement>dateFormatOptions.querySelector("#second")).selectedIndex =
                    <number><unknown>(<HTMLOptionElement>dateFormatOptions.querySelector(`[value="${userDateFormatOptions.second}"]`)).index;
                
            (<HTMLInputElement>dateFormatOptions.querySelector("#show-timeZoneName")).checked = userDateFormatOptions.timeZoneName !== "undefined";
            
            if (userDateFormatOptions.timeZoneName !== "undefined")
                (<HTMLSelectElement>dateFormatOptions.querySelector("#timeZoneName")).selectedIndex =
                    <number><unknown>(<HTMLOptionElement>dateFormatOptions.querySelector(`[value="${userDateFormatOptions.timeZoneName}"]`)).index;
        }

        for (const entry in userDateFormatOptions)
            if (userDateFormatOptions[entry] === "undefined")
                userDateFormatOptions[entry] = undefined;

        modal.AppendContent([
            new Component("p", { children: [
                new Component("span", { innerText: Translation.Get("generic->reference") + ": " }).element,
                new Component("a", {
                    innerText: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/DateTimeFormat",
                    href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/DateTimeFormat",
                    target: "_blank"
                }).element
            ] }).element,
            new Component("p", { children: [
                new Component("span", { innerText: Translation.Get("generic->example") + ": " }).element,
                new Component("span", {
                    id: "example-date",
                    innerText: Utilities.FormatDate(Date.now(), userDateFormatOptions !== "default"
                        ? userDateFormatOptions
                        : null) }).element
            ] }).element,
            dateFormatOptions
        ]);

        const GetDateTimeFormatOptions = (allowUndefinedFields : boolean) : Intl.DateTimeFormatOptions =>
            ({
                weekday: (<HTMLInputElement>dateFormatOptions.querySelector("#show-weekday")).checked
                    ? (<HTMLSelectElement>dateFormatOptions.querySelector("#weekday")).selectedOptions[0].value
                    : (allowUndefinedFields ? undefined : "undefined"),
                era: (<HTMLInputElement>dateFormatOptions.querySelector("#show-era")).checked
                    ? (<HTMLSelectElement>dateFormatOptions.querySelector("#era")).selectedOptions[0].value
                    : (allowUndefinedFields ? undefined : "undefined"),
                year: (<HTMLSelectElement>dateFormatOptions.querySelector("#year")).selectedOptions[0].value,
                month: (<HTMLSelectElement>dateFormatOptions.querySelector("#month")).selectedOptions[0].value,
                day: (<HTMLSelectElement>dateFormatOptions.querySelector("#day")).selectedOptions[0].value,
                hour: (<HTMLSelectElement>dateFormatOptions.querySelector("#hour")).selectedOptions[0].value,
                minute: (<HTMLSelectElement>dateFormatOptions.querySelector("#minute")).selectedOptions[0].value,
                second: (<HTMLInputElement>dateFormatOptions.querySelector("#show-second")).checked
                    ? (<HTMLSelectElement>dateFormatOptions.querySelector("#second")).selectedOptions[0].value
                    : (allowUndefinedFields ? undefined : "undefined"),
                timeZoneName: (<HTMLInputElement>dateFormatOptions.querySelector("#show-timeZoneName")).checked
                    ? (<HTMLSelectElement>dateFormatOptions.querySelector("#timeZoneName")).selectedOptions[0].value
                    : (allowUndefinedFields ? undefined : "undefined"),
            });

        [ ...dateFormatOptions.querySelectorAll("select"), ...dateFormatOptions.querySelectorAll("input[type=checkbox]") ]
            .forEach(element => element.addEventListener("change", () =>
                (<HTMLSpanElement>modal.Content.querySelector("#example-date")).innerText = Utilities.FormatDate(Date.now(), GetDateTimeFormatOptions(true))));

        modal.OnConfirm = () =>
        {
            db.collection(`users/${Auth.UserId}/config`).doc("preferences").set({ dateFormatOptions: GetDateTimeFormatOptions(false) }, { merge: true });

            modal.HideAndRemove();
        };

        modal.Show(true);
    });

    resetDateFormat.addEventListener("click", () =>
        db.collection(`users/${Auth.UserId}/config`).doc("preferences").set({ dateFormatOptions: "default" }, { merge: true }));

    [ changePlan, changePaymentMethod ].forEach(button => button.addEventListener("click", () =>
    {
        const modal = new Modal({
            title: button.closest(".setting").querySelector("h1").innerText,
            allow: [ "close", "confirm" ],
            loading: false
        });

        let cardElement : any;

        const showCreditCardInput : boolean = !userAlreadyHasCardInformation || button === changePaymentMethod;

        if (showCreditCardInput)
        {
            modal.ConfirmButton.disabled = true;

            const stripeElements = stripe.elements({
                fonts: [ {
                    family: "Source Code Variable",
                    src: "url(/assets/font/SourceCodePro/Variable.woff2)"
                } ],
                locale: Translation.Language
            });

            cardElement = stripeElements.create("card", {
                style: {
                    base: {
                        iconColor: "#efcb68",
                        color: "#efcb68",
                        fontFamily: "Source Code Variable, monospace",
                        fontSize: "16px",
                        ":-webkit-autofill": {
                            color: '#fce883',
                        },
                        "::placeholder": {
                            color: '#efcb68',
                        },
                    },
                    invalid: {
                        iconColor: "red",
                        color: "red",
                    },
                },
                hidePostalCode: true
            });

            cardElement.on("change", (e : any) =>
            {
                modal.ConfirmButton.disabled = !e.complete;

                modal.Content.querySelector(".input-error")?.remove();

                if (e.error) modal.Content.insertAdjacentHTML("afterbegin", `<p class="input-error">${e.error.message}</p>`);
            });

            modal.AppendContent([ document.createElement("div") ])

            cardElement.mount(modal.Content.querySelector("div"));
        }

        modal.OnConfirm = async () =>
        {
            let result : any;

            modal.HideAndRemove();

            if (showCreditCardInput) result = await stripe.createPaymentMethod({ type: "card", card: cardElement });

            if (button === changePlan)
                functions.httpsCallable("createSubscription")({
                    plan: plans.querySelector(".selected").classList[1],
                    currency: Translation.Get(`settings->plan->currency`),
                    paymentMethod: result?.paymentMethod.id // Not needed if the user already has a default payment method (aka the user is already a customer)
                });
            else functions.httpsCallable("changePaymentMethod")({ paymentMethod: result.paymentMethod.id });
        }

        modal.Show(true);
    }));

    deletePlan.addEventListener("click", () =>
    {
        const modal = new Modal({
            title: Translation.Get("settings->plan->delete_plan"),
            allow: [ "close", "confirm" ],
            loading: false
        });

        modal.OnConfirm = () =>
        {
            functions.httpsCallable("deleteSubscription")({});

            modal.HideAndRemove();
        }

        modal.Show(true);
    });

    (<NodeListOf<HTMLElement>>plans.querySelectorAll(".plan")).forEach(plan => plan.addEventListener("click", () =>
    {
        const currentPlan = plans.querySelector(".current");
        const previouslySelectedPlan = plans.querySelector(".selected");

        previouslySelectedPlan?.classList.remove("selected");

        if (previouslySelectedPlan !== plan) Utilities.AddClass(plan, "selected");

        changePlan.disabled = (plans.querySelector(".selected") ?? currentPlan) === currentPlan;
    }));

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

    changeVaultPin.addEventListener("click", () =>
    {
        const modal = new Modal({
            title: changeVaultPin.closest(".setting").querySelector("h1").innerText,
            allow: [ "close", "confirm" ],
            loading: false
        });

        const currentVaultPinInput = new InputWithIcon({
            attributes: {
                id: "current-vault-pin",
                placeholder: Translation.Get("settings->security->change_vault_pin->current"),
                type: "password"
            },
            iconClassName: "fas fa-key fa-fw"
        }).element;

        const newVaultPinInput = new InputWithIcon({
            attributes: {
                id: "new-vault-pin",
                placeholder: Translation.Get("settings->security->change_vault_pin->new"),
                type: "password"
            },
            iconClassName: "fas fa-key fa-fw"
        }).element;

        const currentPinInput = currentVaultPinInput.querySelector("input");
        const newPinInput = newVaultPinInput.querySelector("input");

        [ currentPinInput, newPinInput ].forEach(input =>
            input.addEventListener("input", () =>
                modal.ConfirmButton.disabled = currentPinInput.value.length < 4 || newPinInput.value.length < 4));

        modal.ConfirmButton.disabled = true;

        modal.AppendContent([ currentVaultPinInput, newVaultPinInput ]);

        modal.OnConfirm = async () =>
        {
            const currentPin = currentPinInput.value;
            const newPin = newPinInput.value;

            if (Utilities.HasClass(currentPinInput, "error")) currentVaultPinInput.previousElementSibling.remove();
            if (Utilities.HasClass(newPinInput, "error")) newVaultPinInput.previousElementSibling.remove();

            Utilities.RemoveClass(currentPinInput, "error");
            Utilities.RemoveClass(newPinInput, "error");

            modal.Hide();
            
            functions.httpsCallable("changeVaultPin")({ currentPin, newPin }).then((result : any) =>
            {
                if (result.data.success) modal.Remove();
                else
                {
                    Utilities.AddClass(currentPinInput, "error");

                    currentVaultPinInput.insertAdjacentElement("beforebegin", new Component("p", {
                        class: "input-error",
                        innerText: Translation.Get("api->messages->vault->wrong_pin")
                    }).element);

                    modal.Show(true);

                    currentPinInput.focus();
                }
            });
        }

        modal.Show(true);

        currentPinInput.focus();
    });

    deleteVault.addEventListener("click", () =>
    {
        const modal = new Modal({
            title: deleteVault.closest(".setting").querySelector("h1").innerText,
            allow: [ "confirm", "close" ]
        });

        const vaultPinInput = new InputWithIcon({
            attributes: {
                id: "vault-pin",
                placeholder: "PIN",
                type: "password"
            },
            iconClassName: "fas fa-key fa-fw"
        }).element;

        const input = vaultPinInput.querySelector("input");

        input.addEventListener("input", () => modal.ConfirmButton.disabled = input.value.length < 4);

        modal.ConfirmButton.disabled = true;

        modal.AppendContent([ vaultPinInput ]);

        modal.OnConfirm = async () =>
        {
            const pin = input.value;

            if (Utilities.HasClass(input, "error")) vaultPinInput.previousElementSibling.remove();

            Utilities.RemoveClass(input, "error");

            modal.Hide();
                
            functions.httpsCallable("deleteVault")({ pin }).then((result : any) =>
            {
                if (result.data.success) modal.Remove();
                else
                {
                    Utilities.AddClass(input, "error");

                    vaultPinInput.insertAdjacentElement("beforebegin", new Component("p", {
                        class: "input-error",
                        innerText: Translation.Get("api->messages->vault->wrong_pin")
                    }).element);

                    modal.Show(true);

                    input.focus();
                }
            });
        }

        modal.Show(true);

        input.focus();
    });

    changeCacheSize.addEventListener("click", () =>
    {
        const modal = new Modal({
            title: changeCacheSize.closest(".setting").querySelector("h1").innerText,
            allow: [ "close", "confirm" ],
            loading: false
        });

        const cacheSizeOptions : HTMLSelectElement = <HTMLSelectElement>document.querySelector("#cache-size .cache-size-options").cloneNode(true);

        (<HTMLOptionElement>cacheSizeOptions.querySelector(".default")).innerText += ` (${Translation.Get("generic->default")})`;

        const cacheSizeBytes : number = parseInt(localStorage.getItem("cache-size"));

        if (cacheSizeBytes) cacheSizeOptions.selectedIndex = (<HTMLOptionElement>cacheSizeOptions.querySelector(`[value="${cacheSizeBytes / 1000 / 1000}"]`)).index;

        modal.AppendContent([ cacheSizeOptions ]);

        modal.OnConfirm = () =>
        {
            modal.HideAndRemove();

            UpdateCacheSize(parseInt(cacheSizeOptions.selectedOptions[0].value) * 1000 * 1000);

            genericMessage.Show(Translation.Get("settings->changes_will_be_applied_at_the_next_page_load"));
        }

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

    clearCache.addEventListener("click", Utilities.ClearFirestoreCache);

    db.collection("users").doc(Auth.UserId).onSnapshot((user : any) =>
    {
        const plan = user.data().plan;

        UpdatePlan(plan);

        if (plan !== "free")
            changePlan.parentElement.querySelector(".next-renewal").innerHTML = `${Translation.Get("settings->plan->next_renewal")}: <span>${user.data().stripe.nextRenewal}</span>`;
        else Utilities.HideElement(changePlan.parentElement.querySelector(".next-renewal"));

        const defaultPaymentMethod = user.data().stripe?.defaultPaymentMethod;

        userAlreadyHasCardInformation = !!defaultPaymentMethod;

        const creditCardInfo : HTMLElement = document.querySelector("#payment-method .cc-info");

        Utilities.HideElements([ creditCardInfo, noPaymentMethod ]);

        if (userAlreadyHasCardInformation)
        {
            Utilities.ShowElement(creditCardInfo);

            creditCardInfo.querySelector(".brand").innerHTML = `<i class="fab fa-cc-${defaultPaymentMethod.brand}"></i>`;
            creditCardInfo.querySelector(".last4").innerHTML = `&bull;&bull;&bull;&bull;${defaultPaymentMethod.last4}`;
            (<HTMLSpanElement>creditCardInfo.querySelector(".expiration")).innerText = `${defaultPaymentMethod.expirationMonth}/${defaultPaymentMethod.expirationYear}`;
        }
        else Utilities.ShowElement(noPaymentMethod);

        changePaymentMethod.disabled = !userAlreadyHasCardInformation;
    });

    db.collection(`users/${Auth.UserId}/config`).doc("preferences").onSnapshot((preferences : any) =>
    {
        const backgroundImageUrl = preferences.data()?.backgroundImageUrl;

        document.body.style.backgroundImage = backgroundImageUrl ? `url(${backgroundImageUrl})` : "";

        resetBackground.disabled = !backgroundImageUrl;

        resetDateFormat.disabled = preferences.data()?.dateFormatOptions === "default";
    });

    db.collection(`users/${Auth.UserId}/vault`).doc("status").onSnapshot((snapshot : any) =>
    {
        changeVaultPin.disabled = deleteVault.disabled = !snapshot.exists;

        Auth.RefreshToken();
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
    Translation.Init(null, languageSelect.selectedOptions[0].value);

    changeLanguage.parentElement.querySelector("p").innerHTML = `${Translation.Get("generic->current")}: <span>${languageSelect.selectedOptions[0].text}</span>`;
};

const UpdateCacheSize = (bytes : number) =>
{
    localStorage.setItem("cache-size", bytes.toString());

    changeCacheSize.parentElement.querySelector("p").innerHTML =
        `${Translation.Get("generic->current")}: <span>${bytes / 1000 / 1000}MB</span>`;

    resetCacheSize.disabled = bytes === null || defaultCacheSize === bytes;
}

const UpdatePlan = (plan : string) : void =>
{
    Translation.Init(null, languageSelect.selectedOptions[0].value);

    changePlan.parentElement.querySelector(".current-plan").innerHTML = `${Translation.Get("generic->current")}: <span>${Translation.Get(`settings->plan->plans->${plan}->name`)}</span>`;

    plans.querySelector(".current")?.classList.remove("current");

    Utilities.AddClass(plans.querySelector(`.${plan}`), "current");

    plans.querySelector(".selected")?.classList.remove("selected");

    changePlan.disabled = true;

    deletePlan.disabled = plan === "free";
}

UpdateLanguage();

UpdateCacheSize(parseInt(localStorage.getItem("cache-size")) || defaultCacheSize); // if cache-size is null parseInt returns NaN