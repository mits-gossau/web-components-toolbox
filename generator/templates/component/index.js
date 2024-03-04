#!/usr/bin/env node

const fs = require('fs-extra')
const ejs = require('ejs')
const path = require('path')
const inquirer = require('inquirer')

/**
 * Takes in data and a template path, and renders default HTML, JavaScript, and CSS templates using the provided data.
 * @param data - Object that contains the data to be passed to the EJS templates for rendering.
 * @param templatePath - The path where the rendered templates will be saved. It is a string that represents the directory path where the output files will be created.
 */
const renderTemplates = (data, templatePath) => {
  if(data?.typeShort === 'c') return
  const defaults = [
    { file: path.join(__dirname, './defaultHtml.ejs'), out: 'default-.html' },
    { file: path.join(__dirname, './defaultJs.ejs'), out: 'default-.js' },
    { file: path.join(__dirname, './defaultCss.ejs'), out: 'default-.css' }
  ]
  defaults.forEach((f) => {
    ejs.renderFile(f.file, data, {}, (err, str) => {
      if (err) console.error(err)
      const outputFile = `${templatePath}/${f.out}`
      fs.ensureFileSync(outputFile)
      fs.outputFileSync(outputFile, str)
    })
  })
}

/**
 * Renders an EJS template file with provided data and options, and saves the
 * rendered output to a specified directory with a specified filename.
 * @param directoryPath - String that represents the path to the directory where the output file will be saved.
 * @param filename - Path to the EJS template file that you want to render.
 * It should be a string representing the file path, including the file extension (e.g., "template.ejs").
 * @param data - Object that contains the data that will be used to render the EJS template.
 * @param [options] - The `options` parameter is an optional object that can contain additional
 * configuration options for rendering the file. These options can include things like the template
 * engine settings, such as the delimiter, caching options, or any other specific options supported by
 * the template engine being used.
 */
const renderFile = (directoryPath, filename, data, options = {}) => {
  ejs.renderFile(filename, data, options, (err, str) => {
    if (err) console.error(err)
    const outputFile = path.join(process.cwd(), `${directoryPath}/${data.name}.js`)
    fs.ensureFileSync(outputFile)
    fs.outputFileSync(outputFile, str)
  })
}

/**
 * Creates a directory at the specified `directoryPath` and a subdirectory at
 * the specified `templatePath`, and if the directories already exist, it deletes them and recreates them.
 * @param directoryPath - Path where you want to create a new directory. This is the main directory that you want to create.
 * @param templatePath - The path where you want to create a directory for templates.
 */
const makeFolder = (directoryPath, templatePath) => {
  try {
    fs.mkdirSync(directoryPath)
    fs.mkdirSync(templatePath)
  } catch (err) {
    if (err.code === 'EEXIST') {
      // main dir
      fs.rmSync(directoryPath, { recursive: true, force: true })
      fs.mkdirSync(directoryPath)
      // template dir
      fs.rmSync(templatePath, { recursive: true, force: true })
      fs.mkdirSync(templatePath)
    } else {
      throw err
    }
  }
}

/**
 * Generates a template for a component based on the provided name and type.
 */
const main = () => {
  inquirer.prompt(
    [
      {
        name: 'type',
        message: 'What would you like to generate?',
        type: 'list',
        choices: ['atom', 'molecule', 'organism', 'controller']
      },
      {
        name: 'name',
        message: 'What is the component name?',
        type: 'input',
        validate: (name) => {
          if (!name.length) {
            return 'Please provide a component name'
          }
          return true
        }
      }
    ]).then((answers) => {
    try {
      console.log('Generating template...')

      const { name, type } = answers

      const data = {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        folderName: name.charAt(0).toLowerCase() + name.slice(1),
        nameSpace: name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
        type: type + 's',
        typeShort: type.charAt(0)
      }

      const directoryPath = `./src/es/components/${data.type}/${data.folderName}/`
      const templatePath = data.typeShort === 'c' ? `${directoryPath}/` : `${directoryPath}/default-/`
      const template = data.typeShort === 'c' ? './controller.ejs' :'./component.ejs' 
      const filename = path.join(__dirname, template)

      makeFolder(directoryPath, templatePath)
      renderFile(directoryPath, filename, data)
      renderTemplates(data, templatePath)

      console.log('Done. Reload File Explorer.')
    } catch (err) {
      console.error(err)
    }
  })
}

main()
