import { Utilities } from "./Utilities";
import { userEmail, userName, userPhoto } from "./header";
import { Modal } from "./Modal";
import { Component } from "./Component";

export class Auth
{
    private static readonly auth = (<any>window).firebase.auth();
    private static readonly analytics = (<any>window).firebase.analytics();

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

        Utilities.ClearCache();

        location.href = "/";
    }

    public static DeleteUser = () : void =>
    {
        let provider;

        switch (Auth.auth.currentUser.providerData[0].providerId)
        {
            case (<any>window).firebase.auth.GoogleAuthProvider.PROVIDER_ID:
                provider = new (<any>window).firebase.auth.GoogleAuthProvider();
            break;
        }

        Auth.auth.signInWithPopup(provider)
            .then((result : any) => Auth.auth.currentUser.reauthenticateWithCredential(result.credential)
            .then(() => Auth.auth.currentUser.delete()));
    }

    public static Init = () : void =>
    {
        Auth.auth.app.options.authDomain = "denvelope.com";

        Auth.auth.useDeviceLanguage();

        Auth.auth.onAuthStateChanged((user : any) => Auth.AuthStateChanged(user));
    }

    public static RefreshToken = () : void => Auth.auth.currentUser.getIdToken(true);

    public static get CurrentUser () : any { return Auth.auth.currentUser; }
    
    public static get UserId () : string { return Auth.sharedContentUserId || Auth.CurrentUser.uid; }

    private static AuthStateChanged = async (user : any) : Promise<void> =>
    {
        document.querySelector(".waiting-user")?.remove();
        
        if (location.href.indexOf("/shared/") > -1)
        {
            Auth.sharedContentUserId = location.href.split("/")[location.href.split("/").length - 1];

            if (Auth.sharedContentUserId.indexOf("/") > -1) Auth.sharedContentUserId.substr(0, Auth.sharedContentUserId.indexOf("/"));
        }

        if (user)
        {
            Auth.IsAuthenticated = Auth.sharedContentUserId === null || user.uid === Auth.sharedContentUserId;
            Auth.IsSignedIn = true;

            userEmail.innerText = user.email;

            userPhoto.forEach(element => element.src = "/assets/img/icons/user.svg");

            if (user.displayName) userName.innerText = user.displayName;

            if (user.photoURL) await fetch(user.photoURL).then(() => userPhoto.forEach(element => element.src = user.photoURL)).catch(err => err);
        }
        else
        {
            Auth.IsAuthenticated = false;
            Auth.IsSignedIn = false;

            // Do not redirect if the user is alrady on the home page or is on a shared content page or one the 404 page
            if (location.pathname !== "/" && location.href.indexOf("/shared/") === -1 && !Utilities.IsSet(document.documentElement.querySelector("main.error")) &&
                (location.pathname.indexOf("/account") > -1 || location.pathname.indexOf("/settings") > -1)) location.href = "/";
            else
            {
                Auth.LoadFirebaseUi();

                if (location.pathname !== "/") Utilities.ShowElement(document.querySelector(".firebaseui-auth-container"), "flex");
            }
        }

        if (Auth.IsSignedIn)
        {
            Utilities.RemoveClass(document.documentElement, "signed-out");
            Utilities.AddClass(document.documentElement, "signed-in");
        }
        else
        {
            Utilities.RemoveClass(document.documentElement, "signed-in");
            Utilities.AddClass(document.documentElement, "signed-out");
        }

        Utilities.DispatchEvent("userready");
    }

    private static LoadFirebaseUi = () =>
    {
        const script = document.createElement("script");

        script.src = `https://www.gstatic.com/firebasejs/ui/4.5.0/firebase-ui-auth__${navigator.language.substr(0, 2)}.js`;
                
        script.onload = () => {
            const uiConfig = {
                signInSuccessUrl: location.pathname === "/" ? "account" : "",
                callbacks: {
                    signInSuccessWithAuthResult: (authResult : any) =>
                    {
                        Auth.analytics.setUserId(authResult.user.uid);

                        Auth.analytics.logEvent(authResult.additionalUserInfo.isNewUser ? "sign_up" : "login", {
                            method: authResult.additionalUserInfo.providerId
                        });

                        return true; // Redirect the user
                    }
                },
                signInOptions: [
                    {
                        provider: (<any>window).firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                        authMethod: "https://accounts.google.com",
                        clientId: "1023448327269-h54u9u95f2cqs7m1bceqh9h0p1dskcmk.apps.googleusercontent.com",
                    },
                    (<any>window).firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                    (<any>window).firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                    (<any>window).firebase.auth.GithubAuthProvider.PROVIDER_ID,
                    "yahoo.com",
                    "microsoft.com",
                    //"apple.com",
                ],
                credentialHelper: (<any>window).firebaseui.auth.CredentialHelper.NONE,
                tosUrl: "terms",
                privacyPolicyUrl: () => window.location.assign("privacy")
            }

            const ui = new (<any>window).firebaseui.auth.AuthUI(Auth.auth);
    
            ui.disableAutoSignIn();

            ui.start(".firebaseui-auth-container", uiConfig);
        }
    
        document.body.append(script);
    }
}