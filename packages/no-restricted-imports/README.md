# no-restricted-imports

This provides a TypeScript LSP plugin to accompany the Biome [`no-restricted-imports`](https://biomejs.dev/linter/rules/no-restricted-imports/) rule.

## Example

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "no-restricted-imports",
        "options": {
          "paths": {
            "@liqvid/prompts": "import the styled versions from @/components/liqvid/prompts",
            "@lqv/livecode": {
              "importNames": [
                "Editor",
                "EditorGroup",
                "FileTabs",
                "LiveCode",
                "Record",
                "Replay",
                "Resize",
                "Tab",
                "TabList",
              ],
              "message": "import the styled versions from @/components/livecode/theme",
            },
            "@lqv/livecode/html": {
              "importNames": ["HTMLConsole", "HTMLPreview"],
              "message": "import the styled versions from @/components/livecode/html",
            },
          },
        },
      },
    ],
  },
}
```
