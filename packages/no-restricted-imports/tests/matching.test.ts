import { expect, test } from "@jest/globals";

import { checkIsImportable } from "../dist/cjs/checkIsImportable.js";
import type { NoRestrictedImportsConfiguration } from "../dist/types/types.d.ts";

const options = {
  paths: {
    "@liqvid/prompts":
      "import the styled versions from @/components/liqvid/prompts",
    "@lqv/livecode": {
      importNames: [
        "Editor",
        "EditorGroup",
        "FileTabs",
        "LiveCode",
        "HTMLConsole",
        "HTMLPreview",
        "Record",
        "Replay",
        "Resize",
        "Tab",
        "TabList",
      ],
      message:
        "import the styled versions from @/components/liqvid/livecode/theme",
    },
  },
} satisfies NoRestrictedImportsConfiguration;

test("filters correctly", () => {
  expect(
    checkIsImportable({
      exportName: "Resize",
      importPath: "@lqv/livecode",
      options,
    }),
  ).toBe(false);

  expect(
    checkIsImportable({
      exportName: "Resize",
      importPath: "@/components/liqvid/livecode/theme",
      options,
    }),
  ).toBe(true);
});
