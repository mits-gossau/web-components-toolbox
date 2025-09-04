// @ts-check
import { Shadow } from '../../src/es/components/prototypes/Shadow.js'

/**
* @export
* @class Toolbook
* @type {CustomElementConstructor}
*/
export default class Toolbook extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    if (this.template) ({ example: this.example, attributes: this.dataAttributes } = JSON.parse(this.template.content.textContent))
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
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.ul
  }

  /**
   * renders the css
   * @returns Promise<void>
   */
  renderCSS () {
    this.css = /* css */`
      :host {}
      @media only screen and (max-width: _max-width_) {
        :host {}
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   */
  fetchTemplate () {
    /** @type {import("../../src/es/components/prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${this.importMetaUrl}../../src/css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../src/css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * Render HTML
   * @returns Promise<void>
   */
  renderHTML () {
    let html = '<ul>'
    for (const key in this.dataAttributes) {
      html += `<li>${key}: ${this.dataAttributes[key].values}</li>`
    }
    html += '</ul>'
    this.html = html
  }

  get ul () {
    return this.root.querySelector('ul')
  }

  get template () {
    return this.root.querySelector('template')
  }
}
