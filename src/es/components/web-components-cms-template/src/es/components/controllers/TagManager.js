// @ts-check
import { Shadow } from '../prototypes/Shadow.js'

/**
 * Example at: /src/es/components/pages/Home.html
 *
 * @export
 * @class TagManager
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} id
 *  {has} [wc-config-load=n.a.] trigger the render
 *  {number} [timeout=n.a.] timeout to trigger the render
 * }
 */
export default class TagManager extends Shadow() {
  constructor (...args) {
    super(...args) // disabling shadow-DOM to have msrc styles flow into the node

    this.wcConfigLoadListener = event => {
      if (this.getAttribute('timeout') && this.getAttribute('timeout') !== null) {
        setTimeout(() => {
          if (this.shouldComponentRenderHTML()) this.render()
        }, Number(this.getAttribute('timeout')))
      } else if (this.shouldComponentRenderHTML()) this.render()
    }
  }

  connectedCallback () {
    if (this.hasAttribute('wc-config-load')) {
      document.body.addEventListener(this.getAttribute('wc-config-load') || 'wc-config-load', this.wcConfigLoadListener, { once: true })
    } else if (this.getAttribute('timeout') && this.getAttribute('timeout') !== null) {
      setTimeout(() => {
        if (this.shouldComponentRenderHTML()) this.render()
      }, Number(this.getAttribute('timeout')))
    } else if (this.shouldComponentRenderHTML()) this.render()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return !this.scripts.length
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  render () {
    const script = document.createElement('script')
    script.textContent = /* html */`
      window.ga = window.ga || function () { (ga.q = ga.q || []).push(arguments) }; ga.l = +new Date;
      ga('create', '${this.getAttribute('id')}', 'auto');
      ga('send', 'pageview');
    `
    this.html = script
    this.loadDependency()
  }

  /**
   * fetch dependency
   *
   * @returns {Promise<{components: any}>}
   */
  loadDependency () {
    return this.dependencyPromise || (this.dependencyPromise = new Promise(resolve => {
      const gtmScript = document.createElement('script')
      gtmScript.setAttribute('type', 'text/javascript')
      // TODO: Should Integrity check? https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
      gtmScript.setAttribute('src', 'https://www.google-analytics.com/analytics.js')
      gtmScript.onload = () => {
        resolve()
      }
      this.html = gtmScript
    }))
  }

  get scripts () {
    return this.root.querySelectorAll('script')
  }
}
