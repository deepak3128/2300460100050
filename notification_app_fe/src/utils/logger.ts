import { Log, configureLogger, Level, FrontendPackage, SharedPackage } from "../../../logging_middleware/src/index";

export type FEPackage = FrontendPackage | SharedPackage;
let configured = false;

export function initFrontendLogger(token: string): void {
  if (!configured) { configureLogger(token); configured = true; }
}

export async function logger(level: Level, pkg: FEPackage, message: string): Promise<void> {
  await Log("frontend", level, pkg, message);
}