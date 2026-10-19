import cspellPlugin from '@cspell/eslint-plugin'
import pluginJs from '@eslint/js'
import checkFile from 'eslint-plugin-check-file'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import constFuncFix from '../node_modules/.tmp/const-to-function.js'

const unusedPattern = `^\\b_+\\b`

export function getConfig(ignores, meta) {
  return [
    { ignores: ignores },
    pluginJs.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    reactRefresh.configs.recommended,
    {
      languageOptions: {
        globals: { ...globals.browser },
        parserOptions: { projectService: true, tsconfigRootDir: meta.dirname }
      },
      plugins: {
        'react-hooks': reactHooks,
        // Alternative for consistent files & folder naming: https://github.com/loeffel-io/ls-lint
        'check-file': checkFile,
        rules: reactHooks.configs.recommended.rules,
        'const-to-function': constFuncFix,
        'better-tailwindcss': {
          entryPoint: 'fe-base/ui/styles.css'
        }
      }
    },
    {
      plugins: { '@cspell': cspellPlugin },
      rules: {
        '@cspell/spellchecker': ['warn', { configFile: new URL('./cspell.config.yaml', meta.url).toString() }]
      }
    },
    {
      rules: {
        'const-to-function/convert-const-to-function': 'error',
        '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
        '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unnecessary-type-parameters': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: unusedPattern,
            destructuredArrayIgnorePattern: unusedPattern
          }
        ],
        'func-style': ['error', 'declaration', { allowArrowFunctions: false }],
        'check-file/filename-naming-convention': [
          'error',
          { '**/*.{ts,tsx,js,jsx}': '@(+([a-z0-9-])|+([a-z]).config|+([a-z-]).d)' }
        ],
        'check-file/folder-naming-convention': ['error', { '**/*': '@(+([a-z0-9-])|.storybook)' }],
        'no-throw-literal': 'error',
        '@typescript-eslint/prefer-promise-reject-errors': 'off'
      }
    }
  ]
}
