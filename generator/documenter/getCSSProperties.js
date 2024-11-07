const fs = require('fs')
const traverse = require('@babel/traverse').default
const { parse } = require('@babel/parser')

function getCSSproperties(filePath, options = { sourceType: 'module' }) {
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
                const { quasis, expressions } = path.node
                const rawValue = quasis[0].value.raw
                const pattern = /([^{]+)\s*{\s*([^}]+?)\s*}/g
                let match
                while ((match = pattern.exec(rawValue)) !== null) {
                    const selector = match[1].trim()
                    const properties = match[2].trim().split(';').map(property => property.trim())
                    const props = []
                    for (const line of properties) {
                        const property = extractProperty(line)
                        if (property) {
                            props.push(property)
                        }
                    }
                    const dx = { selector, props }
                    css.push(dx)
                }
            }
        })

        return {
            css
        }
    } catch (error) {
        console.error(`Error parsing or manipulating file: ${filePath} - ${error.message}`)
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
        const [variable, fallback] = match[1].split(',').map(value => value.trim())
        const cssProp = inputText.split(':')[0].trim()
        return cssProp ? { property: cssProp, variable, fallback } : null
    }
    console.log('No property found')
    return null
}

module.exports = getCSSproperties 