import type { server } from "typescript";

export function log(logger: server.Logger | undefined, obj: unknown): void {
  logger.info("[no-restricted-imports] " + JSON.stringify(obj, null, 2));
}
