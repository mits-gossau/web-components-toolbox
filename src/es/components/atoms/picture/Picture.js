// @ts-check
import { Intersection } from '../../prototypes/Intersection.js'

/* global CustomEvent */
/* global location */

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
export default class Picture extends Intersection() {
  static get observedAttributes () {
    return ['loading', 'pointer-events']
  }

  constructor (options = {}, ...args) {
    super(Object.assign(options, { intersectionObserverInit: {} }), ...args)

    this.setAttribute('role', 'img')
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
    this.mouseoverListener = event => {
      this.picture.classList.add('hover')
    }
    this.mouseoutListener = event => {
      this.picture.classList.remove('hover')
    }
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.hasAttribute('open-modal')) {
      this.setAttribute('aria-haspopup', 'true')
      this.addEventListener('click', this.clickListener)
    }
    if (this.mouseEventElement) {
      this.mouseEventElement.addEventListener('mouseover', this.mouseoverListener)
      this.mouseEventElement.addEventListener('mouseout', this.mouseoutListener)
    }
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    if (this.hasAttribute('open-modal')) this.removeEventListener('click', this.clickListener)
    if (this.mouseEventElement) {
      this.mouseEventElement.removeEventListener('mouseover', this.mouseoverListener)
      this.mouseEventElement.removeEventListener('mouseout', this.mouseoutListener)
      this.parentNodeShadowRootHost = null
    }
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (this.img) {
      if (name === 'loading' && this.img) {
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

  intersectionCallback (entries, observer) {
    if ((this.isIntersecting = entries && entries[0] && entries[0].isIntersecting)) this.intersecting()
  }

  // placeholder
  intersecting () {}

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
      :host([open-modal]) {
        cursor: pointer;
      }
      :host picture {
        display: var(--display, inline); /* don't use flex here, it can have strange side effects */
      }
      :host picture img {
        aspect-ratio: ${this.hasAttribute('aspect-ratio') ? `1/${this.getAttribute('aspect-ratio')}` : 'var(--aspect-ratio, auto)'};
        border-radius: var(--border-radius, 0);
        display: var(--img-display, block);
        filter: var(--filter, none);
        height: var(--img-height, auto);
        margin: var(--img-margin, auto);
        max-height: var(--img-max-height, 75vh);
        max-width: var(--img-max-width, 100%); /* max-content would have been nice to not scale up the image, but in general make the editor use big enough images and this must stay at 100% default value, otherwise there are several side effects */
        min-height: var(--img-min-height, unset);
        min-width: var(--img-min-width, unset);
        object-fit: var(--img-object-fit, cover);
        overflow: var(--overflow, initial);
        transform: var(--transform, none);
        transition: var(--transition, none);
        vertical-align: middle; /* use middle to avoid having a gap at the bottom of the image https://stackoverflow.com/questions/5804256/image-inside-div-has-extra-space-below-the-image */
        width: var(--img-width, max-content);
        image-rendering: -webkit-optimize-contrast; /* fix blurred image on webkit: https://www.betriebsrestaurants-migros.ch/landingpages/swissgrid/info-menuplan/ */
      }
      :host picture img:hover, :host picture.hover img {
        filter: var(--filter-hover, var(--filter, none));
        transform: var(--transform-hover, var(--transform, none));
      }
      :host([open-modal]) {
        position: relative;
      }
      :host([open]) > .close-btn {
        opacity: 0;
      }
      :host(:not([open])) > .close-btn {
        opacity: 1;
      }
      :host([open-modal]) > .close-btn {
        background-color: var(--close-btn-background-color, var(--color-secondary, var(--background-color)));
        border-radius: 50%;
        border: 0;
        box-sizing: border-box;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 7px;
        transition: var(--close-btn-transition, opacity 0.3s ease-out);
        padding: 0.75em;
        width: 7px;
        position: absolute;
        right: calc(var(--close-btn-right, var(--content-spacing)) / 2);
        bottom: calc(var(--close-btn-bottom, var(--content-spacing)) / 2);
      }
      :host([open-modal]) > .close-btn > span {
        height: 7px;
        width: 7px;
      }
      :host([open-modal]) > .close-btn > span > svg {
        margin: -3.5px 3.5px 1.5px -3.5px;
      }
      @media only screen and (max-width: _max-width_) {
        :host picture img {
          border-radius: var(--border-radius-mobile, 0);
          filter: var(--filter-mobile, var(--filter, none));
          height: var(--img-height-mobile, var(--img-height, auto));
          margin: var(--img-margin-mobile, var(--img-margin, auto));
          transform: var(--transform-mobile, var(--transform, none));
          transition: var(--transition-mobile, var(--transition, none));
          width: var(--img-width-mobile, var(--img-width, 100%));
        }
        :host picture img:hover, :host picture.hover img {
          filter: var(--filter-mobile-hover, var(--filter-hover, var(--filter, none)));
          transform: var(--transform-mobile-hover, var(--transform-hover, var(--transform, none)));
        }
        :host(:not([open-modal-mobile])) {
          position: static;
        }
        :host(:not([open-modal-mobile])) > .close-btn {
          display: none;
        }
        :host([open-modal-mobile]) > .close-btn {
          right: calc(var(--close-btn-right-mobile, var(--close-btn-right, var(--content-spacing-mobile, var(--content-spacing)))) / 2);
          bottom: calc(var(--close-btn-bottom-mobile, var(--close-btn-bottom, var(--content-spacing-mobile, var(--content-spacing)))) / 2);
        }
      }
    `
    switch (this.getAttribute('namespace')) {
      case 'picture-overflow-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./overflow-/overflow-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }])
      case 'picture-overflow-scale-up-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./overflow-scale-up-/overflow-scale-up-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }])
      case 'picture-scale-up-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./scale-up-/scale-up-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }])
      case 'picture-teaser-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./teaser-/teaser-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }])
      case 'picture-store-logo-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./store-logo-/store-logo-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }])
    }
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.html = this.picture = this.root.querySelector('picture') || document.createElement('picture')
    this.sources = []
    // in case someone adds sources/img directly instead of using the attributes
    Array.from(this.root.children).forEach(node => {
      if (node.nodeName === 'IMG') {
        node.setAttribute('data-src', Picture.pathResolver(node.getAttribute('src')))
        node.removeAttribute('src') // would be too late, avoid html img-tag
        this.img = node
      } else if (node.nodeName === 'SOURCE') {
        node.setAttribute('data-srcset', Picture.pathResolver(node.getAttribute('srcset')))
        node.removeAttribute('srcset')
        this.sources.push(node)
      }
    })
    // through defaultSource Attribute add img
    if (this.defaultSource) {
      this.img = document.createElement('img')
      this.img.setAttribute('data-src', Picture.pathResolver(this.defaultSource))
      this.img.setAttribute('alt', this.alt)
      if (this.alt === '') console.warn('a-picture alt is missing', this)
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decoding
    this.img.setAttribute('decoding', 'async')
    // set the loading attribute to the image
    this.setAttribute('loading', this.hasAttribute('picture-load') ? 'eager' : this.getAttribute('loading') || 'lazy') // 'picture-load' must load eager, not that the loading event doesn't trigger emit picture-load
    // deprecated but here for backwards compatibility... load sources through Attribute source
    if (this.sourcesObj) {
      const div = document.createElement('div')
      this.sourcesObj.forEach(i => {
        if (i.src !== '' && i.type !== '' && i.size !== '') {
          switch (i.size) {
            case 'small':
              div.innerHTML += `<source data-srcset="${i.src}" type="${i.type}" media="(max-width: 400px)">`
              break
            case 'medium':
              div.innerHTML += `<source data-srcset="${i.src}" type="${i.type}" media="(min-width: 401px) and (max-width: 600px)">`
              break
            case 'large':
              div.innerHTML += `<source data-srcset="${i.src}" type="${i.type}" media="(min-width: 601px) and (max-width: 1200px)">`
              break
            case 'extra-large':
              div.innerHTML += `<source data-srcset="${i.src}" type="${i.type}" media="(min-width: 1201px)">`
              break
            default:
              div.innerHTML += `<source data-srcset="${i.src}" type="${i.type}">`
              break
          }
        } else {
          console.warn(`a-picture src - missing attributes: ${i.src === '' ? 'src' : ''} ${i.type === '' ? 'type' : ''} ${i.size === '' ? 'size' : ''}`)
        }
      })
      Array.from(div.children).forEach(node => this.sources.push(node))
    }
    // generate sources if there aren't any but the query in the picture src would allow by width parameter
    if (!this.sources.length) {
      // TODO: "Nice to have once Umbraco doesn't send the sources anymore" incorporate self.getComputedStyle(node) CSS width limitation as max nextWidth as well as max raw img-tag width
      const src = Picture.newUrl(this.img.getAttribute('data-src'))
      let naturalWidth
      if ((naturalWidth = src.searchParams.get('width'))) {
        if (this.img.naturalWidth) naturalWidth = this.img.naturalWidth
        src.searchParams.delete('height') // height is not needed in query
        if (src.searchParams.get('format')) src.searchParams.set('format', 'webp') // force webp as format
        const step = 50
        let width = step
        let prevWidth = 0
        let nextWidth = 0
        while (width < naturalWidth) {
          nextWidth = width + step < naturalWidth ? width + step : 0
          nextWidth ? src.searchParams.set('width', String(width)) : src.searchParams.delete('width')
          const source = document.createElement('source')
          source.setAttribute('data-srcset', src.href)
          if (src.searchParams.get('format')) source.setAttribute('type', 'image/webp') // force webp as format
          source.setAttribute('media', `${prevWidth ? `(min-width: ${prevWidth + 1}px)` : ''}${prevWidth && nextWidth ? ' and ' : ''}${nextWidth ? `(max-width: ${width}px)` : ''}`)
          this.sources.push(source)
          prevWidth = width
          width += step
        }
      }
    }
    let img = this.img
    // if loading eager and if bad quality pic available load the picture first with bad quality and then improve it
    if (this.getAttribute('loading') === 'eager') {
      const src = Picture.newUrl(this.img.getAttribute('data-src'))
      if (src.searchParams.get('quality')) {
        this.sources.forEach(source => {
          const newSource = source.cloneNode()
          const src = Picture.newUrl(source.getAttribute('data-srcset'))
          src.searchParams.set('quality', '0')
          this.picture.appendChild(newSource)
          newSource.setAttribute('srcset', src.href)
        })
        img.setAttribute('decoding', 'sync') // otherwise it is flashing
        img = this.img.cloneNode()
        src.searchParams.set('quality', '0')
        img.setAttribute('data-src', src.href)
        this.picture.appendChild(img)
        img.setAttribute('src', img.getAttribute('data-src'))
        // on intersection swap the images
        this.intersecting = () => {
          this.intersecting = () => {}
          this.intersectionObserveStop()
          const picture = document.createElement('picture')
          this.sources.forEach(source => {
            picture.appendChild(source)
            source.setAttribute('srcset', source.getAttribute('data-srcset'))
          })
          picture.appendChild(this.img)
          this.img.setAttribute('src', this.img.getAttribute('data-src'))
          const replaceImg = event => {
            // avoid this.hidden default appear animation from
            this.css = /* CSS */`
              :host {
                --show: none;
              }
            `
            this.picture.replaceWith(picture)
            this.picture = picture
          }
          this.img.addEventListener('load', replaceImg, { once: true })
        }
        if (this.isIntersecting) this.intersecting()
      }
    }
    // if no bad quality picture loaded
    if (img === this.img) {
      this.intersecting = () => {
        this.intersecting = () => {}
        this.intersectionObserveStop()
        this.sources.forEach(source => {
          this.picture.appendChild(source)
          source.setAttribute('srcset', source.getAttribute('data-srcset'))
        })
        this.picture.appendChild(this.img)
        this.img.setAttribute('src', this.img.getAttribute('data-src'))
      }
      if (this.isIntersecting || this.getAttribute('loading') === 'eager') this.intersecting()
    }
    // event stuff
    if (this.hasAttribute('picture-load')) {
      img.addEventListener('load', event => {
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
      }, { once: true })
      img.addEventListener('error', event => {
        this.setAttribute('loaded', 'false')
        this.dispatchEvent(new CustomEvent(this.getAttribute('picture-load') || 'picture-load', {
          detail: {
            error: event
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      }, { once: true })
    }
    // modal stuff
    if (this.hasAttribute('open-modal')) {
      this.closeBtn = document.createElement('button')
      this.closeBtn.innerHTML = `
        <span>
          <svg id="Untitled-Seite%201" viewBox="0 0 14 14" style="background-color:#ffffff00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" x="0px" y="0px" width="14px" height="14px">
            <path d="M 5.9689 7.7071 L 7.7071 5.9689 L 12.5416 10.8034 L 10.8033 12.5416 L 5.9689 7.7071 Z" fill="#FFFFFF"/>
            <path d="M 5.9033 5.9689 L 7.6415 7.7071 L 2.807 12.5416 L 1.0688 10.8034 L 5.9033 5.9689 Z" fill="#FFFFFF"/>
            <path d="M 7.6415 5.9034 L 5.9033 7.6416 L 1.0688 2.8071 L 2.807 1.0689 L 7.6415 5.9034 Z" fill="#FFFFFF"/>
            <path d="M 7.707 7.6416 L 5.9689 5.9033 L 10.8033 1.0689 L 12.5416 2.8071 L 7.707 7.6416 Z" fill="#FFFFFF"/>
          </svg>
        </span>
      `
      this.closeBtn.classList.add('close-btn')
      // adjust for img being smaller than the picture container
      img.addEventListener('load', event => {
        const widthDiff = this.picture.getBoundingClientRect().width - this.img.getBoundingClientRect().width
        if (widthDiff > 0) this.css = /* css */`
          :host([open-modal]) > .close-btn {
            right: calc(var(--close-btn-right, var(--content-spacing)) / 2 + ${widthDiff / 2}px);
          }
          @media only screen and (max-width: _max-width_) {
            :host([open-modal-mobile]) > .close-btn {
              right: calc(var(--close-btn-right-mobile, var(--close-btn-right, var(--content-spacing-mobile, var(--content-spacing)))) / 2 + ${widthDiff / 2}px);
            }
          }
        `
      }, { once: true })
      this.html = this.closeBtn
    }
  }

  get alt () {
    return this.getAttribute('alt') ? this.getAttribute('alt') : ''
  }

  get defaultSource () {
    return this.getAttribute('defaultSource') ? this.getAttribute('defaultSource') : ''
  }

  get sourcesObj () {
    return (this.getAttribute('sources') && Picture.parseAttribute(this.getAttribute('sources'))) || null
  }

  get parentNodeShadowRootHost () {
    if (this._parentNodeShadowRootHost) return this._parentNodeShadowRootHost
    const searchShadowRoot = node => node.root || node.shadowRoot ? node : node.parentNode ? searchShadowRoot(node.parentNode) : node.host ? searchShadowRoot(node.host) : node
    return (this._parentNodeShadowRootHost = searchShadowRoot(this.parentNode))
  }

  set parentNodeShadowRootHost (node) {
    this._parentNodeShadowRootHost = node
  }

  get mouseEventElement () {
    return this[this.hasAttribute('hover-on-parent-element') ? 'parentNode' : this.hasAttribute('hover-on-parent-shadow-root-host') ? 'parentNodeShadowRootHost' : undefined]
  }

  /**
   * harmonize new URL behavior
   *
   * @param {string} path
   * @return {URL}
   */
  static newUrl (path) {
    return new URL(path, path.charAt(0) === '/' ? location.origin : path.charAt(0) === '.' ? import.meta.url.replace(/(.*\/)(.*)$/, '$1') : undefined)
  }

  /**
   * resolve the path from ../ and ./ to have the absolute path which can be used as absolute key for the cache Map
   *
   * @param {string} path
   * @return {string}
   */
  static pathResolver (path) {
    const a = document.createElement('a')
    a.href = path
    return a.href
  }
}
