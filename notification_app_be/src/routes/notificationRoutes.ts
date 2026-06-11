import { Router } from "express";
import { getNotifications, getPriorityNotifications } from "../controllers/notificationController";

const router = Router();
router.get("/", getNotifications);
router.get("/priority", getPriorityNotifications);
export default router;