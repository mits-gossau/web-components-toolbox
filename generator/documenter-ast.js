// https://astexplorer.net/
const fs = require('fs')
const path = require('path')
// https://babeljs.io/docs/babel-parser
const { parse } = require('@babel/parser')
// https://babeljs.io/docs/babel-traverse
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default
const glob = require('glob')

// parse and manipulate a file using Babel AST
function parseAndManipulateFile(filePath, options = {}) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const ast = parse(content, {
            ...options,
            sourceFilename: filePath,
            plugins: ['jsx', 'typescript']
        });

        // traverse and manipulate the AST
        traverse(ast, {
            // example visitor to add a console.log statement at the beginning of each file
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
                path.unshiftContainer('body', consoleLogStatement);
            },
        });

        // generate code from the manipulated AST
        const { code } = generate(ast)
        return code
    } catch (error) {
        console.error(`Error parsing or manipulating file: ${filePath} - ${error.message}`);
        throw error
    }
}

// root directory
const directory = path.resolve('../src/es/components/')

// glob pattern to find files
glob.sync(`${directory}/**/*.{js,ts,jsx,tsx}`).forEach(file => {
    const manipulatedCode = parseAndManipulateFile(file, {
        sourceType: 'module', // Specify source type
    })
    console.log(`manipulated file: ${file}`)
    //console.log(manipulatedCode)
});