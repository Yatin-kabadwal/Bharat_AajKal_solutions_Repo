import { defineConfig } from 'eslint/config'
import { getConfig } from './fe-zen-arch/eslint.config.js'

const ignores = ['dist/', 'fe-zen-arch/', '**/*.js']

export default defineConfig(...getConfig(ignores, import.meta), {
  // Tests are named `<module>.test.ts`; the base rule only allows a single extension.
  files: ['**/*.test.ts'],
  rules: {
    'check-file/filename-naming-convention': ['error', { '**/*.test.ts': '+([a-z0-9-]).test' }],
    // node:test's describe() / it() return promises that the runner awaits itself.
    '@typescript-eslint/no-floating-promises': 'off'
  }
})
