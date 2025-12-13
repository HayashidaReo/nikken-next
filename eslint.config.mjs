import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    // Electron build directories:
    "dist/**",
    "release/**",
    // Build scripts (use CommonJS):
    "scripts/**",
    // Firebase Functions compiled output:
    "functions/lib/**",
    // Generated Service Worker:
    "public/sw.js",
  ]),
  // Jest設定ファイルではrequireを許可
  {
    files: ["jest.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // テストファイルでは any を許可
  {
    files: ["**/*.test.ts", "**/*.test.js", "**/__mocks__/**", "**/*.cjs"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
