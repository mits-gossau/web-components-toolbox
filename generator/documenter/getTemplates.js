const fs = require('fs')
const traverse = require('@babel/traverse').default
const { parse } = require('@babel/parser')
const t = require('@babel/types')


/**
 * Finds all SwitchStatement that are used to switch between different html templates
 * based on the value of the "namespace" attribute.
 * @param {string} filePath The file path of the file to parse.
 * @param {object} [options] The options for the parser.
 * @param {string} [options.sourceType=module] The type of the source code.
 * @return {array} An array of objects with the name and path of each template found.
 */
function getTemplates(filePath, options = { sourceType: 'module' }) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const ast = parse(content, {
      ...options,
      sourceFilename: filePath,
      plugins: ['jsx', 'typescript']
    })

    const templates = new Map()

    traverse(ast, {
      SwitchStatement(path) {
        const discriminant = path.get("discriminant")
        if (
          t.isCallExpression(discriminant) &&
          t.isMemberExpression(discriminant.get("callee")) &&
          t.isThisExpression(discriminant.get("callee.object")) &&
          t.isIdentifier(discriminant.get("callee.property")) &&
          discriminant.get("callee.property").node.name === "getAttribute" &&
          discriminant.get("arguments").length === 1 &&
          t.isStringLiteral(discriminant.get("arguments.0")) &&
          discriminant.get("arguments.0").node.value === "namespace"
        ) {
          path.get("cases").forEach((casePath) => {
            const test = casePath.get("test")
            const switchCaseName = t.isStringLiteral(test) ? test.node.value : null
            if (switchCaseName || casePath.node.test === null) {
              casePath.traverse({
                ObjectExpression(objectPath) {
                  const pathProperty = objectPath.node.properties.find((prop) => prop.key.name === "path")
                  const replaces = objectPath.node.properties.find((prop) => prop.key.name === "replaces")
                  if (pathProperty && (!replaces || replaces.shorthand)) {
                    pathProperty.value.quasis.forEach((quasi) => {
                      if (quasi.value.cooked) {
                        templates.set(switchCaseName, quasi.value.raw)
                      }
                    })
                  }
                }
              })
            }
          })
        }
      }
    })
    return Array.from(templates, ([name, path]) => ({ name, path }))
  } catch (error) {
    console.error(`Error parsing file: ${filePath} - ${error.message}`)
    throw error
  }
}

module.exports = getTemplates
