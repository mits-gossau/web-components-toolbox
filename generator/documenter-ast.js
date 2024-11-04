// https://astexplorer.net/
// https://babeljs.io/docs/babel-parser
// https://babeljs.io/docs/babel-traverse
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const getAttributeNames =  require('./documenter/getAttributes')
const getCSSproperties =  require('./documenter/getCSSProperties')
const generate = require('./documenter/generate')

// root directory
const ROOT_DIR = '../src/es/components/'

// glob pattern to find files
glob.sync(`${ROOT_DIR}/**/*(*.{js,ts,jsx,tsx})`).forEach(file => {

    const directoryPath = path.dirname(file);
    const filePath = `${directoryPath}/x.json` 

    // const manipulatedCode = generate(file, {
    //     sourceType: 'module', // Specify source type
    // })
    //console.log(`manipulated file: ${file}`)
    //console.log(manipulatedCode)

    const attributes = getAttributeNames(file)
    // console.log(attributes)

    const css = getCSSproperties(file)

    // append
    css.attributes = attributes

    const jsonData = JSON.stringify(css, null, 2)
    console.log(jsonData)
    // Read the existing content of the file
    // fs.writeFileSync(filePath, jsonData);
})
