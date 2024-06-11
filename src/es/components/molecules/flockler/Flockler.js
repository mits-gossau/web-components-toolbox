// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

/**
 * Flockler
 * https://github.com/flockler/react-flockler-embed/blob/main/src/index.tsx
 *
 * @export
 * @class Flockler
 * @type {CustomElementConstructor}
 * @attribute {
 * }
 * @css {
 * }
 */
export default class Flockler extends Shadow() {
  constructor (...args) {
    super(...args)

    this.messageListener = event => {
      if (event.origin !== 'https://plugins.flockler.com') return
      if (event.data.eventName !== 'FlockerIframeResizeEvent') return
      this.iframe.setAttribute('height', event.data.nativeHeight)
      this.iframe.contentWindow.postMessage({ eventName: 'FlockerIframeResizeReceivedEvent' }, '*')
    }
    let timeout
    this.messageListenerAppear = event => {
      if (event.origin !== 'https://plugins.flockler.com') return
      // the iframe is going to calculate the height and triggers this listener multiple time, once done we make the iframe appear to avoid ugly display issues
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        this.classList.add('loaded')
        self.removeEventListener('message', this.messageListenerAppear)
      }, 500)
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    self.addEventListener('message', this.messageListener)
    self.addEventListener('message', this.messageListenerAppear)
  }

  disconnectedCallback () {
    self.removeEventListener('message', this.messageListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return this.hasAttribute('id') ? !this.root.querySelector(`:host > style[_css], #${this.getAttribute('id')} > style[_css]`) : !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.iframe
  }

  /**
   * renders the css
   *
   * @return {Promise<void>|void}
   */
  renderCSS () {
    this.css = /* css */`
      :host > iframe {
        display: block;
        border: none;
        width: 100%;
        opacity: 0;
        transition: opacity .3s ease-out;
      }
      :host(.loaded) > iframe {
        opacity: 1;
      }
    `
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.iframe = document.createElement('iframe')
    this.iframe.setAttribute('src', `https://plugins.flockler.com/embed/iframe/${this.getAttribute('site-id')}/${this.getAttribute('embed-id')}`)
    this.iframe.setAttribute('id', `flockler-embed-iframe-${this.getAttribute('embed-id')}`)
    this.iframe.setAttribute('allowfullscreen', 'true')
    this.html = this.iframe
  }
}
