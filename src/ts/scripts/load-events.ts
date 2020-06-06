import { LogPageViewEvent, ShowElement, HideElement, PreventDragEvents, RemoveClass, FormatStorage, IsFreePlan, AddClass, IsTouchDevice } from "./Utilities";
import { Auth } from "./Auth";
import { signOutButton, accountMenuToggle, whatIsTakingUpSpace, upgradePlan } from "./header";
import { ServiceWorkerController } from "../service_workers/ServiceWorkerController";
import { Translation } from "./Translation";
import { Modal } from "./Modal";

export const Init = () : void =>
{
    const db = (<any>window).firebase.firestore();

    const cacheSizeBytes : number = parseInt(localStorage.getItem("cache-size"));

    if (cacheSizeBytes) db.settings({ cacheSizeBytes, ignoreUndefinedProperties: true });

    // Enable caching firestore queries for offline support and enable synchronization between tabs
    db.enablePersistence({ synchronizeTabs: true });

    if (document.body.classList.contains("account") || document.body.classList.contains("settings"))
        document.body.style.backgroundImage = `url(${localStorage.getItem("background-image-url") ?? ""})`;

    window.addEventListener("translationlanguagechange", () =>
        // Used in plans page and in plan settings
        document
            .querySelectorAll(".plans .plan")
            .forEach(plan =>
            {
                (<HTMLSpanElement>plan.querySelector(".price")).innerText =
                Intl.NumberFormat(Translation.Language, { style: "currency", currency: Translation.Get(`settings->plan->currency`), minimumFractionDigits: 0 })
                .format(parseInt(Translation.Get(`settings->plan->plans->${plan.getAttribute("data-max-storage")}->price->month`)))
                .replace(/\s/, "");

                (<HTMLSpanElement>plan.querySelector(".billing-period")).innerText = ` / ${Translation.Get("generic->month").toLowerCase()}`;

                (<HTMLElement>plan.querySelector(".storage")).innerText = plan.getAttribute("data-max-storage");
            }));

    Translation.Init();

    const changeLanguage : HTMLButtonElement = document.querySelector("#change-language .edit");
    const languageSelect : HTMLSelectElement = document.querySelector("#language-select");

    changeLanguage?.addEventListener("click", () =>
    {
        const modal = new Modal({
            title: Translation.Get("generic->language"),
            allow: [ "close", "confirm" ]
        });

        modal.AppendContent([ languageSelect ]);

        languageSelect.selectedIndex = (<HTMLOptionElement>languageSelect.querySelector(`[value^=${Translation.Language}]`)).index;

        modal.OnConfirm = () =>
        {
            Translation.Init(languageSelect.selectedOptions[0].value);

            modal.HideAndRemove();
        }

        modal.Show(true);
    });

    Auth.Init();

    // This needs to wait for the translation to be completed
    LogPageViewEvent();

    const cookieBanner : HTMLElement = document.querySelector(".cookie-banner");

    new ServiceWorkerController();

    if (!localStorage.getItem("cookie-consent"))
    {
        ShowElement(cookieBanner, "flex");

        cookieBanner.querySelector("i:last-child").addEventListener("click", () => HideElement(document.querySelector(".cookie-banner")));
    }

    localStorage.setItem("cookie-consent", "true");

    PreventDragEvents();

    if (IsTouchDevice()) AddClass(document.documentElement, "touch");

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

    window.addEventListener("keydown", e =>
    {
        if (["input", "textarea"].includes(document.activeElement.tagName.toLowerCase())) return;

        const key = e.key.toLowerCase();

        if (["m", "a", "e", "h", "s"].includes(key)) e.preventDefault();

        if (key === "m") accountMenuToggle.click();
        else if (key === "a") location.href = "/account";
        else if (key === "e") signOutButton.click();
        else if (key === "h") location.href = "/";
        else if (key === "s" && !e.ctrlKey) location.href = "/settings";
    });

    window.addEventListener("userready", () =>
    {
        if (Auth.IsAuthenticated)
        {
            db.collection(`users/${Auth.UserId}/config`).doc("preferences").onSnapshot((preferences : any) =>
            {
                if (location.pathname.startsWith("/account") || location.pathname.startsWith("/settings"))
                {
                    const backgroundImageUrl = preferences.data()?.backgroundImageUrl;
                
                    document.body.style.backgroundImage = backgroundImageUrl ? `url(${backgroundImageUrl})` : "";

                    localStorage.setItem("background-image-url", backgroundImageUrl);
                }
            });

            db.collection("users").doc(Auth.UserId).onSnapshot((doc : any) =>
            {
                // It could not exist if the user just signed up
                if (!doc.exists) return;

                const usedStorage = doc.data().usedStorage;
                const maxStorage = doc.data().maxStorage;

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

    window.addEventListener("securitypolicyviolation", e => console.error(e));
}