"use strict";
const cacheName = "static-v1282";
self.addEventListener("install", (e) => e.waitUntil(caches.open(cacheName).then(cache => cache.addAll([
    "/",
    "/account",
    "/settings",
    "/terms",
    "/privacy",
    "/cookies",
    "/accessibility",
    "/assets/css/bundle.289bc06e48929236fe23270665ed375f.css",
    "/assets/js/home.66295f1f4baee4475f63.js",
    "/assets/js/account.0e12a644d54b39cf84c3.js",
    "/assets/js/settings.c4719d82853a4a682751.js",
    "/__/firebase/7.12.0/firebase-app.js",
    "/__/firebase/7.12.0/firebase-auth.js",
    "/__/firebase/7.12.0/firebase-firestore.js",
    "/__/firebase/7.12.0/firebase-storage.js",
    "/__/firebase/7.12.0/firebase-functions.js",
    "/__/firebase/7.12.0/firebase-analytics.js",
    "/__/firebase/7.12.0/firebase-performance.js",
    "/__/firebase/init.js",
    "https://www.gstatic.com/firebasejs/ui/4.5.0/firebase-ui-auth.css",
    "https://www.gstatic.com/firebasejs/ui/4.5.0/firebase-ui-auth__en.js",
    "https://www.gstatic.com/firebasejs/ui/4.5.0/firebase-ui-auth__it.js",
    "/editor/0.20.0/min/vs/loader.js",
    "/editor/0.20.0/min/vs/editor/editor.main.nls.js",
    "/editor/0.20.0/min/vs/editor/editor.main.js",
    "/assets/font/SourceCodePro/ExtraLight.ttf",
    "/assets/font/SourceCodePro/ExtraLight-Italic.ttf",
    "/assets/font/SourceCodePro/Light.ttf",
    "/assets/font/SourceCodePro/Light-Italic.ttf",
    "/assets/font/SourceCodePro/Regular.ttf",
    "/assets/font/SourceCodePro/Regular-Italic.ttf",
    "/assets/font/SourceCodePro/Medium.ttf",
    "/assets/font/SourceCodePro/Medium-Italic.ttf",
    "/assets/font/SourceCodePro/SemiBold.ttf",
    "/assets/font/SourceCodePro/SemiBold-Italic.ttf",
    "/assets/font/SourceCodePro/Bold.ttf",
    "/assets/font/SourceCodePro/Bold-Italic.ttf",
    "/assets/font/SourceCodePro/Black.ttf",
    "/assets/font/SourceCodePro/Black-Italic.ttf",
    "/assets/img/miscellaneous/empty.svg",
    "/assets/img/miscellaneous/file-sync.svg",
    "/assets/img/miscellaneous/open-source.svg",
    "/assets/img/miscellaneous/share.svg",
    "/assets/img/miscellaneous/source-code.svg",
    "/assets/img/miscellaneous/starred.svg",
    "/assets/img/miscellaneous/trash.svg",
    "/assets/img/miscellaneous/offline.svg",
    "/assets/img/miscellaneous/vault.svg?v=2",
    "/assets/img/miscellaneous/web-developer.svg",
    "/assets/img/icons/languages/file.svg?v=2",
    "/assets/img/icons/languages/folder.svg?v=2",
    "/assets/img/icons/languages/lock.svg",
    "/assets/img/icons/user.svg",
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
    if (url.origin === location.origin && url.pathname === "/add-file") {
        e.respondWith(Response.redirect("/account"));
        e.waitUntil(new Promise(async (resolve) => {
            await NextMessage("ready");
            const client = await self.clients.get(e.resultingClientId);
            client.postMessage({ add: "file" });
            resolve();
        }));
        return;
    }
    else if (url.origin === location.origin && url.pathname === "/add-folder") {
        e.respondWith(Response.redirect("/account"));
        e.waitUntil(new Promise(async (resolve) => {
            await NextMessage("ready");
            const client = await self.clients.get(e.resultingClientId);
            client.postMessage({ add: "folder" });
            resolve();
        }));
        return;
    }
    if (url.origin === location.origin &&
        (url.pathname.startsWith("/folder") ||
            url.pathname.startsWith("/file") ||
            url.pathname === "/account/shared" ||
            url.pathname === "/account/starred" ||
            url.pathname === "/account/trash" ||
            url.pathname === "/account/vault")) {
        e.respondWith(caches.open(cacheName).then(cache => cache.match("/account").then(response => response)));
        return;
    }
    else if (url.origin === location.origin && url.pathname.startsWith("/settings/")) {
        e.respondWith(caches.open(cacheName).then(cache => cache.match("/settings").then(response => response)));
        return;
    }
    if (url.origin === location.origin && url.pathname.startsWith("/assets/img/icons/languages/") && !navigator.onLine) {
        e.respondWith(caches.open(cacheName)
            .then(cache => cache.match(e.request)
            .then(cacheResponse => cacheResponse || cache.match(`/assets/img/icons/languages/${url.pathname.includes("folder") ? "folder" : "file"}.svg?v=2`)
            .then(defaultResponse => defaultResponse))));
        return;
    }
    e.respondWith(caches.open(cacheName).then(cache => cache.match(e.request)
        .then(response => response || fetch(e.request).then(response => {
        if (e.request.method === "GET" && !url.href.includes("googleapis"))
            cache.put(e.request, response.clone());
        return response;
    }))));
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
