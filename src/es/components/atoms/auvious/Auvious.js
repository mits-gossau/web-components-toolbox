// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * https://docs.auvious.com/docs/get-started/widget/
 *
 * @export
 * @class Auvious
 * @type {CustomElementConstructor}
 */
export default class Auvious extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => (this.hidden = false))
  }

  disconnectedCallback () {}

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return this.hasAttribute('id') ? !this.root.querySelector(`:host > style[_css], #${this.getAttribute('id')} > style[_css]`) : !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`) 
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.widget
  }

  /**
   * renders the css
   */
  renderCSS () {
    this.css = /* css */`
      :host {}
      @media only screen and (max-width: _max-width_) {
        :host {}
      }
    `
    return Promise.resolve()
  }

  /**
   * Render HTML
   * @returns void
   */
  renderHTML () {
    this.html = Array.from(this.attributes).reduce((acc, attribute) => {
      if (attribute.name && attribute.name !== 'style' && attribute.name !== 'namespace' && attribute.name !== 'tabindex' && !attribute.name.includes('hidden')) return `${acc} ${attribute.name}="${attribute.value || 'true'}"`
      return acc
    }, '<app-auvious-widget') + '></app-auvious-widget>'
    return Promise.all([
      customElements.whenDefined('app-auvious-widget'),
      this.loadDependency('auviousesm', 'https://auvious.video/widget/dist/auvious/auvious.esm.js')
    ])
  }

  /**
   * fetch dependency
   *
   * @returns {Promise<any>}
   */
  loadDependency (globalNamespace, url) {
    // make it global to self so that other components can know when it has been loaded
    return this[`#loadDependency${globalNamespace}`] || (this[`#loadDependency${globalNamespace}`] = new Promise((resolve, reject) => {
      // @ts-ignore
      if (document.head.querySelector(`#${globalNamespace}`) || self[globalNamespace]) return resolve(self[globalNamespace])
      const script = document.createElement('script')
      script.setAttribute('type', 'module')
      script.setAttribute('id', globalNamespace)
      script.setAttribute('src', url)
      // @ts-ignore
      script.onload = () => self[globalNamespace]
        // @ts-ignore
        ? resolve(self[globalNamespace])
        : reject(new Error(`${globalNamespace} does not load into the global scope!`))
      document.head.appendChild(script)
    }))
  }

  get widget () {
    return this.root.querySelector('app-auvious-widget')
  }
}
