!function(e){var t={};function n(a){if(t[a])return t[a].exports;var i=t[a]={i:a,l:!1,exports:{}};return e[a].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=e,n.c=t,n.d=function(e,t,a){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(n.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(a,i,function(t){return e[t]}.bind(null,i));return a},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=8)}([function(e,t,n){"use strict";var a;n.d(t,"v",(function(){return i})),n.d(t,"w",(function(){return o})),n.d(t,"m",(function(){return r})),n.d(t,"n",(function(){return s})),n.d(t,"a",(function(){return l})),n.d(t,"b",(function(){return c})),n.d(t,"t",(function(){return d})),n.d(t,"l",(function(){return u})),n.d(t,"p",(function(){return m})),n.d(t,"s",(function(){return p})),n.d(t,"e",(function(){return h})),n.d(t,"g",(function(){return f})),n.d(t,"f",(function(){return g})),n.d(t,"h",(function(){return v})),n.d(t,"i",(function(){return y})),n.d(t,"u",(function(){return b})),n.d(t,"j",(function(){return _})),n.d(t,"k",(function(){return w})),n.d(t,"q",(function(){return S})),n.d(t,"r",(function(){return O})),n.d(t,"d",(function(){return k})),n.d(t,"c",(function(){return C})),n.d(t,"o",(function(){return E}));const i=(e,t)=>{e.style.display=null!=t?t:"block"},o=(e,t)=>e.forEach(e=>i(e,t)),r=e=>{e.style.display="none"},s=e=>e.forEach(e=>r(e)),l=(e,t)=>e.classList.add(t),c=(e,t)=>t.filter(e=>e.length>0).forEach(t=>l(e,t)),d=(e,t)=>e.classList.remove(t),u=(e,t)=>e.classList.contains(t),m=e=>null!=e,p=()=>{document.addEventListener("drag",e=>e.preventDefault()),document.addEventListener("dragend",e=>e.preventDefault()),document.addEventListener("dragenter",e=>e.preventDefault()),document.addEventListener("dragexit",e=>e.preventDefault()),document.addEventListener("dragleave",e=>e.preventDefault()),document.addEventListener("dragover",e=>e.preventDefault()),document.addEventListener("dragstart",e=>e.preventDefault()),document.addEventListener("drop",e=>e.preventDefault())},h=e=>window.dispatchEvent(new Event(e)),f=e=>{let t="";for(var n=0;e>=1e3;n++)e/=1e3;switch(n){case 0:t="B";break;case 1:t="KB";break;case 2:t="MB";break;case 3:t="GB";break;case 4:t="TB";break;case 5:t="PB";break;case 6:t="EB";break;case 7:t="ZB";break;case 8:t="YB"}return+e.toFixed(2)+t},g=(e,t)=>new Date(e).toLocaleDateString(document.documentElement.lang,t||{year:"numeric",month:"2-digit",day:"2-digit",hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}),v=e=>{let t=document.querySelector("input[name=folder-id]").value;return"trash"!==t&&"starred"!==t&&"shared"!==t&&"vault"!==t||m(e)&&e||(t="root"),t},y=async e=>new Promise(t=>{""!==v(e).trim()&&t(v(e)),document.querySelector("input[name=folder-id]").addEventListener("change",()=>t(v(e)),{once:!0})}),b=e=>{document.querySelector("input[name=folder-id]").value=e},_=()=>window.firebase.firestore.FieldValue.serverTimestamp(),w=()=>({updated:_(),lastClientUpdateTime:new window.firebase.firestore.Timestamp.now}),S=()=>"ontouchstart"in window,O=(null===(a=window.trustedTypes)||void 0===a||a.createPolicy("escapePolicy",{createHTML:e=>(e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/\'/g,"&#039;").replace(/\//g,"&#x2F;"))(e)}),()=>window.firebase.analytics().logEvent("page_view",{page_location:location.href,page_path:location.pathname,page_title:document.title,offline:!navigator.onLine,isPwa:navigator.standalone||window.matchMedia("(display-mode: standalone)").matches})),k=()=>indexedDB.deleteDatabase("firestore/[DEFAULT]/denvelope-firebase/main"),C=()=>{k(),indexedDB.deleteDatabase("firebase-installations-database"),indexedDB.deleteDatabase("firebaseLocalStorageDb"),localStorage.clear(),localStorage.setItem("cookie-consent","true")},E=e=>0===(e=>{switch(e){case"1GB":return 1;case"10GB":return 2;default:return 0}})(f(e))},function(e,t,n){"use strict";n.d(t,"a",(function(){return i})),n.d(t,"b",(function(){return o})),n.d(t,"c",(function(){return r})),n.d(t,"d",(function(){return s}));var a=n(0);class i{constructor(e,t){if(this.type=e,this.options=t,this.element=document.createElement(e),Object(a.p)(t)){if(t.hasOwnProperty("aria")&&(Array.from(Object.keys(t.aria)).forEach((e,n)=>this.element.setAttribute("aria-"+e,Object.values(t.aria)[n])),delete t.aria),t.hasOwnProperty("children")&&(t.children.forEach(e=>this.element.appendChild(e)),delete t.children),t.hasOwnProperty("data")&&(Array.from(Object.keys(t.data)).forEach((e,n)=>this.element.setAttribute("data-"+e,Object.values(t.data)[n])),delete t.data),t.hasOwnProperty("style")){const e={};if(Array.from(Object.keys(t.style)).filter(e=>![":hover",":focus"].includes(e)).forEach((n,a)=>this.element.style[n]=e[n]=Object.values(t.style)[a]),t.style.hasOwnProperty(":hover")){const n=t.style[":hover"];Array.from(Object.keys(n)).forEach((t,i)=>{this.element.addEventListener("mouseenter",()=>Object(a.l)(this.element,"no-hover")?null:this.element.style[t]=Object.values(n)[i]),this.element.addEventListener("mouseleave",()=>this.element.style[t]=e[t]||"")})}delete t.style}t.hasOwnProperty("innerText")&&(this.element.innerText=t.innerText,delete t.innerText),Array.from(Object.keys(t)).forEach((e,n)=>this.element.setAttribute(e,Object.values(t)[n]))}}}class o extends i{constructor(e){super("div",{class:Object(a.p)(e.class)?e.class:"input",children:[new i("input",{...e.attributes}).element,...e.children||[]]}),this.options=e}}class r extends o{constructor(e){var t;super({class:"input-with-icon",children:[new i("button",{type:"button",class:"input-icon",aria:{hidden:!0},tabindex:-1,children:[new i("i",{class:e.iconClassName}).element]}).element],attributes:e.attributes}),this.options=e,"password"===(null===(t=e.attributes)||void 0===t?void 0:t.type)&&this.element.querySelector(".input-icon").addEventListener("click",()=>{this.element.querySelector("input").type="password"===this.element.querySelector("input").type?"text":"password"})}}class s extends i{constructor(){super("span",{class:"spinner",children:[new i("i",{class:"fas fa-circle-notch fa-fw"}).element]})}}},function(e,t,n){"use strict";n.d(t,"a",(function(){return r}));const a={language:{name:"English (United States)"},accessibility:{keyboard_shortcuts:"Keyboard shortcuts",view_account_content:"View account content",view_shared_content:"View shared content",view_starred_content:"View starred content",view_trash:"View trash",close_modal:"Close modal",delete_selected_content:"Delete selected content",open_close_account_menu:"Open / Close account menu",download_current_folder:"Download current folder"},account:{title:"Your Account",icons8_message:"Some folder and file icons are provided by",add_files:"Add files",add_folder:"Add folder",create_file:"Create file",create_folder:"Create folder",shared:"Shared",starred:"Starred",recents:"Recents",trash:"Trash",empty_trash:"Empty trash",create_vault:"Create vault",display_image:"Display image",display_pdf:"Display PDF",validate_xml:"Validate XML",validate_json:"Validate JSON",image_address:"Image address",what_is_taking_up_space:"What's taking up space?",upgrade_plan:"Upgrade",context_menu:{move:{impossible:"Impossible to move this item, there are no folders to move this into"}}},api:{messages:{file:{deleted:"File deleted permanently",restored:"File restored successfully",moved_to_trash:"File moved to trash",downloading:"Downloading"},folder:{deleted:"Folder deleted permanently",restored:"Folder restored successfully",moved_to_trash:"Folder moved to trash",empty:"This folder is empty",no_search_results:"There are no elements matching this",compressing:"Creating compressed folder",choose_download_format:"Choose download format",offline:"You are currently offline",vault_empty:"The vault is empty",no_recents:"There are no recent files"},user:{not_enough_storage:"You do not have enough storage space for this file"},vault:{set_pin:"Set PIN",unlock:"Unlock vault",wrong_pin:"The entered PIN is wrong"}},languages:{cloud_firestore_indexes:"Cloud Firestore Indexes",cloud_firestore_security_rules:"Cloud Firestore Security Rules",document:"Document",file:"File",folder:"Folder",image:"Image"}},cookie_banner:{text:"We use cookies so that Denvelope works for you. By using our website, you agree with our use of cookies.",learn_more:"Learn more"},cookies:{text:"Cookies are small data files sent to your browser when you visit a site. We use both our own cookies, as well as third-party cookies, to do a few different things",why:{access_services:"Log you in to our services",remember_settings:"Remember preferences and settings",secure_account:"Keep your account secure",improve_services:"Better understand how people are using our services and how we can improve"},opt_out:{title:"Opt-Out",text:"You can set your browser to not accept cookies, but this may limit your ability to use the Services."}},errors:{empty:"This field cannot be empty",offline:"You are offline. To complete this action you need an Internet connection",user_content:{already_exists:"An element with this name already exists"},vault_pin_too_short:"The vault PIN must be at least 4 characters long",invalid_url:"The entered URL is invalid",url_must_be_https:"The URL must use HTTPS"},generic:{contact_us:"Contact Us",cookies:"Cookies",privacy:"Privacy",terms:"Terms",view:"View",save:"Save",save_to_my_account:"Save to my account",share:"Share",sharing_options:"Sharing options",copy_shareable_link:"Copy shareable link",unshare:"Unshare",move:"Move",add_to_favourites:"Add to Favourites",remove_from_favourites:"Remove from Favourites",rename:"Rename",edit:"Edit",info:"Info",download:"Download",restore:"Restore",delete:"Delete",close:"Close",back:"Back",settings:"Settings",sign_out:"Sign Out",load_more:"Load more",search:"Search",username:"Username",email:"Email",password:"Password",language:"Language",current:"Current",confirm:"Confirm",update:"Update",terms_of_service:"Terms of Service",privacy_policy:"Privacy Policy",cookie_policy:"Cookie Policy",version:"Version",account:"Account",name:"Name",folder:"Folder",folders:"Folders",file:"File",files:"Files",install:"Install",id:"ID",created:"Created",last_modified:"Last modified",type:"Type",size:"Size",shared:"Shared",starred:"Starred",position:"Position",keyboard_shortcut:"Keyboard shortcut",accessibility:"Accessibility",are_you_sure:"Are you sure?",vault:"Vault",lock:"Lock",unlock:"Unlock",no_errors_found:"No errors found",reset:"Reset",sign_in:"Sign In",example:"Example",reference:"Reference",default:"Default",yes:"Yes",no:"No",month:"Month",from:"From",to:"To",add:"Add",plans:"Plans"},header:{storage:{of:"of",used:"used"}},home:{title:"Denvelope",description:"Denvelope lets you store, edit and share your code in a simple, fast and reliable way",hero:{heading:"Say hello to your code's next home",subheading:"Denvelope is the perfect place to store, edit and share your code in a simple, fast and reliable way"},feature_section:{open_source:{title:"We are Open Source",description:"Denvelope is an and Open Source project."},store:{title:"Never lose your code again",description:"With Denvelope you can now store your code in a secure place. Never worry again about losing your projects."},view_edit:{title:"Access and edit your code from wherever you are",description:"Denvelope lets you view and edit your code from any device with the built-in code editor."},share:{title:"Need to share a piece of code or an entire project?",description:"With Denvelope you can just click a button and the link to that file or project is copied and ready to be shared. You can even hide files or folders inside a project if you don't want to share them but still want to share it."},vault:{title:"Vault",description:"Denvelope has a vault where you can store extremely important files."},pwa:{title:"Progressive Web App",description:"Denvelope is a PWA, this means you can install it basically everywhere. This has the advantage of the very small install size."}}},page_not_found:{title:"Page Not Found",description:"The specified file was not found on this website. Please check the URL for mistakes and try again."},pwa:{update_available:"Update available"},settings:{general:{title:"General",background:"Background",date_format:"Date format"},plan:{title:"Plan",change_plan:{title:"Change plan",change:"Change"},delete_plan:{title:"Delete plan",message:"The plan will be cancelled at the current period end"},payment_methods:{title:"Payment methods",set_as_default:"Set as default"},add_payment_method:"Add payment method",next_renewal:"Next renewal",next_period_plan:"Your plan after this period",subscription_end:"Subscription end",no_payment_method:"You haven't added any payment method",reactivate_subscription:"Reactivate subscription",complete_payment:"Complete payment",cancel_downgrade:"Cancel downgrade",currency:"USD",plans:{"100MB":{price:{month:"0"}},"1GB":{price:{month:"2"}},"10GB":{price:{month:"10"}}}},security:{title:"Security",sign_out_from_all_devices:"Sign Out from all devices",change_vault_pin:{title:"Change vault PIN",current:"Current PIN",new:"New PIN"},delete_vault:"Delete vault"},advanced:{title:"Advanced",delete_account:"Delete account",cache_size:"Cache size"},privacy:{title:"Privacy",clear_cache:{title:"Clear cache",clear:"Clear"}},info:{title:"Info"},changes_will_be_applied_at_the_next_page_load:"Changes will be applied at the next page load"},share:{check_out:"Check out",on_denvelope:"on Denvelope"},vault:{info:"If you delete an element inside the vault it will be deleted immediately, you won't be able to restore it."}},i={language:{name:"Italiano"},accessibility:{keyboard_shortcuts:"Scorciatoie da tastiera",view_account_content:"Vedi contenuti account",view_shared_content:"Vedi contenuti condivisi",view_starred_content:"Vedi contenuti preferiti",view_trash:"Vedi cestino",close_modal:"Chiudi modale",delete_selected_content:"Elimina contenuti selezionati",open_close_account_menu:"Apri / Chiudi menu account",download_current_folder:"Scarica cartella attuale"},account:{title:"Il tuo account",icons8_message:"Alcune icone di cartelle e file sono fornite da",add_files:"Aggiungi file",add_folder:"Aggiungi cartella",create_file:"Crea file",create_folder:"Crea cartella",shared:"Condivisi",starred:"Preferiti",recents:"Recenti",trash:"Cestino",empty_trash:"Svuota cestino",create_vault:"Crea cassaforte",display_image:"Mostra immagine",display_pdf:"Mostra PDF",validate_xml:"Valida XML",validate_json:"Valida JSON",image_address:"Indirizzo dell'immagine",what_is_taking_up_space:"Cosa occupa spazio?",upgrade_plan:"Effettua l'upgrade",context_menu:{move:{impossible:"Impossibile spostare questo elemento, non ci sono cartelle in cui spostarlo"}}},api:{messages:{file:{deleted:"File eliminato permanentemente",restored:"File ripristinato con successo",moved_to_trash:"File spostato nel cestino",downloading:"Scaricando"},folder:{deleted:"Cartella eliminata permanentemente",restored:"Cartella ripristinata con successo",moved_to_trash:"Cartella spostata nel cestino",empty:"Questa cartella è vuota",no_search_results:"Non ci sono elementi corrispondenti a questo",compressing:"Creando cartella compressa",choose_download_format:"Scegli formato download",offline:"Sei attualmente offline",vault_empty:"La cassaforte è vuota",no_recents:"Non ci sono file recenti"},user:{not_enough_storage:"Non hai spazio di archiviazione sufficiente per questo file"},vault:{set_pin:"Imposta PIN",unlock:"Sblocca cassaforte",wrong_pin:"Il PIN inserito non è corretto"}},languages:{cloud_firestore_indexes:"Indici di Cloud Firestore",cloud_firestore_security_rules:"Regole di Sicurezza di Cloud Firestore",document:"Documento",file:"File",folder:"Cartella",image:"Immagine"}},cookie_banner:{text:"Usiamo i cookie per rendere possibile il corretto funzionamento di Denvelope per te. Utilizzando il nostro sito, accetti le nostre modalità di utilizzo dei cookie.",learn_more:"Ulteriori informazioni"},cookies:{text:"I cookie sono piccoli file di dati inviati al tuo browser quando visiti un sito. Utilizziamo sia i nostri cookie che quelli di terze parti per varie finalità",why:{access_services:"Farti accedere ai nostri servizi",remember_settings:"Ricordare preferenze e impostazioni",secure_account:"Mantenere al sicuro il tuo account",improve_services:"Capire meglio in che modo gli utenti utilizzano i nostri servizi e migliorarli"},opt_out:{title:"Disattivazione",text:"Puoi impostare il tuo browser in modo che non accetti i cookie, ma ciò potrebbe limitare la possibilità di utilizzare i nostri Servizi."}},errors:{empty:"Questo campo non può essere vuoto",offline:"Sei offline. Per completare questa azione devi disporre di una connessione ad Internet",user_content:{already_exists:"Un elemento con questo nome esiste già"},vault_pin_too_short:"Il PIN della cassaforte deve avere almeno 4 caratteri",invalid_url:"L'URL inserito non è valido",url_must_be_https:"L'URL deve usare HTTPS"},generic:{contact_us:"Contattaci",cookies:"Cookie",privacy:"Privacy",terms:"Termini",view:"Vedi",save:"Salva",save_to_my_account:"Salva nel mio account",share:"Condividi",sharing_options:"Opzioni di condivisione",copy_shareable_link:"Copia link condivisibile",unshare:"Rimuovi condivisione",move:"Sposta",add_to_favourites:"Aggiungi ai Preferiti",remove_from_favourites:"Rimuovi dai Preferiti",rename:"Rinomina",edit:"Modifica",info:"Informazioni",download:"Scarica",restore:"Ripristina",delete:"Elimina",close:"Chiudi",back:"Indietro",settings:"Impostazioni",sign_out:"Esci",load_more:"Carica di più",search:"Cerca",username:"Nome utente",email:"Email",password:"Password",language:"Lingua",current:"Attuale",confirm:"Conferma",update:"Aggiorna",terms_of_service:"Termini di Servizio",privacy_policy:"Norme sulla Privacy",cookie_policy:"Norme sui Cookie",version:"Versione",account:"Account",name:"Nome",folder:"Cartella",folders:"Cartelle",file:"File",files:"File",install:"Installa",id:"ID",created:"Creato",last_modified:"Ultima modifica",type:"Tipo",size:"Dimensioni",shared:"Condiviso",starred:"Preferito",position:"Posizione",keyboard_shortcut:"Scorciatoia da tastiera",accessibility:"Accessibilità",are_you_sure:"Sei sicuro?",vault:"Cassaforte",lock:"Blocca",unlock:"Sblocca",no_errors_found:"Non sono stati trovati errori",reset:"Ripristina",sign_in:"Accedi",example:"Esempio",reference:"Riferimento",default:"Predefinito",yes:"Sì",no:"No",month:"Mese",from:"Da",to:"A",add:"Aggiungi",plans:"Piani"},header:{storage:{of:"di",used:"in uso"}},home:{title:"Denvelope",description:"Denvelope ti permette di salvare, modificare e condividere il tuo codice in modo semplice, veloce e affidabile",hero:{heading:"Saluta la nuova casa del tuo codice",subheading:"Denvelope è il posto perfetto per salvare, modificare e condividere il tuo codice in modo semplice, veloce e affidabile"},feature_section:{open_source:{title:"Noi siamo Open Source",description:"Denvelope è un progetto Open Source."},store:{title:"Non perdere più il tuo codice",description:"Con Denvelope puoi ora salvare il tuo codice in un posto sicuro. Non dovrai più preoccuparti di perdere i tuoi file o progetti."},view_edit:{title:"Visualizza e modifica il tuo codice da dovunque tu sia",description:"Denvelope ti permette di vedere e modificare il tuo codice da qualunque dispositivo con l'editor integrato."},share:{title:"Hai bisogno di condividere un pezzo di codice o un intero progetto?",description:"Con Denvelope puoi semplicemente cliccare un bottone e il link a quel file o progetto è copiato e pronto per essere condiviso. Puoi inoltre nascondere file o cartelle all'interno di un progetto se non vuoi che siano visibili ma vuoi comunque condividerlo."},vault:{title:"Cassaforte",description:"Denvelope dispone di una cassaforte, il posto perfetto per archiviare file di estrema importanza."},pwa:{title:"Progressive Web App",description:"Denvelope è una PWA, il che vuol dire che puoi installarlo praticamente ovunque. Questo ha il vantaggio delle piccolissime dimensioni di installazione."}}},page_not_found:{title:"Pagina Non Trovata",description:"Il file specificato non è stato trovato in questo sito. Controlla l'URL per eventuali errori e riprova."},pwa:{update_available:"Aggiornamento disponibile"},settings:{general:{title:"Generali",background:"Sfondo",date_format:"Formato della data"},plan:{title:"Piano",change_plan:{title:"Cambia piano",change:"Cambia"},delete_plan:{title:"Cancella piano",message:"Il piano verrà cancellato alla fine del periodo corrente"},payment_methods:{title:"Metodi di pagamento",set_as_default:"Imposta come predefinito"},add_payment_method:"Aggiungi metodo di pagamento",next_renewal:"Prossimo rinnovo",next_period_plan:"Il tuo piano dopo questo periodo",subscription_end:"Fine sottoscrizione",no_payment_method:"Non hai aggiunto nessun metodo di pagamento",reactivate_subscription:"Riattiva sottoscrizione",complete_payment:"Completa pagamento",cancel_downgrade:"Annulla downgrade",currency:"EUR",plans:{"100MB":{price:{month:"0"}},"1GB":{price:{month:"2"}},"10GB":{price:{month:"10"}}}},security:{title:"Sicurezza",sign_out_from_all_devices:"Esci da tutti i dispositivi",change_vault_pin:{title:"Cambia PIN cassaforte",current:"PIN attuale",new:"Nuovo PIN"},delete_vault:"Elimina cassaforte"},advanced:{title:"Avanzate",delete_account:"Elimina account",cache_size:"Dimensioni cache"},privacy:{title:"Privacy",clear_cache:{title:"Svuota cache",clear:"Svuota"}},info:{title:"Informazioni"},changes_will_be_applied_at_the_next_page_load:"Le modifiche saranno applicate al prossimo caricamento di pagina"},share:{check_out:"Guarda",on_denvelope:"su Denvelope"},vault:{info:"Se elimini un elemento all'interno della cassaforte questo sarà eliminato immediatamente, e non potrà più essere recuperato."}};var o=n(0);let r=(()=>{class e{static get Language(){return localStorage.getItem("lang").toLowerCase()}}return e.Init=t=>{t||(t=["/en","/it"].includes(location.pathname)?location.pathname.substr(1):localStorage.getItem("lang")?localStorage.getItem("lang"):navigator.languages?navigator.languages[0]:navigator.language?navigator.language:"en"),e.IsSupportedLanguage(t)||(t="en"),localStorage.setItem("lang",t),document.documentElement.lang=e.Language;const n=Array.from(new Set(Array.from(document.querySelectorAll("*")).filter(e=>e.hasAttribute("data-translation")||e.hasAttribute("data-placeholder-translation")||e.hasAttribute("data-content-translation")||e.hasAttribute("data-aria-label-translation")||e.hasAttribute("data-start-translation")||e.hasAttribute("data-only-translation")).map(e=>e.getAttribute("data-translation")||e.getAttribute("data-placeholder-translation")||e.getAttribute("data-content-translation")||e.getAttribute("data-aria-label-translation")||e.getAttribute("data-start-translation")||e.getAttribute("data-only-translation"))));document.querySelectorAll("[data-use=translation]").forEach(e=>e.remove());const a=e=>{const t=document.createElement("span");return t.setAttribute("data-use","translation"),t.innerText=e,t};n.forEach(t=>document.querySelectorAll(`[data-translation="${t}"]`).forEach(n=>n.appendChild(a(" "+e.Get(t))))),n.forEach(t=>document.querySelectorAll(`[data-placeholder-translation="${t}"]`).forEach(n=>n.placeholder=e.Get(t))),n.forEach(t=>document.querySelectorAll(`[data-content-translation="${t}"]`).forEach(n=>n.content=e.Get(t))),n.forEach(t=>document.querySelectorAll(`[data-aria-label-translation="${t}"]`).forEach(n=>n.setAttribute("aria-label",e.Get(t)))),n.forEach(t=>document.querySelectorAll(`[data-start-translation="${t}"]`).forEach(n=>n.insertAdjacentElement("afterbegin",a(e.Get(t))))),n.forEach(t=>document.querySelectorAll(`[data-only-translation="${t}"]`).forEach(n=>n.innerText=e.Get(t))),Array.from(document.querySelectorAll("*")).filter(e=>e.hasAttribute("data-keyboard-shortcut")).forEach(t=>t.title=`${e.Get("generic->keyboard_shortcut")}: ${t.getAttribute("data-keyboard-shortcut").toUpperCase()}`),Object(o.e)("translationlanguagechange")},e.Get=t=>{const n=t.split("->");let o;switch(e.Language){case"it-it":case"it":o=i;break;default:o=a}for(let e=0;e<n.length-1;e++)o=o[n[e]];return o[n[n.length-1]]},e.IsSupportedLanguage=e=>["en","en-us","it","it-it"].includes(e.toLowerCase()),e})()},function(e,t,n){"use strict";n.d(t,"a",(function(){return r}));var a=n(0),i=n(4),o=n(2);let r=(()=>{class e{static get CurrentUser(){return e.auth.currentUser}static get UserId(){return e.sharedContentUserId||e.CurrentUser.uid}}return e.auth=window.firebase.auth(),e.analytics=window.firebase.analytics(),e.sharedContentUserId=null,e.IsAuthenticated=!1,e.IsSignedIn=!1,e.SignOut=()=>{e.auth.signOut(),Object(a.c)(),location.href="/"},e.DeleteUser=()=>{let t;switch(e.auth.currentUser.providerData[0].providerId){case window.firebase.auth.GoogleAuthProvider.PROVIDER_ID:t=new window.firebase.auth.GoogleAuthProvider}e.auth.signInWithPopup(t).then(t=>e.auth.currentUser.reauthenticateWithCredential(t.credential).then(()=>e.auth.currentUser.delete()))},e.Init=()=>{e.auth.app.options.authDomain="denvelope.com",e.auth.useDeviceLanguage(),e.auth.onAuthStateChanged(t=>e.AuthStateChanged(t))},e.RefreshToken=()=>e.auth.currentUser.getIdToken(!0),e.AuthStateChanged=async t=>{var n;null===(n=document.querySelector(".waiting-user"))||void 0===n||n.remove(),location.href.indexOf("/shared/")>-1&&(e.sharedContentUserId=location.href.split("/")[location.href.split("/").length-1],e.sharedContentUserId.indexOf("/")>-1&&e.sharedContentUserId.substr(0,e.sharedContentUserId.indexOf("/"))),t?(e.IsAuthenticated=null===e.sharedContentUserId||t.uid===e.sharedContentUserId,e.IsSignedIn=!0,i.f.innerText=t.email,i.h.forEach(e=>e.src="/assets/img/icons/user.svg"),t.displayName&&(i.g.innerText=t.displayName),t.photoURL&&await fetch(t.photoURL).then(()=>i.h.forEach(e=>e.src=t.photoURL)).catch(e=>e)):(e.IsAuthenticated=!1,e.IsSignedIn=!1,"/"!==location.pathname&&-1===location.href.indexOf("/shared/")&&!Object(a.p)(document.documentElement.querySelector("main.error"))&&(location.pathname.indexOf("/account")>-1||location.pathname.indexOf("/settings")>-1)?location.href="/":e.LoadFirebaseUi()),e.IsSignedIn?(Object(a.t)(document.documentElement,"signed-out"),Object(a.a)(document.documentElement,"signed-in")):(Object(a.t)(document.documentElement,"signed-in"),Object(a.a)(document.documentElement,"signed-out")),Object(a.e)("userready")},e.LoadFirebaseUi=()=>{const t=document.createElement("script");t.src=`https://www.gstatic.com/firebasejs/ui/4.5.1/firebase-ui-auth__${o.a.Language.substr(0,2)}.js`,t.onload=()=>{const t={signInSuccessUrl:"/"===location.pathname?"account":"",callbacks:{signInSuccessWithAuthResult:t=>(e.analytics.setUserId(t.user.uid),e.analytics.logEvent(t.additionalUserInfo.isNewUser?"sign_up":"login",{method:t.additionalUserInfo.providerId}),!0)},signInOptions:[{provider:window.firebase.auth.GoogleAuthProvider.PROVIDER_ID,authMethod:"https://accounts.google.com",clientId:"1023448327269-h54u9u95f2cqs7m1bceqh9h0p1dskcmk.apps.googleusercontent.com"},window.firebase.auth.FacebookAuthProvider.PROVIDER_ID,window.firebase.auth.TwitterAuthProvider.PROVIDER_ID,window.firebase.auth.GithubAuthProvider.PROVIDER_ID,"yahoo.com","microsoft.com"],credentialHelper:window.firebaseui.auth.CredentialHelper.GOOGLE_YOLO,tosUrl:"terms",privacyPolicyUrl:()=>window.location.assign("privacy")},n=new window.firebaseui.auth.AuthUI(e.auth);n.disableAutoSignIn(),n.start(".firebaseui-auth-container",t)},document.body.append(t)},e})()},function(e,t,n){"use strict";n.d(t,"c",(function(){return i})),n.d(t,"b",(function(){return o})),n.d(t,"e",(function(){return l})),n.d(t,"i",(function(){return c})),n.d(t,"d",(function(){return d})),n.d(t,"h",(function(){return u})),n.d(t,"g",(function(){return m})),n.d(t,"f",(function(){return p})),n.d(t,"a",(function(){return h}));var a=n(0);const i=document.querySelector("header"),o=i.querySelector(".menu-toggle button"),r=document.querySelector(".menu-container"),s=r.querySelector(".menu"),l=s.querySelector(".upgrade-plan"),c=s.querySelector(".storage-info"),d=s.querySelector(".sign-out"),u=document.querySelectorAll("[data-update-field=photo]"),m=document.querySelector("[data-update-field=name]"),p=document.querySelector("[data-update-field=email]"),h=()=>Object(a.m)(r);o.addEventListener("click",()=>"flex"===r.style.display?h():Object(a.v)(r,"flex")),document.addEventListener("click",e=>{s.contains(e.target)||o.contains(e.target)||h()})},function(e,t,n){"use strict";n.d(t,"b",(function(){return r})),n.d(t,"c",(function(){return s})),n.d(t,"a",(function(){return l}));var a=n(0),i=n(1),o=n(2);class r{constructor(e){this.container=document.querySelector(".modal-container").cloneNode(!0),this.element=this.container.querySelector(".modal"),this.spinner=this.element.querySelector(".spinner"),this.Content=this.element.querySelector(".content"),this.CloseButton=this.element.querySelector(".close"),this.ConfirmButton=this.element.querySelector(".confirm"),this.UpdateButton=this.element.querySelector(".update"),this.Show=e=>{this.CloseButton.addEventListener("click",()=>{this.Hide(),this.Remove()}),this.ConfirmButton.addEventListener("click",this.OnConfirm),this.UpdateButton.addEventListener("click",this.OnUpdate),Object(a.p)(e)&&e?document.querySelectorAll(".modal.show:not(.keep-alive)").forEach(e=>e.parentElement.remove()):Object(a.a)(this.element,"keep-alive"),Object(a.l)(this.element,"show")||(Object(a.v)(this.container),Object(a.t)(this.element,"hide"),Object(a.a)(this.element,"show")),document.addEventListener("mouseup",this.HideOnOuterClick),window.addEventListener("keydown",e=>{const t=e.key.toLowerCase();["escape"].includes(t)&&e.preventDefault(),"escape"===t&&this.HideAndRemove()})},this.Hide=()=>{Object(a.t)(this.element,"show"),Object(a.a)(this.element,"hide"),setTimeout(()=>Object(a.m)(this.container),1e3*getComputedStyle(this.element).getPropertyValue("animation-duration").replace(/[a-z]+/g,""))},this.Remove=()=>{this.OnClose(),setTimeout(()=>this.container.remove(),1e3*getComputedStyle(this.element).getPropertyValue("animation-duration").replace(/[a-z]+/g,"")),document.removeEventListener("click",this.HideOnOuterClick)},this.HideAndRemove=()=>{this.Hide(),this.Remove()},this.AppendContent=e=>{Object(a.m)(this.spinner),e.filter(a.p).forEach(e=>this.Content.append(e)),this.Content.querySelectorAll("input").forEach(e=>e.addEventListener("keyup",e=>{"Enter"===e.key&&(this.ConfirmButton.click(),this.UpdateButton.click())}))},this.RemoveContent=()=>{Object(a.v)(this.spinner,"block"),this.Content.innerHTML=""},this.HideOnOuterClick=e=>{this.element.contains(e.target)||Object(a.l)(this.element,"keep-alive")||this.HideAndRemove()},Object(a.p)(e)&&(e.hasOwnProperty("title")&&(this.Title=e.title),e.hasOwnProperty("subtitle")&&(this.Subtitle=e.subtitle),e.hasOwnProperty("allow")&&(e.allow.includes("close")&&Object(a.v)(this.CloseButton,"block"),e.allow.includes("confirm")&&Object(a.v)(this.ConfirmButton,"block"),e.allow.includes("update")&&Object(a.v)(this.UpdateButton,"block")),e.hasOwnProperty("floating")&&e.floating&&(Object(a.a)(this.element,"floating"),Object(a.a)(this.container,"no-background")),e.hasOwnProperty("animate")&&!e.animate&&Object(a.a)(this.element,"no-animate"),e.hasOwnProperty("aside")&&e.aside&&Object(a.a)(this.element,"aside"),e.hasOwnProperty("loading")&&!e.loading?Object(a.m)(this.spinner):Object(a.v)(this.spinner,"block")),this.OnClose=this.OnConfirm=this.OnUpdate=()=>{},document.body.appendChild(this.container)}set Title(e){const t=this.element.querySelector(".title")||document.createElement("h1");t.className="title",t.innerText=e,this.element.querySelector(".heading").insertAdjacentElement("afterbegin",t)}set Subtitle(e){const t=this.element.querySelector(".subtitle")||document.createElement("h4");t.className="subtitle",t.innerText=e,this.element.querySelector(".heading").insertAdjacentElement("beforeend",t)}}class s extends r{constructor(e,t){super({subtitle:e,floating:!0,animate:!1,aside:!0}),this.AppendContent([new i.a("div",{class:"transfer-info",children:[new i.a("div",{class:"progress-bar-container",children:[this.ProgressBar=new i.a("span",{class:"progress-bar"}).element]}).element,new i.a("p",{class:"status",children:[this.TransferSize=new i.a("span",{class:"transfer-size",innerText:0}).element,new i.a("span",{class:"tot-size",innerText:` / ${Object(a.g)(t)}`}).element]}).element]}).element,new i.a("div",{class:"upload-controls",children:[new i.a("button",{class:"pause upload-control",children:[new i.a("i",{class:"fas fa-pause fa-fw"}).element]}).element,new i.a("button",{class:"resume upload-control",children:[new i.a("i",{class:"fas fa-play fa-fw"}).element]}).element,new i.a("button",{class:"cancel upload-control",children:[new i.a("i",{class:"fas fa-times fa-fw"}).element]}).element]}).element]);const n=this.element.querySelector(".pause"),o=this.element.querySelector(".resume"),r=this.element.querySelector(".cancel");n.addEventListener("click",()=>{Object(a.m)(n),Object(a.v)(o,"block"),this.OnPause()}),o.addEventListener("click",()=>{Object(a.m)(o),Object(a.v)(n,"block"),this.OnResume()}),r.addEventListener("click",this.OnCancel),this.Show()}}class l extends r{constructor(e,t){super({subtitle:`${o.a.Get("api->messages->file->downloading")}: ${e}`,floating:!0,animate:!1,aside:!0}),this.AppendContent([new i.a("div",{class:"transfer-info",children:[new i.a("div",{class:"progress-bar-container",children:[this.ProgressBar=new i.a("span",{class:"progress-bar"}).element]}).element,new i.a("p",{class:"status",children:[this.TransferSize=new i.a("span",{class:"transfer-size",innerText:0}).element,new i.a("span",{class:"tot-size",innerText:` / ${Object(a.g)(t)}`}).element]}).element]}).element]),this.Show()}}},function(e,t,n){"use strict";n.d(t,"a",(function(){return c})),n.d(t,"b",(function(){return d}));var a=n(0);const i=document.querySelector(".generic-message"),o=i.querySelector("p"),r=i.querySelector(".action"),s=i.querySelector(".dismiss");let l;const c=(e,t,n=2e3)=>new Promise((c,d)=>{o.innerText=e,Object(a.p)(t)?(r.innerText=t,Object(a.v)(r,"block")):Object(a.m)(r),Object(a.v)(i,"flex"),n>=0&&(l=setTimeout(u,n)),s.addEventListener("click",()=>{clearTimeout(l),u()}),r.addEventListener("click",()=>{c(),clearTimeout(l),u()})}),d=()=>{c("",null,-1),Object(a.m)(s),Object(a.v)(i.querySelector(".spinner"),"block")},u=()=>Object(a.m)(i)},function(e,t,n){"use strict";n.d(t,"a",(function(){return d}));var a=n(0),i=n(3),o=n(4),r=n(6),s=n(2);let l=(()=>{class e{constructor(){this.IsSupported=()=>"serviceWorker"in navigator,this.Register=()=>{let t,n;window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").then(e=>{navigator.serviceWorker.controller&&(e.waiting?this.UpdateReady(e.waiting):e.installing?this.TrackInstalling(e.installing):e.addEventListener("updatefound",()=>this.TrackInstalling(e.installing)))})),navigator.serviceWorker.addEventListener("controllerchange",()=>{t||(window.location.reload(),t=!0)});const i=document.querySelector(".install-pwa"),o=document.querySelector(".install-pwa + hr");window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),n=e,Object(a.w)([i,o],"block")}),window.addEventListener("appinstalled",()=>e.analytics.logEvent("install")),i.addEventListener("click",()=>{n.prompt(),n.userChoice.then(e=>{"accepted"===e.outcome&&Object(a.n)([i,o]),n=null})})},this.TrackInstalling=e=>e.addEventListener("statechange",()=>{"installed"===e.state&&this.UpdateReady(e)}),this.UpdateReady=t=>{r.a(s.a.Get("pwa->update_available"),s.a.Get("generic->update"),-1).then(()=>{r.b(),e.analytics.logEvent("update"),window.firebase.firestore().terminate(),t.postMessage({action:"skipWaiting"})})},this.IsSupported()&&this.Register()}}return e.analytics=window.firebase.analytics(),e})();var c=n(5);const d=()=>{const e=window.firebase.firestore(),t=parseInt(localStorage.getItem("cache-size"));t&&e.settings({cacheSizeBytes:t,ignoreUndefinedProperties:!0}),e.enablePersistence({synchronizeTabs:!0}),window.addEventListener("translationlanguagechange",()=>document.querySelectorAll(".plans .plan").forEach(e=>{e.querySelector(".price").innerText=Intl.NumberFormat(s.a.Language,{style:"currency",currency:s.a.Get("settings->plan->currency"),minimumFractionDigits:0}).format(parseInt(s.a.Get(`settings->plan->plans->${e.getAttribute("data-max-storage")}->price->month`))).replace(/\s/,""),e.querySelector(".billing-period").innerText=` / ${s.a.Get("generic->month").toLowerCase()}`,e.querySelector(".storage").innerText=e.getAttribute("data-max-storage")})),s.a.Init();document.querySelector("#change-language .edit");const n=document.querySelector("#language-select");document.querySelector("#change-language .edit").addEventListener("click",()=>{const e=new c.b({title:s.a.Get("generic->language"),allow:["close","confirm"]});e.AppendContent([n]),n.selectedIndex=n.querySelector(`[value^=${s.a.Language}]`).index,e.OnConfirm=()=>{s.a.Init(n.selectedOptions[0].value),e.HideAndRemove()},e.Show(!0)}),i.a.Init(),Object(a.r)();const r=document.querySelector(".cookie-banner");new l,localStorage.getItem("cookie-consent")||(Object(a.v)(r,"flex"),r.querySelector("i:last-child").addEventListener("click",()=>Object(a.m)(document.querySelector(".cookie-banner")))),localStorage.setItem("cookie-consent","true"),Object(a.s)(),Object(a.q)()&&Object(a.a)(document.documentElement,"touch"),document.addEventListener("contextmenu",e=>{null===e.target.closest(".allow-context-menu")&&e.preventDefault()});const d=document.querySelector(".firebaseui-auth-container");document.querySelectorAll(".sign-in").forEach(e=>e.addEventListener("click",()=>{d.style.display="flex"})),d.addEventListener("click",e=>{const t=e.target;["button","a","p"].includes(t.tagName.toLowerCase())||(d.style.display="none")}),o.d.addEventListener("click",()=>i.a.SignOut()),window.addEventListener("load",()=>Object(a.t)(document.body,"preload")),window.addEventListener("keydown",e=>{if(["input","textarea"].includes(document.activeElement.tagName.toLowerCase()))return;const t=e.key.toLowerCase();["m","a","e","h","s"].includes(t)&&e.preventDefault(),"m"===t?o.b.click():"a"===t?location.href="/account":"e"===t?o.d.click():"h"===t?location.href="/":"s"!==t||e.ctrlKey||(location.href="/settings")}),window.addEventListener("userready",()=>{i.a.IsAuthenticated&&e.collection("users").doc(i.a.UserId).onSnapshot(e=>{if(!e.exists)return;const t=e.data().usedStorage,n=e.data().maxStorage,i=`${+(t/n*100).toFixed(2)}%`,r=document.querySelector("[data-update-field=used-storage]"),s=document.querySelector("[data-update-field=max-storage]");r.innerHTML=Object(a.g)(t),r.setAttribute("data-bytes",t),s.innerHTML=Object(a.g)(n),s.setAttribute("data-bytes",n),document.querySelector("[data-update-field=used-storage-percent]").innerHTML=`(${i})`,document.querySelector(".storage .used").style.width=i,t>0?Object(a.v)(o.i):Object(a.m)(o.i),Object(a.o)(n)?Object(a.v)(o.e):Object(a.m)(o.e)})}),window.addEventListener("securitypolicyviolation",e=>console.error(e))}},function(e,t,n){"use strict";n.r(t),n(7).a()}]);