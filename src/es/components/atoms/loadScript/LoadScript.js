// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
* @export
* @class LoadScript
* @type {CustomElementConstructor}
*/
export default class LoadScript extends Shadow() {
  constructor (...args) {
    super({ mode: 'false' }, ...args) // disabling shadow-DOM to have msrc styles flow into the node

    this.wcConfigLoadListener = event => {
      if (this.getAttribute('timeout') && this.getAttribute('timeout') !== null) {
        setTimeout(() => {
          if (this.shouldRenderHTML()) this.render()
        }, Number(this.getAttribute('timeout')))
      } else if (this.shouldRenderHTML()) this.render()
    }
  }

  connectedCallback () {
    if (this.hasAttribute('wc-config-load')) {
      document.body.addEventListener(this.getAttribute('wc-config-load') || 'wc-config-load', this.wcConfigLoadListener, { once: true })
    } else if (this.getAttribute('timeout') && this.getAttribute('timeout') !== null) {
      setTimeout(() => {
        if (this.shouldRenderHTML()) this.render()
      }, Number(this.getAttribute('timeout')))
    } else if (this.shouldRenderHTML()) this.render()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.script
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  render () {
    this.html = this.setup()
  }

  /**
   * setup tag manager
   *
   * @return {HTMLScriptElement|false}
   */
  setup () {
    // prefetch or pre connect o the iframes src
    if (this.hasAttribute('prefetch')) {
      const link = document.createElement('link')
      link.setAttribute('rel', 'dns-prefetch')
      link.setAttribute('href', this.getAttribute('src'))
    }
    const script = document.createElement('script')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('src', this.getAttribute('src'))
    return script
  }

  get script () {
    return this.root.querySelector('script')
  }
}