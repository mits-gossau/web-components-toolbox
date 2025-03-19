// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

/**
* https://github.com/datalog/qrcode-svg
* max length 1264
*
* @export
* @class QrCodeSvg
* @type {CustomElementConstructor}
*/
export default class QrCodeSvg extends Shadow() {
  static get observedAttributes () {
    return ['data']
  }

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

  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue !== null && oldValue !== newValue) {
      clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(() => this.renderHTML(), 200)
    }
  }

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
    return !this.svg
  }

  /**
   * renders the css
   * @returns Promise<void>
   */
  renderCSS () {
    this.css = /* css */`
      :host > svg {
        height: var(--height, auto);
        max-height: var(--max-height, 75dvh);
        width: var(--width, 100%);
      }
      :host > h5 {
        color: var(--color-error, red);
      }
      @media only screen and (max-width: _max-width_) {
        :host {}
      }
    `
    return Promise.resolve()
  }

  /**
   * Render HTML
   * @returns Promise<void>
   */
  renderHTML () {
    return this.loadDependency('QRCode', `${this.importMetaUrl}./qrcode.min.js`).then(QRCode => {
      if (this.svg) this.svg.remove()
      if (this.getAttribute('data').length > 1264) {
        this.html = ''
        return this.html = '<h5>Warning: String too long! The qr code can not be generated...</h5>'
      }
      this.html = QRCode({
        msg: this.getAttribute('data'),
        pad: 0,
        pal: ['#000', '#fff']
      })
      this.svg.setAttribute('part', 'svg')
      this.root.querySelector('[fill="#000"]').setAttribute('fill', `var(--${this.getAttribute('namespace') || ''}color, black)`)
      this.root.querySelector('[fill="#fff"]').setAttribute('fill', `var(--${this.getAttribute('namespace') || ''}background-color, transparent)`)
    })
  }

  /**
   * fetch dependency
   *
   * @returns {Promise<any>}
   */
  loadDependency (globalNamespace, url) {
    // make it global to self so that other components can know when it has been loaded
    return this[`_loadDependency${globalNamespace}`] || (this[`_loadDependency${globalNamespace}`] = new Promise((resolve, reject) => {
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

  get svg () {
    return this.root.querySelector('svg')
  }
}
