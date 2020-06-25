import { version, static as staticAssets, dynamic } from "../config/assets.json";

const cacheName : string = `static-v${version}`;

self.addEventListener("install", (e : any) =>
	e.waitUntil(caches.open(cacheName).then(cache => cache.addAll([
		...staticAssets,
		`${dynamic.css.rootDir}/${dynamic.css.bundle}`,
		`${dynamic.js.rootDir}/${dynamic.js.index}`,
		`${dynamic.js.rootDir}/${dynamic.js.account}`,
		`${dynamic.js.rootDir}/${dynamic.js.settings}`,
	]))));

self.addEventListener("activate", (e : any) =>
	e.waitUntil(caches.keys().then(cacheNames =>
		Promise.all(cacheNames
			.filter(cache => cache !== cacheName)
			.map(cache => caches.delete(cache))))));

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

	if (url.origin === location.origin && url.pathname === "/create-file")
	{
		e.respondWith(Response.redirect("/account"));

		e.waitUntil(new Promise(async resolve =>
		{
			await NextMessage("ready");

			const client = await (<any>self).clients.get(e.resultingClientId);

			client.postMessage({ add: "file" });

			resolve();
		}));

		return;
	}
	if (url.origin === location.origin && url.pathname === "/create-folder")
	{
		e.respondWith(Response.redirect("/account"));

		e.waitUntil(new Promise(async resolve =>
		{
			await NextMessage("ready");

			const client = await (<any>self).clients.get(e.resultingClientId);

			client.postMessage({ add: "folder" });

			resolve();
		}));

		return;
	}

	const respondWith = (path: string) =>
	{
		e.respondWith(caches.open(cacheName).then(cache => cache.match(path)
			.then(cacheResponse => cacheResponse || fetch(path).then(fetchResponse =>
			{
				if (e.request.method === "GET" && !url.href.includes("googleapis")) cache.put(path, fetchResponse.clone());

				return fetchResponse;
			}))));
	};

	if (url.origin === location.origin && [ "/en", "/it" ].includes(url.pathname))
	{
		respondWith("/");

		return;
	}
	if (url.origin === location.origin
		&& (url.pathname.startsWith("/folder")
		|| url.pathname.startsWith("/file")
		|| url.pathname.startsWith("/account")))
	{
		respondWith("/account");

		return;
	}
	if (url.origin === location.origin && url.pathname.startsWith("/settings/"))
	{
		respondWith("/settings");

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

	respondWith(e.request);
});

self.addEventListener("message", e =>
{
	if (e.data.action === "skipWaiting") (<any>self).skipWaiting();
});

const nextMessageResolveMap: Map<string, (() => void)[]> = new Map();

const NextMessage = (dataVal: string) : Promise<void> => new Promise(resolve =>
{
	if (!nextMessageResolveMap.has(dataVal)) nextMessageResolveMap.set(dataVal, []);

	nextMessageResolveMap.get(dataVal)?.push(resolve);
});

self.addEventListener("message", event =>
{
	const resolvers = nextMessageResolveMap.get(event.data);

	if (!resolvers) return;

	nextMessageResolveMap.delete(event.data);

	resolvers.forEach(resolve => resolve());
});