const CACHE_NAME = "seat-snaps-v3";
const STATIC_ASSETS = [
  "/manifest.json",
  "/manifest-attendee.json",
];
const IS_DEV = new URL(self.location.href).searchParams.get("dev") === "1";

self.addEventListener("install", (event) => {
  if (IS_DEV) {
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  if (IS_DEV) {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
    );
    self.clients.claim();
    return;
  }

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("push", (event) => {
  let data = { title: "SeatSnaps", body: "You have a new notification.", url: "/" };
  try {
    data = Object.assign(data, event.data?.json());
  } catch {}

  const title = typeof data.title === "string" && data.title.trim() ? data.title : "SeatSnaps";
  const body = typeof data.body === "string" && data.body.trim()
    ? data.body
    : "You have a new notification.";
  const url = typeof data.url === "string" && data.url.trim() ? data.url : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Skip duplicates only when the app is actively focused in foreground.
      if (clients.some((c) => c.visibilityState === "visible" && c.focused)) return;

      return self.registration
        .showNotification(title, {
          body,
          data: { url },
        })
        .catch(() =>
          self.registration.showNotification("SeatSnaps", {
            body: "You have a new update.",
            data: { url: "/" },
          }),
        );
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(self.location.origin));
        if (existing) {
          existing.focus();
          return existing.navigate(url);
        }
        return self.clients.openWindow(url);
      }),
  );
});

self.addEventListener("fetch", (event) => {
  if (IS_DEV) {
    return;
  }

  const url = new URL(event.request.url);

  // Network-first for API, auth, and navigation requests
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/_next") ||
    event.request.mode === "navigate"
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    }),
  );
});
