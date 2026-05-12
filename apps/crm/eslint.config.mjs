/**
 * ESLint config — CRM.
 *
 * Versão minimalista: usa apenas `eslint-config-next` (já em devDependencies)
 * + regras genéricas. Pra equiparar ao CFO (que tem @typescript-eslint
 * explícito), instale:
 *
 *   npm install --save-dev @next/eslint-plugin-next @typescript-eslint/eslint-plugin @typescript-eslint/parser
 *
 * E substitua este arquivo pelo do CFO. Ver UPGRADE-PLAN.md raiz.
 */

import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      // alinhado com o CFO eslint.config.mjs
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
]
