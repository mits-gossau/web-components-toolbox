// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */

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
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.sources = (this.getAttribute('sources') && Video.parseAttribute(this.getAttribute('sources'))) || null
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return this.hasAttribute('id') ? !this.root.querySelector(`:host > style[_css], #${this.getAttribute('id')} > style[_css]`) : !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`) 
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.video
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
    :host {
      width: var(--width, 100%);
      height: var(--height, auto);
    }
    :host video, :host iframe {
      ${this.getAttribute('height') ? `height: ${this.getAttribute('height')}` : ''}
      ${this.getAttribute('width') ? `width: ${this.getAttribute('width')}` : ''}
      aspect-ratio: ${this.hasAttribute('aspect-ratio') ? `1/${this.getAttribute('aspect-ratio')}` : 'var(--aspect-ratio, auto)'};
      display: var(--display, block);
      filter: var(--filter, none);
      margin: var(--margin, 0 auto);
      max-height: var(--max-height, 75vh);
      max-width: var(--max-width, 100%);
      min-height: var(--min-height);
      min-width: var(--min-width);
      outline: var(--outline, none);
      transform: var(--transform, none);
      transition: var(--transition, none);
      width: var(--width, 100%);
      height: var(--height, auto);
    }
    :host video:hover, :host iframe:hover {
      filter: var(--filter-hover, var(--filter, none));
    }
    :host video {
      object-fit: var(--video-object-fit, cover);
      clip-path: var(--clip-path, none);
    }

    @media only screen and (max-width: _max-width_) {
      :host video, :host iframe {
        filter: var(--filter-mobile, none);
        transform: var(--transform-mobile, none);
        transition: var(--transition-mobile, none);
        width: var(--width-mobile, 100%);
      }
    }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    switch (this.getAttribute('namespace')) {
      case 'video-crop-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./crop-/crop-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }])
      default:
        return Promise.resolve()
    }
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.video = this.root.querySelector('div') || document.createElement('div')
    this.video.innerHTML = Array.from(this.attributes).reduce((acc, attribute) => {
      if (attribute.name && attribute.name !== 'sources' && attribute.name !== 'namespace' && !attribute.name.includes('hidden')) return `${acc} ${attribute.name}="${attribute.value || 'true'}"${!this.hasAttribute('playsinline') && attribute.name === 'autoplay' && attribute.value !== 'false' ? ' playsinline' : ''}`
      return acc
    }, '<video') + '></video>'
    this.video = this.video.children[0] // workaround, since autoplay did not trigger, when document.createElement('video')

    // in case someone adds sources directly instead of using the attributes
    Array.from(this.root.children).forEach(node => {
      if (node.nodeName === 'SOURCE') this.video.appendChild(node)
    })

    if ((this.sources && this.sources.every(i => {
      if (i.src !== '' && i.type !== '') return (this.video.innerHTML += `<source src="${i.src}" type="${i.type || 'video/mp4'}">`)
      return false
    })) || this.video.querySelector('source')) this.html = this.video

    if (this.hasAttribute('video-load')) {
      this.video.addEventListener(this.hasAttribute('poster') ? 'loadedmetadata' : 'loadeddata', event => {
        this.setAttribute('loaded', 'true')
        this.dispatchEvent(new CustomEvent(this.getAttribute('video-load') || 'video-load', {
          detail: {
            origEvent: event,
            child: this,
            video: this.video,
            picture: this.picture
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      })
      this.video.addEventListener('error', event => {
        this.setAttribute('loaded', 'false')
        this.dispatchEvent(new CustomEvent(this.getAttribute('video-load') || 'video-load', {
          detail: {
            error: event
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      })
      this.video.setAttribute('loading', 'eager') // must load eager, not that the loading event doesn't trigger emit video-load
    } else {
      this.video.setAttribute('loading', this.getAttribute('loading') || 'lazy')
    }
  }
}
