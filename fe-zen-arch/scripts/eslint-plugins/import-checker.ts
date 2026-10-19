import type { Rule } from 'eslint'
import type { ImportDeclaration } from 'estree'
// @ts-expect-error
import { readFileSync } from 'fs'
// @ts-expect-error
import { resolve } from 'path'

type ESLintContext = Rule.RuleContext

interface ImportCheckerPlugin {
  name: string
  rules: Record<string, Rule.RuleModule>
}

const pkgDir = resolve('./packages/')

const cache = new Map<string, string[]>()

function getDependencies(packageLocation: string) {
  const packageDetails = JSON.parse(readFileSync(packageLocation, 'utf-8'))
  return Object.keys(packageDetails?.dependencies ?? {})
}

function allDependencies(packageName: string) {
  const cachedValue = cache.get(packageName)
  if (cachedValue != null) return cachedValue
  const dependencies = getDependencies(`${pkgDir}/${packageName}/package.json`)
  const rootDependencies = getDependencies('./package.json')
  dependencies.push(packageName)
  dependencies.push(...rootDependencies)
  cache.set(packageName, dependencies)
  return dependencies
}

// Your business logic function
function shouldFlagImport(importPath: string, filePath: string): boolean {
  try {
    // Handle alias
    if (importPath.startsWith('@')) {
      // don't allow Shadcn components import
      return importPath.startsWith('@/')
    }

    // Handle relative imports
    if (importPath.startsWith('.')) {
      return importPath.includes(`../../`)
    }

    const packageName = filePath.substring(pkgDir.length + 1, filePath.indexOf('/', pkgDir.length + 1))
    if (!filePath.startsWith(`${pkgDir}/${packageName}/src`)) return false

    const dependencies = allDependencies(packageName)
    const importPackage = importPath.substring(0, importPath.indexOf('/'))
    if (dependencies.includes(importPackage) || dependencies.includes(importPath)) return false

    return true
  } catch (error) {
    console.error(importPath, filePath)
    throw error
  }
}

const importCheckerPlugin: ImportCheckerPlugin = {
  name: 'eslint-plugin-import-checker',
  rules: {
    'check-imports': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Check imports based on custom business logic',
          recommended: false
        },
        schema: [] // Define any options your rule accepts
      },
      create(context: ESLintContext) {
        return {
          ImportDeclaration(node: ImportDeclaration) {
            // Get the source value (the imported path)
            const importPath = node.source.value as string

            // Get the current file path
            const currentFilePath = context.filename

            // Apply your business logic here
            if (shouldFlagImport(importPath, currentFilePath)) {
              context.report({
                node,
                message: 'This import violates our import rules'
              })
            }
          }
        }
      }
    }
  }
}

export default importCheckerPlugin
