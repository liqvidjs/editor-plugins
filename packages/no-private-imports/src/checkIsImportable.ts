import path from "node:path";

import { type Program, SymbolFlags, type server } from "typescript";

type Scope = "package" | "private" | "public";

export const checkIsImportable = ({
  tsProgram,
  importPath,
  exportPath,
  exportName,
}: {
  tsProgram: Program;
  importPath: string | undefined;
  exportPath: string | undefined;
  exportName: string;
  info: server.PluginCreateInfo;
}) => {
  if (!importPath || !exportPath || exportPath.includes("node_modules"))
    return true;

  const exportFile = tsProgram.getSourceFile(exportPath);
  const exportDir = path.dirname(exportPath);
  let scope: Scope | undefined;

  if (!exportFile) return true;

  const typeChecker = tsProgram.getTypeChecker();
  const fileSymbol = typeChecker.getSymbolAtLocation(exportFile);
  const exports = fileSymbol && typeChecker.getExportsOfModule(fileSymbol);
  let exportSymbol = exports?.find((x) => x.name === exportName);

  if (!exportSymbol) return true;

  if (exportName !== "default" && exportSymbol.flags & SymbolFlags.Alias) {
    exportSymbol = typeChecker.getImmediateAliasedSymbol(exportSymbol);
  }

  const jsDocTags = exportSymbol?.getJsDocTags();

  if (!jsDocTags) return true;

  for (const tag of jsDocTags) {
    switch (tag.name) {
      case "package":
        scope = "package";
        break;
      case "private":
        scope = "private";
        break;
      case "public":
        scope = "public";
        break;
    }
  }

  scope ??= "public";

  switch (scope) {
    case "package":
      return importPath.startsWith(exportDir);
    case "private":
      return false;
    case "public":
      return true;
  }
};
