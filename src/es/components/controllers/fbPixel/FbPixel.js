// @ts-check
import TagManager from '../tagManager/TagManager.js'

/* global self */

/**
 * Facebook Event Pixel
 * Example at: /src/es/components/pages/Home.html
 *
 * @export
 * @class FbPixel
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} id
 *  {has} [wc-config-load=n.a.] trigger the render
 *  {number} [timeout=n.a.] timeout to trigger the render
 * }
 * @example {
    <c-fb-pixel id="XXXXXXXXXXXXXXX" wc-config-load>
      <noscript><img height="1" width="1" src="https://www.facebook.com/tr?id=889748457863737&ev=PageView&noscript=1" /></noscript>
    </c-fb-pixel>
 * }
 */
export default class FbPixel extends TagManager {
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
        link.setAttribute('href', 'https://connect.facebook.net')
        document.head.appendChild(link)
      }
      const script = document.createElement('script')
      script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${id}');fbq('track', 'PageView');`
      return script
    }
    return false
  }
}
