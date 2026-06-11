import { Log, configureLogger, Level, Package } from "logging-middleware";
import config from "../config";

configureLogger(config.authToken);

export async function logger(
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  await Log("backend", level, pkg, message);
}