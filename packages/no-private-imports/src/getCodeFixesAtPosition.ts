import type { LanguageService, server } from "typescript";

import { checkIsImportable } from "./checkIsImportable.ts";

export const getCodeFixesAtPosition =
  (
    ts: typeof import("typescript"),
    info: server.PluginCreateInfo,
  ): LanguageService["getCodeFixesAtPosition"] =>
  (importPath, ...args) => {
    const ls = info.languageService;
    const fixes = ls.getCodeFixesAtPosition(importPath, ...args);
    const tsProgram = ls.getProgram();

    if (!tsProgram) return fixes;

    return fixes.filter((fix) => {
      if (fix.fixName !== "import") return true;

      const exportPathRegex = /["]([^"]+?)["]$/;
      // TODO: find a more reliable source of this data
      const [, relativeExportPath] =
        fix.description.match(exportPathRegex) ?? [];

      const newText = fix.changes![0]!.textChanges[0]!.newText;
      let exportName: string;

      if (fix.description.startsWith("Add import")) {
        exportName = newText.match(/\{(.+)\} /)[1]!.trim();
      } else {
        exportName = newText.replace(",", "").trim();
      }

      if (!relativeExportPath) return true;

      const { resolvedModule } = ts.resolveModuleName(
        relativeExportPath,
        importPath,
        info.project.getCompilerOptions(),
        ts.sys,
      );

      const exportPath = resolvedModule?.resolvedFileName;

      return checkIsImportable({
        exportName,
        exportPath,
        importPath,
        info,
        tsProgram,
      });
    });
  };
