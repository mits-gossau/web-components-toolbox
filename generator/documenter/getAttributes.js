const fs = require('fs')
const traverse = require('@babel/traverse').default
const { parse } = require('@babel/parser')

/**
 * Extracts attribute names from a JavaScript file where `this.getAttribute` is used.
 * @param {string} filePath - The file path of the file to parse.
 * @param {object} [options] - The options for the parser.
 * @param {string} [options.sourceType=module] - The type of the source code.
 * @return {array} An array of objects with each attribute name and its description.
 */
function getAttributeNames (filePath, options = { sourceType: 'module' }) {
  const attributes = new Set()
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const ast = parse(content, {
      ...options,
      sourceFilename: filePath,
      plugins: ['jsx', 'typescript']
    })

    traverse(ast, {
      CallExpression (path) {
        const { callee } = path.node
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'ThisExpression' &&
          callee.property.name === 'getAttribute'
        ) {
          const { value } = path.node.arguments[0]
          attributes.add(value)
        }
      }
    })
    return [...attributes].map((name) => ({ attributeName: name, description: '' }))
  } catch (error) {
    console.error(`Error parsing file: ${filePath} - ${error.message}`)
    throw error
  }
}

module.exports = getAttributeNames
