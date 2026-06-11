export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";
export type BackendPackage = "cache" | "controller" | "cron job" | "db" | "domain" | "handler" | "repository" | "route" | "service";
export type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style";
export type SharedPackage = "auth" | "config" | "middleware" | "utils";
export type Package = BackendPackage | FrontendPackage | SharedPackage;

export interface LogPayload { stack: Stack; level: Level; package: Package; message: string; }
export interface LogResponse { logID: string; message: string; }

const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";
let authToken: string | null = null;

export function configureLogger(token: string): void {
  authToken = token;
}

const VALID_STACKS: Stack[] = ["backend", "frontend"];
const VALID_LEVELS: Level[] = ["debug", "info", "warn", "error", "fatal"];
const VALID_BACKEND_PACKAGES: BackendPackage[] = ["cache","controller","cron job","db","domain","handler","repository","route","service"];
const VALID_FRONTEND_PACKAGES: FrontendPackage[] = ["api","component","hook","page","state","style"];
const VALID_SHARED_PACKAGES: SharedPackage[] = ["auth","config","middleware","utils"];

function validatePayload(stack: string, level: string, pkg: string, message: string): { valid: boolean; error?: string } {
  if (!VALID_STACKS.includes(stack as Stack)) return { valid: false, error: `Invalid stack "${stack}"` };
  if (!VALID_LEVELS.includes(level as Level)) return { valid: false, error: `Invalid level "${level}"` };
  const allValid: string[] = [...VALID_SHARED_PACKAGES, ...(stack === "backend" ? VALID_BACKEND_PACKAGES : VALID_FRONTEND_PACKAGES)];
  if (!allValid.includes(pkg)) return { valid: false, error: `Invalid package "${pkg}" for stack "${stack}"` };
  if (!message || message.trim().length === 0) return { valid: false, error: "Log message cannot be empty." };
  return { valid: true };
}

export async function Log(stack: Stack, level: Level, pkg: Package, message: string): Promise<LogResponse | null> {
  const validation = validatePayload(stack, level, pkg, message);
  if (!validation.valid) { console.error(`[LogMiddleware] ${validation.error}`); return null; }
  const payload: LogPayload = { stack, level, package: pkg, message };
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
    const response = await fetch(LOG_API_URL, { method: "POST", headers, body: JSON.stringify(payload) });
    if (!response.ok) { console.error(`[LogMiddleware] API ${response.status}`); return null; }
    return await response.json() as LogResponse;
  } catch (err) {
    console.error(`[LogMiddleware] Failed: ${(err as Error).message}`);
    return null;
  }
}

export default Log;