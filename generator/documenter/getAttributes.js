const fs = require('fs')
const traverse = require('@babel/traverse').default
const { parse } = require('@babel/parser')

function getAttributeNames(filePath, options = { sourceType: 'module' }) {
    const attributes = []
    try {
        const content = fs.readFileSync(filePath, 'utf8')
        const ast = parse(content, {
            ...options,
            sourceFilename: filePath,
            plugins: ['jsx', 'typescript']
        });
        traverse(ast, {
            CallExpression(path) {
                const callee = path.node.callee
                if (callee.type === 'MemberExpression' && callee.object.type === 'ThisExpression' && callee.property.name === 'getAttribute') {
                    const attributeName = path.node.arguments[0].value
                    console.log(`found this.getAttribute('${attributeName}') at line ${path.node.loc.start.line}, column ${path.node.loc.start.column}`)
                    attributes.push(attributeName)
                }
            }
        })
        return {
            attributes
        }
    } catch (error) {
        console.error(`Error parsing or manipulating file: ${filePath} - ${error.message}`)
        throw error
    }
}

module.exports =  getAttributeNames 