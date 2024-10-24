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
    if (this.hasAttribute('custom-notification')) {
      // @ts-ignore
      this.customNotification = this.getAttribute('custom-notification') ? IconMdx.parseAttribute(this.getAttribute('custom-notification')) : {}
    }
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    if (this.hasAttribute('request-event-name')) this.addEventListener('click', this.clickListener)
    Promise.all(showPromises).then(() => (this.hidden = false))
  }

  disconnectedCallback () {
    if (this.hasAttribute('request-event-name')) this.removeEventListener('click', this.clickListener)
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
   * @return {Promise<void>}
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
      :host([custom-notification])::after {
        content: "";
        position: absolute;
        display: block;
        height: ${this.customNotification?.height || '1em'};
        width: ${this.customNotification?.width || '1em'};
        background: ${this.customNotification?.background || 'var(--color-secondary, red)'};
        border-radius: ${this.customNotification?.borderRadius || '50%'};
        outline: ${this.customNotification?.outline || 'none'};
        right: ${this.customNotification?.right || 'unset'};
        left: ${this.customNotification?.left || 'unset'};
        top: ${this.customNotification?.top || 'unset'};
        bottom: ${this.customNotification?.bottom || 'unset'};
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
        display: var(--icon-mdx-svg-display);
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
    return Promise.resolve()
  }

  // TODO: Templates
  /*
    return this.fetchTemplate()
    fetchTemplate () {
  */

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    this.html = ''
    this.html = '<svg></svg>' // placeholder for keeping the size
    const iconPath = this.getAttribute('icon-url')
      ? `${this.getAttribute('icon-url').substring(0, 1) === '.'
        ? this.importMetaUrl + this.getAttribute('icon-url')
        : this.getAttribute('icon-url')}`
      : `${this.getAttribute('base-url') || `${this.importMetaUrl}../../../icons/mdx-main-packages-icons-dist-svg/packages/icons/dist/svg/`}${(this.lastFetchedIconName = this.iconName)}/Size_${this.getAttribute('icon-size') || '56x56'}.svg`
    return (this.fetch = this.fetchHTML([iconPath], true).then(htmls => htmls.forEach(html => {
      this.html = ''
      this.html = html
      this.root.querySelector('svg')?.setAttribute('part', 'svg')
    })))
  }

  clickListener = event => {
    this.getAttribute('request-event-name').split(',').forEach(eventName => this.dispatchEvent(new CustomEvent(eventName, {
      detail: {
        origEvent: event,
        this: this
      },
      bubbles: true,
      cancelable: true,
      composed: true
    })))
  }

  get iconName () {
    return this.getAttribute('icon-name') || 'AddedToList'
  }
}
