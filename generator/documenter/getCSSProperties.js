const fs = require('fs')
const traverse = require('@babel/traverse').default
const { parse } = require('@babel/parser')

function getCSSProperties(filePath, options = { sourceType: 'module' }) {
  const css = []
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const ast = parse(content, {
      ...options,
      sourceFilename: filePath,
      plugins: ['jsx', 'typescript']
    })

    traverse(ast, {
      TemplateLiteral(path) {
        // Destructure the 'quasis' array from the 'path.node' object, which represents template literals in the AST
        const { quasis } = path.node
        // Extract the raw content of the first quasi (template element) in the template literal
        const rawValue = quasis[0].value.raw
        // Use a regular expression to find all CSS-like blocks within the template string
        // The regex captures selectors and their corresponding properties
        const matches = rawValue.matchAll(/([^{]+)\s*{\s*([^}]+?)\s*}/g)
        // Iterate over all matches found in the template string
        for (const match of matches) {
          // Trim whitespace and obtain the CSS selector from the first capturing group
          const selector = match[1].trim()
          // Split the second capturing group by semicolons to separate properties, and trim each property
          const properties = match[2].trim().split(';').map(property => property.trim())
          // Map over the properties, extracting key-value pairs using the 'extractProperty' function
          // Filter out any invalid or empty properties
          const cssDeclarationBlock = properties.map(property => extractProperty(property)).filter(prop => prop)
          console.log(`found selector: ${selector} at line ${path.node.loc.start.line}, column ${path.node.loc.start.column}`)
          // Create an object containing the selector and its properties, and push it to the 'css' array
          css.push({ selector, declaration: cssDeclarationBlock })
        }
      }
    })
    return { css }
  } catch (error) {
    console.error(`Error parsing file: ${filePath} - ${error.message}`)
    throw error
  }
}

function extractProperty(inputText) {
  const properties = inputText.split(';').map(line => line.trim()).filter(line => line !== '')[0]
  if (!properties) return null
  // It matches the string "var("
  // followed by any characters(captured in group 1),
  // followed by ")".
  // The (.*?) - capture group that matches any characters(including none)
  // -
  // used to extract the variable name and fallback value from a CSS property declaration
  // that uses the var() function, such as color: var(--my - color, #fff)
  const match = properties.match(/var\((.*?)\)/)
  if (match) {
    const allCssVars = grabAllVars(properties)
    const defaultValue = getLatestValue(inputText)
    const cssProp = inputText.split(':')[0].trim()
    return cssProp ? { property: cssProp, allCssVars, defaultValue } : null
  }
  console.log('No property found in: ', inputText)
  return null
}

/**
 * Extract all CSS variables from a string.
 * The regex is from here: https://github.com/mits-gossau/web-components-toolbox/blob/master/src/es/components/prototypes/Shadow.js#L285
 * Returns an array of all variables found.
 * @param {string} str - The string to check for CSS variables
 * @return {Array<string>} - An array of all variables found
 */
function grabAllVars(str) {
  let result = []
  const regexResult = /var\(--([^,)]*)([^;]*)/g.exec(str)
  if (!regexResult) return result
  if (regexResult[1]) result.push(`--${regexResult[1]}`)
  if (regexResult[2]) result = [...result, ...grabAllVars(regexResult[2])]
  return result
}

/**
 * Returns the latest value of a CSS property declaration.
 * @param {string} str - The string to check for a CSS property declaration
 * @return {string} - The value of the CSS property declaration
 */
function getLatestValue(str){
  const regex = /.*,([^)]*)/
  const match = str.match(regex)
  return match ? match[1].trim() : null
}

module.exports = getCSSProperties
