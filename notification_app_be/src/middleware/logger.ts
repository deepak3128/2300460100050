import { Log as _Log, configureLogger, Level, Package } from "../../../logging_middleware/src/index";
import config from "../config";

configureLogger(config.authToken);

export async function logger(level: Level, pkg: Package, message: string): Promise<void> {
  await _Log("backend", level, pkg, message);
}

export { Log } from "../../../logging_middleware/src/index";