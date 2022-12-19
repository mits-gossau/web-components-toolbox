// @ts-check
import Body from '../body/Body.js'

/* global self */

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
  constructor (...args) {
    super(...args)

    this.setAttribute('aria-label', 'Section')
  }

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
    const cssSyntax = (attribute, isMobile = false) => {
      const attributeName = isMobile ? attribute.name.replace('-mobile', '') : attribute.name
      if (/-prop$/.test(attributeName)) {
        return `${attributeName.replace('-prop', '')}:${attribute.value};`
      } else if (/-var$/.test(attributeName)) {
        return `--${attributeName.replace('-var', '')}:${attribute.value};`
      }
      return `${attributeName}:${attribute.value};--${attributeName}:${attribute.value};`
    }
    this.css = /* css */`
      :host {
        ${Array.from(this.attributes).reduce((acc, attribute) => {
          if (!attribute || !attribute.name || !attribute.value || attribute.name.includes('aria') || attribute.name.includes('tabindex')) return acc
          if (attribute.name.includes('-mobile')) {
            attributesMobile.push(attribute)
            return acc
          }
          return `${acc}${cssSyntax(attribute)}`
        }, '')}
        display: inline-block !important;
        width: 100% !important;
        margin: 0 !important;
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          ${Array.from(attributesMobile).reduce((acc, attribute) => `${acc}${cssSyntax(attribute, true)}`, '')}
        }
      }
    `
    // BodyStyle has to be 100% (minus content spacing) when it is not within o-body nor o-body-style
    // in case it is within  o-body or o-body-style, it's children have the inherit o-body :host > * (any direct child) width styling, desktop width (:host > main > * { width: var(--content-width, 55%);) since itself has 100% by line 54 (width: 100% !important;)
    // !DON'T stack two o-body-style in each other, except directly within main
    if ((this.parentNode.tagName !== 'MAIN' && (this.parentNode.tagName || (this.parentNode.host && this.parentNode.host.tagName)) !== 'O-BODY-STYLE') && (!self.getComputedStyle(this).getPropertyValue('--content-width') || !self.getComputedStyle(this).getPropertyValue('--content-width-mobile'))) {
      this.css = /* css */`
        :host > * {
          width: var(--content-width, calc(100% - var(--content-spacing) * 2));
        }
        @media only screen and (max-width: _max-width_) {
          :host > * {
            width: var(--content-width-mobile, var(--content-width, calc(100% - var(--content-spacing-mobile, var(--content-spacing)) * 2)));
          }
        }
      `
    }
  }
}
