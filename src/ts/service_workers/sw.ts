const cacheName : string = "static-v2275";

self.addEventListener("install", (e : any) =>
    e.waitUntil(caches.open(cacheName).then(cache => cache.addAll([
        "/",
        "/account",
        "/settings",
        "/terms",
        "/privacy",
        "/cookies",
        "/accessibility",
        "/assets/css/bundle.bece63c496e1a59a2c82af48af11649d.css",
        "/assets/js/home.9cfe96d05c9f2c171c41.js",
        "/assets/js/account.4e47c1c8095101d2dddb.js",
        "/assets/js/settings.14ea5dabf2428129bbce.js",
        "/__/firebase/7.14.4/firebase-app.js",
        "/__/firebase/7.14.4/firebase-auth.js",
        "/__/firebase/7.14.4/firebase-firestore.js",
        "/__/firebase/7.14.4/firebase-storage.js",
        "/__/firebase/7.14.4/firebase-functions.js",
        "/__/firebase/7.14.4/firebase-analytics.js",
        "/__/firebase/7.14.4/firebase-performance.js",
        "/__/firebase/init.js",
        "https://www.gstatic.com/firebasejs/ui/4.5.0/firebase-ui-auth__en.js",
        "https://www.gstatic.com/firebasejs/ui/4.5.0/firebase-ui-auth__it.js",
        "/editor/0.20.0/min/vs/loader.js",
        "/editor/0.20.0/min/vs/editor/editor.main.nls.js",
        "/editor/0.20.0/min/vs/editor/editor.main.js",
        "/assets/img/miscellaneous/empty.svg",
        "/assets/img/miscellaneous/file-sync.svg",
        "/assets/img/miscellaneous/open-source.svg",
        "/assets/img/miscellaneous/share.svg",
        "/assets/img/miscellaneous/source-code.svg",
        "/assets/img/miscellaneous/starred.svg",
        "/assets/img/miscellaneous/trash.svg",
        "/assets/img/miscellaneous/offline.svg",
        "/assets/img/miscellaneous/vault.svg?v=2",
        "/assets/img/miscellaneous/pwa.svg",
        "/assets/img/miscellaneous/web-developer.svg",
        "/assets/img/icons/languages/file.svg?v=2",
        "/assets/img/icons/languages/folder.svg?v=2",
        "/assets/img/icons/languages/lock.svg",
        "/assets/img/icons/user.svg",
        "/android-chrome-36x36.png",
        "/android-chrome-48x48.png",
        "/android-chrome-72x72.png",
        "/android-chrome-96x96.png",
        "/android-chrome-144x144.png",
        "/android-chrome-192x192.png",
        "/android-chrome-256x256.png",
        "/android-chrome-384x384.png",
        "/android-chrome-512x512.png",
        "/apple-touch-icon.png",
        "/apple-touch-icon-precomposed.png",
        "/apple-touch-icon-57x57.png",
        "/apple-touch-icon-57x57-precomposed.png",
        "/apple-touch-icon-60x60.png",
        "/apple-touch-icon-60x60-precomposed.png",
        "/apple-touch-icon-72x72.png",
        "/apple-touch-icon-72x72-precomposed.png",
        "/apple-touch-icon-76x76.png",
        "/apple-touch-icon-76x76-precomposed.png",
        "/apple-touch-icon-114x114.png",
        "/apple-touch-icon-114x114-precomposed.png",
        "/apple-touch-icon-120x120.png",
        "/apple-touch-icon-120x120-precomposed.png",
        "/apple-touch-icon-144x144.png",
        "/apple-touch-icon-144x144-precomposed.png",
        "/apple-touch-icon-152x152.png",
        "/apple-touch-icon-152x152-precomposed.png",
        "/apple-touch-icon-180x180.png",
        "/apple-touch-icon-180x180-precomposed.png",
        "/browserconfig.xml",
        "/favicon.ico",
        "/favicon-16x16.png",
        "/favicon-32x32.png",
        "/favicon-194x194.png",
        "/mstile-70x70.png",
        "/mstile-144x144.png",
        "/mstile-150x150.png",
        "/mstile-310x150.png",
        "/mstile-310x310.png",
        "/safari-pinned-tab.svg",
    ]))));

self.addEventListener("activate", (e : any) =>
    e.waitUntil(caches.keys().then(cacheNames => Promise.all(cacheNames.filter(cache => cache !== cacheName).map(cache => caches.delete(cache))))));

self.addEventListener("fetch", (e : any) =>
{
    const url = new URL(e.request.url);

    if (url.origin === location.origin && url.pathname === "/account" && e.request.method === "POST")
    {
        e.respondWith(Response.redirect("/account"));

        e.waitUntil(new Promise(async resolve =>
        {
            await NextMessage("ready");

            const data = await e.request.formData();
            const client = await (<any>self).clients.get(e.resultingClientId);
            
            const file = data.get("file");
            
            client.postMessage({ file });

            resolve();
        }));

        return;
    }
    
    if (url.origin === location.origin && url.pathname === "/add-file")
    {
        e.respondWith(Response.redirect("/account"));

        e.waitUntil(new Promise(async (resolve) =>
        {
            await NextMessage("ready");

            const client = await (<any>self).clients.get(e.resultingClientId);
            
            client.postMessage({ add: "file" });

            resolve();
        }));

        return;
    }
    else if (url.origin === location.origin && url.pathname === "/add-folder")
    {
        e.respondWith(Response.redirect("/account"));

        e.waitUntil(new Promise(async (resolve) =>
        {
            await NextMessage("ready");

            const client = await (<any>self).clients.get(e.resultingClientId);
            
            client.postMessage({ add: "folder" });

            resolve();
        }));

        return;
    }

    if (url.origin === location.origin &&
        (url.pathname.startsWith("/folder") ||
        url.pathname.startsWith("/file") ||
        url.pathname.startsWith("/account")))
    {
        e.respondWith(caches.open(cacheName).then(cache => cache.match("/account").then(response => response)));

        return;
    }
    else if (url.origin === location.origin && url.pathname.startsWith("/settings/"))
    {
        e.respondWith(caches.open(cacheName).then(cache => cache.match("/settings").then(response => response)));

        return;
    }

    if (url.origin === location.origin && url.pathname.startsWith("/assets/img/icons/languages/") && !navigator.onLine)
    {
        e.respondWith(caches.open(cacheName)
            .then(cache => cache.match(e.request)
            .then(cacheResponse => cacheResponse || cache.match(`/assets/img/icons/languages/${url.pathname.includes("folder") ? "folder" : "file"}.svg?v=2`)
            .then(defaultResponse => defaultResponse))));

        return;
    }

    e.respondWith(caches.open(cacheName).then(cache => cache.match(e.request)
        .then(response => response || fetch(e.request).then(response =>
        {
            if (e.request.method === "GET" && !url.href.includes("googleapis")) cache.put(e.request, response.clone());

            return response;
        }))));
});

self.addEventListener("message", e =>
{
    if (e.data.action === "skipWaiting") (<any>self).skipWaiting();
});

const nextMessageResolveMap = new Map<string, (() => void)[]>();

const NextMessage = (dataVal: string) : Promise<void> => new Promise((resolve) => {
    if (!nextMessageResolveMap.has(dataVal)) nextMessageResolveMap.set(dataVal, []);

    nextMessageResolveMap.get(dataVal)?.push(resolve);
});

self.addEventListener("message", (event) =>
{
    const resolvers = nextMessageResolveMap.get(event.data);

    if (!resolvers) return;

    nextMessageResolveMap.delete(event.data);

    for (const resolve of resolvers) resolve();
});