// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 *
 *
 * @export
 * @class PictureWithPicture
 * @type {CustomElementConstructor}
 * @css {
 *
 * }
 * @attribute {
 * { has } [place-right] default is left
 * { has } [place-bottom] default is top
 * }
 */
export default class PictureWithPicture extends Shadow() {
  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldComponentRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    Promise.all(showPromises).then(() => (this.hidden = false))
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
    return !this.wrapper
  }

  /**
   * renders the a-PictureWithPicture css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host .wrapper {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        margin: 0 auto;
        max-width: 100%;
        overflow: overlay;
        max-height: 90vh;
      }
      :host .wrapper > * {
        grid-column: 1;
        grid-row: 1;
      }
      :host .wrapper > div {
        display: flex;
        margin: 1em;
        gap: 1em;
        flex-direction: ${this.getAttribute('icon-direction') || 'row'};
      }
      :host([place-right]) .wrapper > div {
        justify-content: end;
      }
      :host([place-bottom]) .wrapper > div {
        align-items: end;
      }
      :host .wrapper > div > * {
        height: fit-content;
        width: ${this.getAttribute('icon-width') || '10%'};
      }
    `

    const styles = [{
      // @ts-ignore
      path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
      namespaceFallback: true
    }]

    switch (this.getAttribute('namespace')) {
      case 'picture-text-default-':
      default:
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`,
          namespace: false
        }, ...styles], false)
    }
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.wrapper = document.createElement('div')
    this.wrapper.classList.add('wrapper')
    Array.from(this.root.children).forEach(node => {
      if (!node.getAttribute('slot') && node.tagName !== 'STYLE') this.wrapper.appendChild(node)
    })
    this.html = this.wrapper
  }
}
