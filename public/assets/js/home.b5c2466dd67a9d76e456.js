!function(e){var t={};function o(n){if(t[n])return t[n].exports;var a=t[n]={i:n,l:!1,exports:{}};return e[n].call(a.exports,a,a.exports,o),a.l=!0,a.exports}o.m=e,o.c=t,o.d=function(e,t,n){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)o.d(n,a,function(t){return e[t]}.bind(null,a));return n},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="",o(o.s=8)}([function(e,t,o){"use strict";o.d(t,"a",(function(){return n}));class n{static FormatStorage(e){let t="";for(var o=0;e>=1e3;o++)e/=1e3;switch(o){case 0:t="B";break;case 1:t="KB";break;case 2:t="MB";break;case 3:t="GB";break;case 4:t="TB";break;case 5:t="PB";break;case 6:t="EB";break;case 7:t="ZB";break;case 8:t="YB"}return+e.toFixed(2)+t}}n.ShowElement=(e,t)=>{e.style.display=null!=t?t:"block"},n.ShowElements=(e,t)=>e.forEach(e=>n.ShowElement(e,t)),n.HideElement=e=>{e.style.display="none"},n.HideElements=e=>e.forEach(e=>n.HideElement(e)),n.RemoveAllElements=e=>document.querySelectorAll(e).forEach(e=>e.remove()),n.AddClass=(e,t)=>e.classList.add(t),n.AddClasses=(e,t)=>t.filter(e=>e.length>0).forEach(t=>n.AddClass(e,t)),n.RemoveClass=(e,t)=>e.classList.remove(t),n.RemoveAllClasses=(e,t={except:""})=>{const o=e.classList.length;let a=0;for(let i=0;i<o;i++)e.classList[i-a]!==t.except&&(n.RemoveClass(e,e.classList[i-a]),a++)},n.HasClass=(e,t)=>e.classList.contains(t),n.RemoveAllAttributes=(e,t={except:""})=>{const o=e.attributes.length;let n=0;for(let a=0;a<o;a++)e.attributes[a-n]!==t.except&&(e.removeAttribute(e.attributes[a-n].nodeValue),n++)},n.IsSet=e=>null!=e,n.PreventDragEvents=()=>{document.addEventListener("drag",e=>e.preventDefault()),document.addEventListener("dragend",e=>e.preventDefault()),document.addEventListener("dragenter",e=>e.preventDefault()),document.addEventListener("dragexit",e=>e.preventDefault()),document.addEventListener("dragleave",e=>e.preventDefault()),document.addEventListener("dragover",e=>e.preventDefault()),document.addEventListener("dragstart",e=>e.preventDefault()),document.addEventListener("drop",e=>e.preventDefault())},n.SetCookie=(e,t,o)=>{const n=new Date;n.setTime(n.getTime()+30*o*24*60*60*1e3),document.cookie=`${e}=${t};expires=${n.toUTCString()};path=/`},n.GetCookie=e=>document.cookie.substr(document.cookie.indexOf(e)).substr(e.length+1).split(";")[0]||null,n.DeleteCookie=e=>n.SetCookie(e,null,-1),n.IsSetCookie=e=>document.cookie.indexOf(e+"=")>-1,n.DispatchEvent=e=>window.dispatchEvent(new Event(e)),n.GetDateFromTimestamp=e=>{const t={weekday:void 0,year:"numeric",month:"2-digit",day:"2-digit",hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"};return new Date(e).toLocaleDateString(void 0,t)},n.GetCurrentFolderId=e=>{let t=document.querySelector("input[name=folder-id]").value;return"trash"!==t&&"starred"!==t&&"shared"!==t&&"vault"!==t||n.IsSet(e)&&e||(t="root"),t},n.GetCurrentFolderIdAsync=async e=>new Promise(t=>{""!==n.GetCurrentFolderId(e).trim()&&t(n.GetCurrentFolderId(e)),document.querySelector("input[name=folder-id]").addEventListener("change",()=>t(n.GetCurrentFolderId(e)),{once:!0})}),n.SetCurrentFolderId=e=>{document.querySelector("input[name=folder-id]").value=e},n.GetFirestoreServerTimestamp=()=>window.firebase.firestore.FieldValue.serverTimestamp(),n.GetFirestoreUpdateTimestamp=()=>({updated:n.GetFirestoreServerTimestamp(),lastClientUpdateTime:new window.firebase.firestore.Timestamp.now}),n.IsTouchDevice=()=>"ontouchstart"in window,n.EscapeHtml=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/\'/g,"&#039;").replace(/\//g,"&#x2F;"),n.UnescapeHtml=e=>e.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&#x2F;/g,"/"),n.CamelCaseToKebabCase=e=>e.replace(/([a-zA-Z])(?=[A-Z])/g,"$1-").toLowerCase(),n.LogPageViewEvent=()=>window.firebase.analytics().logEvent("page_view",{page_location:location.href,page_path:location.pathname,page_title:document.title,offline:!navigator.onLine,isPwa:navigator.standalone||window.matchMedia("(display-mode: standalone)").matches})},function(e,t,o){"use strict";o.d(t,"a",(function(){return a})),o.d(t,"b",(function(){return i})),o.d(t,"c",(function(){return r})),o.d(t,"d",(function(){return s}));var n=o(0);class a{constructor(e,t){if(this.type=e,this.options=t,this.element=document.createElement(e),n.a.IsSet(t)){if(t.hasOwnProperty("aria")&&(Array.from(Object.keys(t.aria)).forEach((e,o)=>this.element.setAttribute("aria-"+e,Object.values(t.aria)[o])),delete t.aria),t.hasOwnProperty("children")&&(t.children.forEach(e=>this.element.appendChild(e)),delete t.children),t.hasOwnProperty("data")&&(Array.from(Object.keys(t.data)).forEach((e,o)=>this.element.setAttribute("data-"+e,Object.values(t.data)[o])),delete t.data),t.hasOwnProperty("style")){const e={};if(Array.from(Object.keys(t.style)).filter(e=>![":hover",":focus"].includes(e)).forEach((o,n)=>this.element.style[o]=e[o]=Object.values(t.style)[n]),t.style.hasOwnProperty(":hover")){const o=t.style[":hover"];Array.from(Object.keys(o)).forEach((t,a)=>{this.element.addEventListener("mouseenter",()=>n.a.HasClass(this.element,"no-hover")?null:this.element.style[t]=Object.values(o)[a]),this.element.addEventListener("mouseleave",()=>this.element.style[t]=e[t]||"")})}delete t.style}t.hasOwnProperty("innerHTML")&&(this.element.innerHTML=t.innerHTML,delete t.innerHTML),t.hasOwnProperty("innerText")&&(this.element.innerText=t.innerText,delete t.innerText),Array.from(Object.keys(t)).forEach((e,o)=>this.element.setAttribute(e,Object.values(t)[o]))}}}class i extends a{constructor(e){super("div",{class:n.a.IsSet(e.class)?e.class:"input",children:[new a("input",{...e.attributes}).element,...e.children||[]]}),this.options=e}}class r extends i{constructor(e){var t;super({class:"input-with-icon",children:[new a("button",{type:"button",class:"input-icon",aria:{hidden:!0},tabindex:-1,children:[new a("i",{class:e.iconClassName}).element]}).element],attributes:e.attributes}),this.options=e,"password"===(null===(t=e.attributes)||void 0===t?void 0:t.type)&&this.element.querySelector(".input-icon").addEventListener("click",()=>{this.element.querySelector("input").type="password"===this.element.querySelector("input").type?"text":"password"})}}class s extends a{constructor(){super("span",{class:"spinner",children:[new a("i",{class:"fas fa-circle-notch fa-fw"}).element]})}}},function(e,t,o){"use strict";o.d(t,"a",(function(){return s}));var n=o(0),a=o(4),i=o(5),r=o(1);class s{static get UserId(){return s.sharedContentUserId||s.auth.currentUser.uid}}s.auth=window.firebase.auth(),s.analytics=window.firebase.analytics(),s.sharedContentUserId=null,s.IsAuthenticated=!1,s.IsSignedIn=!1,s.SignOut=()=>{s.auth.signOut(),window.firebase.firestore().clearPersistence(),location.href="/"},s.DeleteUser=()=>{let e;switch(s.auth.currentUser.providerData[0].providerId){case window.firebase.auth.GoogleAuthProvider.PROVIDER_ID:e=new window.firebase.auth.GoogleAuthProvider}s.auth.signInWithPopup(e).then(e=>s.auth.currentUser.reauthenticateWithCredential(e.credential).then(()=>s.auth.currentUser.delete()))},s.Init=()=>{s.auth.app.options.authDomain="denvelope.com",s.auth.useDeviceLanguage(),s.auth.onAuthStateChanged(e=>s.AuthStateChanged(e))},s.RefreshToken=()=>s.auth.currentUser.getIdToken(!0),s.AuthStateChanged=async e=>{var t;null===(t=document.querySelector(".waiting-user"))||void 0===t||t.remove(),location.href.indexOf("/shared/")>-1&&(s.sharedContentUserId=location.href.split("/")[location.href.split("/").length-1],s.sharedContentUserId.indexOf("/")>-1&&s.sharedContentUserId.substr(0,s.sharedContentUserId.indexOf("/"))),e?(s.IsAuthenticated=null===s.sharedContentUserId||e.uid===s.sharedContentUserId,s.IsSignedIn=!0,a.f.innerText=e.email,a.h.forEach(e=>e.src="/assets/img/icons/user.svg"),e.displayName&&(a.g.innerText=e.displayName),e.photoURL&&await fetch(e.photoURL).then(()=>a.h.forEach(t=>t.src=e.photoURL)).catch(e=>e)):(s.IsAuthenticated=!1,s.IsSignedIn=!1,"/"!==location.pathname&&-1===location.href.indexOf("/shared/")&&!n.a.IsSet(document.documentElement.querySelector("main.error"))&&(location.pathname.indexOf("/account")>-1||location.pathname.indexOf("/settings")>-1)?location.href="/":n.a.IsSet(document.querySelector(".firebaseui-auth-container"))?s.LoadFirebaseUi():s.ShowSignInModal()),s.IsSignedIn?(n.a.RemoveClass(document.documentElement,"logged-out"),n.a.AddClass(document.documentElement,"logged-in")):(n.a.RemoveClass(document.documentElement,"logged-in"),n.a.AddClass(document.documentElement,"logged-out")),n.a.DispatchEvent("userready")},s.ShowSignInModal=()=>{const e=new i.b({allow:["close"]});e.AppendContent([new r.a("div",{class:"firebaseui-auth-container"}).element]),s.LoadFirebaseUi(),e.Show(!0)},s.LoadFirebaseUi=()=>{const e=document.createElement("script");e.src=`https://www.gstatic.com/firebasejs/ui/4.5.0/firebase-ui-auth__${navigator.language.substr(0,2)}.js`,e.onload=()=>{const e={signInSuccessUrl:"/"===location.pathname?"account":"",callbacks:{signInSuccessWithAuthResult:e=>(s.analytics.setUserId(e.user.uid),s.analytics.logEvent(e.additionalUserInfo.isNewUser?"sign_up":"login",{method:e.additionalUserInfo.providerId}),!0)},signInOptions:[{provider:window.firebase.auth.GoogleAuthProvider.PROVIDER_ID,authMethod:"https://accounts.google.com",clientId:"1023448327269-h54u9u95f2cqs7m1bceqh9h0p1dskcmk.apps.googleusercontent.com"},window.firebase.auth.FacebookAuthProvider.PROVIDER_ID,window.firebase.auth.TwitterAuthProvider.PROVIDER_ID,window.firebase.auth.GithubAuthProvider.PROVIDER_ID,"yahoo.com","microsoft.com"],credentialHelper:window.firebaseui.auth.CredentialHelper.GOOGLE_YOLO,tosUrl:"terms",privacyPolicyUrl:()=>window.location.assign("privacy")},t=new window.firebaseui.auth.AuthUI(s.auth);t.disableAutoSignIn(),t.start(".firebaseui-auth-container",e)},document.body.append(e)}},function(e,t,o){"use strict";o.d(t,"a",(function(){return r}));var n=o(0);const a={accessibility:{keyboard_shortcuts:"Keyboard shortcuts",view_account_content:"View account content",view_shared_content:"View shared content",view_starred_content:"View starred content",view_trash:"View trash",close_modal:"Close modal",delete_selected_content:"Delete selected content",open_close_account_menu:"Open / Close account menu",download_current_folder:"Download current folder"},account:{title:"Your Account",icons8_message:"Some folder and file icons are provided by",add_files:"Add files",add_folder:"Add folder",create_file:"Create file",create_folder:"Create folder",shared:"Shared",starred:"Starred",trash:"Trash",empty_trash:"Empty trash",create_vault:"Create vault",display_image:"Display image",display_pdf:"Display PDF",change_background:"Change background",image_address:"Image address",context_menu:{move:{impossible:"Impossible to move this item, there are no folders to move this into"}}},api:{messages:{file:{deleted:"File deleted permanently",restored:"File restored successfully",moved_to_trash:"File moved to trash",downloading:"Downloading"},folder:{deleted:"Folder deleted permanently",restored:"Folder restored successfully",moved_to_trash:"Folder moved to trash",empty:"This folder is empty",no_search_results:"There are no elements matching this",compressing:"Creating compressed folder",choose_download_format:"Choose download format",offline:"You are currently offline",vault_empty:"The vault is empty"},user:{not_enough_storage:"You do not have enough storage space for this file"},vault:{set_pin:"Set PIN",unlock:"Unlock vault",wrong_pin:"The entered PIN is wrong"}},languages:{cloud_firestore_indexes:"Cloud Firestore Indexes",cloud_firestore_security_rules:"Cloud Firestore Security Rules",document:"Document",file:"File",folder:"Folder",image:"Image"}},cookie_banner:{text:"We use cookies so that Denvelope works for you. By using our website, you agree with our use of cookies.",learn_more:"Learn more"},cookies:{text:"Cookies are small data files sent to your browser when you visit a site. We use both our own cookies, as well as third-party cookies, to do a few different things",why:{access_services:"Log you in to our services",remember_settings:"Remember preferences and settings",secure_account:"Keep your account secure",improve_services:"Better understand how people are using our services and how we can improve"},opt_out:{title:"Opt-Out",text:"You can set your browser to not accept cookies, but this may limit your ability to use the Services."}},errors:{empty:"This field cannot be empty",offline:"You are offline. To complete this action you need an Internet connection",user_content:{already_exists:"An element with this name already exists"},vault_pin_too_short:"The vault PIN must be at least 4 characters long",invalid_url:"The entered URL is invalid",url_must_be_https:"The URL must use HTTPS"},generic:{contact_us:"Contact Us",cookies:"Cookies",privacy:"Privacy",terms:"Terms",view:"View",save:"Save",save_to_my_account:"Save to my account",share:"Share",sharing_options:"Sharing options",copy_shareable_link:"Copy shareable link",unshare:"Unshare",move:"Move",add_to_favourites:"Add to Favourites",remove_from_favourites:"Remove from Favourites",rename:"Rename",edit:"Edit",info:"Info",download:"Download",restore:"Restore",delete:"Delete",close:"Close",back:"Back",settings:"Settings",sign_out:"Sign Out",load_more:"Load more",search:"Search",username:"Username",email:"Email",password:"Password",language:"Language",confirm:"Confirm",update:"Update",terms_of_service:"Terms of Service",privacy_policy:"Privacy Policy",cookie_policy:"Cookie Policy",version:"Version",account:"Account",name:"Name",folder:"Folder",folders:"Folders",file:"File",files:"Files",install:"Install",in_short:"In short",the_team:"The Denvelope Team",id:"ID",created:"Created",last_modified:"Last modified",type:"Type",size:"Size",keyboard_shortcut:"Keyboard shortcut",accessibility:"Accessibility",are_you_sure:"Are you sure?",vault:"Vault",lock:"Lock",unlock:"Unlock"},header:{storage:{of:"of",used:"used"}},home:{title:"Denvelope",description:"Denvelope lets you store, edit and share your code in a simple, fast and reliable way",hero:{heading:"Say hello to your code's next home",subheading:"Denvelope is the perfect place to store, edit and share your code in a simple, fast and reliable way"},feature_section:{open_source:{title:"We are Open Source",description:"Denvelope is a non-commercial and Open Source project, for this reason we only provide you with 100MB of non-upgradable storage. If you need more storage space you can clone Denvelope and host it on Firebase."},store:{title:"Never lose your code again",description:"With Denvelope you can now store your code in a secure place. Never worry again about losing your projects."},view_edit:{title:"Access and edit your code from wherever you are",description:"Denvelope lets you view and edit your code from any device with the built-in code editor."},share:{title:"Need to share a piece of code or an entire project?",description:"With Denvelope you can just click a button and the link to that file or project is copied and ready to be shared. You can even hide files or folders inside a project if you don't want to share them but still want to share it."},vault:{title:"Vault",description:"Denvelope has a vault where you can store extremely important files."}}},page_not_found:{title:"Page Not Found",description:"The specified file was not found on this website. Please check the URL for mistakes and try again."},pwa:{update_available:"Update available"},settings:{general:{title:"General"},security:{title:"Security",sign_out_from_all_devices:"Sign Out from all devices"},advanced:{title:"Advanced",delete_account:"Delete account"},info:{title:"Info"}},share:{check_out:"Check out",on_denvelope:"on Denvelope"},vault:{info:"If you delete an element inside the vault it will be deleted immediately, you won't be able to restore it."}},i={accessibility:{keyboard_shortcuts:"Scorciatoie da tastiera",view_account_content:"Vedi contenuti account",view_shared_content:"Vedi contenuti condivisi",view_starred_content:"Vedi contenuti preferiti",view_trash:"Vedi cestino",close_modal:"Chiudi modale",delete_selected_content:"Elimina contenuti selezionati",open_close_account_menu:"Apri / Chiudi menu account",download_current_folder:"Scarica cartella attuale"},account:{title:"Il tuo account",icons8_message:"Alcune icone di cartelle e file sono fornite da",add_files:"Aggiungi file",add_folder:"Aggiungi cartella",create_file:"Crea file",create_folder:"Crea cartella",shared:"Condivisi",starred:"Preferiti",trash:"Cestino",empty_trash:"Svuota cestino",create_vault:"Crea cassaforte",display_image:"Mostra immagine",display_pdf:"Mostra PDF",change_background:"Cambia sfondo",image_address:"Indirizzo dell'immagine",context_menu:{move:{impossible:"Impossibile spostare questo elemento, non ci sono cartelle in cui spostarlo"}}},api:{messages:{file:{deleted:"File eliminato permanentemente",restored:"File ripristinato con successo",moved_to_trash:"File spostato nel cestino",downloading:"Scaricando"},folder:{deleted:"Cartella eliminata permanentemente",restored:"Cartella ripristinata con successo",moved_to_trash:"Cartella spostata nel cestino",empty:"Questa cartella è vuota",no_search_results:"Non ci sono elementi corrispondenti a questo",compressing:"Creando cartella compressa",choose_download_format:"Scegli formato download",offline:"Sei attualmente offline",vault_empty:"La cassaforte è vuota"},user:{not_enough_storage:"Non hai spazio di archiviazione sufficiente per questo file"},vault:{set_pin:"Imposta PIN",unlock:"Sblocca cassaforte",wrong_pin:"Il PIN inserito non è corretto"}},languages:{cloud_firestore_indexes:"Indici di Cloud Firestore",cloud_firestore_security_rules:"Regole di Sicurezza di Cloud Firestore",document:"Documento",file:"File",folder:"Cartella",image:"Immagine"}},cookie_banner:{text:"Usiamo i cookie per rendere possibile il corretto funzionamento di Denvelope per te. Utilizzando il nostro sito, accetti le nostre modalità di utilizzo dei cookie.",learn_more:"Ulteriori informazioni"},cookies:{text:"I cookie sono piccoli file di dati inviati al tuo browser quando visiti un sito. Utilizziamo sia i nostri cookie che quelli di terze parti per varie finalità",why:{access_services:"Farti accedere ai nostri servizi",remember_settings:"Ricordare preferenze e impostazioni",secure_account:"Mantenere al sicuro il tuo account",improve_services:"Capire meglio in che modo gli utenti utilizzano i nostri servizi e migliorarli"},opt_out:{title:"Disattivazione",text:"Puoi impostare il tuo browser in modo che non accetti i cookie, ma ciò potrebbe limitare la possibilità di utilizzare i nostri Servizi."}},errors:{empty:"Questo campo non può essere vuoto",offline:"Sei offline. Per completare questa azione devi disporre di una connessione ad Internet",user_content:{already_exists:"Un elemento con questo nome esiste già"},vault_pin_too_short:"Il PIN della cassaforte deve avere almeno 4 caratteri",invalid_url:"L'URL inserito non è valido",url_must_be_https:"L'URL deve usare HTTPS"},generic:{contact_us:"Contattaci",cookies:"Cookie",privacy:"Privacy",terms:"Termini",view:"Vedi",save:"Salva",save_to_my_account:"Salva nel mio account",share:"Condividi",sharing_options:"Opzioni di condivisione",copy_shareable_link:"Copia link condivisibile",unshare:"Rimuovi condivisione",move:"Sposta",add_to_favourites:"Aggiungi ai Preferiti",remove_from_favourites:"Rimuovi dai Preferiti",rename:"Rinomina",edit:"Modifica",info:"Informazioni",download:"Scarica",restore:"Ripristina",delete:"Elimina",close:"Chiudi",back:"Indietro",settings:"Impostazioni",sign_out:"Esci",load_more:"Carica di più",search:"Cerca",username:"Nome utente",email:"Email",password:"Password",language:"Lingua",confirm:"Conferma",update:"Aggiorna",terms_of_service:"Termini di Servizio",privacy_policy:"Norme sulla Privacy",cookie_policy:"Norme sui Cookie",version:"Versione",account:"Account",name:"Nome",folder:"Cartella",folders:"Cartelle",file:"File",files:"File",install:"Installa",in_short:"In breve",the_team:"Il Team Denvelope",id:"ID",created:"Creato",last_modified:"Ultima modifica",type:"Tipo",size:"Dimensioni",keyboard_shortcut:"Scorciatoia da tastiera",accessibility:"Accessibilità",are_you_sure:"Sei sicuro?",vault:"Cassaforte",lock:"Blocca",unlock:"Sblocca"},header:{storage:{of:"di",used:"in uso"}},home:{title:"Denvelope",description:"Denvelope ti permette di salvare, modificare e condividere il tuo codice in modo semplice, veloce e affidabile",hero:{heading:"Saluta la nuova casa del tuo codice",subheading:"Denvelope è il posto perfetto per salvare, modificare e condividere il tuo codice in modo semplice, veloce e affidabile"},feature_section:{open_source:{title:"Noi siamo Open Source",description:"Denvelope è un progetto Open Source e non commerciale, per questo motivo possiamo offrirti solo 100MB di spazio di archiviazione non aumentabile. Se necessiti di più spazio di archiviazione puoi clonare Denvelope e hostarlo su Firebase."},store:{title:"Non perdere più il tuo codice",description:"Con Denvelope puoi ora salvare il tuo codice in un posto sicuro. Non dovrai più preoccuparti di perdere i tuoi file o progetti."},view_edit:{title:"Visualizza e modifica il tuo codice da dovunque tu sia",description:"Denvelope ti permette di vedere e modificare il tuo codice da qualunque dispositivo con l'editor integrato."},share:{title:"Hai bisogno di condividere un pezzo di codice o un intero progetto?",description:"Con Denvelope puoi semplicemente cliccare un bottone e il link a quel file o progetto è copiato e pronto per essere condiviso. Puoi inoltre nascondere file o cartelle all'interno di un progetto se non vuoi che siano visibili ma vuoi comunque condividerlo."},vault:{title:"Cassaforte",description:"Denvelope dispone di una cassaforte, il posto perfetto per archiviare file di estrema importanza."}}},page_not_found:{title:"Pagina Non Trovata",description:"Il file specificato non è stato trovato in questo sito. Controlla l'URL per eventuali errori e riprova."},pwa:{update_available:"Aggiornamento disponibile"},settings:{general:{title:"Generali"},security:{title:"Sicurezza",sign_out_from_all_devices:"Esci da tutti i dispositivi"},advanced:{title:"Avanzate",delete_account:"Elimina account"},info:{title:"Informazioni"}},share:{check_out:"Guarda",on_denvelope:"su Denvelope"},vault:{info:"Se elimini un elemento all'interno della cassaforte questo sarà eliminato immediatamente, e non potrà più essere recuperato."}};class r{}r.Init=(e,t)=>{n.a.IsSet(e)||(e=document),n.a.IsSet(t)||(t=n.a.IsSetCookie("lang")?n.a.GetCookie("lang"):navigator.language),n.a.SetCookie("lang",t,60),document.documentElement.lang=r.Language=t;const o=Array.from(new Set(Array.from(e.querySelectorAll("*")).filter(e=>e.hasAttribute("data-translation")||e.hasAttribute("data-placeholder-translation")||e.hasAttribute("data-content-translation")||e.hasAttribute("data-aria-label-translation")||e.hasAttribute("data-start-translation")||e.hasAttribute("data-only-translation")).map(e=>e.getAttribute("data-translation")||e.getAttribute("data-placeholder-translation")||e.getAttribute("data-content-translation")||e.getAttribute("data-aria-label-translation")||e.getAttribute("data-start-translation")||e.getAttribute("data-only-translation"))));e.querySelectorAll("[data-use=translation]").forEach(e=>e.remove()),o.forEach(t=>e.querySelectorAll(`[data-translation="${t}"]`).forEach(e=>e.innerHTML+=` <span data-use="translation">${r.Get(t)}</span>`)),o.forEach(t=>e.querySelectorAll(`[data-placeholder-translation="${t}"]`).forEach(e=>e.placeholder=r.Get(t))),o.forEach(t=>e.querySelectorAll(`[data-content-translation="${t}"]`).forEach(e=>e.content=r.Get(t))),o.forEach(t=>e.querySelectorAll(`[data-aria-label-translation="${t}"]`).forEach(e=>e.setAttribute("aria-label",r.Get(t)))),o.forEach(t=>e.querySelectorAll(`[data-start-translation="${t}"]`).forEach(e=>e.innerHTML=`<span data-use="translation">${r.Get(t)}</span>`+e.innerHTML)),o.forEach(t=>e.querySelectorAll(`[data-only-translation="${t}"]`).forEach(e=>e.innerHTML=r.Get(t))),Array.from(e.querySelectorAll("*")).filter(e=>e.hasAttribute("data-keyboard-shortcut")).forEach(e=>e.title=`${r.Get("generic->keyboard_shortcut")}: ${e.getAttribute("data-keyboard-shortcut").toUpperCase()}`)},r.Get=e=>{const t=e.split("->");let o;switch(r.Language.toLowerCase()){case"it-it":case"it":o=i;break;default:o=a}for(let e=0;e<t.length-1;e++)o=o[t[e]];return o[t[t.length-1]]}},function(e,t,o){"use strict";o.d(t,"b",(function(){return a})),o.d(t,"c",(function(){return i})),o.d(t,"d",(function(){return r})),o.d(t,"e",(function(){return l})),o.d(t,"h",(function(){return c})),o.d(t,"g",(function(){return d})),o.d(t,"f",(function(){return u})),o.d(t,"a",(function(){return m}));var n=o(0);const a=document.querySelector("header"),i=a.querySelector(".menu-toggle button"),r=document.querySelector(".menu.logged-in"),s=a.querySelector(".sign-in"),l=r.querySelector(".sign-out"),c=document.querySelectorAll("[data-update-field=photo]"),d=document.querySelector("[data-update-field=name]"),u=document.querySelector("[data-update-field=email]"),m=()=>n.a.HideElement(r);i.addEventListener("click",()=>"block"===r.style.display?m():n.a.ShowElement(r,"block")),document.addEventListener("click",e=>{r.contains(e.target)||i.contains(e.target)||m()}),s.addEventListener("click",()=>location.href="/"),document.addEventListener("scroll",m),document.addEventListener("contextmenu",m),window.addEventListener("resize",m)},function(e,t,o){"use strict";o.d(t,"b",(function(){return r})),o.d(t,"c",(function(){return s})),o.d(t,"a",(function(){return l}));var n=o(0),a=o(1),i=o(3);class r{constructor(e){this.element=document.querySelector(".modal").cloneNode(!0),this.spinner=this.element.querySelector(".spinner"),this.Content=this.element.querySelector(".content"),this.CloseButton=this.element.querySelector(".close"),this.ConfirmButton=this.element.querySelector(".confirm"),this.UpdateButton=this.element.querySelector(".update"),this.Show=e=>{this.CloseButton.addEventListener("click",()=>{this.Hide(),this.Remove()}),this.ConfirmButton.addEventListener("click",this.OnConfirm),this.UpdateButton.addEventListener("click",this.OnUpdate),n.a.IsSet(e)&&e?document.querySelectorAll(".modal.show:not(.keep-alive)").forEach(e=>e.remove()):n.a.AddClass(this.element,"keep-alive"),n.a.HasClass(this.element,"show")||(""===this.Content.innerHTML.trim()&&n.a.ShowElement(this.spinner,"block"),n.a.RemoveClass(this.element,"hide"),n.a.AddClass(this.element,"show")),document.addEventListener("mouseup",this.HideOnOuterClick),window.addEventListener("keydown",e=>{const t=e.key.toLowerCase();["escape"].includes(t)&&e.preventDefault(),"escape"===t&&this.HideAndRemove()})},this.Hide=()=>{n.a.RemoveClass(this.element,"show"),n.a.AddClass(this.element,"hide")},this.Remove=()=>{this.OnClose(),setTimeout(()=>this.element.remove(),1e3*getComputedStyle(this.element).getPropertyValue("animation-duration").replace(/[a-z]+/g,"")),document.removeEventListener("click",this.HideOnOuterClick)},this.HideAndRemove=()=>{this.Hide(),this.Remove()},this.AppendContent=e=>{n.a.HideElement(this.spinner),e.filter(n.a.IsSet).forEach(e=>this.Content.append(e)),this.Content.querySelectorAll("input").forEach(e=>e.addEventListener("keyup",e=>{"Enter"===e.key&&(this.ConfirmButton.click(),this.UpdateButton.click())}))},this.RemoveContent=()=>{n.a.ShowElement(this.spinner,"block"),this.Content.childNodes.forEach(e=>n.a.HasClass(e,"heading")?null:e.remove())},this.HideOnOuterClick=e=>{this.element.contains(e.target)||n.a.HasClass(this.element,"keep-alive")||this.HideAndRemove()},n.a.IsSet(e)&&(e.hasOwnProperty("title")&&(this.Title=e.title),e.hasOwnProperty("subtitle")&&(this.Subtitle=e.subtitle),e.hasOwnProperty("allow")&&(e.allow.includes("close")&&n.a.ShowElement(this.CloseButton,"block"),e.allow.includes("confirm")&&n.a.ShowElement(this.ConfirmButton,"block"),e.allow.includes("update")&&n.a.ShowElement(this.UpdateButton,"block")),e.hasOwnProperty("floating")&&e.floating&&n.a.AddClass(this.element,"floating"),e.hasOwnProperty("animate")&&!e.animate&&n.a.AddClass(this.element,"no-animate"),e.hasOwnProperty("aside")&&e.aside&&n.a.AddClass(this.element,"aside"),e.hasOwnProperty("loading")&&!e.loading&&n.a.HideElement(this.spinner)),this.OnClose=this.OnConfirm=this.OnUpdate=()=>{},document.body.appendChild(this.element)}set Title(e){const t=document.createElement("h1");t.className="title",t.innerHTML=e,this.Content.querySelector(".heading").insertAdjacentElement("afterbegin",t)}set Subtitle(e){const t=document.createElement("h4");t.className="subtitle",t.innerHTML=e,this.Content.querySelector(".heading").insertAdjacentElement("beforeend",t)}}class s extends r{constructor(e,t){super({subtitle:e,floating:!0,animate:!1,aside:!0}),this.AppendContent([new a.a("div",{class:"transfer-info",children:[new a.a("div",{class:"progress-bar-container",children:[this.ProgressBar=new a.a("span",{class:"progress-bar"}).element]}).element,new a.a("p",{class:"status",children:[this.TransferSize=new a.a("span",{class:"transfer-size",innerHTML:0}).element,new a.a("span",{class:"tot-size",innerHTML:` / ${n.a.FormatStorage(t)}`}).element]}).element]}).element,new a.a("div",{class:"upload-controls",children:[new a.a("button",{class:"pause upload-control",children:[new a.a("i",{class:"fas fa-pause fa-fw"}).element]}).element,new a.a("button",{class:"resume upload-control",children:[new a.a("i",{class:"fas fa-play fa-fw"}).element]}).element,new a.a("button",{class:"cancel upload-control",children:[new a.a("i",{class:"fas fa-times fa-fw"}).element]}).element]}).element]);const o=this.element.querySelector(".pause"),i=this.element.querySelector(".resume"),r=this.element.querySelector(".cancel");o.addEventListener("click",()=>{n.a.HideElement(o),n.a.ShowElement(i,"block"),this.OnPause()}),i.addEventListener("click",()=>{n.a.HideElement(i),n.a.ShowElement(o,"block"),this.OnResume()}),r.addEventListener("click",this.OnCancel),this.Show()}}class l extends r{constructor(e,t){super({subtitle:`${i.a.Get("api->messages->file->downloading")}: ${e}`,floating:!0,animate:!1,aside:!0}),this.AppendContent([new a.a("div",{class:"transfer-info",children:[new a.a("div",{class:"progress-bar-container",children:[this.ProgressBar=new a.a("span",{class:"progress-bar"}).element]}).element,new a.a("p",{class:"status",children:[this.TransferSize=new a.a("span",{class:"transfer-size",innerHTML:0}).element,new a.a("span",{class:"tot-size",innerHTML:` / ${n.a.FormatStorage(t)}`}).element]}).element]}).element]),this.Show()}}},function(e,t,o){"use strict";o.d(t,"a",(function(){return c})),o.d(t,"b",(function(){return d}));var n=o(0);const a=document.querySelector(".generic-message"),i=a.querySelector("p"),r=a.querySelector(".action"),s=a.querySelector(".dismiss");let l;const c=(e,t,o=2e3)=>new Promise((c,d)=>{i.innerText=e,n.a.IsSet(t)?(r.innerText=t,n.a.ShowElement(r,"block")):n.a.HideElement(r),n.a.ShowElement(a,"flex"),o>=0&&(l=setTimeout(u,o)),s.addEventListener("click",()=>{clearTimeout(l),u()}),r.addEventListener("click",()=>{c(),clearTimeout(l),u()})}),d=()=>{c("",null,-1),n.a.HideElement(s),n.a.ShowElement(a.querySelector(".spinner"),"block")},u=()=>n.a.HideElement(a)},function(e,t,o){"use strict";o.d(t,"a",(function(){return c}));var n=o(0),a=o(2),i=o(4),r=o(6),s=o(3);class l{constructor(){this.IsSupported=()=>"serviceWorker"in navigator,this.Register=()=>{let e,t;window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").then(e=>{navigator.serviceWorker.controller&&(e.waiting?this.UpdateReady(e.waiting):e.installing?this.TrackInstalling(e.installing):e.addEventListener("updatefound",()=>this.TrackInstalling(e.installing)))})),navigator.serviceWorker.addEventListener("controllerchange",()=>{e||(window.location.reload(),e=!0)});const o=document.querySelector(".install-pwa"),a=document.querySelector(".install-pwa + hr");window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),t=e,n.a.ShowElements([o,a],"block")}),window.addEventListener("appinstalled",()=>l.analytics.logEvent("install")),o.addEventListener("click",()=>{t.prompt(),t.userChoice.then(e=>{"accepted"===e.outcome&&n.a.HideElements([o,a]),t=null})})},this.TrackInstalling=e=>e.addEventListener("statechange",()=>{"installed"===e.state&&this.UpdateReady(e)}),this.UpdateReady=e=>{r.a(s.a.Get("pwa->update_available"),s.a.Get("generic->update"),-1).then(()=>{r.b(),l.analytics.logEvent("update"),window.firebase.firestore().terminate(),e.postMessage({action:"skipWaiting"})})},this.IsSupported()&&this.Register()}}l.analytics=window.firebase.analytics();const c=()=>{const e=window.firebase.firestore();e.enablePersistence({synchronizeTabs:!0}),a.a.Init();const t=document.querySelector(".cookie-banner");new l,n.a.IsSetCookie("cookie_consent")||(n.a.ShowElement(t,"flex"),t.querySelector("i:last-child").addEventListener("click",()=>n.a.HideElement(document.querySelector(".cookie-banner")))),n.a.PreventDragEvents(),document.addEventListener("contextmenu",e=>{null===e.target.closest(".allow-context-menu")&&e.preventDefault()}),i.e.addEventListener("click",()=>a.a.SignOut()),document.addEventListener("DOMContentLoaded",()=>{n.a.SetCookie("cookie_consent","true",60),s.a.Init(),n.a.LogPageViewEvent()}),window.addEventListener("load",()=>n.a.RemoveClass(document.body,"preload")),window.addEventListener("keydown",e=>{if(["input","textarea"].includes(document.activeElement.tagName.toLowerCase()))return;const t=e.key.toLowerCase();["m","a","e","h","s"].includes(t)&&e.preventDefault(),"m"===t?i.c.click():"a"===t?location.href="/account":"e"===t?i.e.click():"h"===t?location.href="/":"s"!==t||e.ctrlKey||(location.href="/settings")}),window.addEventListener("userready",()=>{a.a.IsAuthenticated&&e.collection("users").doc(a.a.UserId).onSnapshot(e=>{if(!e.exists)return;const t=e.data().usedStorage,o=e.data().maxStorage,a=`${+(t/o*100).toFixed(2)}%`,i=document.querySelector("[data-update-field=used-storage]"),r=document.querySelector("[data-update-field=max-storage]");i.innerHTML=n.a.FormatStorage(t),i.setAttribute("data-bytes",t),r.innerHTML=n.a.FormatStorage(o),r.setAttribute("data-bytes",o),document.querySelector("[data-update-field=used-storage-percent]").innerHTML=`(${a})`,document.querySelector(".storage .used").style.width=a})})}},function(e,t,o){"use strict";o.r(t),o(7).a()}]);