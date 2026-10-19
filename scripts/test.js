// Runs the unit tests (src/**/*.test.ts) with Node's built-in test runner.
// No test framework dependency: esbuild (already a devDependency) bundles each test file, resolving
// the same path aliases the app uses, and `node --test` runs the result.
import { build } from 'esbuild'
import { spawnSync } from 'node:child_process'
import { readdirSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const outdir = join(root, 'node_modules/.tmp/tests')

function findTests(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return findTests(path)
    return entry.name.endsWith('.test.ts') ? [path] : []
  })
}

const entryPoints = findTests(join(root, 'src'))
rmSync(outdir, { recursive: true, force: true })

await build({
  entryPoints,
  outdir,
  outbase: join(root, 'src'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  logLevel: 'warning',
  alias: {
    '@': join(root, 'src'),
    core: join(root, 'fe-zen-arch/core'),
    ui: join(root, 'fe-zen-arch/ui'),
    icons: join(root, 'fe-zen-arch/icons')
  },
  // The app code reads Vite's `import.meta.env`; in tests it is a production-like, non-DEV build.
  define: { 'import.meta.env.DEV': 'false', 'import.meta.env.PROD': 'true' }
})

const files = entryPoints.map((file) => join(outdir, file.slice(join(root, 'src').length).replace(/\.ts$/, '.js')))
const result = spawnSync(process.execPath, ['--test', '--test-reporter=spec', ...files], { stdio: 'inherit' })
process.exit(result.status ?? 1)
