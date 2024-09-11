const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ead files recursively
function readFilesRecursively(directory) {
    glob.sync(`${directory}/**/*.{html,css,js}`).forEach(file => {
        if (fs.lstatSync(file).isFile()) {
            const content = fs.readFileSync(file, 'utf8');
            console.log(`file: ${file}`);
            console.log(content);
            console.log('------------------------');
        }
    });
}

// root directory 
const directory = path.resolve('../src/es/components/')

readFilesRecursively(directory);