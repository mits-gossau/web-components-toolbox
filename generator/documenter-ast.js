// https://astexplorer.net/
const fs = require('fs')
const path = require('path')
// https://babeljs.io/docs/babel-parser
const { parse } = require('@babel/parser')
// https://babeljs.io/docs/babel-traverse
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default
const glob = require('glob')

function getAttributeNames(filePath, options = {}) {
    const functions = []
    const variables = []
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
            },
            MemberExpression(path) {
                if (path.node.object.type === 'ThisExpression' && path.node.property.name === 'getAttribute') {
                    console.log(`Found this.getAttribute at line ${path.node.loc.start.line}, column ${path.node.loc.start.column}`)
                }
            },
            FunctionDeclaration(path) {
                functions.push(path.node.id.name)
            },
            VariableDeclarator(path) {
                variables.push(path.node.id.name)
            },
        })
        return {
            functions,
            variables,
            attributes
        }
    } catch (error) {
        console.error(`Error parsing or manipulating file: ${filePath} - ${error.message}`)
        throw error
    }
}

function extractProperty(inputText) {
    const properties = inputText.split(';').map(line => line.trim()).filter(line => line !== '')[0]
    if(!properties) return null
    const property = properties.match(/var\((.*?)\)/)
    if (property) {
        const pr1 = property[1].split(',').map(value => value.trim())
        const cssProp = inputText.split(':')[0].trim()
        if (cssProp) {
            return {
                property: cssProp,
                variable: pr1[0],
                fallback: pr1[1]
            };
        }
    }
    console.log('No property found');
    return null;
}

function getCSSproperties(filePath, options = {}) {
    const cssProperties = []
    const cssData = {
        filePath,
        css: []
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8')
        const ast = parse(content, {
            ...options,
            sourceFilename: filePath,
            plugins: ['jsx', 'typescript']
        });

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
                    const dx = {selector, props }
                    cssData.css.push(dx)
                    // console.log(cssData)
                    cssProperties.push(cssData)

                }
            }
        });

        return {
            cssData
        }
    } catch (error) {
        console.error(`Error parsing or manipulating file: ${filePath} - ${error.message}`)
        throw error
    }
}

function parseAndManipulateFile(filePath, options = {}) {
    try {
        const content = fs.readFileSync(filePath, 'utf8')
        const ast = parse(content, {
            ...options,
            sourceFilename: filePath,
            plugins: ['jsx', 'typescript']
        });

        // traverse and manipulate(!!!) the AST
        traverse(ast, {
            // example visitor to add a "console.log" statement at the beginning of each file
            // see log output for result!
            Program(path) {
                const consoleLogStatement = {
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'CallExpression',
                        callee: {
                            type: 'MemberExpression',
                            object: {
                                type: 'Identifier',
                                name: 'console',
                            },
                            property: {
                                type: 'Identifier',
                                name: 'log',
                            },
                        },
                        arguments: [
                            {
                                type: 'StringLiteral',
                                value: 'File loaded',
                            },
                        ],
                    },
                };
                path.unshiftContainer('body', consoleLogStatement)
            },
        });

        // generate code from the manipulated AST
        const { code } = generate(ast)
        return code
    } catch (error) {
        console.error(`Error parsing or manipulating file: ${filePath} - ${error.message}`)
        throw error
    }
}

// root directory
//const directory = path.resolve('../src/es/components/')
const directory = '../src/es/components/'

// glob pattern to find files
glob.sync(`${directory}/**/*(*.{js,ts,jsx,tsx})`).forEach(file => {
    // const manipulatedCode = parseAndManipulateFile(file, {
    //     sourceType: 'module', // Specify source type
    // })
    //console.log(`manipulated file: ${file}`)
    //console.log(manipulatedCode)

    // const attributes = getAttributeNames(file, {
    //     sourceType: 'module', // Specify source type
    // })
    //console.log(attributes)

    const css = getCSSproperties(file, {
        sourceType: 'module', // Specify source type
    })
    const jsonData = JSON.stringify(css, null, 2)
    //console.log(jsonData)
    const filePath = 'user_profile.json'
    // Read the existing content of the file
    let existingData = ''
    try {
        existingData = fs.readFileSync(filePath, 'utf-8')
    } catch (error) {
        console.error('Error reading file:', error)
    }
    const updatedData = existingData ? `${existingData},\n${jsonData}` : `${jsonData},\n`
    fs.writeFileSync(filePath, updatedData);
})
console.log("END")
