// @ts-check
import { Hover } from '../../prototypes/Hover.js'

/**
 * IconMdx can host any mdx svg icon
 * Example at: /src/es/components/molecules/navigation/nature-/nature-.html
 * As an atom, this component can not hold further children (those would be quantum)
 *
 * @export
 * @class IconMdx
 * @type {CustomElementConstructor}
 * @attribute {
 *  {has} no-hover
 *  {em} [size=1.5em]
 *  {deg} rotate
 *  {string} [base-url='../../../icons/mdx-main-packages-icons-dist-svg/packages/icons/dist/svg/']
 *  {string} [icon-name='AddedToList']
 *  {string} [icon-size='56x56']
 * }
 */
export default class IconMdx extends Hover() {
  static get observedAttributes () {
    return ['size', 'rotate', 'icon-name']
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue === null) return
    if (name === 'icon-name') {
      if (this.shouldRenderHTML()) this.renderHTML()
    } else {
      this.css = ''
      this.renderCSS()
    }
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
    return this.lastFetchedIconName !== this.iconName
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        ${this.getAttribute('size')
          ? `
            --svg-size: ${this.getAttribute('size')};
          `
          : ''
        }
        color: var(--color, #777);
      }
      ${this.hasAttribute('no-hover')
        ? ''
        : /* css */`
          :host(:hover), :host(.hover) {
            color: var(--color-hover, var(--color, #FFFFFF));
            cursor: pointer;
          }
        `
      }
      :host(:active), :host(.active) {
        color: var(--color-active, var(--color-hover, var(--color, #FFFFFF)));
      }
      :host([disabled]) {
        color: var(--color-disabled, var(--color, #FFFFFF));
        cursor: not-allowed;
        opacity: var(--opacity-disabled, var(--opacity, 1));
        transition: opacity 0.3s ease-out;
      }
      :host > svg {
        height: var(--svg-height, var(--svg-size, 1.5em));
        width: var(--svg-width, var(--svg-size, 1.5em));
        transition: var(--transition, var(--a-transition, all 0.3s ease-out));
      }
      :host([no-hover][rotate]) > svg, :host([disabled][rotate]) > svg, :host([rotate]:hover:not([disabled])) > svg {
        transform: rotate(${this.getAttribute('rotate')});
      }
    `
    // TODO: check if the part below is needed!?
    // font-family can have an effect on size on the bounding h-tag with .bg-color
    //if (this.parentElement && this.parentElement.children.length === 1) this.parentElement.setAttribute('style', 'font-family: inherit')
  }

  // TODO: Templates
  /*
    return this.fetchTemplate()
    fetchTemplate () {
  */

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.html = ''
    this.html = '<svg></svg>' // placeholder for keeping the size
    this.fetch = this.fetchHTML([`${this.getAttribute('base-url') || `${this.importMetaUrl}../../../icons/mdx-main-packages-icons-dist-svg/packages/icons/dist/svg/`}${(this.lastFetchedIconName = this.iconName)}/Size_${this.getAttribute('icon-size') || '56x56'}.svg`], true).then(htmls => htmls.forEach(html => {
      this.html = ''
      this.html = html
    }))
  }

  get iconName () {
    return this.getAttribute('icon-name') || 'AddedToList'
  }
}
