// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
* LoadTemplateTagClickMore unpacks template tags on event
* 
* @export
* @class LoadTemplateTagClickMore
* @type {CustomElementConstructor}
*/
export default class LoadTemplateTagClickMore extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, mode: 'false', ...options }, ...args)

    this.didRenderHTML = this.hasAttribute('no-initial-unpack')

    this.answerEventListener = event => {
      this.renderHTML()
      if (event?.detail?.this) {
        if (this.template) {
          event.detail.this.blur()
        } else {
          event.detail.this.remove()
          this.remove()
        }
      }
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    if (this.getAttribute('answer-event-name')) {
      document.body.addEventListener(this.getAttribute('answer-event-name'), this.answerEventListener)
    } else {
      console.warn('LoadTemplateTagClickMore has no attribute called "answer-event-name" and is not active!', this)
    }
  }

  disconnectedCallback () {
    if (this.getAttribute('answer-event-name')) document.body.removeEventListener(this.getAttribute('answer-event-name'), this.answerEventListener)
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
    return !this.didRenderHTML
  }

  /**
   * renders the css
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        display: none !important;
        position: absolute;
        top: -1000px;
        left: -1000px;
        opacity: 0;
      }
    `
  }

  /**
   * Render HTML
   * @return {boolean}
   */
  renderHTML () {
    this.didRenderHTML = true
    // @ts-ignore
    if (!this.template) return console.info('LoadTemplateTagClickMore has no more template tags to unpack. Make sure that the answer-event-name click target a custom event with detail: { this } delivers, so that the target can be removed...', this) || false
    const templateContent = this.template.content
    this.template.remove()
    this.parentNode.appendChild(templateContent)
    let notDefined
    if ((notDefined = this.parentNode.querySelectorAll(':not(:defined)')) && notDefined.length) {
      if (document.body.hasAttribute(this.getAttribute('load-custom-elements') || 'load-custom-elements')) {
        this.parentNode.dispatchEvent(new CustomEvent(this.getAttribute('load-custom-elements') || 'load-custom-elements', {
          detail: {
            nodes: Array.from(notDefined)
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      } else {
        console.error(
          'There are :not(:defined) web components in the template. You must load through wc-config or manually:',
          notDefined,
          this
        )
      }
    }
    if (this.hasAttribute('initial-unpack') && Number(this.getAttribute('initial-unpack')) > 1) {
      this.setAttribute('initial-unpack', Number(this.getAttribute('initial-unpack')) - 1)
      this.renderHTML()
    } 
    return true
  }

  get template () {
    return this.root.querySelector('template')
  }
}
