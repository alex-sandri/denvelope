"use strict";
const cacheName = "static-v2653";
self.addEventListener("install", (e) => e.waitUntil(caches.open(cacheName).then(cache => cache.addAll([
    "/",
    "/account",
    "/settings",
    "/plans",
    "/terms",
    "/privacy",
    "/cookies",
    "/accessibility",
    "/assets/css/bundle.204ecd0ccf4ac46c32d2ad97ec2a6760.css",
    "/assets/js/home.7024f866182fa05ea0f5.js",
    "/assets/js/account.61d9b540317c0fc7cd76.js",
    "/assets/js/settings.30cfcf023c6c4b1151f3.js",
    "/__/firebase/7.15.0/firebase-app.js",
    "/__/firebase/7.15.0/firebase-auth.js",
    "/__/firebase/7.15.0/firebase-firestore.js",
    "/__/firebase/7.15.0/firebase-storage.js",
    "/__/firebase/7.15.0/firebase-functions.js",
    "/__/firebase/7.15.0/firebase-analytics.js",
    "/__/firebase/7.15.0/firebase-performance.js",
    "/__/firebase/init.js",
    "https://www.gstatic.com/firebasejs/ui/4.5.1/firebase-ui-auth__en.js",
    "https://www.gstatic.com/firebasejs/ui/4.5.1/firebase-ui-auth__it.js",
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
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then(cacheNames => Promise.all(cacheNames.filter(cache => cache !== cacheName).map(cache => caches.delete(cache))))));
self.addEventListener("fetch", (e) => {
    const url = new URL(e.request.url);
    if (url.origin === location.origin && url.pathname === "/account" && e.request.method === "POST") {
        e.respondWith(Response.redirect("/account"));
        e.waitUntil(new Promise(async (resolve) => {
            await NextMessage("ready");
            const data = await e.request.formData();
            const client = await self.clients.get(e.resultingClientId);
            const file = data.get("file");
            client.postMessage({ file });
            resolve();
        }));
        return;
    }
    if (url.origin === location.origin && url.pathname === "/create-file") {
        e.respondWith(Response.redirect("/account"));
        e.waitUntil(new Promise(async (resolve) => {
            await NextMessage("ready");
            const client = await self.clients.get(e.resultingClientId);
            client.postMessage({ add: "file" });
            resolve();
        }));
        return;
    }
    else if (url.origin === location.origin && url.pathname === "/create-folder") {
        e.respondWith(Response.redirect("/account"));
        e.waitUntil(new Promise(async (resolve) => {
            await NextMessage("ready");
            const client = await self.clients.get(e.resultingClientId);
            client.postMessage({ add: "folder" });
            resolve();
        }));
        return;
    }
    const respondWith = (path) => {
        e.respondWith(caches.open(cacheName).then(cache => cache.match(path)
            .then(response => response || fetch(path).then(response => {
            if (e.request.method === "GET" && !url.href.includes("googleapis"))
                cache.put(path, response.clone());
            return response;
        }))));
    };
    if (url.origin === location.origin && ["/en", "/it"].includes(url.pathname)) {
        respondWith("/");
        return;
    }
    else if (url.origin === location.origin &&
        (url.pathname.startsWith("/folder") ||
            url.pathname.startsWith("/file") ||
            url.pathname.startsWith("/account"))) {
        respondWith("/account");
        return;
    }
    else if (url.origin === location.origin && url.pathname.startsWith("/settings/")) {
        respondWith("/settings");
        return;
    }
    if (url.origin === location.origin && url.pathname.startsWith("/assets/img/icons/languages/") && !navigator.onLine) {
        e.respondWith(caches.open(cacheName)
            .then(cache => cache.match(e.request)
            .then(cacheResponse => cacheResponse || cache.match(`/assets/img/icons/languages/${url.pathname.includes("folder") ? "folder" : "file"}.svg?v=2`)
            .then(defaultResponse => defaultResponse))));
        return;
    }
    respondWith(e.request);
});
self.addEventListener("message", e => {
    if (e.data.action === "skipWaiting")
        self.skipWaiting();
});
const nextMessageResolveMap = new Map();
const NextMessage = (dataVal) => new Promise((resolve) => {
    var _a;
    if (!nextMessageResolveMap.has(dataVal))
        nextMessageResolveMap.set(dataVal, []);
    (_a = nextMessageResolveMap.get(dataVal)) === null || _a === void 0 ? void 0 : _a.push(resolve);
});
self.addEventListener("message", (event) => {
    const resolvers = nextMessageResolveMap.get(event.data);
    if (!resolvers)
        return;
    nextMessageResolveMap.delete(event.data);
    for (const resolve of resolvers)
        resolve();
});
