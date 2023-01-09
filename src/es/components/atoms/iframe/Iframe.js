// @ts-check
import { Intersection } from '../../prototypes/Intersection.js'

/* global self */

/**
 * Lazy load Iframe
 * Example at: /src/es/components/atoms/iframe/Iframe.html
 *
 * @export
 * @class Iframe
 * @type {CustomElementConstructor}
 * @attribute {
 *  {number} [timeout=200]
 * }
 * @example {
    <a-iframe>
      <template>
        <iframe width='100%' height='480' src='https://my.matterport.com/show/?m=YSNEkt4DstH&brand=0' frameborder='0' allowfullscreen allow='vr'></iframe>
      </template>
    </a-iframe>
 * }
 */
export default class Iframe extends Intersection() {
  constructor (options = {}, ...args) {
    super(Object.assign(options, { intersectionObserverInit: {} }), ...args)

    // cant set the same namespace in backend as o-wrapper 
    if (!this.hasAttribute("namespace") && this.getRootNode().host.getAttribute("namespace")) 
      this.setAttribute("namespace", this.getRootNode().host.getAttribute("namespace"))
    
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    const finalRender = this.shouldComponentRenderHTML() ? this.renderHTML() : () => console.warn('No required template tag found within this component: ', this)
    const renderPromises = []
    renderPromises.push(new Promise(resolve => document.body.addEventListener(this.getAttribute('wc-config-load') || 'wc-config-load', event => resolve(event), { once: true })))
    renderPromises.push(new Promise(resolve => this.intersecting = event => resolve(event)))
    Promise.all(renderPromises).then(finalRender)
  }

  intersectionCallback (entries, observer) {
    // @ts-ignore
    if ((this.isIntersecting = entries && entries[0] && entries[0].isIntersecting)) this.intersecting()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }
  

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return this.template
  }


  /**
   * renders the a-Iframe css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        --${this.getAttribute("namespace")}padding: calc(56.10% / 4);
        height: 0;
        line-height: 0;
        overflow: hidden;
        padding: var(--${this.getAttribute("namespace")}padding, 0); /* no namespace in this component */
        position: relative;

        ${this.hasAttribute('background-color')
          ? `background-color: ${this.getAttribute('background-color')};`
          : ''
        }
      }
      :host > iframe {
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
      }
      @media screen and (max-width: _max-width_) {
        :host {
          --${this.getAttribute("namespace")}padding: calc(56.10% / 2);
        }
      }
    `
  }


  /**
   * renders the html
   *
   * @return {()=>void} final render function with a default of 200ms timeout
   */
  renderHTML () {
    // prefetch or pre connect o the iframes src
    const link = document.createElement('link')
    link.setAttribute('rel', 'prefetch')
    link.setAttribute('href', this.iframe.getAttribute('src'))
    document.head.appendChild(link)
    // set the fix height of the iframe until we load it
    const templateContent = this.template.content
    this.template.remove()
    return () => setTimeout(() => {
      this.html = templateContent
    }, this.getAttribute('timeout') && this.getAttribute('timeout') !== null
      ? Number(this.getAttribute('timeout'))
      : 200)
  }

  get template () {
    return this.root.querySelector('template')
  }

  get iframe () {
    return this.template && this.template.content.querySelector('iframe') || this.root.querySelector('iframe')
  }
}
