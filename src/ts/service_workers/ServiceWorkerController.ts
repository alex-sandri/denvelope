import { ShowElements, HideElements } from "../scripts/Utilities";
import * as genericMessage from "../scripts/generic-message";
import Translation from "../scripts/Translation";

export class ServiceWorkerController
{
	private static readonly analytics : any = (<any>window).firebase.analytics();

	constructor()
	{
		if (this.IsSupported()) this.Register();
	}

	IsSupported = () : boolean => "serviceWorker" in navigator;

	Register = () : void =>
	{
		window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").then(reg =>
		{
			if (!navigator.serviceWorker.controller) return;

			if (reg.waiting)
			{
				this.UpdateReady(reg.waiting);

				return;
			}

			if (reg.installing)
			{
				this.TrackInstalling(reg.installing);

				return;
			}

			reg.addEventListener("updatefound", () => this.TrackInstalling(reg.installing));
		}));

		// Ensure refresh is only called once.
		// This works around a bug in "force update on reload".
		let refreshing : boolean;

		navigator.serviceWorker.addEventListener("controllerchange", () =>
		{
			if (refreshing) return;

			window.location.reload();

			refreshing = true;
		});

		let deferredPrompt : any;

		const installPwaButton : HTMLButtonElement = document.querySelector(".install-pwa");
		const installPwaHr : HTMLHRElement = document.querySelector(".install-pwa + hr");

		window.addEventListener("beforeinstallprompt", e =>
		{
			e.preventDefault();

			deferredPrompt = e;

			ShowElements([
				installPwaButton,
				installPwaHr,
			], "block");
		});

		window.addEventListener("appinstalled", () => ServiceWorkerController.analytics.logEvent("install"));

		installPwaButton.addEventListener("click", () =>
		{
			deferredPrompt.prompt();

			deferredPrompt.userChoice.then((choiceResult : any) =>
			{
				if (choiceResult.outcome === "accepted") HideElements([
					installPwaButton,
					installPwaHr,
				]);

				deferredPrompt = null;
			});
		});
	}

	TrackInstalling = (sw : ServiceWorker) : void =>
		sw.addEventListener("statechange", () =>
		{
			if (sw.state === "installed") this.UpdateReady(sw);
		});

	UpdateReady = (sw : ServiceWorker) : void =>
		void genericMessage.Show(Translation.Get("pwa->update_available"), Translation.Get("generic->update"), -1).then(() =>
		{
			genericMessage.ShowSpinner();

			ServiceWorkerController.analytics.logEvent("update");

			(<any>window).firebase.firestore().terminate();

			sw.postMessage({ action: "skipWaiting" });
		});
}