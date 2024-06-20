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
 *  {string} [custom-notification=`{
      'color': undefined,
      'outline': undefined,
      'height': 0,
      'width': 0,
      'borderRadius': 0,
      'top': 0,
      'bottom': 0,
      'left': 0,
      'right': 0,
     }`]
 *  }
 */
export default class IconMdx extends Hover() {
  static get observedAttributes () {
    return ['size', 'rotate', 'icon-name']
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.getAttribute('custom-notification')) {
      // @ts-ignore
      this.customNotification = IconMdx.parseAttribute(this.getAttribute('custom-notification'))
    }

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
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
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
        display: contents; /* don't change this */
        ${this.getAttribute('size')
          ? `
            --svg-size: ${this.getAttribute('size')};
          `
          : ''
        }
        ${this.hasAttribute('size') || this.hasAttribute('mobile-size')
          ? `
            --svg-size-mobile: ${this.getAttribute('mobile-size') ?? this.getAttribute('size')};
          `
          : ''
        }
        ${this.getAttribute('color')
          ? `
            --color: ${this.getAttribute('color')};
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
      ${this.hasAttribute('custom-notification')
        ? /* css */`
        :host::after {
          content: "";
          position: absolute;
          display: block;
          height: ${this.customNotification.height};
          width: ${this.customNotification.width};
          background: ${this.customNotification.background};
          border-radius: ${this.customNotification.borderRadius};
          outline: ${this.customNotification.outline};
          right: ${this.customNotification.right};
          left: ${this.customNotification.left};
          top: ${this.customNotification.top};
          bottom: ${this.customNotification.bottom};
        }
      `
        : ''
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
        display: block;
        position: relative;
        height: var(--svg-height, var(--svg-size, 1.5em));
        width: var(--svg-width, var(--svg-size, 1.5em));
        transition: var(--transition, var(--a-transition, all 0.3s ease-out));
      }
      :host([no-hover][rotate]) > svg, :host([no-hover-transform][rotate]) > svg, :host([disabled][rotate]) > svg, :host([rotate]:hover:not([disabled]):not([no-hover-transform])) > svg, :host([rotate].hover:not([disabled]):not([no-hover-transform])) > svg {
        transform: rotate(${this.getAttribute('rotate')});
      }
      /* Mobile layout */
    @media only screen and (max-width: _max-width_) {
      :host > svg {
        height: var(--svg-height-mobile, var(--svg-size-mobile, 1.5em));
        width: var(--svg-width-mobile, var(--svg-size-mobile, 1.5em));
      }
    }
    `
    // TODO: check if the part below is needed!?
    // font-family can have an effect on size on the bounding h-tag with .bg-color
    // if (this.parentElement && this.parentElement.children.length === 1) this.parentElement.setAttribute('style', 'font-family: inherit')
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
    const iconPath = this.getAttribute('icon-url')
      ? `${this.getAttribute('icon-url').substring(0, 1) === '.'
        ? this.importMetaUrl + this.getAttribute('icon-url')
        : this.getAttribute('icon-url')}`
      : `${this.getAttribute('base-url') || `${this.importMetaUrl}../../../icons/mdx-main-packages-icons-dist-svg/packages/icons/dist/svg/`}${(this.lastFetchedIconName = this.iconName)}/Size_${this.getAttribute('icon-size') || '56x56'}.svg`
    this.fetch = this.fetchHTML([iconPath], true).then(htmls => htmls.forEach(html => {
      this.html = ''
      this.html = html
      this.root.querySelector('svg')?.setAttribute('part', 'svg')
    }))
  }

  get iconName () {
    return this.getAttribute('icon-name') || 'AddedToList'
  }
}
