export {};

import * as loadEvents from "./scripts/load-events";

loadEvents.Init();

const firebaseUiAuthContainer : HTMLElement = document.querySelector(".firebaseui-auth-container");

document.querySelectorAll(".sign-in").forEach(element => element.addEventListener("click", () =>
{
    firebaseUiAuthContainer.style.display = "flex";

    document.body.classList.add("no-overflow");
}));

firebaseUiAuthContainer.addEventListener("click", e =>
{
    const target = <HTMLElement>e.target;

    if (![ "button", "a", "p" ].includes(target.tagName.toLowerCase()))
    {
        firebaseUiAuthContainer.style.display = "none";

        document.body.classList.remove("no-overflow");
    }
});