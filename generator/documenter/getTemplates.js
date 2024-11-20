const fs = require('fs')
const traverse = require('@babel/traverse').default
const { parse } = require('@babel/parser')
const t = require('@babel/types');

function getTemplates(filePath, options = { sourceType: 'module' }) {
    const result = []
    try {
        const content = fs.readFileSync(filePath, 'utf8')
        const ast = parse(content, {
            ...options,
            sourceFilename: filePath,
            plugins: ['jsx', 'typescript']
        })
        traverse(ast, {
            ClassMethod(path) {
                if (path.node.key.name === "fetchTemplate") {
                    const switchCaseNode = path.node.body.body.find(node => t.isSwitchStatement(node))
                    if (switchCaseNode) {
                        path.traverse({
                            SwitchCase(path) {
                                const templateName = path.node.test?.value
                                if (templateName) {
                                    path.traverse({
                                        ObjectExpression(path) {
                                            if (path.node.properties[0].value.quasis) {
                                                result.push({ name: templateName, path: path.node.properties[0].value.quasis[1].value.cooked })
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
        return result
    } catch (error) {
        console.error(`Error parsing or manipulating file: ${filePath} - ${error.message}`)
        throw error
    }
}

module.exports = getTemplates 