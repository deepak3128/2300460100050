import { Log, configureLogger, Level, Package } from "logging-middleware";
import config from "../config";

let isConfigured = false;

export async function logger(
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  if (!isConfigured) {
    configureLogger(config.authToken);
    isConfigured = true;
  }
  await Log("backend", level, pkg, message);
}