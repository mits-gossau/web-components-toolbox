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
