"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  PhotoResponse,
  UploadUrlResponse,
  UpdatePhotoStatusInput,
} from "@seat-snaps/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ?? (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : "http://localhost:3001");

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}/api${path}`;
  const method = init?.method ?? "GET";

  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
  }).catch((error: unknown) => {
    console.error("[photos api] network failure", {
      method,
      path,
      url,
      error,
    });
    throw new Error(
      `Could not reach API for ${method} ${path}. Check NEXT_PUBLIC_API_URL (${API_BASE}) and API availability.`,
    );
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray((err as { message?: string | string[] }).message)
      ? (err as { message: string[] }).message.join(", ")
      : (err as { message?: string }).message;

    console.error("[photos api] request failed", {
      method,
      path,
      url,
      status: res.status,
      statusText: res.statusText,
      errorBody: err,
    });

    throw new Error(message ?? `Request failed (${res.status} ${res.statusText}) for ${method} ${path}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Attendee hooks (use attendee-session cookie automatically via credentials: "include")
export function useAttendeePhotos(eventId: string) {
  return useQuery<PhotoResponse[]>({
    queryKey: ["events", eventId, "photos", "gallery"],
    queryFn: () => fetchApi(`/events/${eventId}/photos/gallery`),
    enabled: !!eventId,
  });
}

export function useRequestUploadUrl(eventId: string) {
  return useMutation<UploadUrlResponse, Error, { contentType: string }>({
    mutationFn: (data) =>
      fetchApi(`/events/${eventId}/photos/upload-url`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useConfirmUpload(eventId: string) {
  const qc = useQueryClient();
  return useMutation<PhotoResponse, Error, { photoId: string }>({
    mutationFn: (data) =>
      fetchApi(`/events/${eventId}/photos/confirm`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "photos"] });
    },
  });
}

// Organizer hooks (use JWT session cookie)
export function useOrganizerPhotos(eventId: string) {
  return useQuery<PhotoResponse[]>({
    queryKey: ["events", eventId, "photos", "organizer"],
    queryFn: () => fetchApi(`/events/${eventId}/photos`),
    enabled: !!eventId,
  });
}

export function useUpdatePhotoStatus(eventId: string) {
  const qc = useQueryClient();
  return useMutation<PhotoResponse, Error, { photoId: string } & UpdatePhotoStatusInput>({
    mutationFn: ({ photoId, ...data }) =>
      fetchApi(`/events/${eventId}/photos/${photoId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "photos"] });
    },
  });
}

export function useDeletePhoto(eventId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (photoId) =>
      fetchApi(`/events/${eventId}/photos/${photoId}`, { method: "DELETE" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "photos"] });
    },
  });
}

export function useHighlightPhotos(eventId: string) {
  return useQuery<PhotoResponse[]>({
    queryKey: ["events", eventId, "photos", "highlights"],
    queryFn: () => fetchApi(`/events/${eventId}/photos/highlights`),
    enabled: !!eventId,
  });
}

export function useToggleHighlight(eventId: string) {
  const qc = useQueryClient();
  return useMutation<PhotoResponse, Error, { photoId: string; isHighlight: boolean }>({
    mutationFn: ({ photoId, isHighlight }) =>
      fetchApi(`/events/${eventId}/photos/${photoId}/highlight`, {
        method: "PATCH",
        body: JSON.stringify({ isHighlight }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "photos"] });
    },
  });
}
