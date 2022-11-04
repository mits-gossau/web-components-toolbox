/* global location */

// the loader shall make it easy to get all component preview files for previews from within src/...
const script = document.createElement('script')
script.setAttribute('src', location.href.replace(/\/(?:.(?!\/src\/))+$/g, '/wc-config.js?triggerImmediately=true'))
document.head.appendChild(script)
const env = document.createElement('script')
env.setAttribute('src', location.href.replace(/\/(?:.(?!\/src\/))+$/g, '/src/es/helpers/Environment.js'))
document.head.appendChild(env)
const div = document.createElement('div')
div.innerHTML = `
    <link href=${location.href.replace(/\/(?:.(?!\/src\/))+$/g, '/src/css/colors.css')} rel=stylesheet type="text/css">
    <link href=${location.href.replace(/\/(?:.(?!\/src\/))+$/g, '/src/css/fonts.css')} rel=stylesheet type="text/css">
    <link href=${location.href.replace(/\/(?:.(?!\/src\/))+$/g, '/src/css/variables.css')} rel=stylesheet type="text/css">
  `
Array.from(div.children).forEach(child => document.head.appendChild(child))
