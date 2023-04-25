// @ts-check
import { Prototype } from '../Prototype.js'

/* global self */

/**
 * digital-campaign-factory Widget ask niels
 * Example at: klubschule wettbewerb Home.html
 *
 * @export
 * @class Widget
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} [language=document.documentElement.getAttribute('lang') || 'de']
 *  {string} id
 *  {string} name
 * }
 * @example {
    <mcs-widget>
        <template>
            <div id="mdcf-wheel">
                <style>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); }  }</style>
                <div style="width: 100%; height: 100%; min-height: 200px; display: flex; justify-content: center; align-items: center; color: #949494">
                  <svg width="32px" height="32px" viewBox="0 0 400 400" style="animation: spin 0.75s linear infinite">
                    <path fill="currentColor" fill-rule="nonzero" d="M200,50V0c110.5,0,200,89.5,200,200h-50C350,117.2,282.8,50,200,50z" />
                  </svg>
                </div>
                </div>
                <script>
                    async function load() {
                        var head = document.head;
                        let {version} = await (await fetch('https://digital-campaign-factory.migros.ch/api/version')).json();
                        var script = document.createElement('script');
                        const src = 'https://digital-campaign-factory.migros.ch/static-widgets/%version%/main.js'.replace('%version%', version);

                        script.type = 'text/javascript';
                        script.src = src;

                        script.onload = () => {if (window.mcs !== undefined){ window.mcs.wheel(document.getElementById('mdcf-wheel'), { language: 'de', wheelId: 'W1wlwhzIlaCHivyqdvlW' });}};
                        head.appendChild(script);
                    }
                    load();
                </script>
        </template>
    </mcs-widget>
 * }
 */
export default class Widget extends Prototype() {
  // !IMPORTANT: Must be in the LIGHT DOM for query Selectors to get through!
  constructor (...args) {
    super({ mode: 'false' }, ...args)
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRender()) showPromises.push(this.render())
    Promise.all(showPromises).then(() => (this.hidden = false))
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRender () {
    return !this.mscWrapper
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  render () {
    this.mscWrapper = this.root.querySelector('div') || document.createElement('div')
    this.mscWrapper.innerHTML = '<style>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); }  }</style><div style="width: 100%; height: 100%; min-height: 200px; display: flex; justify-content: center; align-items: center; color: #949494">  <svg width="32px" height="32px" viewBox="0 0 400 400" style="animation: spin 0.75s linear infinite">    <path fill="currentColor" fill-rule="nonzero" d="M200,50V0c110.5,0,200,89.5,200,200h-50C350,117.2,282.8,50,200,50z" />  </svg></div>'
    return this.loadDependency().then(msc => {
      let name = this.getAttribute('name')
      let id = this.getAttribute('id')
      // read out the template and overwrite the vars and html
      if (this.template) {
        const templateContent = this.template.content
        this.template.remove()
        // append all nodes except of script node (typically this is the mcs loader animation div plus style tag)
        if (templateContent.querySelector(':not(script)')) {
          this.mscWrapper.innerHTML = ''
          Array.from(templateContent.querySelector(':not(script)').children).forEach(child => this.mscWrapper.appendChild(child))
        }
        // read out the script for the keywords of name (widget name) and id (expl. wheelId)
        if (templateContent.querySelector('script')) {
          name = Array.from(templateContent.querySelector('script').textContent.match(/mcs\.([a-z]*?)\(/) || [])[1] || name
          id = Array.from(templateContent.querySelector('script').textContent.match(new RegExp(`${name}Id:[\\s]{0,1}['"]{1}(.*?)['"]{1}`)) || [])[1] || id
        }
      }
      if (!name) return console.error('error no name supplied: ', name, this)
      if (name in msc === false) return console.error('error wrong widget name: ', name, this)
      if (!id) return console.error('error no id supplied: ', id, this)
      msc[name](this.mscWrapper, JSON.parse(`{
        "language": "${this.getAttribute('language') || self.Environment.language}",
        "${name}Id": "${id}"
      }`))
      this.setAttribute('name', name)
      this.setAttribute('id', id)
      return (this.html = this.mscWrapper)
    })
  }

  get template () {
    return this.root.querySelector('template')
  }
}
