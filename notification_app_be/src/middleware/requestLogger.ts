import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

export async function requestLogger(req: Request, res: Response, next: NextFunction): Promise<void> {
  const start = Date.now();
  await logger("info", "middleware", `Incoming ${req.method} ${req.originalUrl} from ${req.ip}`);
  res.on("finish", async () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    await logger(level, "middleware", `${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
}