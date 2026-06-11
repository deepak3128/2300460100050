"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureLogger = configureLogger;
exports.Log = Log;
const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";
let authToken = null;
function configureLogger(token) {
    authToken = token;
}
const VALID_STACKS = ["backend", "frontend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_BACKEND_PACKAGES = ["cache", "controller", "cron job", "db", "domain", "handler", "repository", "route", "service"];
const VALID_FRONTEND_PACKAGES = ["api", "component", "hook", "page", "state", "style"];
const VALID_SHARED_PACKAGES = ["auth", "config", "middleware", "utils"];
function validatePayload(stack, level, pkg, message) {
    if (!VALID_STACKS.includes(stack))
        return { valid: false, error: `Invalid stack "${stack}"` };
    if (!VALID_LEVELS.includes(level))
        return { valid: false, error: `Invalid level "${level}"` };
    const allValid = [...VALID_SHARED_PACKAGES, ...(stack === "backend" ? VALID_BACKEND_PACKAGES : VALID_FRONTEND_PACKAGES)];
    if (!allValid.includes(pkg))
        return { valid: false, error: `Invalid package "${pkg}" for stack "${stack}"` };
    if (!message || message.trim().length === 0)
        return { valid: false, error: "Log message cannot be empty." };
    return { valid: true };
}
async function Log(stack, level, pkg, message) {
    const validation = validatePayload(stack, level, pkg, message);
    if (!validation.valid) {
        console.error(`[LogMiddleware] ${validation.error}`);
        return null;
    }
    const payload = { stack, level, package: pkg, message };
    try {
        const headers = { "Content-Type": "application/json" };
        if (authToken)
            headers["Authorization"] = `Bearer ${authToken}`;
        const response = await fetch(LOG_API_URL, { method: "POST", headers, body: JSON.stringify(payload) });
        if (!response.ok) {
            console.error(`[LogMiddleware] API ${response.status}`);
            return null;
        }
        return await response.json();
    }
    catch (err) {
        console.error(`[LogMiddleware] Failed: ${err.message}`);
        return null;
    }
}
exports.default = Log;
