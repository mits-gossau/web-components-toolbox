// @ts-check
import TagManager from '../tagManager/TagManager.js'

/* global self */

/**
 * Facebook Event Pixel
 * Example at: /src/es/components/pages/Home.html
 *
 * @export
 * @class PinterestPixel
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} id
 *  {has} [wc-config-load=n.a.] trigger the render
 *  {number} [timeout=n.a.] timeout to trigger the render
 * }
 * @example {
    <c-pinterest-pixel id="XXXXXXXXXXXXXXX" wc-config-load>
      <noscript>
        <img height="1" width="1" style="display:none;" alt="" src=https://ct.pinterest.com/v3/?event=init&tid=2614324606034&pd[em]=<hashed_email_address>&noscript=1 />
      </noscript>    
    </c-pinterest-pixel>
 * }
 */
export default class PinterestPixel extends TagManager {
  /**
   * setup tag manager
   *
   * @param {string} [id=this.getAttribute('id') || 'XXXXXXXXXXXXXXX']
   * @return {HTMLScriptElement|false}
   */
  setup (id = this.getAttribute('id') || 'XXXXXXXXXXXXXXX') {
    // cookie domain error when only localhost in url bar (only for local debugging)
    if (self.location.hostname !== 'localhost') {
      // prefetch or pre connect o the iframes src
      if (this.hasAttribute('prefetch')) {
        const link = document.createElement('link')
        link.setAttribute('rel', 'dns-prefetch')
        link.setAttribute('href', 'https://ct.pinterest.com')
        document.head.appendChild(link)
      }
      const script = document.createElement('script')
      script.innerHTML = `!function(e){if(!window.pintrk){window.pintrk = function () {window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0]; r.parentNode.insertBefore(t,r)}}(https://s.pinimg.com/ct/core.js);pintrk('load', '${id}', {em: '<user_email_address>'});pintrk('page');`
      return script
    }
    return false
  }
}

