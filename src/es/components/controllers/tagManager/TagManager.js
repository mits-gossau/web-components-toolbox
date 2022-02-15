// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

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
 * @example {
    <c-tag-manager id="GTM-XXXXXX" wc-config-load>
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    </c-tag-manager>
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
    let script
    if ((script = this.setup())) this.html = script
  }

  /**
   * setup tag manager
   *
   * @param {string} [gtmId=this.getAttribute('id') || 'GTM-XXXXXX']
   * @return {HTMLScriptElement|false}
   */
  setup (gtmId = this.getAttribute('id') || 'GTM-XXXXXX') {
    // @ts-ignore
    self.dataLayer = self.dataLayer || []
    // cookie domain error when only localhost in url bar (only for local debugging)
    if (self.location.hostname !== 'localhost') {
      const script = document.createElement('script')
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`
      return script
    }
    return false
  }

  get scripts () {
    return this.root.querySelectorAll('script')
  }
}
