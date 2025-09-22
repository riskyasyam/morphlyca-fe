import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // Allow 'any' type during development
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unused variables (they might be used later)
      "@typescript-eslint/no-unused-vars": "warn",
      // Allow img elements (can be converted to Image later)
      "@next/next/no-img-element": "warn",
      // Allow missing alt text for now
      "jsx-a11y/alt-text": "warn",
    },
  },
];

export default eslintConfig;
