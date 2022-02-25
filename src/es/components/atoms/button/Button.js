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
    return ['label']
  }

  constructor (options = {}, ...args) {
    super(Object.assign(options, { mode: 'open' }), ...args)

    this.clickListener = event => {
      this.button.classList.add('active')
      if (this.hasAttribute('href')) {
        event.stopPropagation()
        self.open(this.getAttribute('href'), this.getAttribute('target') || '_self', this.hasAttribute('rel') ? `rel=${this.getAttribute('rel')}` : '')
      }
    }
    // link behavior made accessible
    if (this.hasAttribute('href')) {
      this.setAttribute('data-href', this.getAttribute('href'))
      this.setAttribute('role', 'link')
    }
    if (this.textContent.length) this.labelText = this.textContent // allow its initial textContent to become the label if there are no nodes but only text
  }

  connectedCallback () {
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    this.button.addEventListener('click', this.clickListener)
  }

  disconnectedCallback () {
    this.button.removeEventListener('click', this.clickListener)
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'label') {
      this.labelText = newValue
      if (this.label) {
        this.label.textContent = this.labelText || ''
        this.label.classList[this.labelText ? 'remove' : 'add']('hide')
      }
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
        display: block;
      }
      button {
        align-items: center;
        background-color: var(--background-color, #000000);
        border-radius: var(--border-radius, 0.5em);
        border: var(--border-width, 0) solid var(--border-color, transparent);
        color: var(--color, #FFFFFF);
        cursor: pointer;
        display: flex;
        font-family: var(--font-family, unset);
        font-size: var(--font-size, 1em);
        font-weight: var(--font-weight, 400);
        justify-content: center;
        letter-spacing: var(--letter-spacing, normal);
        line-height: var(--line-height, 1.5em);
        margin: var(--margin, 0);
        outline: var(--outline, none);
        overflow: hidden;
        padding: var(--padding, 0.75em 1.5em);
        position: relative;
        touch-action: manipulation;
        transition: background-color 0.3s ease-out, border-color 0.3s ease-out, color 0.3s ease-out;
        width: var(--width, auto);
        opacity: var(--opacity, 1);
      }
      button:hover {
        background-color: var(--background-color-hover, var(--background-color, #B24800));
        border: var(--border-width-hover, var(--border-width, 0)) solid var(--border-color-hover, var(--border-color, #FFFFFF));
        color: var(--color-hover, var(--color, #FFFFFF));
        opacity: var(--opacity-hover, var(--opacity, 1));
      }
      button:active {
        background-color: var(--background-color-active, var(--background-color, #803300));
        color: var(--color-active, var(--color, #FFFFFF));
      }
      :host([disabled]) button {
        border: var(--border-width-disabled, var(--border-width, 0)) solid var(--border-color-disabled, var(--border-color, #FFFFFF));
        background-color: var(--background-color-disabled, var(--background-color, #FFDAC2));
        color: var(--color-disabled, var(--color, #FFFFFF));
        cursor: not-allowed;
        opacity: var(--opacity-disabled, var(--opacity, 1));
        transition: opacity 0.3s ease-out;
      }
      :host([disabled]) button:hover {
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
      @media only screen and (max-width: _max-width_) {
        button {
          font-size: var(--font-size-mobile, var(--font-size, 1em));
          margin: var(--margin-mobile, var(--margin, 0));
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
    }
  }

  renderHTML () {
    this.html = /* html */`
      <button type="button">
        <span id="label"${!this.labelText ? ' class="hide"' : ''}>${this.labelText || ''}</span>
      </button>
    `
    let iconLeft
    if ((iconLeft = this.root.querySelector('.icon-left'))) this.button.prepend(iconLeft)
    let iconRight
    if ((iconRight = this.root.querySelector('.icon-right'))) this.button.append(iconRight)
  }

  get disabled () {
    return this.hasAttribute('disabled')
  }

  set disabled (isDisabled) {
    this.button.disabled = isDisabled
    isDisabled ? this.setAttribute('disabled', '') : this.removeAttribute('disabled')
  }

  get button () {
    return this.root.querySelector('button')
  }

  get label () {
    return this.root.querySelector('#label')
  }
}
