function generate(filePath, options = {}) {
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

module.exports = generate 