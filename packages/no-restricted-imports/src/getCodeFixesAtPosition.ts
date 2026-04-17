import type { LanguageService, server } from "typescript";

import { checkIsImportable } from "./checkIsImportable.ts";
import type { NoRestrictedImportsConfiguration } from "./types.ts";

/**
 * Type guard to validate that the config options match NoRestrictedImportsPlugin structure.
 */
const isNoRestrictedImportsPlugin = (
  options: unknown,
): options is NoRestrictedImportsConfiguration => {
  if (typeof options !== "object" || options === null) {
    return false;
  }

  const obj = options as Record<string, unknown>;

  // Check paths if present
  if (obj.paths !== undefined) {
    if (typeof obj.paths !== "object" || obj.paths === null) {
      return false;
    }

    for (const value of Object.values(obj.paths as Record<string, unknown>)) {
      if (typeof value === "string") {
        continue;
      }
      if (typeof value === "object" && value !== null) {
        const pathConfig = value as Record<string, unknown>;
        if (
          pathConfig.message !== undefined &&
          typeof pathConfig.message !== "string"
        ) {
          return false;
        }
        if (
          pathConfig.importNames !== undefined &&
          !Array.isArray(pathConfig.importNames)
        ) {
          return false;
        }
        if (
          pathConfig.allowImportNames !== undefined &&
          !Array.isArray(pathConfig.allowImportNames)
        ) {
          return false;
        }
        continue;
      }
      return false;
    }
  }

  // Check patterns if present
  if (obj.patterns !== undefined) {
    if (!Array.isArray(obj.patterns)) {
      return false;
    }

    for (const pattern of obj.patterns) {
      if (typeof pattern !== "object" || pattern === null) {
        return false;
      }
      const patternConfig = pattern as Record<string, unknown>;
      if (!Array.isArray(patternConfig.group)) {
        return false;
      }
      if (
        patternConfig.message !== undefined &&
        typeof patternConfig.message !== "string"
      ) {
        return false;
      }
      if (
        patternConfig.importNamePattern !== undefined &&
        typeof patternConfig.importNamePattern !== "string"
      ) {
        return false;
      }
      if (
        patternConfig.invertImportNamePattern !== undefined &&
        typeof patternConfig.invertImportNamePattern !== "boolean"
      ) {
        return false;
      }
    }
  }

  return true;
};

export const getCodeFixesAtPosition =
  (
    _ts: typeof import("typescript"),
    info: server.PluginCreateInfo,
  ): LanguageService["getCodeFixesAtPosition"] =>
  (importPath, ...args) => {
    const { logger } = info.project.projectService;
    const ls = info.languageService;
    const fixes = ls.getCodeFixesAtPosition(importPath, ...args);

    // Validate that config.options is a NoRestrictedImportsPlugin
    const options = info.config?.options;
    if (!isNoRestrictedImportsPlugin(options)) {
      info.project.projectService.logger.info(
        "[no-restricted-imports] Invalid plugin configuration, skipping import restrictions.",
      );
      // If options are not valid, return all fixes unfiltered
      return fixes;
    }

    return fixes.filter((fix) => {
      if (fix.fixName !== "import") return true;

      const exportPathRegex = /["]([^"]+?)["]$/;
      // TODO: find a more reliable source of this data
      const [, relativeExportPath] =
        fix.description.match(exportPathRegex) ?? [];

      const newText = fix.changes![0]!.textChanges[0]!.newText;
      let exportName: string;

      if (fix.description.startsWith("Add import")) {
        exportName = newText.match(/\{(.+)\} /)?.[1]?.trim() ?? "";
      } else {
        exportName = newText.replace(",", "").trim();
      }

      if (!relativeExportPath) return true;

      return checkIsImportable({
        exportName,
        importPath: relativeExportPath,
        logger,
        options,
      });
    });
  };
