const fs = require('fs')
const traverse = require('@babel/traverse').default
const { parse } = require('@babel/parser')
const t = require('@babel/types')

function getTemplates(filePath, options = { sourceType: 'module' }) {
  const templates = []
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const ast = parse(content, {
      ...options,
      sourceFilename: filePath,
      plugins: ['jsx', 'typescript']
    })
    traverse(ast, {
      ClassMethod(path) {
        if (path.node.key.name === 'fetchTemplate') {
          const switchCaseNode = path.node.body.body.find(node => t.isSwitchStatement(node))
          if (switchCaseNode) {
            path.traverse({
              SwitchCase(path) {
                const templateName = path.node.test?.value
                const switchStatementArgument = path.parent.discriminant.arguments[0].value
                if (templateName && switchStatementArgument === "namespace") {
                  path.traverse({
                    ObjectExpression(path) {
                      const quasis = path.node.properties[0]?.value?.quasis
                      if (quasis?.[1]?.value?.cooked) {
                        templates.push({ name: templateName, path: quasis[1].value.cooked })
                      }
                    }
                  })
                }
                path.skip()
              }
            })
          }
        }
      }
    })
    return [...new Set(templates)]
  } catch (error) {
    console.error(`Error parsing file: ${filePath} - ${error.message}`)
    throw error
  }
}

module.exports = getTemplates
