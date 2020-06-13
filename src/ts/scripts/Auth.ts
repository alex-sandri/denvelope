import type {
	analytics as firebaseAnalytics,
	auth as firebaseAuth,
	User as firebaseUser,
} from "firebase";

import {
	ClearCache, RemoveClass, AddClass, DispatchEvent, IsSet,
} from "./Utilities";
import { userEmail, userName, userPhoto } from "./header";
import Translation from "./Translation";

declare const firebase: any;
declare const firebaseui: any;

export default class Auth
{
	private static readonly auth: firebaseAuth.Auth = firebase.auth();

	private static readonly analytics: firebaseAnalytics.Analytics = firebase.analytics();

	private static sharedContentUserId : string = null;

	/**
	 * @public
	 * @property Whether the user is signed in and is the content owner
	 */
	public static IsAuthenticated : boolean = false;

	/**
	 * @public
	 * @property Whether a user is signed in
	 */
	public static IsSignedIn : boolean = false;

	public static SignOut = () : void =>
	{
		Auth.auth.signOut();

		ClearCache();

		location.href = "/";
	}

	public static DeleteUser = () : void =>
	{
		let provider;

		switch (Auth.auth.currentUser.providerData[0].providerId)
		{
			case firebase.auth.GoogleAuthProvider.PROVIDER_ID:
				provider = new firebase.auth.GoogleAuthProvider();
				break;
			case firebase.auth.FacebookAuthProvider.PROVIDER_ID:
				provider = new firebase.auth.FacebookAuthProvider();
				break;
			case firebase.auth.TwitterAuthProvider.PROVIDER_ID:
				provider = new firebase.auth.TwitterAuthProvider();
				break;
			case firebase.auth.GithubAuthProvider.PROVIDER_ID:
				provider = new firebase.auth.GithubAuthProvider();
				break;
			case "yahoo.com":
				provider = new firebase.auth.OAuthProvider("yahoo.com");
				break;
			case "microsoft.com":
				provider = new firebase.auth.OAuthProvider("microsoft.com");
				break;
		}

		Auth.auth.signInWithPopup(provider)
			.then(result => Auth.auth.currentUser.reauthenticateWithCredential(result.credential)
				.then(() => Auth.auth.currentUser.delete()));
	}

	public static Init = () : void =>
	{
		(<any>Auth.auth.app.options).authDomain = "denvelope.com";

		Auth.auth.useDeviceLanguage();

		Auth.auth.onAuthStateChanged(user => Auth.AuthStateChanged(user));
	}

	public static RefreshToken = async () : Promise<void> => { await Auth.auth.currentUser.getIdToken(true); }

	public static get CurrentUser() : firebaseUser { return Auth.auth.currentUser; }

	public static get UserId() : string { return Auth.sharedContentUserId || Auth.CurrentUser.uid; }

	private static AuthStateChanged = async (user : firebaseUser) : Promise<void> =>
	{
		document.querySelector(".waiting-user")?.remove();

		if (location.href.indexOf("/shared/") > -1)
		{
			Auth.sharedContentUserId = location.href.split("/")[location.href.split("/").length - 1];

			if (Auth.sharedContentUserId.indexOf("/") > -1) Auth.sharedContentUserId.substr(0, Auth.sharedContentUserId.indexOf("/"));
		}

		if (user)
		{
			Auth.IsAuthenticated = Auth.sharedContentUserId === null
				|| user.uid === Auth.sharedContentUserId;

			Auth.IsSignedIn = true;

			userEmail.innerText = user.email;

			userPhoto.forEach(element => { element.src = "/assets/img/icons/user.svg"; });

			if (user.displayName) userName.innerText = user.displayName;

			if (user.photoURL) await fetch(user.photoURL)
				.then(() => userPhoto.forEach(element => { element.src = user.photoURL; }))
				.catch(err => err);
		}
		else
		{
			Auth.IsAuthenticated = false;
			Auth.IsSignedIn = false;

			// Do not redirect if the user is already on the home page
			// or if it is on a shared content page or one the 404 page
			if (location.pathname !== "/" && location.href.indexOf("/shared/") === -1 && !IsSet(document.documentElement.querySelector("main.error"))
				&& (location.pathname.indexOf("/account") > -1 || location.pathname.indexOf("/settings") > -1)) location.href = "/";
			else Auth.LoadFirebaseUi();
		}

		if (Auth.IsSignedIn)
		{
			RemoveClass(document.documentElement, "signed-out");
			AddClass(document.documentElement, "signed-in");
		}
		else
		{
			RemoveClass(document.documentElement, "signed-in");
			AddClass(document.documentElement, "signed-out");
		}

		DispatchEvent("userready");
	}

	private static LoadFirebaseUi = () =>
	{
		const script = document.createElement("script");

		script.src = `https://www.gstatic.com/firebasejs/ui/4.5.1/firebase-ui-auth__${Translation.Language.substr(0, 2)}.js`;

		script.onload = () =>
		{
			const uiConfig = {
				signInSuccessUrl: location.pathname === "/" ? "account" : "",
				callbacks: {
					signInSuccessWithAuthResult: (authResult : any) =>
					{
						Auth.analytics.setUserId(authResult.user.uid);

						Auth.analytics.logEvent(<never>(authResult.additionalUserInfo.isNewUser ? "sign_up" : "login"), {
							method: authResult.additionalUserInfo.providerId,
						});

						return true; // Redirect the user
					},
				},
				signInOptions: [
					{
						provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
						authMethod: "https://accounts.google.com",
						clientId: "1023448327269-h54u9u95f2cqs7m1bceqh9h0p1dskcmk.apps.googleusercontent.com",
					},
					firebase.auth.FacebookAuthProvider.PROVIDER_ID,
					firebase.auth.TwitterAuthProvider.PROVIDER_ID,
					firebase.auth.GithubAuthProvider.PROVIDER_ID,
					"yahoo.com",
					"microsoft.com",
					// "apple.com",
				],
				credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
				tosUrl: "terms",
				privacyPolicyUrl: () => window.location.assign("privacy"),
			};

			const ui = new firebaseui.auth.AuthUI(Auth.auth);

			ui.disableAutoSignIn();

			ui.start(".firebaseui-auth-container", uiConfig);
		};

		document.body.append(script);
	}
}