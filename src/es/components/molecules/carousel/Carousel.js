// @ts-check
import BaseCarousel from '../../thirdParty/macroCarousel/MacroCarousel.js'

/* global self */

/**
 *
 * @export
 * @attribute {namespace} namespace
 * @type {CustomElementConstructor}
 */

// @ts-ignore
export default class Carousel extends BaseCarousel {
  constructor (...args) {
    super(...args)
  }

  connectedCallback () {
    super.connectedCallback()
    this.renderCustomCSS()
  }

  disconnectedCallback () {
    super.disconnectedCallback()  
  }

  
  /**
   * renders the m-Details css
   *
   * @return {void}
   */
  renderCustomCSS () {
    
    this.css = /* css */` 
      :host > macro-carousel > .container {} 
      
      :host > macro-carousel > .container > a-picture{} 

      :host > macro-carousel > div > .text {
        width:100%;
        background-color: var(--text-background-color, red);
      }
      :host > macro-carousel > div > .text > p {
        padding:var(--text-padding, 0);
        font-size: var(--text-font-size, 1em);
      }
      :host .macro-carousel-previous, .macro-carousel-next{
        padding:2em;
      }
         


      @media only screen and (max-width: _max-width_) {}
    `

    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'carousel-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles, false)
    }
  }



  

  
}
