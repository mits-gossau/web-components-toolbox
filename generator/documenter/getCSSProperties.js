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
    const property = properties.match(/var\((.*?)\)/)
    if (property) {
        const pr1 = property[1].split(',').map(value => value.trim())
        const cssProp = inputText.split(':')[0].trim()
        if (cssProp) {
            return {
                property: cssProp,
                variable: pr1[0],
                fallback: pr1[1]
            }
        }
    }
    console.log('No property found')
    return null
}

module.exports = getCSSproperties 