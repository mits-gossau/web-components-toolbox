// @ts-check
import Body from '../body/Body.js'

/* global self */

/**
 * As an organism, this component shall hold molecules and/or atoms
 * NOTE: This component requires a new version of wc-config to consume it directly as o-wrapper. At customElements.define you have to use Wrapper()... Check out => https://github.com/mits-gossau/web-components-cms-template-logistik/blob/master/wc-config.js
 * Example at: https://mits-gossau.github.io/web-components-cms-template-logistik/src/es/components/pages/Home.html TeaserWrapper extends this
 *
 * @export
 * @class Wrapper
 * @type {CustomElementConstructor | *}
 * @attribute {
 *  {number%} [any-{columnNumber}-width] define which column has what exact width in percent
 *  {has} [flex-nowrap-mobile] force the content to not wrap on mobile view
 * }
 * @return {CustomElementConstructor | *}
 */
// extend body for scroll to anchor behavior
export const Wrapper = (ChosenHTMLElement = Body) => class Wrapper extends ChosenHTMLElement {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    // link behavior made accessible
    if (this.hasAttribute('href')) {
      this.setAttribute('data-href', this.getAttribute('href'))
      this.setAttribute('role', 'link')
    }
    let timeout = null
    this.resizeListener = event => {
      clearTimeout(timeout)
      timeout = setTimeout(() => this.calcColumnWidth(), 200)
    }
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    Promise.all(showPromises).then(() => {
      this.checkIfLink()
      this.hidden = false
    })
    self.addEventListener('resize', this.resizeListener)
    super.connectedCallback() // extend body and call it to get the scroll behavior
  }

  disconnectedCallback () {
    self.removeEventListener('resize', this.resizeListener)
    super.disconnectedCallback() // extend body and call it to get the scroll behavior
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.section
  }

  /**
   * renders the o-teaser-wrapper css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    // general flex styles
    this.css = /* css */`
      :host {
        display: block;
      }
      :host([href]) {
        cursor: pointer;
      }
      :host > section {
        display: flex;
        flex-wrap: wrap;
        align-items: ${this.hasAttribute('align-items')
          ? this.getAttribute('align-items')
          : 'var(--align-items, center)'};
        justify-content: var(--justify-content, center);
        flex-direction: var(--flex-direction, row);
        width: 100%;
        gap: var(--gap, normal);
      }
      :host > section > * {
        box-sizing: border-box;
        margin: var(--margin, 0) !important;
        padding: var(--padding, 0) !important;
      }
      :host > section > *:not([style]):first-child {
        margin: var(--margin-first-child, var(--margin, 0)) !important;
        padding: var(--padding-first-child, var(--padding, 0)) !important;
      }
      :host > section > *:not([style]):last-child {
        margin: var(--margin-last-child, var(--margin, 0)) !important;
        padding: var(--padding-last-child, var(--padding, 0)) !important;
      }
      :host > section > * > *:not([style]):last-child {
        padding-bottom: var(--any-padding-bottom-last-child, var(--any-padding-bottom, 0)) !important;
        margin-bottom: var(--any-margin-bottom-last-child, var(--any-margin-bottom, 0)) !important;
      }
      :host([fix-one-pixel-glitch]) > section > *:not(:first-child) {
        transform: translateX(-1px) scaleX(1.005);
      }
      @media only screen and (max-width: _max-width_) {
        :host > section {
          flex-direction: var(--flex-direction-mobile, var(--flex-direction, row));
        }
        :host > section > * {
          margin: var(--margin-mobile, var(--margin, 0)) !important;
          padding: var(--padding-mobile, var(--padding, 0)) !important;
          ${this.hasAttribute('flex-nowrap-mobile') ? '' : 'width: 100% !important;'}
          ${this.hasAttribute('width-mobile') ? `width: ${this.getAttribute('width-mobile')} !important;` : ''}
        }
        :host > section > *:not([style]):first-child {
          margin: var(--margin-first-child-mobile, var(--margin-first-child, var(--margin-mobile, var(--margin, 0)))) !important;
          padding: var(--padding-first-child-mobile, var(--padding-first-child, var(--padding-mobile, var(--padding, 0)))) !important;
        }
        :host > section > *:not([style]):last-child {
          margin: var(--margin-last-child-mobile, var(--margin-last-child, var(--margin-mobile, var(--margin, 0)))) !important;
          padding: var(--padding-last-child-mobile, var(--padding-last-child, var(--padding-mobile, var(--padding, 0)))) !important;
        }
        :host > section > * > *:not([style]):last-child {
          padding-bottom: var(--any-padding-bottom-last-child-mobile, var(--any-padding-bottom-last-child, var(--any-padding-bottom-mobile, var(--any-padding-bottom, 0)))) !important;
          margin-bottom: var(--any-margin-bottom-last-child-mobile, var(--any-margin-bottom-last-child, var(--any-margin-bottom-mobile, var(--any-margin-bottom, 0)))) !important;
        }
        :host > section > *.first-mobile {
          order: -1;
        }
        ${this.hasAttribute('picture-first-mobile')
          ? /* css */`
            :host > section > a-picture, :host > section > picture, :host > section > img {
              order: -1;
            }
          `
          : ''
        }
        ${this.hasAttribute('picture-last-mobile')
          ? /* css */`
            :host > section > *:not(a-picture):not(picture):not(img) {
              order: -1;
            }
          `
          : ''
        }
        ${this.hasAttribute('overlay-mobile')
          ? /* css */`
            :host > section {
              display: grid;
            }
            :host > section > * {
              display: block;
              grid-column: 1;
              grid-row: 1;
            }
            :host > section > *:not([style]):last-child {
              margin: var(--content-spacing-mobile, var(--content-spacing, 2em)) auto !important;
              width: calc(100% - var(--content-spacing-mobile, var(--content-spacing, 2em)) * 2) !important;
            }
          `
          : ''
        }
        :host([fix-one-pixel-glitch]) > section > *:not(:first-child) {
          transform: none;
        }
      }
    `
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${this.importMetaUrl}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'wrapper-teaser-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./teaser-/teaser-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(() => this.calcColumnWidth())
      case 'wrapper-teaser-recipe-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./teaser-recipe-/teaser-recipe-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(() => this.calcColumnWidth())
      case 'wrapper-text-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./text-/text-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(() => this.calcColumnWidth())
      case 'wrapper-text-center-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./text-center-/text-center-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(() => this.calcColumnWidth())
      case 'wrapper-no-calc-column-width-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./no-calc-column-width-/no-calc-column-width-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(() => this.calcColumnWidth())
      case 'wrapper-no-calc-column-width-left-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./no-calc-column-width-left-/no-calc-column-width-left-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(() => this.calcColumnWidth())
      case 'menu-legends-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./menu-legends-/menu-legends-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(() => this.calcColumnWidth())
      case 'wrapper-text-picture-cover-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./text-picture-cover-/text-picture-cover-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(() => this.calcColumnWidth())
      default:
        if (!this.hasAttribute('namespace')) {
          this.css = /* css */`
            :host {
              --gap: var(--gap-custom, var(--content-spacing));
            }
            :host > section > *:not(a-picture) ~ * {
              align-self: var(--not-a-picture-align-self, normal);
            }
            @media only screen and (max-width: _max-width_) {
              :host {
                --gap: var(--gap-mobile-custom, var(--gap-custom, var(--content-spacing-mobile, var(--content-spacing))));
              }
            }
          `
        }
        return this.fetchCSS(styles, false).then(() => this.calcColumnWidth())
    }
  }

  calcColumnWidth (children = this.section.children) {
    if (this.hasAttribute('no-calc-column-width')) return
    self.requestAnimationFrame(timeStamp => {
      // set width attributes as css vars
      let childNodes = Array.from(children).filter(node => node.nodeName !== 'STYLE' && (node.nodeName !== 'DIV' || !node.hasAttribute('hidden'))) // ignore hidden divs to allow placing hidden elements, which then must be wrapped by <div hidden>...</div>
      const childNodesLength = Number(this.getAttribute('simulate-children')) || childNodes.length
      let childNodesLengthNotWidthHundredPercent = childNodesLength
      if (childNodes.length < childNodesLength) {
        childNodes = childNodes.concat(Array(childNodesLength - childNodes.length).fill(childNodes[0]))
      } else if (childNodes.length > childNodesLength) {
        childNodes = childNodes.splice(0, childNodesLength)
      }
      for (let i = 0; i < childNodesLength; i++) {
        if (this.hasAttribute(`any-${i + 1}-width`) || (childNodes[i] && childNodes[i].hasAttribute('width'))) {
          this.css = /* css */`
            :host {
              --any-${i + 1}-width: ${childNodes[i].getAttribute('width') || this.getAttribute(`any-${i + 1}-width`)};
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
        // incase any has 100% reset it and don't count to continue on next row
        if (width >= 100) {
          width = 0
          childNodesLengthNotWidthHundredPercent--
        }
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
        if (i === childNodesLength - 1) {
          [margin, unit] = this.cleanPropertyMarginValue(self.getComputedStyle(node).getPropertyValue(`--${this.namespace || ''}margin-last-child`))
          // margin-last-child without namespace
          if (margin === false && this.hasAttribute('namespace-fallback')) [margin, unit] = this.cleanPropertyMarginValue(self.getComputedStyle(node).getPropertyValue('--margin-last-child'))
        }
        // margin
        if (margin === false) {
          [margin, unit] = this.cleanPropertyMarginValue(self.getComputedStyle(node).getPropertyValue(`--${this.namespace || ''}margin`))
          if (margin === false && this.hasAttribute('namespace-fallback')) [margin, unit] = this.cleanPropertyMarginValue(self.getComputedStyle(node).getPropertyValue('--margin'))
        }
        // gap (ether use gap or margin, both does not work)
        if (margin === false && i < childNodesLength - 1) {
          [margin, unit] = this.cleanPropertyMarginValue(self.getComputedStyle(node).getPropertyValue(`--${this.namespace || ''}gap`))
          if (margin === false && this.hasAttribute('namespace-fallback')) [margin, unit] = this.cleanPropertyMarginValue(self.getComputedStyle(node).getPropertyValue('--gap'))
          if (margin) margin = margin / 2 // gap has no shorthand and does not need to be duplicated like margin for lef and right
        }
        return [acc[0] + width, width ? acc[1] + 1 : acc[1], unit ? acc[2] + margin : acc[2], unit || acc[3]]
      }, [0, 0, 0, ''])
      let freeWidth = ((100 - bookedWidth) / (childNodesLengthNotWidthHundredPercent - bookedCount))
      // @ts-ignore
      if (freeWidth === Infinity || freeWidth === -Infinity) freeWidth = 0
      this.style.textContent = ''
      for (let i = 1; i < childNodesLength + 1; i++) {
        this.setCss(/* CSS */`
          :host > section > *:nth-child(${i}) {
            width: calc(var(--any-${i}-width, ${freeWidth}%) - ${(!childNodes[i - 1].hasAttribute('width') || !childNodes[i - 1].getAttribute('width').includes('100')
              ? margin || 0
              : 0) / childNodesLengthNotWidthHundredPercent || 0}${unit || 'px'});
          }
        `, undefined, undefined, undefined, this.style)
      }
    })
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    this.section = this.root.querySelector(this.cssSelector + ' > section') || document.createElement('section')
    Array.from(this.root.children).forEach(node => {
      if (node.tagName !== 'STYLE' && node.tagName !== 'SECTION') this.section.appendChild(node)
    })
    this.html = [this.section, this.style]
    return Promise.resolve()
  }

  checkIfLink () {
    // accessible and seo conform a tag wrapped around this component
    if (this.hasAttribute('href') && this.parentNode) {
      const a = document.createElement('a')
      Array.from(this.attributes).forEach(attribute => {
        if (!attribute.name.includes('hidden')) a.setAttribute(attribute.name, attribute.value)
      })
      a.setAttribute('wrapper', '')
      a.setAttribute('href', this.getAttribute('href'))
      a.setAttribute('target', this.getAttribute('target') || '_self')
      if (this.hasAttribute('rel')) a.setAttribute('rel', this.getAttribute('rel'))
      a.style.color = 'inherit'
      a.style.textDecoration = 'inherit'
      this.parentNode.replaceChild(a, this)
      a.appendChild(this)
      this.checkIfLink = () => {}
    }
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
    let values = value.trimStart().split(' ').filter(value => value.length)
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

  get style () {
    return this._style || (this._style = (() => {
      const style = document.createElement('style')
      style.setAttribute('protected', 'true')
      return style
    })())
  }
}
