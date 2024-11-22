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
        })
        traverse(ast, {
            CallExpression(path) {
                const callee = path.node.callee
                // If the expression is a call to a method on 'this' and that
                // method is 'getAttribute', then we know that we're dealing
                // with an attribute on a web component.
                if (callee.type === 'MemberExpression' && callee.object.type === 'ThisExpression' && callee.property.name === 'getAttribute') {
                    // Get the attribute name that is being accessed.
                    const attributeName = path.node.arguments[0].value
                    // Print out a message so that we can see where in the code we're finding the attributes.
                    console.log(`found this.getAttribute('${attributeName}') at line ${path.node.loc.start.line}, column ${path.node.loc.start.column}`)
                    // Add the attribute name to the list of found attributes.
                    attributes.push(attributeName)
                }
            }
        })
        return [...new Set(attributes)]
    } catch (error) {
        console.error(`Error parsing file: ${filePath} - ${error.message}`)
        throw error
    }
}

module.exports = getAttributeNames 