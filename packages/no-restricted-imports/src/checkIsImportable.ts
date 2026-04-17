import type ts from "typescript";

import type {
  NoRestrictedImportsConfiguration,
  RestrictedPathConfig,
} from "./types.ts";

/**
 * Checks if an import matches a gitignore-style pattern.
 * Supports wildcards (*) and negation patterns (!).
 */
const matchesPattern = (importPath: string, pattern: string): boolean => {
  // Handle negation patterns
  if (pattern.startsWith("!")) {
    return false; // Negation is handled separately in the pattern group logic
  }

  // Convert gitignore-style pattern to regex
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape special regex chars
    .replace(/\*/g, ".*"); // Convert * to .*

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(importPath);
};

/**
 * Checks if an import path matches any pattern in a group.
 * Negation patterns (starting with !) exclude matches.
 */
const matchesPatternGroup = (importPath: string, group: string[]): boolean => {
  let matched = false;

  for (const pattern of group) {
    if (pattern.startsWith("!")) {
      // Negation pattern - if it matches, exclude this import
      const negatedPattern = pattern.slice(1);
      if (matchesPattern(importPath, negatedPattern)) {
        return false;
      }
    } else if (matchesPattern(importPath, pattern)) {
      matched = true;
    }
  }

  return matched;
};

export const checkIsImportable = ({
  importPath,
  exportName,
  options,
}: {
  importPath: string;
  exportName: string;
  options: NoRestrictedImportsConfiguration;
  logger?: ts.server.Logger;
}): boolean => {
  // Check paths restrictions
  if (options.paths) {
    const pathConfig = options.paths[importPath];

    if (pathConfig !== undefined) {
      // Path is in the restricted list
      if (typeof pathConfig === "string") {
        // Simple restriction - entire path is restricted
        return false;
      }

      const config = pathConfig as RestrictedPathConfig;

      // Check importNames (explicitly forbidden names)
      if (config.importNames) {
        if (config.importNames.includes(exportName)) {
          return false;
        }
        // If importNames is specified but doesn't include this export, it's allowed
        return true;
      }

      // Check allowImportNames (only these are allowed)
      if (config.allowImportNames) {
        if (!config.allowImportNames.includes(exportName)) {
          return false;
        }
        return true;
      }

      // Path is restricted with no specific import name rules
      return false;
    }
  }

  // Check pattern restrictions
  if (options.patterns) {
    for (const patternConfig of options.patterns) {
      if (matchesPatternGroup(importPath, patternConfig.group)) {
        // Import path matches the pattern group

        // Check if there's an import name pattern restriction
        if (patternConfig.importNamePattern) {
          const regex = new RegExp(patternConfig.importNamePattern);
          const nameMatches = regex.test(exportName);

          if (patternConfig.invertImportNamePattern) {
            // Inverted: matched names are allowed, unmatched are restricted
            if (!nameMatches) {
              return false;
            }
          } else {
            // Normal: matched names are restricted
            if (nameMatches) {
              return false;
            }
          }
        } else {
          // No import name pattern - entire matched path is restricted
          return false;
        }
      }
    }
  }

  // Not restricted
  return true;
};
