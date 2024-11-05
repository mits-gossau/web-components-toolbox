const fs = require('fs')
const { parse } = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default

function generateModified(filePath, options = { sourceType: 'module' }) {
    try {
        const content = fs.readFileSync(filePath, 'utf8')
        const ast = parse(content, {
            ...options,
            sourceFilename: filePath,
            plugins: ['jsx', 'typescript']
        });

        traverse(ast, {
            // example visitor to add a "console.log" statement at the beginning of each file
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

        const { code } = generate(ast)
        return code
    } catch (error) {
        console.error(`Error parsing or manipulating file: ${filePath} - ${error.message}`)
        throw error
    }
}

module.exports = generateModified 