"use client";

import { useMutation } from "@tanstack/react-query";
import { clientFetch } from "@/lib/client-api";

export async function getVapidPublicKey(): Promise<string> {
  const data = await clientFetch<{ publicKey: string }>(
    "/push-subscriptions/vapid-key",
    "push-subscriptions",
  );
  
  return data.publicKey;
}

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(rawData.length));

  for (let index = 0; index < rawData.length; index += 1) {
    bytes[index] = rawData.charCodeAt(index);
  }

  return bytes.buffer;
}

async function saveSubscription(eventId: string, subscription: PushSubscription): Promise<void> {
  const json = subscription.toJSON();
  const keys = json.keys;

  if (!json.endpoint || !keys?.p256dh || !keys.auth) {
    throw new Error("Push subscription is missing required keys");
  }

  await clientFetch(`/push-subscriptions/attendee/${eventId}`, "push-subscriptions", {
    method: "POST",
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys,
    }),
  });
}

async function ensurePushSubscription(eventId: string, requestPermission: boolean): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

  const permission = requestPermission
    ? await Notification.requestPermission()
    : Notification.permission;
  if (permission !== "granted") return false;
  
  const vapidKey = await getVapidPublicKey();
  if (!vapidKey) return false;

  const registration = await navigator.serviceWorker.ready;
  
  const existingSubscription = await registration.pushManager.getSubscription();
  
  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToArrayBuffer(vapidKey),
    }));

  await saveSubscription(eventId, subscription);

  return true;
}

export async function subscribeToPush(eventId: string): Promise<boolean> {
  return ensurePushSubscription(eventId, true);
}

export async function syncPushSubscription(eventId: string): Promise<boolean> {
  return ensurePushSubscription(eventId, false);
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();

  await clientFetch(`/push-subscriptions/attendee`, "push-subscriptions", {
    method: "DELETE",
    body: JSON.stringify({ endpoint }),
  });
}

export function useSubscribeToPush(eventId: string) {
  return useMutation<boolean, Error>({
    mutationFn: () => subscribeToPush(eventId),
  });
}
