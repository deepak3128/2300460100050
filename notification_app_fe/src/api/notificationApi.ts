import { logger } from "../utils/logger";

const BASE_URL = "http://localhost:5000/api";

export type NotificationType = "Placement" | "Result" | "Event";

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

export interface PriorityResponse {
  notifications: Notification[];
  topN: number;
}

export async function fetchNotifications(page = 1, limit = 20, notification_type?: NotificationType): Promise<NotificationsResponse> {
  await logger("info", "api", `Fetching notifications page=${page} type=${notification_type || "all"}`);
  const url = new URL(`${BASE_URL}/notifications`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (notification_type) url.searchParams.set("notification_type", notification_type);
  try {
    const res = await fetch(url.toString());
    if (!res.ok) { await logger("error", "api", `API error: ${res.status}`); throw new Error(`API error: ${res.status}`); }
    const data: NotificationsResponse = await res.json();
    await logger("info", "api", `Received ${data.notifications.length} notifications`);
    return data;
  } catch (err) {
    await logger("fatal", "api", `fetchNotifications failed: ${(err as Error).message}`);
    throw err;
  }
}

export async function fetchPriorityNotifications(topN = 10, notification_type?: NotificationType): Promise<PriorityResponse> {
  await logger("info", "api", `Fetching priority top=${topN} type=${notification_type || "all"}`);
  const url = new URL(`${BASE_URL}/notifications/priority`);
  url.searchParams.set("top", String(topN));
  if (notification_type) url.searchParams.set("notification_type", notification_type);
  try {
    const res = await fetch(url.toString());
    if (!res.ok) { await logger("error", "api", `Priority API error: ${res.status}`); throw new Error(`API error: ${res.status}`); }
    const data: PriorityResponse = await res.json();
    await logger("info", "api", `Received ${data.notifications.length} priority notifications`);
    return data;
  } catch (err) {
    await logger("fatal", "api", `fetchPriorityNotifications failed: ${(err as Error).message}`);
    throw err;
  }
}