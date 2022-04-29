/// <reference lib="webworker" />
// CREDIT: https://dev.to/100lvlmaster/create-a-pwa-with-sveltekit-svelte-a36

import { build, files, version } from '$service-worker';

const worker = self as unknown as ServiceWorkerGlobalScope;
// Files to cache
const forCaching = build.concat(files);
const cacheVersion = `cache${version}`;
const cachedFile = new Set(forCaching);

// On install, caches all files
worker.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(cacheVersion)
			.then((cache) => cache.addAll(forCaching))
			.then(() => worker.skipWaiting())
	);
});

worker.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			for (const key of keys) {
				if (key !== cacheVersion) await caches.delete(key);
			}
			worker.clients.claim();
		})
	);
});

async function fetchAndCache(request: Request) {
	const cache = await caches.open(`offline${version}`);

	try {
		const respose = await fetch(request);
		cache.put(request, respose.clone());
		return respose;
	} catch (error) {
		const response = await cache.match(request);
		if (response) return response;
		throw error;
	}
}

worker.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET' || event.request.headers.has('range')) return;

	const url = new URL(event.request.url);

	const isHttp = url.protocol.startsWith('http');
	const isDevServerRequest =
		url.hostname === self.location.hostname && url.port !== self.location.port;
	const isCachedFile = url.host === self.location.host && cachedFile.has(url.pathname);
	const skipForUncached = event.request.cache === 'only-if-cached' && !isCachedFile;

	if (isHttp && !isDevServerRequest && !skipForUncached) {
		event.respondWith(
			(async () => {
				const theCachedFile = isCachedFile && (await caches.match(event.request));
				return theCachedFile || fetchAndCache(event.request);
			})()
		);
	}
});
