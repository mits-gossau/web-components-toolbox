// https://astexplorer.net/
// https://babeljs.io/docs/babel-parser
// https://babeljs.io/docs/babel-traverse
const fs = require('fs')
const glob = require('glob')
const path = require('path')
const getAttributeNames =  require('./documenter/getAttributes')
const getCSSproperties =  require('./documenter/getCSSProperties')
const generateModified = require('./documenter/generateModified')

const ROOT_DIR = '../src/es/components/'

glob.sync(`${ROOT_DIR}/**/*(*.{js,ts,jsx,tsx})`).forEach(file => {

    const directoryPath = path.dirname(file);
    const filePath = `${directoryPath}/x.json` 
  
    const manipulatedCode = generateModified(file)
    // console.log(`manipulated file: ${file}`)
    // console.log(manipulatedCode)
    // fs.writeFileSync(file, manipulatedCode);

    const data = {
        path: file,
        css: getCSSproperties(file).css,
        attributes: getAttributeNames(file).attributes
    }
    
    const jsonData = JSON.stringify(data, null, 2)
    console.log(jsonData)
    // fs.writeFileSync(filePath, jsonData);
})
