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
// For Demo Purposes Only
document.body.setAttribute('style', '--background-color: #eee; background-color: var(--background-color);')