import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  logger("info", "middleware", `Incoming ${req.method} ${req.originalUrl} from ${req.ip}`);
  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    logger(level, "middleware", `${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
}