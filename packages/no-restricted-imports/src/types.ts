/**
 * Configuration for a specific restricted path.
 * Allows specifying which import names are restricted or allowed.
 */
export interface RestrictedPathConfig {
  /** Custom message to show when this import is restricted */
  message?: string;

  /** Array of import names that should be explicitly forbidden */
  importNames?: string[];

  /** Array of import names that should be explicitly allowed (all others are forbidden) */
  allowImportNames?: string[];
}

/**
 * Pattern-based restriction configuration.
 * Uses gitignore-style patterns for restricting modules.
 */
export interface RestrictedPattern {
  /** Gitignore-style patterns for restricting modules (e.g., ["import-foo/*", "!import-foo/bar"]) */
  group: string[];

  /** Custom message to show when this pattern matches */
  message?: string;

  /** Regex pattern to restrict import names */
  importNamePattern?: string;

  /** If true, the matched patterns in importNamePattern will be allowed instead of restricted */
  invertImportNamePattern?: boolean;
}

/**
 * Plugin options matching Biome's linter.rules.style.noRestrictedImports.options structure.
 * @see https://biomejs.dev/linter/rules/no-restricted-imports/#options
 */
export interface NoRestrictedImportsConfiguration {
  /**
   * An object that lists the import paths that are either wholly or partially restricted.
   * Keys are import paths, values can be:
   * - A string with a custom message
   * - A RestrictedPathConfig object with additional options
   */
  paths?: Record<string, string | RestrictedPathConfig>;

  /**
   * Array of pattern-based restrictions using gitignore-style patterns.
   */
  patterns?: RestrictedPattern[];
}
