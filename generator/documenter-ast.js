// https://astexplorer.net/
const fs = require('fs')
const path = require('path')
// https://babeljs.io/docs/babel-parser
const { parse } = require('@babel/parser')
// https://babeljs.io/docs/babel-traverse
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default
const glob = require('glob')


// see traverse at line 12 for 'this.getAttribute' example
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
                    // console.log(`found this.getAttribute('${attributeName}') at line ${path.node.loc.start.line}, column ${path.node.loc.start.column}`)
                    attributes.push(attributeName)
                }
            },
            MemberExpression(path) {
                if (path.node.object.type === 'ThisExpression' && path.node.property.name === 'getAttribute') {
                    // console.log(`Found this.getAttribute at line ${path.node.loc.start.line}, column ${path.node.loc.start.column}`)
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

function getCSSproperties(filePath, options = {}) {
    const cssProperties = []
    try {
        const content = fs.readFileSync(filePath, 'utf8')
        const ast = parse(content, {
            ...options,
            sourceFilename: filePath,
            plugins: ['jsx', 'typescript']
        });

        traverse(ast, {
            TemplateLiteral(path) {
                const templateLiteral = path.node
                const rawValue = templateLiteral.quasis.map(quasi => quasi.value.cooked).join('')
                //const regex = /var$$--([a-zA-Z-]+),\s*([a-zA-Z0-9#.-]+)$$/g
                //const regex = /--([a-zA-Z-]+)/g
                const regex = /--([a-zA-Z-]+),\s*([a-zA-Z0-9#.-]+)/g
                let match
                while ((match = regex.exec(rawValue)) !== null) {
                    cssProperties.push({ variable: match[1], fallback: match[2] })
                }
            },
        });

        return {
            cssProperties
        }
    } catch (error) {
        console.error(`Error parsing or manipulating file: ${filePath} - ${error.message}`)
        throw error
    }
}

// parse and manipulate a file using Babel AST
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
const directory = path.resolve('../src/es/components/')

// glob pattern to find files
glob.sync(`${directory}/**/*.{js,ts,jsx,tsx}`).forEach(file => {
    // const manipulatedCode = parseAndManipulateFile(file, {
    //     sourceType: 'module', // Specify source type
    // })
    //console.log(`manipulated file: ${file}`)
    //console.log(manipulatedCode)

    const attributes = getAttributeNames(file, {
        sourceType: 'module', // Specify source type
    })
    //console.log(attributes)

    const css = getCSSproperties(file, {
        sourceType: 'module', // Specify source type
    })
    console.log(css)
});