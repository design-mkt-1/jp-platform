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
  },
  {
    // Colour discipline. The Figma file has no variables, so docs/tokens.md plus the
    // Tailwind theme are the only mapping between design and code. A raw hex in a
    // component silently forks that mapping and cannot be re-themed, so reject it here
    // rather than hoping review catches it. Token definitions live in
    // src/app/globals.css and tailwind.config.ts, which are outside this glob.
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-fA-F])/]",
          message:
            "No raw hex colours in components. Use a Tailwind token (see docs/tokens.md); add new values to globals.css and tailwind.config.ts.",
        },
        {
          selector:
            "TemplateElement[value.raw=/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-fA-F])/]",
          message:
            "No raw hex colours in components. Use a Tailwind token (see docs/tokens.md); add new values to globals.css and tailwind.config.ts.",
        },
      ],
    },
  },
];

export default eslintConfig;
