import type * as ts from "typescript/lib/tsserverlibrary.ts";

import { getCodeFixesAtPosition } from "./getCodeFixesAtPosition.ts";

module.exports = function init(module: {
  typescript: typeof ts;
  info: ts.server.PluginCreateInfo;
}): ts.server.PluginModule {
  function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    const ls = info.languageService;
    const proxy = { ...ls };

    proxy.getCodeFixesAtPosition = getCodeFixesAtPosition(
      module.typescript,
      info,
    );

    return proxy;
  }

  return { create };
};
