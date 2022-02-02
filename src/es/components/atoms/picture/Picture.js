// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */
/* global CustomEvent */

/**
 * Picture
 * Wrapper for a picture-tag with multiple sources
 * Makes it easier for backend-user by accepting sources as array and applying media-queries according to size-attribute
 * As an atom, this component can not hold further children (those would be quantum)
 *
 * @export
 * @class Picture
 * @type {CustomElementConstructor}
 * @attribute {
 *  sources [array]
 *  [{
 *    source [string]
 *    type [string] e.g. image/jpg, image/webp, etc.
 *    size [string=small, medium, large, extra-large] corresponds to different media queries
 *  }, {...}, {...}]
 *
 *  {string} [defaultSource] the default source for the img-tag
 *  {string} [alt] alt-text for the image
 *  {string} [loading=lazy] image loading
 *  {string} [open-modal=""] does emit event with name set by open-modal which can be reacted on by eg. organisms/Modal.js
 *  {string} [picture-load=""] does emit event with name set by picture-load which can be reacted on by eg. molecules/Flyer.js
 * }
 * @css {
 *  --width [100%]
 *  --max-width [100%]
 *  --height [auto]
 *  --min-height [100%]
 *  --object-fit [cover]
 * }
 */
export default class Picture extends Shadow() {
  static get observedAttributes () {
    return ['loading', 'pointer-events']
  }

  constructor (...args) {
    super(...args)
    this.sources = (this.getAttribute('sources') && Picture.parseAttribute(this.getAttribute('sources'))) || null
    this.defaultSource = this.getAttribute('defaultSource') ? this.getAttribute('defaultSource') : ''
    this.alt = this.getAttribute('alt') ? this.getAttribute('alt') : ''

    this.clickListener = event => {
      if (!this.hasAttribute('open')) event.stopPropagation()
      this.dispatchEvent(new CustomEvent(this.getAttribute('open-modal') || 'open-modal', {
        detail: {
          origEvent: event,
          child: this
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.hasAttribute('open-modal')) this.addEventListener('click', this.clickListener)
  }

  disconnectedCallback () {
    if (this.hasAttribute('open-modal')) this.removeEventListener('click', this.clickListener)
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (this.img) {
      if (name === 'loading') {
        this.img.setAttribute(name, newValue)
      } else if (name === 'pointer-events') {
        this.css = /* css */`
          :host picture img {
            pointer-events: ${newValue};
          }
        `
      }
    }
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
    return !this.picture
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        text-align: var(--text-align, center);
      }
      :host([open-modal]) {
        cursor: pointer;
      }
      :host picture {
        filter: var(--filter, none);
        display: var(--display, block); /* don't use flex here, it can have strange side effects */
        justify-content: var(--justify-content, center);
        width: var(--width, unset);
        height: var(--height, unset);
        overflow: var(--overflow, initial);
        transition: var(--transition, none);
        margin: var(--margin, 0);
        transform: var(--transform, none);
        text-align: var(--text-align, center);
      }
      :host picture:hover {
        filter: var(--filter-hover, var(--filter, none));
      }
      :host picture img {
        aspect-ratio: var(--aspect-ratio, attr(width, auto) / attr(height, auto));
        display: var(--img-display, inline);
        border-radius:var(--border-radius, 0);
        width: var(--img-width, 100%);
        min-width: var(--img-min-width);
        max-width: var(--img-max-width, 100%);
        height: var(--img-height, auto);
        min-height: var(--img-min-height, 100%);
        max-height: var(--img-max-height);
        object-fit: var(--img-object-fit, cover);
        vertical-align: middle; /* use middle to avoid having a gap at the bottom of the image https://stackoverflow.com/questions/5804256/image-inside-div-has-extra-space-below-the-image */
      }
      @media only screen and (max-width: _max-width_) {
        :host picture {
          border-radius:var(--border-radius-mobile, 0);
          transition: var(--transition-mobile, none);
          transform: var(--transform-mobile, none);
          filter: var(--filter-mobile, none);
          width: var(--width-mobile, var(--width, 100%));
          height: var(--height-mobile, var(--height, unset));
        }
        :host picture img {
          border-radius:var(--border-radius-mobile, 0);
        }
      }
    `
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.html = this.picture = document.createElement('picture')

    // in case someone adds sources/img directly instead of using the attributes
    Array.from(this.root.children).forEach(node => {
      if (node.nodeName === 'SOURCE' || node.nodeName === 'IMG') this.picture.appendChild(node)
    })

    if (this.sources) {
      this.sources.forEach(i => {
        if (i.src !== '' && i.type !== '' && i.size !== '') {
          switch (i.size) {
            case 'small':
              this.picture.innerHTML += `<source srcset="${i.src}" type="${i.type}" media="(max-width: 400px)">`
              break
            case 'medium':
              this.picture.innerHTML += `<source srcset="${i.src}" type="${i.type}" media="(min-width: 401px) and (max-width: 600px)">`
              break
            case 'large':
              this.picture.innerHTML += `<source srcset="${i.src}" type="${i.type}" media="(min-width: 601px) and (max-width: 1200px)">`
              break
            case 'extra-large':
              this.picture.innerHTML += `<source srcset="${i.src}" type="${i.type}" media="(min-width: 1201px)">`
              break
            default:
              this.picture.innerHTML += `<source srcset="${i.src}" type="${i.type}">`
              break
          }
        } else {
          console.warn(`a-picture src - missing attributes: ${i.src === '' ? 'src' : ''} ${i.type === '' ? 'type' : ''} ${i.size === '' ? 'size' : ''}`)
        }
      })
    }
    if (this.defaultSource) {
      this.picture.innerHTML += `<img src="${this.defaultSource}" alt="${this.alt}">`
      if (this.alt === '') {
        console.warn('a-picture alt is missing')
      }
    } else {
      console.warn(`a-picture defaultSource ${this.alt === '' ? '& alt ' : ''}is missing`)
    }
    if (this.hasAttribute('picture-load')) {
      this.img.addEventListener('load', event => {
        this.setAttribute('loaded', 'true')
        this.dispatchEvent(new CustomEvent(this.getAttribute('picture-load') || 'picture-load', {
          detail: {
            origEvent: event,
            child: this,
            img: this.img,
            picture: this.picture
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      })
      this.img.setAttribute('loading', 'eager') // must load eager, not that the loading event doesn't trigger emit picture-load
    } else {
      this.img.setAttribute('loading', this.getAttribute('loading') || 'lazy')
    }
  }

  get img () {
    return this.root.querySelector('img')
  }
}
