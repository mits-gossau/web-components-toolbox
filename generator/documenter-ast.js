const fs = require('fs')
const glob = require('glob')
const path = require('path')
const getAttributeNames = require('./documenter/getAttributes')
const getCSSproperties = require('./documenter/getCSSProperties')
const generateModified = require('./documenter/generateModified')

const ROOT_DIR = '../src/es/components/'

glob.sync(`${ROOT_DIR}/**/*(*.{js,ts,jsx,tsx})`, {
    ignore: [
        `${ROOT_DIR}/prototypes/**`,
        `${ROOT_DIR}/pages/**`,
        `${ROOT_DIR}/msrc/**`,        
        `${ROOT_DIR}/mcs/**`,         
        `${ROOT_DIR}/controllers/**`,
        `${ROOT_DIR}/contentful/**`  
    ]
}).forEach(async file => {
    const attr = getAttributeNames(file)
    // For each file found, prepare a data object containing:
    // - the file path
    // - CSS properties extracted from the file
    // - attribute names extracted from the file
    const data = {
        path: file,
        css: getCSSproperties(file).css, // Extract CSS properties from the file
        namespaces: attr.namespaces,
        attributes: attr.attributes // Extract attribute names from the file
    }

    // Convert the data object to a JSON string with indentation for readability
    const jsonData = JSON.stringify(data, null, 2)

    // Perform both file write operations concurrently:
    // - Overwrite the original file with its modified version
    // - Write the JSON data to a new x.json file in the same directory as the original file
    await Promise.all([
        // fs.promises.writeFile(file, generateModified(file)), // Write the modified code back to the file
        // fs.promises.writeFile(`${path.dirname(file)}/x.json`, jsonData) // Write the JSON data to a file
    ])

    console.log(`manipulated file: ${file}`)
    console.log(jsonData)
})
