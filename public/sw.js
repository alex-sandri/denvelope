"use strict";
const cacheName = "static-v2927";
self.addEventListener("install", (e) => e.waitUntil(caches.open(cacheName).then(cache => cache.addAll([
    "/",
    "/account",
    "/settings",
    "/plans",
    "/terms",
    "/privacy",
    "/cookies",
    "/accessibility",
    "/assets/css/bundle.195112e6609ef55c5d5887603bd793c1.css",
    "/assets/js/home.ce8d3c2e676608f82572.js",
    "/assets/js/account.0104db1c0d3f7a7a4436.js",
    "/assets/js/settings.33c890d460d02696f8da.js",
    "/__/firebase/7.15.2/firebase-app.js",
    "/__/firebase/7.15.2/firebase-auth.js",
    "/__/firebase/7.15.2/firebase-firestore.js",
    "/__/firebase/7.15.2/firebase-storage.js",
    "/__/firebase/7.15.2/firebase-functions.js",
    "/__/firebase/7.15.2/firebase-analytics.js",
    "/__/firebase/7.15.2/firebase-performance.js",
    "/__/firebase/init.js",
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
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then(cacheNames => Promise.all(cacheNames
    .filter(cache => cache !== cacheName)
    .map(cache => caches.delete(cache))))));
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
    if (url.origin === location.origin && url.pathname === "/create-folder") {
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
            .then(cacheResponse => cacheResponse || fetch(path).then(fetchResponse => {
            if (e.request.method === "GET" && !url.href.includes("googleapis"))
                cache.put(path, fetchResponse.clone());
            return fetchResponse;
        }))));
    };
    if (url.origin === location.origin && ["/en", "/it"].includes(url.pathname)) {
        respondWith("/");
        return;
    }
    if (url.origin === location.origin
        && (url.pathname.startsWith("/folder")
            || url.pathname.startsWith("/file")
            || url.pathname.startsWith("/account"))) {
        respondWith("/account");
        return;
    }
    if (url.origin === location.origin && url.pathname.startsWith("/settings/")) {
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
const NextMessage = (dataVal) => new Promise(resolve => {
    var _a;
    if (!nextMessageResolveMap.has(dataVal))
        nextMessageResolveMap.set(dataVal, []);
    (_a = nextMessageResolveMap.get(dataVal)) === null || _a === void 0 ? void 0 : _a.push(resolve);
});
self.addEventListener("message", event => {
    const resolvers = nextMessageResolveMap.get(event.data);
    if (!resolvers)
        return;
    nextMessageResolveMap.delete(event.data);
    resolvers.forEach(resolve => resolve());
});
