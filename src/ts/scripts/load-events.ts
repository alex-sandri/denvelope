import { Utilities } from "./Utilities";
import { Auth } from "./Auth";
import { signOutButton, accountMenuToggle, whatIsTakingUpSpace } from "./header";
import { ServiceWorkerController } from "../service_workers/ServiceWorkerController";
import { Translation } from "./Translation";

export const Init = () : void =>
{
    const db = (<any>window).firebase.firestore();

    // Enable caching firestore queries for offline support and enable synchronization between tabs
    db.enablePersistence({
        synchronizeTabs: true
    });

    Auth.Init();

    const cookieBanner : HTMLElement = document.querySelector(".cookie-banner");

    new ServiceWorkerController();

    if (!Utilities.IsSetCookie("cookie_consent"))
    {
        Utilities.ShowElement(cookieBanner, "flex");

        cookieBanner.querySelector("i:last-child").addEventListener("click", () => Utilities.HideElement(document.querySelector(".cookie-banner")));
    }

    Utilities.PreventDragEvents();

    document.addEventListener("contextmenu", e =>
    {
        if ((<HTMLElement>e.target).closest(".allow-context-menu") === null) e.preventDefault();
    });

    signOutButton.addEventListener("click", () => Auth.SignOut());

    document.addEventListener("DOMContentLoaded", () =>
    {
        Utilities.SetCookie("cookie_consent", "true", 60);

        Translation.Init();

        // This needs to wait for the translation to be completed
        Utilities.LogPageViewEvent();
    });

    window.addEventListener("load", () => Utilities.RemoveClass(document.body, "preload"));

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
            db.collection("users").doc(Auth.UserId).onSnapshot((doc : any) =>
            {
                // It could not exist if the user just signed up
                if (!doc.exists) return;

                const usedStorage = doc.data().usedStorage;
                const maxStorage = doc.data().maxStorage;

                const percent = `${+((usedStorage / maxStorage) * 100).toFixed(2)}%`;

                const usedStorageElement = document.querySelector("[data-update-field=used-storage]");
                const maxStorageElement = document.querySelector("[data-update-field=max-storage]");

                usedStorageElement.innerHTML = Utilities.FormatStorage(usedStorage);
                usedStorageElement.setAttribute("data-bytes", usedStorage);

                maxStorageElement.innerHTML = Utilities.FormatStorage(maxStorage);
                maxStorageElement.setAttribute("data-bytes", maxStorage);

                document.querySelector("[data-update-field=used-storage-percent]").innerHTML = `(${percent})`;

                (<HTMLElement>document.querySelector(".storage .used")).style.width = percent;

                if (usedStorage > 0) Utilities.ShowElement(whatIsTakingUpSpace);
                else Utilities.HideElement(whatIsTakingUpSpace);
            });
    });
}