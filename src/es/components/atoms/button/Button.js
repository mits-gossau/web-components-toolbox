// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

/**
 * Creates an Button
 * https://www.figma.com/file/npi1QoTULLWLTGM4kMPUtZ/Components-Universal?node-id=2866%3A55901
 *
 * @export
 * @attribute {namespace} namespace
 * @type {CustomElementConstructor}
 */
export default class Button extends Shadow() {
  static get observedAttributes () {
    return ['label', 'disabled']
  }

  constructor (...args) {
    super(...args)

    this.clickListener = event => {
      if (this.hasAttribute('href')) {
        event.stopPropagation()
        self.open(this.getAttribute('href'), this.getAttribute('target') || '_self', this.hasAttribute('rel') ? `rel=${this.getAttribute('rel')}` : '')
      }
      if (this.getAttribute('request-event-name')) {
        this.button.classList.add('active')
        this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name'), {
          detail: {
            origEvent: event,
            tags: [this.getAttribute('tag')],
            fetchSubTags: this.hasAttribute('fetch-sub-tags'),
            clearSubTags: this.hasAttribute('clear-sub-tags'),
            this: this
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      }
    }
    this.answerEventListener = async event => {
      let tags = event.detail.tags
      if (this.hasAttribute('active-detail-property-name')) {
        tags = await this.getAttribute('active-detail-property-name').split(':').reduce(async (accumulator, propertyName) => {
          propertyName = propertyName.replace(/-([a-z]{1})/g, (match, p1) => p1.toUpperCase())
          if (accumulator instanceof Promise) accumulator = await accumulator
          return accumulator[propertyName]
        }, event.detail)
      }
      console.log('changed', tags, this.getAttribute('tag'));
      if (tags && tags.length) this.button.classList[tags.includes(this.getAttribute('tag')) ? 'add' : 'remove']('active')
    }
    // link behavior made accessible
    if (this.hasAttribute('href')) {
      this.setAttribute('data-href', this.getAttribute('href'))
      this.setAttribute('role', 'link')
    }
    if (this.textContent.length) this.labelText = this.textContent // allow its initial textContent to become the label if there are no nodes but only text
    this.mouseoverListener = event => {
      this.button.classList.add('hover')
    }
    this.mouseoutListener = event => {
      this.button.classList.remove('hover')
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    this.button.addEventListener('click', this.clickListener)
    console.log('listening', this.getAttribute('answer-event-name'));
    if (this.getAttribute('answer-event-name')) document.body.addEventListener(this.getAttribute('answer-event-name'), this.answerEventListener)
    this.attributeChangedCallback('disabled')
    if (this.mouseEventElement) {
      this.mouseEventElement.addEventListener('mouseover', this.mouseoverListener)
      this.mouseEventElement.addEventListener('mouseout', this.mouseoutListener)
    }
  }

  disconnectedCallback () {
    this.button.removeEventListener('click', this.clickListener)
    if (this.getAttribute('answer-event-name')) document.body.removeEventListener(this.getAttribute('answer-event-name'), this.answerEventListener)
    if (this.mouseEventElement) {
      this.mouseEventElement.removeEventListener('mouseover', this.mouseoverListener)
      this.mouseEventElement.removeEventListener('mouseout', this.mouseoutListener)
      this.parentNodeShadowRootHost = null
    }
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'label') {
      this.labelText = newValue
      if (this.label) {
        this.label.textContent = this.labelText || ''
        this.label.classList[this.labelText ? 'remove' : 'add']('hide')
      }
    } else if (this.button && name === 'disabled') {
      this.hasAttribute('disabled') ? this.button.setAttribute('disabled', '') : this.button.removeAttribute('disabled')
      this.hasAttribute('aria-disabled') ? this.button.setAttribute('aria-disabled', 'true') : this.button.removeAttribute('aria-disabled')
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderCSS () {
    return !this.root.querySelector('style[_css]')
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return !this.button || !this.label
  }

  renderCSS () {
    this.css = /* css */`
      :host {
        cursor: unset !important;
        display: inline-block;
      }
      button {
        align-items: center;
        background-color: var(--background-color, #000000);
        border-radius: var(--border-radius, 0.5em);
        border: var(--border-width, 0px) solid var(--border-color, transparent);
        color: var(--color, #FFFFFF);
        cursor: pointer;
        display: flex;
        font-family: var(--font-family, unset);
        font-size: var(--font-size, 1em);
        font-weight: var(--font-weight, 400);
        justify-content: var(--justify-content, center);
        letter-spacing: var(--letter-spacing, normal);
        line-height: var(--line-height, 1.5em);
        margin: var(--margin, auto);
        opacity: var(--opacity, 1);
        outline: var(--outline, none);
        overflow: hidden;
        padding: var(--padding, calc(0.75em - var(--border-width, 0px)) calc(1.5em - var(--border-width, 0px)));
        text-transform: var(--text-transform, none);
        touch-action: manipulation;
        transition: var(--transition, background-color 0.3s ease-out, border-color 0.3s ease-out, color 0.3s ease-out);
        width: var(--width, auto);
      }
      button:hover, button.hover {
        background-color: var(--background-color-hover, var(--background-color, #B24800));
        border: var(--border-width-hover, var(--border-width, 0px)) solid var(--border-color-hover, var(--border-color, #FFFFFF));
        color: var(--color-hover, var(--color, #FFFFFF));
        opacity: var(--opacity-hover, var(--opacity, 1));
      }
      button:active, button.active {
        background-color: var(--background-color-active, var(--background-color-hover, var(--background-color, #803300)));
        color: var(--color-active, var(--color-hover, var(--color, #FFFFFF)));
      }
      :host button[disabled] {
        border: var(--border-width-disabled, var(--border-width, 0px)) solid var(--border-color-disabled, var(--border-color, #FFFFFF));
        background-color: var(--background-color-disabled, var(--background-color, #FFDAC2));
        color: var(--color-disabled, var(--color, #FFFFFF));
        cursor: not-allowed;
        opacity: var(--opacity-disabled, var(--opacity, 1));
        transition: opacity 0.3s ease-out;
      }
      :host button[disabled]:hover, :host button[disabled].hover {
        opacity: var(--opacity-disabled-hover, var(--opacity-disabled, var(--opacity, 1)));
      }
      #label {
        display: inline-block;
        position: relative;
      }
      #label.hide {
        display: none;
      }
      .icon-left {
        margin: var(--icon-left-margin, 0 0.5em 0 0);
      }
      .icon-right {
        margin: var(--icon-right-margin, 0 0 0 0.5em);
      }
      .icon-left, .icon-right {
        height: var(--icon-height, 1.5em);
        width: var(--icon-width, auto);
      }
      .icon-left, .icon-right {
        flex-shrink: 0;
      }
      @media only screen and (max-width: _max-width_) {
        button {
          font-size: var(--font-size-mobile, var(--font-size, 1em));
          margin: var(--margin-mobile, var(--margin, auto));
          border-radius: var(--border-radius-mobile, var(--border-radius, 0.571em));
        }
        .icon-left {
          margin: var(--icon-left-margin-mobile, var(--icon-left-margin, 0 0.5em 0 0));
        }
        .icon-right {
          margin: var(--icon-right-margin-mobile, var(--icon-right-margin, 0 0 0 0.5em));
        }
        .icon-left, .icon-right {
          height: var(--icon-height-mobile,var(--icon-height, 1.5em));
          width: var(--icon-width-mobile, var(--icon-width, auto));
        }
      }
    `
    switch (this.getAttribute('namespace')) {
      case 'button-primary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./primary-/primary-.css`,
          namespace: false
        }])
      case 'button-secondary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./secondary-/secondary-.css`,
          namespace: false
        }])
      case 'button-tertiary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./tertiary-/tertiary-.css`,
          namespace: false
        }])
      case 'button-quaternary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./quaternary-/quaternary-.css`,
          namespace: false
        }])
      case 'button-download-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./download-/download-.css`,
          namespace: false
        }])
      case 'button-category-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./primary-/primary-.css`,
          namespace: false
        },
        {
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./category-/category-.css`,
          namespace: false
        }], false).then(fetchCSSParams => {
          // harmonize the primary-.css namespace with --category
          fetchCSSParams[0].styleNode.textContent = fetchCSSParams[0].styleNode.textContent.replace(/--primary-/g, '--category-')
        })
    }
  }

  renderHTML () {
    this.html = /* html */`
      <button type="button">
        <span id="label"${!this.labelText ? ' class="hide"' : ''}>${this.labelText || ''}</span>
      </button>
    `
    if (this.getAttribute('namespace') === 'button-download-') {
      this.button.prepend(this.downloadIcon)
    }

    let iconLeft
    if ((iconLeft = this.root.querySelector('.icon-left'))) this.button.prepend(iconLeft)
    let iconRight
    if ((iconRight = this.root.querySelector('.icon-right'))) this.button.append(iconRight)
  }

  get button () {
    return this.root.querySelector('button')
  }

  get label () {
    return this.root.querySelector('#label')
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

  get downloadIcon () {
    let iconImg
    iconImg = document.createElement('div')
    iconImg.innerHTML = /* html */ `
      <svg class="icon-left" width="60px" height="60px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <!-- Generator: Sketch 63.1 (92452) - https://sketch.com -->
        <title>Button Download</title>
        <desc>Created with Sketch.</desc>
        <g id="Button-Download" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="Group-2">
                <circle id="Oval" fill="var(--button-download-background-color)" cx="30" cy="30" r="30"></circle>
                <g id="Group" transform="translate(19.000000, 14.000000)" stroke="var(--button-download-icon-color)" stroke-width="3">
                    <line x1="0" y1="30.5" x2="23" y2="30.5" id="Line-3" stroke-linecap="square"></line>
                    <line x1="11.5" y1="22" x2="11.5" y2="-6.10622664e-16" id="Line-3-Copy" stroke-linecap="square"></line>
                    <polyline id="Path-2" points="0 12.5 11.5 24.5 23 12.5"></polyline>
                </g>
            </g>
        </g>
      </svg>`
    return (iconImg = iconImg.children[0])
  }
}
