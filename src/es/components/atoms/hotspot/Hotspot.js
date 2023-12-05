// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 *
 *
 * @export
 * @class Hotspot
 * @type {CustomElementConstructor}
 * @css {
 *
 * }
 * @attribute {
 * {number} [top] The position to top
 * {number} [left] The position to left
 * {left, right, top, bottom } [place=bottom] default is bottom

 * }
 */
export default class Hotspot extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.hasRendered = false

    this.buttonClickListener = e => {
      if (this.classList.contains('active')) {
        this.classList.remove('active')
        document.body.removeEventListener('click', this.clickListener)
      } else {
        this.classList.add('active')
        document.body.addEventListener('click', this.clickListener)
      }
    }

    this.clickListener = e => {
      if (e.composedPath()[0] !== this.buttonOpen) {
        this.classList.remove('active')
        document.body.removeEventListener('click', this.clickListener)
      }
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    this.buttonOpen.addEventListener('click', this.buttonClickListener)
    this.buttonClose.addEventListener('click', this.buttonClickListener)
  }

  disconnectedCallback () {
    this.buttonOpen.removeEventListener('click', this.buttonClickListener)
    this.buttonClose.removeEventListener('click', this.buttonClickListener)
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
    return !this.hasRendered
  }

  /**
   * renders the a-Hotspot css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host{
        ${this.getAttribute('top') != null
        ? `
          position: absolute;
          top: ${this.getAttribute('top')}%;         
          left: ${this.getAttribute('left')}%;
        `
        : 'position: relative;'}
      }

      :host .btn-close{
        background-color: transparent;
        background-image: url(_import-meta-url_./icons/close-orange-large.svg);
        background-repeat: no-repeat;
        background-size: contain;
        border-radius: 50%;
        border: 0;
        display: block;
        height: var(--btn-close-size, 1rem);
        padding: 0;
        position: absolute;
        right: var(--btn-close-right, var(--content-padding, 1.25rem));
        top: var(--btn-close-top, var(--content-padding, 1.25rem));
        width: var(--btn-close-size, 1rem);;
      }

      :host .btn-open {
        background-color: transparent;
        border: 0;
        padding: 0;
      }

      :host .btn-open:after {
        border-radius: 50%;
        cursor: pointer;
        position: absolute;
      }

      :host .btn-open:after{
        background-position: 50% 50%;
        background-repeat: no-repeat;
        box-shadow: var(--btn-open-after-box-shadow, 0 0 0 0 transparent);
        content: '';
        transition: transform .2s ease-out,
          box-shadow .2s ease-out,
          background-color .2s ease-out;
      }

      :host .sr-only {
        border: 0;
        clip: rect(0,0,0,0);
        height: 1px;
        margin: -1px;
        overflow: hidden;
        padding: 0;
        position: absolute;
        width: 1px;
      }

      :host .content{
        background-color: var(--content-background-color, #fff);
        outline: 0;
        z-index: 100;
      }

      @media screen and (min-width: _max-width_){
        :host .content{
          left: 50%;
          padding: var(--content-padding, 1.25rem);
          position: absolute;
          top: 50%;
          transform: scale(0) translate(-50%,-50%);
          transition: transform 250ms cubic-bezier(.755,.05,.855,.06);
          width: var(--content-width, 22rem);
        }
        :host(.active) .content{
          transition: transform .4s 250ms cubic-bezier(.755,.05,.855,.06);
          visibility: visible;
        }
        :host .content:after{
          border: solid var(--after-border-width, 0.75rem) var(--content-background-color, #fff);
          box-shadow: 3px 3px 15px -1px transparent;
          content: ' ';
          height: 0;
          margin-left: calc(var(--after-border-width, 0.75rem) * -1);
          pointer-events: none;
          position: absolute;
          transition: box-shadow .1s cubic-bezier(.755,.05,.855,.06),
            transform .1s cubic-bezier(.755,.05,.855,.06);
          width: 0;
          z-index: -1;
        }
        :host(.active) .content > *{
          opacity: 1;
          transition: opacity 250ms .4s ease-out;
        }
        :host .content > *{
          opacity: 0;
          transition: opacity 75ms ease-in;
        }
      }

      @media screen and (max-width: _max-width_){
        :host .content{
          animation: fadeOutBottom 1s ease;
          backface-visibility: hidden;
          border-radius: 10px 10px 0 0;
          bottom: 0;
          box-shadow: 0 0 0.625rem 0 rgb(83 83 83 / 20%);
          left: 0;
          overflow-x: hidden;
          overflow-y: scroll;
          padding: 0 1.25rem 1.25rem;
          position: fixed;
          right: 0;
          top: auto;
          transition: height .3s, animation .3s ease-in-out, visibility 1s ease;
          visibility: hidden;
          white-space: normal;
        }
        @keyframes fadeOutBottom{
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100%);
          }
        }
        :host(.active) .content{
          animation: fadeInBottom 1s ease;
          visibility: visible;
        }
        @keyframes fadeInBottom{
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0);
          }
        }
        :host .content:before{
          background-color: var(--button-background-color, var(--color-secondary, #ff6600));
          border-radius: 4px;
          content: '';
          height: 4px;
          left: 50%;
          position: absolute;
          top: 0.625rem;
          transform: translateX(-50%);
          width: 2.5rem;
        }
        :host .content-title{
          font-size: 1.8rem;
          margin-bottom: 0.75rem;
          min-height: 2.5rem;
          padding: 10px 0 0.75rem;
          position: relative;
        }
        :host .content-title:after{
          background-color: #f3f2f0;
          bottom: 0;
          content: '';
          height: 2px;
          left: -1rem;
          position: absolute;
          width: calc(100% + 36px);
        }
        :host .btn-open {
          box-shadow: none;
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
    const styles = [{
      // @ts-ignore
      path: `${this.importMetaUrl}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
      namespaceFallback: true
    }]

    switch (this.getAttribute('place')) {
      case 'left':
        styles.push({
          path: `${this.importMetaUrl}./place/left.css`,
          namespaceFallback: true
        })
        break
      case 'right':
        styles.push({
          path: `${this.importMetaUrl}./place/right.css`,
          namespaceFallback: true
        })
        break
      case 'top':
        styles.push({
          path: `${this.importMetaUrl}./place/top.css`,
          namespaceFallback: true
        })
        break
        case 'none':
        styles.push({
          path: `${this.importMetaUrl}./place/none.css`,
          namespaceFallback: true
        })
      case 'bottom':
      default:
        styles.push({
          path: `${this.importMetaUrl}./place/bottom.css`,
          namespaceFallback: true
        })
        break
    }

    switch (this.getAttribute('namespace')) {
      case 'hotspot-helper-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./helper-/helper-.css`,
          namespace: false
        }, ...styles], false)
      case 'hotspot-default-':
      default:
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./default-/default-.css`,
          namespace: false
        }, ...styles], false)
    }
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.hasRendered = true

    this.buttonOpen.classList.add('btn-open')
    this.buttonClose.classList.add('btn-close')
    Array.from(this.span).forEach(node => {
      this.buttonOpen.appendChild(node)
      if (node.classList.contains('sr-close')) this.buttonClose.appendChild(node.cloneNode())
    })

    if (this.content.querySelector('h3') != null) {
      this.divTitle.classList.add('content-title')
      this.divTitle.appendChild(this.content.querySelector('h3'))
      this.content.prepend(this.divTitle)
    }
    this.content.appendChild(this.buttonClose)

    this.html = this.buttonOpen
  }

  get content () {
    return this.root.querySelector('.content')
  }

  get divTitle () {
    return this._divTitle || (this._divTitle = document.createElement('div'))
  }

  get buttonOpen () {
    return this._buttonOpen || (this._buttonOpen = document.createElement('button'))
  }

  get buttonClose () {
    return this._buttonClose || (this._buttonClose = document.createElement('button'))
  }

  get span () {
    return this.root.querySelectorAll('span.sr-only')
  }
}
