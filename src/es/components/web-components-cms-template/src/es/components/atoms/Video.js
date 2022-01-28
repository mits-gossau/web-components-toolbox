// @ts-check
import { Shadow } from '../prototypes/Shadow.js'

/* global self */

/**
 * Video
 * Wrapper for a video-tag with multiple sources
 * Makes it easier for backend-user by accepting sources as array and applying media-queries according to size-attribute
 * As an atom, this component can not hold further children (those would be quantum)
 *
 * @export
 * @class Video
 * @type {CustomElementConstructor}
 * @attribute {
 *  sources [array]
 *  [{
 *    source [string]
 *    type [string?=undefined] e.g. image/jpg, image/webp, etc.
 *  }, {...}, {...}] analog: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
 *  {string} [width]
 *  {string} [height]
 * }
 * @css {
 *  --display [block]
 *  --filter [none]
 *  --margin [0 auto]
 *  --max-height
 *  --max-width [100%]
 *  --min-height [100%]
 *  --min-width
 *  --transform [none]
 *  --transition [none]
 *  --filter-hover [none]
 *  --video-object-fit [cover]
 *  --filter-mobile [none]
 *  --transform-mobile [none]
 *  --transition-mobile [none]
 *  --width-mobile [100%]
 * }
 */
export default class Video extends Shadow() {
  constructor (...args) {
    super(...args)
    this.sources = (this.getAttribute('sources') && Video.parseAttribute(this.getAttribute('sources'))) || null
  }

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
    return !this.video
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
    :host video, :host iframe {
      ${this.getAttribute('height') ? `height: ${this.getAttribute('height')}` : ''}
      ${this.getAttribute('width') ? `width: ${this.getAttribute('width')}` : ''}
      aspect-ratio: var(--aspect-ratio, attr(width, auto) / attr(height, auto));
      display: var(--display, block);
      filter: var(--filter, none);
      margin: var(--margin, 0 auto);
      max-height: var(--max-height, 100%);
      max-width: var(--max-width, 100%);
      min-height: var(--min-height);
      min-width: var(--min-width);
      outline: var(--outline, none);
      transform: var(--transform, none);
      transition: var(--transition, none);
    }
    :host video:hover, :host iframe:hover {
      filter: var(--filter-hover, var(--filter, none));
    }
    :host video {
      object-fit: var(--video-object-fit, cover);
    }

    @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
      :host video, :host iframe {
        filter: var(--filter-mobile, none);
        transform: var(--transform-mobile, none);
        transition: var(--transition-mobile, none);
        width: var(--width-mobile, 100%);
      }
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
    this.video = document.createElement('div')
    this.video.innerHTML = Array.from(this.attributes).reduce((acc, attribute) => {
      if (attribute.name && attribute.name !== 'sources') return `${acc} ${attribute.name}="${attribute.value || 'true'}"`
      return acc
    }, '<video') + '></video'
    this.video = this.video.children[0] // workaround, since autoplay did not trigger, when document.createElement('video')

    // in case someone adds sources directly instead of using the attributes
    Array.from(this.root.children).forEach(node => {
      if (node.nodeName === 'SOURCE') this.video.appendChild(node)
    })

    if ((this.sources && this.sources.every(i => {
      if (i.src !== '' && i.type !== '') return (this.video.innerHTML += `<source src="${i.src}" type="${i.type}">`)
      return false
    })) || this.video.querySelector('source')) this.html = this.video
  }
}
