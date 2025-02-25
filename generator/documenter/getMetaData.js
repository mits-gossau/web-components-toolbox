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
      summary: extractLeadingCommentByType(metaData, 'summary'),
      integration: extractLeadingCommentByType(metaData, 'integration'),
    }
  } catch (error) {
    console.error(`Error parsing file: ${filePath} - ${error.message}`)
    throw error
  }
}

/**
 * Extract the text from the leading comments that starts with the searchKey
 * @param {array} array - the array of leading comments
 * @param {string} searchKey - the key to search for in the leading comments
 * @returns {string} - the extracted text
 */
function extractLeadingCommentByType(array, searchKey = 'summary') {
  const searchTag = `@${searchKey}`

  for (const element of array) {
    const tagIndex = element.indexOf(searchTag)

    if (tagIndex !== -1) {
      let textAfterTag = element.substring(tagIndex + searchTag.length).trim()
      let endIndex = textAfterTag.length

      // find the index of the next '@' symbol that starts a tag
      // this is done to prevent text from a subsequent tag 
      // from being included in the extracted text
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
