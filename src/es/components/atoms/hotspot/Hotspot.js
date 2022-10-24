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
    super(Object.assign(options, { importMetaUrl: import.meta.url }), ...args)
    this.hasRendered = false

    this.buttonClickListener = e => {
      if (this.classList.contains('active')) {
        this.classList.remove('active')
        document.body.removeEventListener('click', this.clickListener);
      } else {
        document.body.addEventListener('click', this.clickListener);
      }
    }

    this.clickListener = e => {
      console.log(e.target, this)
      
      if (this.classList.contains('active')) {
        this.classList.remove('active')
        document.body.removeEventListener('click', this.clickListener);
      }
      else{
        this.classList.add('active')
      }
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
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
  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return !this.hasRendered
  }

  /**
   * renders the a-Hotspot css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host{
        position: absolute;
        top: ${this.getAttribute('top')}%;
        left: ${this.getAttribute('left')}%;
        width: 0;
        height: 0;
      }

      :host .btn-close{
        display: none;
      }
      :host .btn-open {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 3.1rem;
        height: 3.1rem;
        padding: 0;
        border: 0;
        background-color: transparent;
        border-radius: 50%;
        box-shadow: 1px 1px 15px -2px rgba(0,0,0,.1);
        outline: 0;
        transform: translate(-50%,-50%);
        transition: transform .2s ease-out,
          box-shadow .2s ease-out,
          background-color .2s ease-out;
        will-change: transform;
        z-index: 0;
      }

      :host .btn-open:before,
      :host .btn-open:after {
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        cursor: pointer;
      }
      :host .btn-open:before{
        width: 3.1rem;
        height: 3.1rem;
        background-color: rgba(255,255,255,.5);
        content: '';
        transform: translate(-50%,-50%);
        transition: background-color .2s ease-out;
      }


      :host(:nth-child(1n)) .btn-open:before{
        animation: button-pulse 1s ease;
      }      
      :host(:nth-child(2n)) .btn-open:before{
        animation: button-pulse 1s 250ms ease;
      }      
      :host(:nth-child(3n)) .btn-open:before{
        animation: button-pulse 1s .5s ease;
      }

      @keyframes button-pulse {
        0% {
        transform:translate(-50%,-50%) scale(1)
        }
        30% {
        transform:translate(-50%,-50%) scale(1.5)
        }
        100% {
        transform:translate(-50%,-50%) scale(1)
        }
      }

      :host .btn-open:after{
        background-image: url(_import-meta-url_./close-white.svg);
        background-color: var(--hotspot-button-background-color, var(--color-secondary, #ff6600));
        background-position: 50% 50%;
        background-repeat: no-repeat;
        transform: translate(-50%,-50%) rotate(-45deg);
        width: 2.2rem;
        height: 2.2rem;
        box-shadow: 0 0 0 0 transparent;
        content: '';
        transition: transform .2s ease-out,
          box-shadow .2s ease-out,
          background-color .2s ease-out;
      }
      :host .btn-open:hover:after{
        background-color: var(--hotspot-button-background-color-hover, var(--color-hover, #AACF80));
        box-shadow: 0 0 6px 0 rgba(0,0,0,.6);
      }
      :host(.active) .btn-open:after{
        background-color: var(--hotspot-button-background-color-hover, var(--color-hover, #AACF80));
        transform: translate(-50%,-50%) rotate(0);
      }

      :host .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0,0,0,0);
        border: 0;
      }

      :host .content{
        outline:0;
        z-index: 1;
        background-color: #fff;
      }

      @media screen and (min-width: _max-width_){
        :host .content{
          position: absolute;
          padding: 1.25rem;
          transform: scale(0) translate(-50%,-50%);
          transition: transform 250ms cubic-bezier(.755,.05,.855,.06);
          top: 50%;
          left: 50%;
          width: 22rem;
        }
        :host(.active) .content{
          visibility: visible;
          transition: transform .4s 250ms cubic-bezier(.755,.05,.855,.06);
        }
        :host .content:after{
          position: absolute;
          z-index: -1;
          width: 0;
          height: 0;
          border: solid #fff;
          border-width: 0.75rem;
          margin-left: -0.75rem;
          box-shadow: 5px 5px 15px -6px transparent;
          content: ' ';
          pointer-events: none;
          transition: box-shadow .1s cubic-bezier(.755,.05,.855,.06),
            transform .1s cubic-bezier(.755,.05,.855,.06);
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
          position: fixed;
          top: auto;
          right: 0;
          bottom: 0;
          left: 0;
          padding: 0 1.25rem 1.25rem;
          backface-visibility: hidden;
          border-radius: 10px 10px 0 0;
          box-shadow: 0 0 0.625rem 0 rgb(83 83 83 / 20%);
          transition: height .3s, animation .3s ease-in-out, visibility 1s ease;
          visibility: hidden;
          overflow-x: hidden;
          overflow-y: scroll;
          white-space: normal;
          animation: fadeOutBottom 1s ease;
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
          position: absolute;
          top: 0.625rem;
          left: 50%;
          width: 2.5rem;
          height: 4px;
          background-color: var(--hotspot-button-background-color, var(--color-secondary, #ff6600));
          border-radius: 4px;
          content: '';
          transform: translateX(-50%);
        }
        :host .content-title{
          position: relative;
          min-height: 2.5rem;
          padding: 10px 0 0.75rem;
          margin-bottom: 0.75rem;
          font-size: 1.8rem;
        }
        :host .content-title:after{
          position: absolute;
          bottom: 0;
          left: -1rem;
          width: calc(100% + 36px);
          height: 2px;
          background-color: #f3f2f0;
          content: '';
        }
        :host .btn-open {
          box-shadow: none;
        }
        :host .btn-open:before{
          background-color: transparent;
        }
        :host .btn-close{
          display:block;
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          width: 1rem;
          height: 1rem;
          padding: 0;
          border: 0;
          background-color: transparent;
          background-image: url(_import-meta-url_./close-orange-large.svg);
          background-repeat: no-repeat;
          background-size: contain;
          border-radius: 50%;
        }
      }
    `
    switch (this.getAttribute('place')) {
      case 'left':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./place/left.css`,
          namespace: false
        }])
      case 'right':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./place/right.css`,
          namespace: false
        }])
      case 'top':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./place/top.css`,
          namespace: false
        }])
      case 'bottom':
      default:
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./place/bottom.css`,
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
    this.hasRendered = true

    this.buttonOpen.classList.add('btn-open')
    this.buttonClose.classList.add('btn-close')
    Array.from(this.span).forEach(node => {
      this.buttonOpen.appendChild(node)
      if (node.classList.contains('sr-close')) this.buttonClose.appendChild(node.cloneNode())
    })

    this.divTitle.classList.add('content-title')
    this.divTitle.appendChild(this.content.querySelector('h3'))
    this.content.prepend(this.divTitle)
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
