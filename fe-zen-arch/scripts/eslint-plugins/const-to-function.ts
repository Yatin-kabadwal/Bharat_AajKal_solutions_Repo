import type { Rule } from 'eslint'
import { ArrowFunctionExpression, Comment, FunctionExpression } from 'estree'

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Convert const function declarations to traditional function declarations',
      recommended: false
    },
    schema: [] // no options
  },
  create(context) {
    return {
      VariableDeclaration(node) {
        if (node.kind !== 'const') return
        if (context.sourceCode.getAllComments().some(checkIgnored)) return

        for (const declaration of node.declarations) {
          if (
            declaration.init &&
            (declaration.init.type === 'ArrowFunctionExpression' || declaration.init.type === 'FunctionExpression')
          ) {
            context.report({
              node,
              message: 'Use traditional function declaration instead of const function',
              fix(fixer) {
                const functionNode = declaration.init as ArrowFunctionExpression | FunctionExpression | undefined
                let functionText = context.sourceCode.getText(functionNode)
                const functionName = (declaration.id as any).name
                const isAsync = functionNode?.async

                let replacement = `function ${functionName}`
                if (isAsync) {
                  replacement = `async ${replacement}`
                  functionText = functionText.replace('async', '')
                }

                if (functionNode?.type === 'ArrowFunctionExpression') {
                  replacement += functionText.replace('=>', '')
                } else {
                  replacement += functionText.replace(/^async\s*function\s*|^function\s*/, '')
                }

                return [fixer.replaceText(node, replacement)]
              }
            })
          }
        }
      }
    }
  }
}

function checkIgnored(comment: Comment) {
  return comment.value.includes('eslint-disable') && comment.value.includes('func-style')
}

export default {
  rules: {
    'convert-const-to-function': rule
  }
}
