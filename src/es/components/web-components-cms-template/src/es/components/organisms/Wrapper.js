// @ts-check
import Body from './Body.js'

/* global self */

/**
 * As an organism, this component shall hold molecules and/or atoms
 * NOTE: This component requires a new version of wc-config to consume it directly as o-wrapper. At customElements.define you have to use Wrapper()... Check out => https://github.com/mits-gossau/web-components-cms-template-logistik/blob/master/wc-config.js
 * Example at: https://mits-gossau.github.io/web-components-cms-template-logistik/src/es/components/pages/Home.html TeaserWrapper extends this
 *
 * @export
 * @class Wrapper
 * @type {CustomElementConstructor}
 * @attribute {
 *  {number%} [any-{columnNumber}-width] define which column has what exact width in percent
 *  {has} [flex-nowrap-mobile] force the content to not wrap on mobile view
 * }
 * @return {CustomElementConstructor | *}
 */
export const Wrapper = (ChosenHTMLElement = Body) => class Wrapper extends ChosenHTMLElement {
  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
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
    return !this.querySelector('section')
  }

  /**
   * renders the o-teaser-wrapper css
   *
   * @return {void}
   */
  renderCSS () {
    // extend body styles
    if (typeof super.renderCSS === 'function') {
      super.renderCSS()
      const bodyCss = this.css.replace(/\s>\smain/g, '')
      this.css = ''
      this.setCss(bodyCss, undefined, '') // already received its namespace and for that gets set without any ''
    }
    // general flex styles
    this.css = /* css */`
      :host {
        display: block;
      }
      :host > section {
        display: flex;
        flex-wrap: wrap;
        align-items: var(--align-items, normal);
        justify-content: var(--justify-content, center);
        width: 100%;
      }
      :host > section > * {
        box-sizing: border-box;
        margin: var(--margin, 0);
        padding: var(--padding, 0);
      }
      :host > section > *:first-child {
        margin: var(--margin-first-child, var(--margin, 0));
        padding: var(--padding-first-child, var(--padding, 0));
      }
      :host > section > *:last-child {
        margin: var(--margin-last-child, var(--margin, 0));
        padding: var(--padding-last-child, var(--padding, 0));
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host > section > * {
          margin: var(--margin-mobile, var(--margin, 0));
          padding: var(--padding-mobile, var(--padding, 0));
          ${this.hasAttribute('flex-nowrap-mobile') ? '' : 'width: 100% !important;'}
        }
        :host > section > *:first-child {
          margin: var(--margin-first-child-mobile, var(--margin-first-child, var(--margin-mobile, var(--margin, 0))));
          padding: var(--padding-first-child-mobile, var(--padding-first-child, var(--padding-mobile, var(--padding, 0))));
        }
        :host > section > *:last-child {
          margin: var(--margin-last-child-mobile, var(--margin-last-child, var(--margin-mobile, var(--margin, 0))));
          padding: var(--padding-last-child-mobile, var(--padding-last-child, var(--padding-mobile, var(--padding, 0))));
        }
      }
    `
    // set width attributes as css vars
    const childNodes = Array.from(this.root.children).filter(node => node.nodeName !== 'STYLE')
    for (let i = 0; i < childNodes.length; i++) {
      if (this.hasAttribute(`any-${i + 1}-width`) || (childNodes[i] && childNodes[i].hasAttribute('width'))) {
        this.css = /* css */ `
          :host {
            --any-${i + 1}-width: ${this.getAttribute(`any-${i + 1}-width`) || childNodes[i].getAttribute('width')};
          }
        `
      }
    }
    // calculate flex child width by CSS vars
    const [bookedWidth, bookedCount, margin, unit] = childNodes.reduce((acc, node, i) => {
      // width
      let width = this.cleanPropertyWidthValue(self.getComputedStyle(node).getPropertyValue(`--${this.namespace || ''}any-${i + 1}-width`))
      // width without namespace
      if (!width && this.hasAttribute('namespace-fallback')) width = this.cleanPropertyWidthValue(self.getComputedStyle(node).getPropertyValue(`--any-${i + 1}-width`))
      /** @type {false | number} */
      let margin = false
      /** @type {false | string} */
      let unit = false
      // margin-first-child
      if (i === 0) {
        [margin, unit] = this.cleanPropertyMarginValue(self.getComputedStyle(node).getPropertyValue(`--${this.namespace || ''}margin-first-child`))
        // margin-first-child without namespace
        if (margin === false && this.hasAttribute('namespace-fallback')) [margin, unit] = this.cleanPropertyMarginValue(self.getComputedStyle(node).getPropertyValue('--margin-first-child'))
      }
      // margin-last-child
      if (i === childNodes.length - 1) {
        [margin, unit] = this.cleanPropertyMarginValue(self.getComputedStyle(node).getPropertyValue(`--${this.namespace || ''}margin-last-child`))
        // margin-last-child without namespace
        if (margin === false && this.hasAttribute('namespace-fallback')) [margin, unit] = this.cleanPropertyMarginValue(self.getComputedStyle(node).getPropertyValue('--margin-last-child'))
      }
      // margin
      if (margin === false) {
        [margin, unit] = this.cleanPropertyMarginValue(self.getComputedStyle(node).getPropertyValue(`--${this.namespace || ''}margin`))
        if (margin === false && this.hasAttribute('namespace-fallback')) [margin, unit] = this.cleanPropertyMarginValue(self.getComputedStyle(node).getPropertyValue('--margin'))
      }
      return [acc[0] + width, width ? acc[1] + 1 : acc[1], unit ? acc[2] + margin : acc[2], unit || acc[3]]
    }, [0, 0, 0, ''])
    let freeWidth = ((100 - bookedWidth) / (childNodes.length - bookedCount))
    // @ts-ignore
    if (freeWidth === Infinity) freeWidth = 0
    for (let i = 1; i < childNodes.length + 1; i++) {
      this.css = /* css */`
        :host > section > *:nth-child(${i}) {
          width: calc(var(--any-${i}-width, ${freeWidth}%) - ${margin / childNodes.length}${unit || 'px'});
        }
      `
    }
  }

  /**
   * renders the a-link html
   *
   * @return {void}
   */
  renderHTML () {
    Array.from(this.root.children).forEach(node => {
      if (node.tagName !== 'STYLE') this.section.appendChild(node)
    })
    this.html = this.section
  }

  /**
   * @param {string} value
   * @returns {number}
   */
  cleanPropertyWidthValue (value) {
    return Number(value.trim().replace(/[^0-9]/g, ''))
  }

  /**
   * @param {string | any} value
   * @returns {[number, string] | [false, false]}
   */
  cleanPropertyMarginValue (value) {
    if (!value) return [false, false]
    let values = value.trimStart().split(' ')
    if (values.length === 0) return [false, false]
    if (values.length === 1) values = Array(4).fill(values[0])
    if (values.length === 2) values = [values[0], values[1], values[0], values[1]]
    if (values.length === 3) values = [values[0], values[1], values[2], values[1]]
    const unitRegex = /[a-z%]/g
    const valueRegex = /[^a-z%]/g
    const unit = unitRegex.test(values[1] || '') ? values[1].replace(valueRegex, '') : unitRegex.test(values[3] || '') ? values[3].replace(valueRegex, '') : ''
    value = unitRegex.test(values[1] || '') ? Number(values[1].replace(unitRegex, '')) : 0
    value += unitRegex.test(values[3] || '') ? Number(values[3].replace(unitRegex, '')) : 0
    return [value, unit]
  }

  get section () {
    return this._section || (this._section = document.createElement('section'))
  }
}
