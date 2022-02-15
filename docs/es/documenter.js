/* global fetch */
/* global location */

// the documenter shall only be used at component previews within src/...
const componentName = new URL(document.currentScript.src).searchParams.get('component')
if (componentName) {
  document.body.addEventListener('wc-config-load', event => event.detail.imports.forEach(importPromise => importPromise.then(importEl => {
    if (importEl[3].includes(componentName)) {
      fetch(location.href.replace(/\/(?:.(?!src\/))+$/g, importEl[3].replace('./', '/'))).then(res => res.text())/* .then(file => console.log('documenter.js', file)) */
      console.log('documenter.js runs')
    }
  })))
}
