const fs = require('fs')
const traverse = require('@babel/traverse').default
const { parse } = require('@babel/parser')

function getMetaData(filePath, options = { sourceType: 'module' }) {
  const metaData = []
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const ast = parse(content, {
      ...options,
      sourceFilename: filePath,
      plugins: ['jsx', 'typescript'],
    })

    traverse(ast, {
      ExportDefaultDeclaration(path) {
        const leadingComments = path.node.leadingComments
        if (leadingComments) {
          leadingComments.forEach(comment => {
            metaData.push(comment.value)
          })
        }
      }
    })
    return {
      summary: extractSummaryText(metaData, 'summary'),
      integration: extractSummaryText(metaData, 'integration'),
    }
  } catch (error) {
    console.error(`Error parsing file: ${filePath} - ${error.message}`)
    throw error
  }
}

function extractSummaryText(array, searchKey = 'summary') {
  const searchTag = `@${searchKey}`

  for (const element of array) {
    const tagIndex = element.indexOf(searchTag)

    if (tagIndex !== -1) {
      let textAfterTag = element.substring(tagIndex + searchTag.length).trim()
      let endIndex = textAfterTag.length

      // find the index of the next '@' symbol that starts a tag
      for (let i = 0; i < textAfterTag.length; i++) {
        // check for '@' preceded by whitespace (or at the very beginning, but i>0 prevents issues in this case)
        if (textAfterTag[i] === '@' && i > 0 && /\s/.test(textAfterTag[i - 1])) {
          endIndex = i
          break
          // handle if the next tag is immediately after the search tag without whitespace
        } else if (textAfterTag[i] === '@' && i === 0) {
          endIndex = i
          break
        }
      }

      textAfterTag = textAfterTag.substring(0, endIndex).trim()
      return textAfterTag.replace(/\*/g, '')
    }
  }
  return 'n/a' 
}

module.exports = getMetaData
