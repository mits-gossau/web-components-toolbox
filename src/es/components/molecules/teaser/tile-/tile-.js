// For Demo Purposes Only
document.body.setAttribute('style', '--background-color: #eee; background-color: var(--background-color);')
// TODO: below line is a hint for reading out the web components file best in a separate js file and then documenting the loaded web components
document.body.addEventListener('wc-config-load', event => event.detail.imports.forEach(importPromise => importPromise.then(importEl => {
  fetch(importEl[3].replace('./', `${location.origin}/`)).then(res => res.text()).then(file => console.log('changed', file))
})))
// TODO: part below should go into a separate file
// for tile-.html load the web components through wc-config plus colors, fonts and variables
if (!location.href.includes('Template')) {
  const script = document.createElement('script')
  script.setAttribute('src', '../../../../../../wc-config.js?triggerImmediately=true')
  document.head.appendChild(script)
  const div = document.createElement('div')
  div.innerHTML = `
    <link href=../../../../../css/colors.css rel=stylesheet type="text/css">
    <link href=../../../../../css/fonts.css rel=stylesheet type="text/css">
    <link href=../../../../../css/variables.css rel=stylesheet type="text/css">
  `
  Array.from(div.children).forEach(child => document.head.appendChild(child))
}