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
  ]),
  // Regras específicas para arquivos de teste
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/rules-of-hooks": "off", // Permite hooks em funções de teste
      "react-hooks/exhaustive-deps": "warn", // Apenas warning em testes
      "react-hooks/preserve-manual-memoization": "off", // Desabilita em testes
      "react-hooks/incompatible-library": "off", // Desabilita em testes
      "react/display-name": "off", // Permite componentes sem displayName em testes
    },
  },
]);

export default eslintConfig;
