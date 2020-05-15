!function(e){var t={};function a(o){if(t[o])return t[o].exports;var i=t[o]={i:o,l:!1,exports:{}};return e[o].call(i.exports,i,i.exports,a),i.l=!0,i.exports}a.m=e,a.c=t,a.d=function(e,t,o){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(a.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)a.d(o,i,function(t){return e[t]}.bind(null,i));return o},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="",a(a.s=8)}([function(e,t,a){"use strict";a.d(t,"a",(function(){return o}));class o{}o.ShowElement=(e,t)=>{e.style.display=null!=t?t:"block"},o.ShowElements=(e,t)=>e.forEach(e=>o.ShowElement(e,t)),o.HideElement=e=>{e.style.display="none"},o.HideElements=e=>e.forEach(e=>o.HideElement(e)),o.RemoveAllElements=e=>document.querySelectorAll(e).forEach(e=>e.remove()),o.AddClass=(e,t)=>e.classList.add(t),o.AddClasses=(e,t)=>t.filter(e=>e.length>0).forEach(t=>o.AddClass(e,t)),o.RemoveClass=(e,t)=>e.classList.remove(t),o.HasClass=(e,t)=>e.classList.contains(t),o.IsSet=e=>null!=e,o.PreventDragEvents=()=>{document.addEventListener("drag",e=>e.preventDefault()),document.addEventListener("dragend",e=>e.preventDefault()),document.addEventListener("dragenter",e=>e.preventDefault()),document.addEventListener("dragexit",e=>e.preventDefault()),document.addEventListener("dragleave",e=>e.preventDefault()),document.addEventListener("dragover",e=>e.preventDefault()),document.addEventListener("dragstart",e=>e.preventDefault()),document.addEventListener("drop",e=>e.preventDefault())},o.SetCookie=(e,t,a)=>{const o=new Date;o.setTime(o.getTime()+30*a*24*60*60*1e3),document.cookie=`${e}=${t};expires=${o.toUTCString()};path=/`},o.GetCookie=e=>document.cookie.substr(document.cookie.indexOf(e)).substr(e.length+1).split(";")[0]||null,o.DeleteCookie=e=>o.SetCookie(e,null,-1),o.IsSetCookie=e=>document.cookie.indexOf(e+"=")>-1,o.DispatchEvent=e=>window.dispatchEvent(new Event(e)),o.FormatStorage=e=>{let t="";for(var a=0;e>=1e3;a++)e/=1e3;switch(a){case 0:t="B";break;case 1:t="KB";break;case 2:t="MB";break;case 3:t="GB";break;case 4:t="TB";break;case 5:t="PB";break;case 6:t="EB";break;case 7:t="ZB";break;case 8:t="YB"}return+e.toFixed(2)+t},o.FormatDate=(e,t)=>new Date(e).toLocaleDateString(document.documentElement.lang,t||{year:"numeric",month:"2-digit",day:"2-digit",hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}),o.GetCurrentFolderId=e=>{let t=document.querySelector("input[name=folder-id]").value;return"trash"!==t&&"starred"!==t&&"shared"!==t&&"vault"!==t||o.IsSet(e)&&e||(t="root"),t},o.GetCurrentFolderIdAsync=async e=>new Promise(t=>{""!==o.GetCurrentFolderId(e).trim()&&t(o.GetCurrentFolderId(e)),document.querySelector("input[name=folder-id]").addEventListener("change",()=>t(o.GetCurrentFolderId(e)),{once:!0})}),o.SetCurrentFolderId=e=>{document.querySelector("input[name=folder-id]").value=e},o.GetFirestoreServerTimestamp=()=>window.firebase.firestore.FieldValue.serverTimestamp(),o.GetFirestoreUpdateTimestamp=()=>({updated:o.GetFirestoreServerTimestamp(),lastClientUpdateTime:new window.firebase.firestore.Timestamp.now}),o.IsTouchDevice=()=>"ontouchstart"in window,o.EscapeHtml=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/\'/g,"&#039;").replace(/\//g,"&#x2F;"),o.UnescapeHtml=e=>e.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&#x2F;/g,"/"),o.CamelCaseToKebabCase=e=>e.replace(/([a-zA-Z])(?=[A-Z])/g,"$1-").toLowerCase(),o.LogPageViewEvent=()=>window.firebase.analytics().logEvent("page_view",{page_location:location.href,page_path:location.pathname,page_title:document.title,offline:!navigator.onLine,isPwa:navigator.standalone||window.matchMedia("(display-mode: standalone)").matches}),o.ClearFirestoreCache=()=>indexedDB.deleteDatabase("firestore/[DEFAULT]/denvelope-firebase/main"),o.ClearCache=()=>{o.ClearFirestoreCache(),indexedDB.deleteDatabase("firebase-installations-database"),indexedDB.deleteDatabase("firebaseLocalStorageDb"),localStorage.clear()}},,function(e,t,a){"use strict";a.d(t,"a",(function(){return n}));var o=a(0),i=a(4);class n{static get CurrentUser(){return n.auth.currentUser}static get UserId(){return n.sharedContentUserId||n.CurrentUser.uid}}n.auth=window.firebase.auth(),n.analytics=window.firebase.analytics(),n.sharedContentUserId=null,n.IsAuthenticated=!1,n.IsSignedIn=!1,n.SignOut=()=>{n.auth.signOut(),o.a.ClearCache(),location.href="/"},n.DeleteUser=()=>{let e;switch(n.auth.currentUser.providerData[0].providerId){case window.firebase.auth.GoogleAuthProvider.PROVIDER_ID:e=new window.firebase.auth.GoogleAuthProvider}n.auth.signInWithPopup(e).then(e=>n.auth.currentUser.reauthenticateWithCredential(e.credential).then(()=>n.auth.currentUser.delete()))},n.Init=()=>{n.auth.app.options.authDomain="denvelope.com",n.auth.useDeviceLanguage(),n.auth.onAuthStateChanged(e=>n.AuthStateChanged(e))},n.RefreshToken=()=>n.auth.currentUser.getIdToken(!0),n.AuthStateChanged=async e=>{var t;null===(t=document.querySelector(".waiting-user"))||void 0===t||t.remove(),location.href.indexOf("/shared/")>-1&&(n.sharedContentUserId=location.href.split("/")[location.href.split("/").length-1],n.sharedContentUserId.indexOf("/")>-1&&n.sharedContentUserId.substr(0,n.sharedContentUserId.indexOf("/"))),e?(n.IsAuthenticated=null===n.sharedContentUserId||e.uid===n.sharedContentUserId,n.IsSignedIn=!0,i.f.innerText=e.email,i.h.forEach(e=>e.src="/assets/img/icons/user.svg"),e.displayName&&(i.g.innerText=e.displayName),e.photoURL&&await fetch(e.photoURL).then(()=>i.h.forEach(t=>t.src=e.photoURL)).catch(e=>e)):(n.IsAuthenticated=!1,n.IsSignedIn=!1,"/"!==location.pathname&&-1===location.href.indexOf("/shared/")&&!o.a.IsSet(document.documentElement.querySelector("main.error"))&&(location.pathname.indexOf("/account")>-1||location.pathname.indexOf("/settings")>-1)?location.href="/":(n.LoadFirebaseUi(),"/"!==location.pathname&&o.a.ShowElement(document.querySelector(".firebaseui-auth-container"),"flex"))),n.IsSignedIn?(o.a.RemoveClass(document.documentElement,"signed-out"),o.a.AddClass(document.documentElement,"signed-in")):(o.a.RemoveClass(document.documentElement,"signed-in"),o.a.AddClass(document.documentElement,"signed-out")),o.a.DispatchEvent("userready")},n.LoadFirebaseUi=()=>{const e=document.createElement("script");e.src=`https://www.gstatic.com/firebasejs/ui/4.5.0/firebase-ui-auth__${navigator.language.substr(0,2)}.js`,e.onload=()=>{const e={signInSuccessUrl:"/"===location.pathname?"account":"",callbacks:{signInSuccessWithAuthResult:e=>(n.analytics.setUserId(e.user.uid),n.analytics.logEvent(e.additionalUserInfo.isNewUser?"sign_up":"login",{method:e.additionalUserInfo.providerId}),!0)},signInOptions:[{provider:window.firebase.auth.GoogleAuthProvider.PROVIDER_ID,authMethod:"https://accounts.google.com",clientId:"1023448327269-h54u9u95f2cqs7m1bceqh9h0p1dskcmk.apps.googleusercontent.com"},window.firebase.auth.FacebookAuthProvider.PROVIDER_ID,window.firebase.auth.TwitterAuthProvider.PROVIDER_ID,window.firebase.auth.GithubAuthProvider.PROVIDER_ID,"yahoo.com","microsoft.com"],credentialHelper:window.firebaseui.auth.CredentialHelper.NONE,tosUrl:"terms",privacyPolicyUrl:()=>window.location.assign("privacy")},t=new window.firebaseui.auth.AuthUI(n.auth);t.disableAutoSignIn(),t.start(".firebaseui-auth-container",e)},document.body.append(e)}},function(e,t,a){"use strict";a.d(t,"a",(function(){return r}));var o=a(0);const i={accessibility:{keyboard_shortcuts:"Keyboard shortcuts",view_account_content:"View account content",view_shared_content:"View shared content",view_starred_content:"View starred content",view_trash:"View trash",close_modal:"Close modal",delete_selected_content:"Delete selected content",open_close_account_menu:"Open / Close account menu",download_current_folder:"Download current folder"},account:{title:"Your Account",icons8_message:"Some folder and file icons are provided by",add_files:"Add files",add_folder:"Add folder",create_file:"Create file",create_folder:"Create folder",shared:"Shared",starred:"Starred",recents:"Recents",trash:"Trash",empty_trash:"Empty trash",create_vault:"Create vault",display_image:"Display image",display_pdf:"Display PDF",validate_xml:"Validate XML",validate_json:"Validate JSON",image_address:"Image address",what_is_taking_up_space:"What's taking up space?",upgrade_plan:"Upgrade",context_menu:{move:{impossible:"Impossible to move this item, there are no folders to move this into"}}},api:{messages:{file:{deleted:"File deleted permanently",restored:"File restored successfully",moved_to_trash:"File moved to trash",downloading:"Downloading"},folder:{deleted:"Folder deleted permanently",restored:"Folder restored successfully",moved_to_trash:"Folder moved to trash",empty:"This folder is empty",no_search_results:"There are no elements matching this",compressing:"Creating compressed folder",choose_download_format:"Choose download format",offline:"You are currently offline",vault_empty:"The vault is empty",no_recents:"There are no recent files"},user:{not_enough_storage:"You do not have enough storage space for this file"},vault:{set_pin:"Set PIN",unlock:"Unlock vault",wrong_pin:"The entered PIN is wrong"}},languages:{cloud_firestore_indexes:"Cloud Firestore Indexes",cloud_firestore_security_rules:"Cloud Firestore Security Rules",document:"Document",file:"File",folder:"Folder",image:"Image"}},cookie_banner:{text:"We use cookies so that Denvelope works for you. By using our website, you agree with our use of cookies.",learn_more:"Learn more"},cookies:{text:"Cookies are small data files sent to your browser when you visit a site. We use both our own cookies, as well as third-party cookies, to do a few different things",why:{access_services:"Log you in to our services",remember_settings:"Remember preferences and settings",secure_account:"Keep your account secure",improve_services:"Better understand how people are using our services and how we can improve"},opt_out:{title:"Opt-Out",text:"You can set your browser to not accept cookies, but this may limit your ability to use the Services."}},errors:{empty:"This field cannot be empty",offline:"You are offline. To complete this action you need an Internet connection",user_content:{already_exists:"An element with this name already exists"},vault_pin_too_short:"The vault PIN must be at least 4 characters long",invalid_url:"The entered URL is invalid",url_must_be_https:"The URL must use HTTPS"},generic:{contact_us:"Contact Us",cookies:"Cookies",privacy:"Privacy",terms:"Terms",view:"View",save:"Save",save_to_my_account:"Save to my account",share:"Share",sharing_options:"Sharing options",copy_shareable_link:"Copy shareable link",unshare:"Unshare",move:"Move",add_to_favourites:"Add to Favourites",remove_from_favourites:"Remove from Favourites",rename:"Rename",edit:"Edit",info:"Info",download:"Download",restore:"Restore",delete:"Delete",close:"Close",back:"Back",settings:"Settings",sign_out:"Sign Out",load_more:"Load more",search:"Search",username:"Username",email:"Email",password:"Password",language:"Language",current:"Current",confirm:"Confirm",update:"Update",terms_of_service:"Terms of Service",privacy_policy:"Privacy Policy",cookie_policy:"Cookie Policy",version:"Version",account:"Account",name:"Name",folder:"Folder",folders:"Folders",file:"File",files:"Files",install:"Install",id:"ID",created:"Created",last_modified:"Last modified",type:"Type",size:"Size",shared:"Shared",starred:"Starred",position:"Position",keyboard_shortcut:"Keyboard shortcut",accessibility:"Accessibility",are_you_sure:"Are you sure?",vault:"Vault",lock:"Lock",unlock:"Unlock",no_errors_found:"No errors found",reset:"Reset",sign_in:"Sign In",example:"Example",reference:"Reference",default:"Default",yes:"Yes",no:"No",month:"Month",from:"From",to:"To"},header:{storage:{of:"of",used:"used"}},home:{title:"Denvelope",description:"Denvelope lets you store, edit and share your code in a simple, fast and reliable way",hero:{heading:"Say hello to your code's next home",subheading:"Denvelope is the perfect place to store, edit and share your code in a simple, fast and reliable way"},feature_section:{open_source:{title:"We are Open Source",description:"Denvelope is a non-commercial and Open Source project, for this reason we only provide you with 100MB of non-upgradable storage. If you need more storage space you can clone Denvelope and host it on Firebase."},store:{title:"Never lose your code again",description:"With Denvelope you can now store your code in a secure place. Never worry again about losing your projects."},view_edit:{title:"Access and edit your code from wherever you are",description:"Denvelope lets you view and edit your code from any device with the built-in code editor."},share:{title:"Need to share a piece of code or an entire project?",description:"With Denvelope you can just click a button and the link to that file or project is copied and ready to be shared. You can even hide files or folders inside a project if you don't want to share them but still want to share it."},vault:{title:"Vault",description:"Denvelope has a vault where you can store extremely important files."},pwa:{title:"Progressive Web App",description:"Denvelope is a PWA, this means you can install it basically everywhere. This has the advantage of the very small install size."}}},page_not_found:{title:"Page Not Found",description:"The specified file was not found on this website. Please check the URL for mistakes and try again."},pwa:{update_available:"Update available"},settings:{general:{title:"General",background:"Background",date_format:"Date format"},plan:{title:"Plan",change_plan:{title:"Change plan",change:"Change"},delete_plan:"Delete plan",payment_method:"Payment method",next_renewal:"Next renewal",no_payment_method:"You haven't added any payment method",currency:"USD",plans:{free:{name:"Free",price:{month:"0"}},premium:{name:"Premium",price:{month:"10"}}}},security:{title:"Security",sign_out_from_all_devices:"Sign Out from all devices",change_vault_pin:{title:"Change vault PIN",current:"Current PIN",new:"New PIN"},delete_vault:"Delete vault"},advanced:{title:"Advanced",delete_account:"Delete account",cache_size:"Cache size"},privacy:{title:"Privacy",clear_cache:{title:"Clear cache",clear:"Clear"}},info:{title:"Info"},changes_will_be_applied_at_the_next_page_load:"Changes will be applied at the next page load"},share:{check_out:"Check out",on_denvelope:"on Denvelope"},vault:{info:"If you delete an element inside the vault it will be deleted immediately, you won't be able to restore it."}},n={accessibility:{keyboard_shortcuts:"Scorciatoie da tastiera",view_account_content:"Vedi contenuti account",view_shared_content:"Vedi contenuti condivisi",view_starred_content:"Vedi contenuti preferiti",view_trash:"Vedi cestino",close_modal:"Chiudi modale",delete_selected_content:"Elimina contenuti selezionati",open_close_account_menu:"Apri / Chiudi menu account",download_current_folder:"Scarica cartella attuale"},account:{title:"Il tuo account",icons8_message:"Alcune icone di cartelle e file sono fornite da",add_files:"Aggiungi file",add_folder:"Aggiungi cartella",create_file:"Crea file",create_folder:"Crea cartella",shared:"Condivisi",starred:"Preferiti",recents:"Recenti",trash:"Cestino",empty_trash:"Svuota cestino",create_vault:"Crea cassaforte",display_image:"Mostra immagine",display_pdf:"Mostra PDF",validate_xml:"Valida XML",validate_json:"Valida JSON",image_address:"Indirizzo dell'immagine",what_is_taking_up_space:"Cosa occupa spazio?",upgrade_plan:"Effettua l'upgrade",context_menu:{move:{impossible:"Impossibile spostare questo elemento, non ci sono cartelle in cui spostarlo"}}},api:{messages:{file:{deleted:"File eliminato permanentemente",restored:"File ripristinato con successo",moved_to_trash:"File spostato nel cestino",downloading:"Scaricando"},folder:{deleted:"Cartella eliminata permanentemente",restored:"Cartella ripristinata con successo",moved_to_trash:"Cartella spostata nel cestino",empty:"Questa cartella è vuota",no_search_results:"Non ci sono elementi corrispondenti a questo",compressing:"Creando cartella compressa",choose_download_format:"Scegli formato download",offline:"Sei attualmente offline",vault_empty:"La cassaforte è vuota",no_recents:"Non ci sono file recenti"},user:{not_enough_storage:"Non hai spazio di archiviazione sufficiente per questo file"},vault:{set_pin:"Imposta PIN",unlock:"Sblocca cassaforte",wrong_pin:"Il PIN inserito non è corretto"}},languages:{cloud_firestore_indexes:"Indici di Cloud Firestore",cloud_firestore_security_rules:"Regole di Sicurezza di Cloud Firestore",document:"Documento",file:"File",folder:"Cartella",image:"Immagine"}},cookie_banner:{text:"Usiamo i cookie per rendere possibile il corretto funzionamento di Denvelope per te. Utilizzando il nostro sito, accetti le nostre modalità di utilizzo dei cookie.",learn_more:"Ulteriori informazioni"},cookies:{text:"I cookie sono piccoli file di dati inviati al tuo browser quando visiti un sito. Utilizziamo sia i nostri cookie che quelli di terze parti per varie finalità",why:{access_services:"Farti accedere ai nostri servizi",remember_settings:"Ricordare preferenze e impostazioni",secure_account:"Mantenere al sicuro il tuo account",improve_services:"Capire meglio in che modo gli utenti utilizzano i nostri servizi e migliorarli"},opt_out:{title:"Disattivazione",text:"Puoi impostare il tuo browser in modo che non accetti i cookie, ma ciò potrebbe limitare la possibilità di utilizzare i nostri Servizi."}},errors:{empty:"Questo campo non può essere vuoto",offline:"Sei offline. Per completare questa azione devi disporre di una connessione ad Internet",user_content:{already_exists:"Un elemento con questo nome esiste già"},vault_pin_too_short:"Il PIN della cassaforte deve avere almeno 4 caratteri",invalid_url:"L'URL inserito non è valido",url_must_be_https:"L'URL deve usare HTTPS"},generic:{contact_us:"Contattaci",cookies:"Cookie",privacy:"Privacy",terms:"Termini",view:"Vedi",save:"Salva",save_to_my_account:"Salva nel mio account",share:"Condividi",sharing_options:"Opzioni di condivisione",copy_shareable_link:"Copia link condivisibile",unshare:"Rimuovi condivisione",move:"Sposta",add_to_favourites:"Aggiungi ai Preferiti",remove_from_favourites:"Rimuovi dai Preferiti",rename:"Rinomina",edit:"Modifica",info:"Informazioni",download:"Scarica",restore:"Ripristina",delete:"Elimina",close:"Chiudi",back:"Indietro",settings:"Impostazioni",sign_out:"Esci",load_more:"Carica di più",search:"Cerca",username:"Nome utente",email:"Email",password:"Password",language:"Lingua",current:"Attuale",confirm:"Conferma",update:"Aggiorna",terms_of_service:"Termini di Servizio",privacy_policy:"Norme sulla Privacy",cookie_policy:"Norme sui Cookie",version:"Versione",account:"Account",name:"Nome",folder:"Cartella",folders:"Cartelle",file:"File",files:"File",install:"Installa",id:"ID",created:"Creato",last_modified:"Ultima modifica",type:"Tipo",size:"Dimensioni",shared:"Condiviso",starred:"Preferito",position:"Posizione",keyboard_shortcut:"Scorciatoia da tastiera",accessibility:"Accessibilità",are_you_sure:"Sei sicuro?",vault:"Cassaforte",lock:"Blocca",unlock:"Sblocca",no_errors_found:"Non sono stati trovati errori",reset:"Ripristina",sign_in:"Accedi",example:"Esempio",reference:"Riferimento",default:"Predefinito",yes:"Sì",no:"No",month:"Mese",from:"Da",to:"A"},header:{storage:{of:"di",used:"in uso"}},home:{title:"Denvelope",description:"Denvelope ti permette di salvare, modificare e condividere il tuo codice in modo semplice, veloce e affidabile",hero:{heading:"Saluta la nuova casa del tuo codice",subheading:"Denvelope è il posto perfetto per salvare, modificare e condividere il tuo codice in modo semplice, veloce e affidabile"},feature_section:{open_source:{title:"Noi siamo Open Source",description:"Denvelope è un progetto Open Source e non commerciale, per questo motivo possiamo offrirti solo 100MB di spazio di archiviazione non aumentabile. Se necessiti di più spazio di archiviazione puoi clonare Denvelope e hostarlo su Firebase."},store:{title:"Non perdere più il tuo codice",description:"Con Denvelope puoi ora salvare il tuo codice in un posto sicuro. Non dovrai più preoccuparti di perdere i tuoi file o progetti."},view_edit:{title:"Visualizza e modifica il tuo codice da dovunque tu sia",description:"Denvelope ti permette di vedere e modificare il tuo codice da qualunque dispositivo con l'editor integrato."},share:{title:"Hai bisogno di condividere un pezzo di codice o un intero progetto?",description:"Con Denvelope puoi semplicemente cliccare un bottone e il link a quel file o progetto è copiato e pronto per essere condiviso. Puoi inoltre nascondere file o cartelle all'interno di un progetto se non vuoi che siano visibili ma vuoi comunque condividerlo."},vault:{title:"Cassaforte",description:"Denvelope dispone di una cassaforte, il posto perfetto per archiviare file di estrema importanza."},pwa:{title:"Progressive Web App",description:"Denvelope è una PWA, il che vuol dire che puoi installarlo praticamente ovunque. Questo ha il vantaggio delle piccolissime dimensioni di installazione."}}},page_not_found:{title:"Pagina Non Trovata",description:"Il file specificato non è stato trovato in questo sito. Controlla l'URL per eventuali errori e riprova."},pwa:{update_available:"Aggiornamento disponibile"},settings:{general:{title:"Generali",background:"Sfondo",date_format:"Formato della data"},plan:{title:"Piano",change_plan:{title:"Cambia piano",change:"Cambia"},delete_plan:"Cancella piano",payment_method:"Metodo di pagamento",next_renewal:"Prossimo rinnovo",no_payment_method:"Non hai aggiunto nessun metodo di pagamento",currency:"EUR",plans:{free:{name:"Gratuito",price:{month:"0"}},premium:{name:"Premium",price:{month:"10"}}}},security:{title:"Sicurezza",sign_out_from_all_devices:"Esci da tutti i dispositivi",change_vault_pin:{title:"Cambia PIN cassaforte",current:"PIN attuale",new:"Nuovo PIN"},delete_vault:"Elimina cassaforte"},advanced:{title:"Avanzate",delete_account:"Elimina account",cache_size:"Dimensioni cache"},privacy:{title:"Privacy",clear_cache:{title:"Svuota cache",clear:"Svuota"}},info:{title:"Informazioni"},changes_will_be_applied_at_the_next_page_load:"Le modifiche saranno applicate al prossimo caricamento di pagina"},share:{check_out:"Guarda",on_denvelope:"su Denvelope"},vault:{info:"Se elimini un elemento all'interno della cassaforte questo sarà eliminato immediatamente, e non potrà più essere recuperato."}};class r{static get Language(){return r.language}}r.Init=(e,t)=>{var a;o.a.IsSet(e)||(e=document),o.a.IsSet(t)||(t=null!==(a=localStorage.getItem("lang"))&&void 0!==a?a:navigator.language),localStorage.setItem("lang",t),document.documentElement.lang=r.language=t;const i=Array.from(new Set(Array.from(e.querySelectorAll("*")).filter(e=>e.hasAttribute("data-translation")||e.hasAttribute("data-placeholder-translation")||e.hasAttribute("data-content-translation")||e.hasAttribute("data-aria-label-translation")||e.hasAttribute("data-start-translation")||e.hasAttribute("data-only-translation")).map(e=>e.getAttribute("data-translation")||e.getAttribute("data-placeholder-translation")||e.getAttribute("data-content-translation")||e.getAttribute("data-aria-label-translation")||e.getAttribute("data-start-translation")||e.getAttribute("data-only-translation"))));e.querySelectorAll("[data-use=translation]").forEach(e=>e.remove()),i.forEach(t=>e.querySelectorAll(`[data-translation="${t}"]`).forEach(e=>e.innerHTML+=` <span data-use="translation">${r.Get(t)}</span>`)),i.forEach(t=>e.querySelectorAll(`[data-placeholder-translation="${t}"]`).forEach(e=>e.placeholder=r.Get(t))),i.forEach(t=>e.querySelectorAll(`[data-content-translation="${t}"]`).forEach(e=>e.content=r.Get(t))),i.forEach(t=>e.querySelectorAll(`[data-aria-label-translation="${t}"]`).forEach(e=>e.setAttribute("aria-label",r.Get(t)))),i.forEach(t=>e.querySelectorAll(`[data-start-translation="${t}"]`).forEach(e=>e.innerHTML=`<span data-use="translation">${r.Get(t)}</span>`+e.innerHTML)),i.forEach(t=>e.querySelectorAll(`[data-only-translation="${t}"]`).forEach(e=>e.innerHTML=r.Get(t))),Array.from(e.querySelectorAll("*")).filter(e=>e.hasAttribute("data-keyboard-shortcut")).forEach(e=>e.title=`${r.Get("generic->keyboard_shortcut")}: ${e.getAttribute("data-keyboard-shortcut").toUpperCase()}`)},r.Get=e=>{const t=e.split("->");let a;switch(r.Language.toLowerCase()){case"it-it":case"it":a=n;break;default:a=i}for(let e=0;e<t.length-1;e++)a=a[t[e]];return a[t[t.length-1]]}},function(e,t,a){"use strict";a.d(t,"c",(function(){return i})),a.d(t,"b",(function(){return n})),a.d(t,"e",(function(){return l})),a.d(t,"i",(function(){return c})),a.d(t,"d",(function(){return d})),a.d(t,"h",(function(){return u})),a.d(t,"g",(function(){return m})),a.d(t,"f",(function(){return p})),a.d(t,"a",(function(){return h}));var o=a(0);const i=document.querySelector("header"),n=i.querySelector(".menu-toggle button"),r=document.querySelector(".menu-container"),s=r.querySelector(".menu"),l=s.querySelector(".upgrade-plan"),c=s.querySelector(".storage-info"),d=s.querySelector(".sign-out"),u=document.querySelectorAll("[data-update-field=photo]"),m=document.querySelector("[data-update-field=name]"),p=document.querySelector("[data-update-field=email]"),h=()=>o.a.HideElement(r);n.addEventListener("click",()=>"flex"===r.style.display?h():o.a.ShowElement(r,"flex")),document.addEventListener("click",e=>{s.contains(e.target)||n.contains(e.target)||h()})},,function(e,t,a){"use strict";a.d(t,"a",(function(){return c})),a.d(t,"b",(function(){return d}));var o=a(0);const i=document.querySelector(".generic-message"),n=i.querySelector("p"),r=i.querySelector(".action"),s=i.querySelector(".dismiss");let l;const c=(e,t,a=2e3)=>new Promise((c,d)=>{n.innerText=e,o.a.IsSet(t)?(r.innerText=t,o.a.ShowElement(r,"block")):o.a.HideElement(r),o.a.ShowElement(i,"flex"),a>=0&&(l=setTimeout(u,a)),s.addEventListener("click",()=>{clearTimeout(l),u()}),r.addEventListener("click",()=>{c(),clearTimeout(l),u()})}),d=()=>{c("",null,-1),o.a.HideElement(s),o.a.ShowElement(i.querySelector(".spinner"),"block")},u=()=>o.a.HideElement(i)},function(e,t,a){"use strict";a.d(t,"a",(function(){return c}));var o=a(0),i=a(2),n=a(4),r=a(6),s=a(3);class l{constructor(){this.IsSupported=()=>"serviceWorker"in navigator,this.Register=()=>{let e,t;window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").then(e=>{navigator.serviceWorker.controller&&(e.waiting?this.UpdateReady(e.waiting):e.installing?this.TrackInstalling(e.installing):e.addEventListener("updatefound",()=>this.TrackInstalling(e.installing)))})),navigator.serviceWorker.addEventListener("controllerchange",()=>{e||(window.location.reload(),e=!0)});const a=document.querySelector(".install-pwa"),i=document.querySelector(".install-pwa + hr");window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),t=e,o.a.ShowElements([a,i],"block")}),window.addEventListener("appinstalled",()=>l.analytics.logEvent("install")),a.addEventListener("click",()=>{t.prompt(),t.userChoice.then(e=>{"accepted"===e.outcome&&o.a.HideElements([a,i]),t=null})})},this.TrackInstalling=e=>e.addEventListener("statechange",()=>{"installed"===e.state&&this.UpdateReady(e)}),this.UpdateReady=e=>{r.a(s.a.Get("pwa->update_available"),s.a.Get("generic->update"),-1).then(()=>{r.b(),l.analytics.logEvent("update"),window.firebase.firestore().terminate(),e.postMessage({action:"skipWaiting"})})},this.IsSupported()&&this.Register()}}l.analytics=window.firebase.analytics();const c=()=>{const e=window.firebase.firestore(),t=parseInt(localStorage.getItem("cache-size"));t&&e.settings({cacheSizeBytes:t}),e.enablePersistence({synchronizeTabs:!0}),i.a.Init(),s.a.Init(),o.a.LogPageViewEvent();const a=document.querySelector(".cookie-banner");new l,localStorage.getItem("cookie-consent")||(o.a.ShowElement(a,"flex"),a.querySelector("i:last-child").addEventListener("click",()=>o.a.HideElement(document.querySelector(".cookie-banner")))),localStorage.setItem("cookie-consent","true"),o.a.PreventDragEvents(),document.addEventListener("contextmenu",e=>{null===e.target.closest(".allow-context-menu")&&e.preventDefault()}),n.d.addEventListener("click",()=>i.a.SignOut()),window.addEventListener("load",()=>o.a.RemoveClass(document.body,"preload")),window.addEventListener("keydown",e=>{if(["input","textarea"].includes(document.activeElement.tagName.toLowerCase()))return;const t=e.key.toLowerCase();["m","a","e","h","s"].includes(t)&&e.preventDefault(),"m"===t?n.b.click():"a"===t?location.href="/account":"e"===t?n.d.click():"h"===t?location.href="/":"s"!==t||e.ctrlKey||(location.href="/settings")}),window.addEventListener("userready",()=>{i.a.IsAuthenticated&&e.collection("users").doc(i.a.UserId).onSnapshot(e=>{if(!e.exists)return;const t=e.data().usedStorage,a=e.data().maxStorage,i=`${+(t/a*100).toFixed(2)}%`,r=document.querySelector("[data-update-field=used-storage]"),s=document.querySelector("[data-update-field=max-storage]");r.innerHTML=o.a.FormatStorage(t),r.setAttribute("data-bytes",t),s.innerHTML=o.a.FormatStorage(a),s.setAttribute("data-bytes",a),document.querySelector("[data-update-field=used-storage-percent]").innerHTML=`(${i})`,document.querySelector(".storage .used").style.width=i,t>0?o.a.ShowElement(n.i):o.a.HideElement(n.i),"free"===e.data().plan?o.a.ShowElement(n.e):o.a.HideElement(n.e)})})}},function(e,t,a){"use strict";a.r(t),a(7).a();const o=document.querySelector(".firebaseui-auth-container");document.querySelectorAll(".sign-in").forEach(e=>e.addEventListener("click",()=>{o.style.display="flex"})),o.addEventListener("click",e=>{const t=e.target;["button","a","p"].includes(t.tagName.toLowerCase())||(o.style.display="none")})}]);