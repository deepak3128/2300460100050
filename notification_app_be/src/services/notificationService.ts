import config from "../config";
import { logger } from "../middleware/logger";
import { Notification, NotificationType, PaginatedNotificationsResponse, NotificationQueryParams } from "../domain/notification";

const NOTIFICATIONS_URL = `${config.testServerBaseUrl}/notifications`;

const PRIORITY_WEIGHT: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export async function fetchNotifications(params: NotificationQueryParams = {}): Promise<PaginatedNotificationsResponse> {
  await logger("info", "service", "Fetching notifications from test server");
  const url = new URL(NOTIFICATIONS_URL);
  if (params.page !== undefined) url.searchParams.set("page", String(params.page));
  if (params.limit !== undefined) url.searchParams.set("limit", String(params.limit));
  if (params.notification_type) url.searchParams.set("notification_type", params.notification_type);
  try {
    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${config.authToken}`, "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const errText = await response.text();
      await logger("error", "service", `Test server responded with ${response.status}: ${errText}`);
      throw new Error(`Upstream error ${response.status}: ${errText}`);
    }
    const data = await response.json() as PaginatedNotificationsResponse;
    const notifications = data.notifications ?? [];
    await logger("info", "service", `Successfully fetched ${notifications.length} notifications`);
    return { notifications, total: data.total ?? notifications.length, page: params.page || 1, limit: params.limit || notifications.length };
  } catch (err) {
    await logger("error", "service", `Failed to fetch notifications: ${(err as Error).message}`);
    throw err;
  }
}

export async function getTopPriorityNotifications(topN: number, notification_type?: NotificationType): Promise<Notification[]> {
  await logger("info", "service", `Computing top ${topN} priority notifications`);
  try {
    const { notifications } = await fetchNotifications({ notification_type });
    if (notifications.length === 0) { await logger("warn", "service", "No notifications available"); return []; }
    const scored = notifications.map((n) => ({ notification: n, score: PRIORITY_WEIGHT[n.Type] * 1e12 + new Date(n.Timestamp).getTime() }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, topN).map((s) => s.notification);
    await logger("info", "service", `Returning top ${top.length} priority notifications`);
    return top;
  } catch (err) {
    await logger("error", "service", `Failed to compute priority notifications: ${(err as Error).message}`);
    throw err;
  }
}