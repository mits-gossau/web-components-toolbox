const fs = require('fs')
const traverse = require('@babel/traverse').default
const { parse } = require('@babel/parser');
const { log } = require('console');

function getAttributeNames(filePath, options = { sourceType: 'module' }) {
    const attributes = []
    const namespaces = [];
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
                    // Print out a message so that we can see where in the
                    // code we're finding the attributes.
                    console.log(`found this.getAttribute('${attributeName}') at line ${path.node.loc.start.line}, column ${path.node.loc.start.column}`)
                    if (attributeName === 'namespace' && path.parent.type === 'SwitchStatement') {
                        path.parent.cases.forEach(caseNode => { 
                            const returnStatement = caseNode.consequent.find(node => node.type === 'ReturnStatement');
                            if (caseNode.test && returnStatement) {
                                const namespace = caseNode.test.value;
                                const pathExpression = returnStatement.object?.arguments[0]?.elements[0].properties[0].value.quasis[1].value 
                                namespaces.push({
                                    namespace,
                                    path: pathExpression?.cooked,
                                })
                            }
                        })
                    }
                    // Add the attribute name to the list of found attributes.
                    attributes.push(attributeName)
                }
            } 
        })
        console.log("--------",namespaces)
    return {
        attributes,
        namespaces
    }
} catch (error) {
    console.error(`Error parsing or manipulating file: ${filePath} - ${error.message}`)
    throw error
}
}

module.exports = getAttributeNames 