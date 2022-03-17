// @ts-check
import Body from '../body/Body.js'

/**
 * Defines a Style for content
 * Example at: /src/es/components/pages/Idee.html
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Style
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} [color=n.a.]
 *  {string} [background-color=n.a.]
 * }
 * @css {
 *  Note: all of src/es/components/web-components-cms-template/src/es/components/organisms/Body.js
 * }
 */
export default class BodyStyle extends Body {
  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return false
  }

  /**
   * renders the o-highlight-list css
   *
   * @return {void}
   */
  renderCSS () {
    super.renderCSS()
    const bodyCss = this.css.replace(/\s>\smain/g, '')
    this.css = ''
    this._css.textContent = bodyCss
    const attributesMobile = []
    this.css = /* css */`
      :host {
        ${Array.from(this.attributes).reduce((acc, attribute) => {
          if (!attribute || !attribute.name || !attribute.value) return acc
          if (attribute.name.includes('-mobile')) {
            attributesMobile.push(attribute)
            return acc
          }
          return `${acc}${attribute.name}: ${attribute.value};--${attribute.name}: ${attribute.value};`
        }, '')}
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          ${Array.from(attributesMobile).reduce((acc, attribute) => {
            const attributeName = attribute.name.replace('-mobile', '')
            return `${acc}${attributeName}: ${attribute.value};--${attributeName}: ${attribute.value};`
          }, '')}
        }
      }
    `
  }
}
