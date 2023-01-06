// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

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
export default class Iframe extends Shadow() {
  constructor (...args) {
    super(...args) // disabling shadow-DOM to have msrc styles flow into the node

    this.wcConfigLoadListener = event => {
      if (this.shouldComponentRenderHTML()) this.renderHTML()
    }
  }

  connectedCallback () {
    document.body.addEventListener(this.getAttribute('wc-config-load') || 'wc-config-load', this.wcConfigLoadListener, { once: true })
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
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    // prefetch or pre connect o the iframes src
    const link = document.createElement('link')
    link.setAttribute('rel', 'prefetch')
    link.setAttribute('href', this.iframe.getAttribute('src'))
    document.head.appendChild(link)
    // set the fix height of the iframe until we load it
    this.css = /*css*/`
      :host {
        height: ${this.iframe.getAttribute('height')}px;
        ${this.hasAttribute('background-color')
          ? `background-color: ${this.getAttribute('background-color')};`
          : ''
        }
      }
    `
    const templateContent = this.template.content
    this.template.remove()
    setTimeout(() => {
      this.html = templateContent
      this.css = ''
      this.css = /*css*/`
        :host {
          line-height: 0;
        }
      `
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
