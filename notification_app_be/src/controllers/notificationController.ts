import { Request, Response } from "express";
import { logger } from "../middleware/logger";
import { fetchNotifications, getTopPriorityNotifications } from "../services/notificationService";
import { NotificationType } from "../domain/notification";

export async function getNotifications(req: Request, res: Response): Promise<void> {
  await logger("info", "controller", "GET /api/notifications called");
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const notification_type = req.query.notification_type as NotificationType | undefined;
  if (notification_type && !["Placement", "Result", "Event"].includes(notification_type)) {
    await logger("warn", "controller", `Invalid notification_type: ${notification_type}`);
    res.status(400).json({ error: "Invalid notification_type." });
    return;
  }
  try {
    const result = await fetchNotifications({ page, limit, notification_type });
    res.status(200).json(result);
  } catch (err) {
    await logger("error", "controller", `Failed: ${(err as Error).message}`);
    res.status(502).json({ error: "Failed to fetch notifications." });
  }
}

export async function getPriorityNotifications(req: Request, res: Response): Promise<void> {
  await logger("info", "controller", "GET /api/notifications/priority called");
  const topN = parseInt(req.query.top as string) || 10;
  const notification_type = req.query.notification_type as NotificationType | undefined;
  if (topN < 1 || topN > 100) {
    res.status(400).json({ error: "top must be between 1 and 100." });
    return;
  }
  try {
    const notifications = await getTopPriorityNotifications(topN, notification_type);
    res.status(200).json({ notifications, topN });
  } catch (err) {
    await logger("error", "controller", `Failed: ${(err as Error).message}`);
    res.status(502).json({ error: "Failed to compute priority notifications." });
  }
}