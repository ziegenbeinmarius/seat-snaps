"use client";

import { useMutation } from "@tanstack/react-query";
import { clientFetch } from "@/lib/client-api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function getVapidPublicKey(): Promise<string> {
  const res = await fetch(`${API_URL}/api/push-subscriptions/vapid-key`);
  if (!res.ok) throw new Error("Failed to fetch VAPID key");
  const data = (await res.json()) as { publicKey: string };
  return data.publicKey;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function subscribeToPush(eventId: string): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const vapidKey = await getVapidPublicKey();
  if (!vapidKey) return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey) as ArrayBuffer,
  });

  const json = subscription.toJSON();
  await clientFetch(`/push-subscriptions/attendee/${eventId}`, "push-subscriptions", {
    method: "POST",
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
    }),
  });

  return true;
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
