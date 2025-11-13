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
  
  constructor(options = {}, ...args) {
    super({ tabindex: 'no-tabindex', ...options }, ...args)
  }

  static get observedAttributes () {
    return ['size', 'rotate', 'scale', 'icon-name']
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
          :host(:not([no-hover]):hover), :host(.hover) {
            color: var(--color-hover, var(--color, #FFFFFF)) !important;
            cursor: var(--cursor-hover, pointer);
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
      :host([no-hover][rotate]) > svg, :host([no-hover-transform][rotate]) > svg, :host([disabled][rotate]) > svg, :host([rotate]:hover:not([disabled]):not([no-hover-transform])) > svg, :host([rotate].hover:not([disabled]):not([no-hover-transform])) > svg,
      :host([no-hover][scale]) > svg, :host([no-hover-transform][scale]) > svg, :host([disabled][scale]) > svg, :host([scale]:hover:not([disabled]):not([no-hover-transform])) > svg, :host([scale].hover:not([disabled]):not([no-hover-transform])) > svg {
        transform: ${this.hasAttribute('rotate') ? `rotate(${this.getAttribute('rotate')})` : ''} ${this.hasAttribute('scale') ? `scale(${this.getAttribute('scale')})` : ''};
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
    return (this.fetch = this.getIcon(this.iconName, iconPath).then(htmls => htmls.forEach(html => {
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

  // ******************** !IMPORTANT: Fetching the icons through Web API Fetch has bad performance impacts, for that reason we include the most common mdx icons below *****************************************************
  getIcon (iconName, iconPath) {
    switch (iconName) {
      case 'Search':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="2" d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"/></svg>'])
      case 'Heart':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="M48.627 13.094a12.834 12.834 0 0 0-18.154 0L28 15.568l-2.473-2.474A12.836 12.836 0 0 0 7.373 31.248L28 51.874l20.627-20.626a12.832 12.832 0 0 0 0-18.154Z"/></svg>'])
      case 'Plus':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="M28 11.667v32.666M11.667 28h32.666"/></svg>'])
      case 'ChevronRight':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="m21 42 14-14-14-14"/></svg>'])
      case 'ArrowRight':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="M11.667 28h32.666m0 0L28 11.667M44.333 28 28 44.333"/></svg>'])
      case 'ArrowLeft':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="M44.333 28H11.667m0 0L28 44.333M11.667 28 28 11.667"/></svg>'])
      case 'AlertCircle':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="M28 18.667V28m0 9.333h.023M51.333 28c0 12.887-10.446 23.333-23.333 23.333C15.113 51.333 4.667 40.887 4.667 28 4.667 15.113 15.113 4.667 28 4.667c12.887 0 23.333 10.446 23.333 23.333Z"/></svg>'])
      case 'ArrowUpRight':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="m16.333 39.667 23.334-23.334m0 0H16.333m23.334 0v23.334"/></svg>'])
      case 'Phone':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="M51.333 39.48v7a4.665 4.665 0 0 1-5.086 4.667 46.177 46.177 0 0 1-20.137-7.164 45.5 45.5 0 0 1-14-14 46.176 46.176 0 0 1-7.163-20.23A4.667 4.667 0 0 1 9.59 4.667h7a4.667 4.667 0 0 1 4.667 4.013 29.96 29.96 0 0 0 1.633 6.557 4.667 4.667 0 0 1-1.05 4.923l-2.963 2.963a37.333 37.333 0 0 0 14 14l2.963-2.963a4.667 4.667 0 0 1 4.923-1.05 29.956 29.956 0 0 0 6.557 1.633 4.666 4.666 0 0 1 4.013 4.737Z"/></svg>'])
      case 'Mail':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="M51.333 14a4.68 4.68 0 0 0-4.666-4.667H9.333A4.68 4.68 0 0 0 4.667 14m46.666 0v28a4.68 4.68 0 0 1-4.666 4.667H9.333A4.68 4.68 0 0 1 4.667 42V14m46.666 0L28 30.333 4.667 14"/></svg>'])
      case 'Instagram':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="M40.833 15.167h.024m-24.524-10.5h23.334c6.443 0 11.666 5.223 11.666 11.666v23.334c0 6.443-5.223 11.666-11.666 11.666H16.333c-6.443 0-11.666-5.223-11.666-11.666V16.333c0-6.443 5.223-11.666 11.666-11.666Zm21 21.863a9.333 9.333 0 1 1-18.463 2.738 9.333 9.333 0 0 1 18.463-2.738Z"/></svg>'])
      case 'TwitterX':
        return Promise.resolve(['<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.64998 1.18785C1.82965 1.44421 5.99061 7.50063 10.8966 14.6465C15.8026 21.7924 20.3401 28.4008 20.9801 29.3319C21.6201 30.263 22.1437 31.0435 22.1437 31.0664C22.1437 31.0893 21.9054 31.3831 21.6141 31.7193C21.3229 32.0556 20.5025 33.0074 19.7912 33.8345C19.0798 34.6615 17.8805 36.0555 17.1262 36.9322C16.3719 37.8089 15.0449 39.3518 14.1772 40.3608C13.3096 41.3698 11.7493 43.1839 10.71 44.3921C7.49552 48.129 7.03163 48.6687 4.58466 51.5187C3.27807 53.0405 2.02514 54.4955 1.80042 54.7521C1.5757 55.0087 1.39182 55.2456 1.39182 55.2784C1.39182 55.317 2.21251 55.3382 3.70406 55.3382H6.01624L8.55825 52.3758C9.95639 50.7465 11.3356 49.1427 11.6231 48.8119C12.2449 48.0966 16.9865 42.5794 17.3851 42.1075C17.5377 41.9269 17.7593 41.6698 17.8777 41.5361C17.996 41.4025 18.9289 40.3187 19.9507 39.1277C20.9725 37.9367 21.8366 36.9331 21.8709 36.8974C21.9051 36.8618 22.4461 36.2325 23.073 35.4989C23.6998 34.7655 24.2321 34.1653 24.2558 34.1653C24.2795 34.1653 27.4997 38.8277 31.4119 44.5262C35.3241 50.2247 38.5948 54.988 38.6802 55.1114L38.8354 55.3356L46.7667 55.337C53.289 55.338 54.6926 55.3242 54.6676 55.2592C54.6411 55.1902 50.8412 49.6476 41.0926 35.4585C34.0746 25.244 33.1415 23.8714 33.1682 23.8017C33.1942 23.734 34.1501 22.616 40.4345 15.3032C41.5125 14.0488 42.9986 12.3187 43.7368 11.4585C44.475 10.5984 45.2204 9.73221 45.3931 9.53371C45.5659 9.33521 46.4743 8.27957 47.4118 7.18785C48.3492 6.09612 49.9429 4.24108 50.9533 3.06556C51.9637 1.89004 52.8275 0.881801 52.8728 0.824959C52.9506 0.727695 52.8185 0.72168 50.6068 0.72168H48.2582L47.2136 1.93972C45.8234 3.56078 43.3103 6.48403 42.5966 7.31007C42.2814 7.67506 41.8881 8.13377 41.7226 8.32938C41.5572 8.52499 41.2309 8.90303 40.9974 9.1695C40.764 9.43597 39.5875 10.8044 38.383 12.2104C37.1785 13.6164 36.1765 14.7803 36.1563 14.7969C36.1362 14.8134 35.8781 15.1128 35.5828 15.4622C35.0663 16.0733 34.5407 16.685 32.1303 19.4805C31.0722 20.7075 31.018 20.7602 30.9288 20.6475C30.8775 20.5825 27.7768 16.0728 24.0384 10.6261L17.2414 0.722943L9.2824 0.722282L1.32336 0.72168L1.64998 1.18785ZM7.86189 4.43548C7.92168 4.52673 9.40872 6.65852 11.1665 9.17281C14.5002 13.9413 27.6004 32.6908 36.0253 44.7518C38.7175 48.6059 40.953 51.7933 40.9932 51.8349C41.0506 51.8944 41.8345 51.9073 44.656 51.8951L48.2458 51.8796L38.852 38.436C33.6854 31.042 26.2051 20.3367 22.229 14.6465L14.9998 4.30063L11.3765 4.28511L7.75332 4.26959L7.86189 4.43548Z" fill="currentColor"/></svg>'])
      case 'Facebook':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="M42 4.667h-7a11.666 11.666 0 0 0-11.667 11.666v7h-7v9.334h7v18.666h9.334V32.667h7L42 23.333h-9.333v-7A2.333 2.333 0 0 1 35 14h7V4.667Z"/></svg>'])
      case 'Youtube':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="M52.593 14.98a6.487 6.487 0 0 0-4.526-4.667C44.053 9.333 28 9.333 28 9.333s-16.053 0-20.067 1.074a6.486 6.486 0 0 0-4.526 4.666 67.666 67.666 0 0 0-1.074 12.344 67.667 67.667 0 0 0 1.074 12.436 6.486 6.486 0 0 0 4.526 4.48C11.947 45.407 28 45.407 28 45.407s16.053 0 20.067-1.074a6.487 6.487 0 0 0 4.526-4.666 67.667 67.667 0 0 0 1.074-12.25 67.666 67.666 0 0 0-1.074-12.437Z"/><path stroke-width="3.5" d="m22.75 35.047 13.417-7.63-13.417-7.63v15.26Z"/></svg>'])
      case 'Linkedin':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="M37.333 18.667a14 14 0 0 1 14 14V49H42V32.667a4.667 4.667 0 0 0-9.333 0V49h-9.334V32.667a14 14 0 0 1 14-14ZM14 21H4.667v28H14V21ZM9.333 14a4.667 4.667 0 1 0 0-9.333 4.667 4.667 0 0 0 0 9.333Z"/></svg>'])
      case 'X':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="M42 14 14 42m0-28 28 28"/></svg>'])
      case 'ChevronDown':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="m14 21 14 14 14-14"/></svg>'])
      case 'ArrowUp':
        return Promise.resolve([/* html */'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none"><path stroke-width="3.5" d="M28 44.333V11.667m0 0L11.667 28M28 11.667 44.333 28"/></svg>'])
      default:
        return this.fetchHTML([iconPath], true)
    }
  }
}
