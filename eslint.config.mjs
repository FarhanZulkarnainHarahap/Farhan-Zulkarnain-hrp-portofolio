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
    ".qa/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Third-party Claude Code skill scripts (not app code):
    ".claude/**",
    // TEMPORARY (redesign): legacy Kinetic file with 2 pre-existing react-hooks/immutability
    // errors. Remove this entry when the file is deleted in Fase 11.
    "src/components/three/kinetic/KineticCore.tsx",
  ]),
]);

export default eslintConfig;
