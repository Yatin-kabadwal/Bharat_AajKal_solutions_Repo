import esbuild from 'esbuild'
import fs from 'fs'
import { basename, join, resolve } from 'path'

const tsFile = process.argv[2]
if (!tsFile) {
  console.error('Please provide a TypeScript file path')
  process.exit(1)
}
compileTypeScriptPlugin(tsFile, process.argv[3])

/**
 * Compiles a TypeScript file to JavaScript if needed
 * @param {string} tsFilePath - Path to the TypeScript file
 * @param {string} [outputDir] - Output directory (defaults to node_modules/.cache/eslint-plugins)
 * @returns {string} - Path to the compiled JavaScript file
 */
export function compileTypeScriptPlugin(tsFilePath, outputDir) {
  // Resolve paths
  const absoluteTsPath = resolve(tsFilePath)
  const cacheDir = outputDir || join(process.cwd(), `node_modules/.tmp/`)
  const fileName = basename(absoluteTsPath, '.ts')
  const outputPath = join(cacheDir, `${fileName}.js`)

  // Check if we need to recompile
  let needsCompile = true

  if (fs.existsSync(outputPath)) {
    const tsStats = fs.statSync(absoluteTsPath)
    const jsStats = fs.statSync(outputPath)

    // If the JS file is newer than the TS file, no need to recompile
    if (jsStats.mtimeMs > tsStats.mtimeMs) needsCompile = false
  }

  // Compile if needed
  if (needsCompile) {
    console.info(`Compiling ${tsFilePath} to JavaScript...`)

    esbuild.buildSync({
      entryPoints: [absoluteTsPath],
      outfile: outputPath,
      platform: 'node',
      format: 'esm',
      bundle: true,
      external: ['eslint', 'typescript', '@typescript-eslint/*'] // External dependencies
    })

    console.info(`Compiled to ${outputPath}`)
  } else {
    console.info(`Using cached version of ${tsFilePath}`)
  }

  return outputPath
}
