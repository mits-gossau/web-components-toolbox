// @ts-check
import { Shadow } from '../prototypes/Shadow.js'

/* global CustomEvent */
/* global self */

/**
 * Input is a wrapper for any form input
 * Example at: /src/es/components/pages/ClassicsSearch.html
 * As an atom, this component can not hold further children (those would be quantum)
 *
 * @export
 * @class Input
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} [type=text] the input type (text, radio, select, checkbox, etc.)
 * }
 * @css {
 * --display [flex]
 * --height [min(95px, 20vw)]
 * --input-background [none]
 * --color [red]
 * --input-border [none]
 * --flex-grow [0]
 * --flex-direction [column]
 * --border-top [none]
 * --border-bottom [none]
 * --border-right [none]
 * --border-left [none]
 * --text-align [center]
 * --display-mobile [--display]
 * --height-mobile [--height]
 * --input-background-mobile [--input-background]
 * --color-mobile [--color]
 * --input-border-mobile [--input-border]
 * --flex-grow-mobile [--flex-grow]
 * --flex-direction-mobile [--flex-direction]
 * --border-top-mobile [--border-top]
 * --border-bottom-mobile [--border-bottom]
 * --border-right-mobile [--border-right]
 * --border-left-mobile [--border-left]
 * --text-align-mobile [--text-align]
 * --font-family
 * --font-family-bold
 * --p-font-size
 * }
 */

export default class Input extends Shadow() {
  constructor (input, label, description, ...args) {
    super(...args)

    this._input = input
    this._label = label
    this._description = description

    this.onChange = event => {
      if (!this.getAttribute('name')) this.setAttribute('name', event.target.name)
      if (event.key === 'Enter') {
        this.dispatchEvent(new CustomEvent('form-submit', {
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      } else {
        this.setAttribute('value', event.target.value)
      }
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.input) {
      this.input.addEventListener('keyup', this.onChange)
      this.input.addEventListener('change', this.onChange)
    }
  }

  disconnectedCallback () {
    if (this.input) {
      this.input.removeEventListener('keyup', this.onChange)
      this.input.removeEventListener('change', this.onChange)
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
    return !this.root.querySelector('input') || !this.root.querySelector('label')
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        display: var(--display, flex);
        width: var(--width, unset);
        flex-grow: var(--flex-grow, 0);
        padding: var(--padding, 0);
        margin: var(--margin, 0);
        flex-direction: var(--flex-direction, column);
        height: var(--height, min(95px, 20vw)); 
        text-align: var(--text-align, center);
        position: var(--position, static);
      }
      :host([type=radio]) {
        display: var(--radio-display, var(--display, flex));
        width: var(--radio-width, var(--width, unset));
        flex-grow: var(--radio-flex-grow, var(--flex-grow, 0));
        padding: var(--radio-padding, var(--padding, 0));
        margin: var(--radio-margin, var(--margin, 0));
        flex-direction: var(--radio-flex-direction, var(--flex-direction, column));
        height: var(--radio-height, var(--height, min(95px, 20vw)));
        text-align: var(--radio-text-align, var(--text-align, center));
      }
      :host([type=checkbox]) {
        display: var(--checkbox-display, var(--display, flex));
        width: var(--checkbox-width, var(--width, unset));
        flex-grow: var(--checkbox-flex-grow, var(--flex-grow, 0));
        padding: var(--checkbox-padding, var(--padding, 0));
        margin: var(--checkbox-margin, var(--margin, 0));
        flex-direction: var(--checkbox-flex-direction, var(--flex-direction, column));
        height: var(--checkbox-height, var(--height, min(95px, 20vw)));
        text-align: var(--checkbox-text-align, var(--text-align, center));
      }
      :host(:focus-within) {
        box-shadow: var(--input-box-shadow, inset 0 0 2px 2px var(--color));
      }
      :host > input {
        background: var(--input-background, var(--background, none));
        padding: var(--input-padding, var(--padding, 0 15px));
        margin: var(--input-margin, var(--margin, 0));
        border: var(--input-border, var(--border, none));
        border-radius: var(--input-border-radius, var(--border-radius, 0px));
        font-family: var(--input-font-family, var(--font-family));
        font-weight: var(--input-font-weight, var(--font-weight, normal));
        font-size: var(--input-font-size, var(--p-font-size, var(--font-size)));
        text-align: var(--input-text-align, var(--text-align, center));
        color: var(--input-color, var(--color, red));
        width: var(--input-width, var(--width, 40%));
        align-self: var(--input-align-self, var(--align-self, center));
        height: var(--input-height, var(--height, 100%));
      }
      :host > label {
        background: var(--label-background, var(--background, none));
        padding: var(--label-padding, var(--padding, 0 15px));
        margin: var(--label-margin, var(--margin, 0));
        border: var(--label-border, var(--border, none));
        border-radius: var(--label-border-radius, var(--border-radius, 0px));
        font-family: var(--label-font-family-bold, var(--font-family-bold));
        font-weight: var(--label-font-weight, var(--font-weight, normal));
        font-size: var(--label-font-size, var(--p-font-size, var(--font-size)));
        text-align: var(--label-text-align, var(--text-align, center));
        color: var(--label-color, var(--color, red));
        width: var(--label-width, var(--width, 40%));
        align-self: var(--label-align-self, var(--align-self, center));
        height: var(--label-height, var(--height, 100%));
        text-transform: var(--label-text-transform, var(--text-transform, uppercase));
      }
      :host > label.normal {
        font-family: var(--label-font-family-normal, var(--label-font-family, var(--font-family)));
        text-transform: var(--label-text-transform-normal, var(--label-text-transform, var(--text-transform)));
      }
      :host > input[type=radio], :host > input[type=checkbox] {
        width: auto; /* safari only swallows auto otherwise it will hang at left edge */
      }
      :host > input[type=radio] {
        height: var(--input-radio-height, var(--input-height, var(--height, auto)));
        padding: var(--input-radio-padding, var(--input-padding, var(--padding)));
        margin: var(--input-radio-margin, var(--input-margin, var(--margin)));
      }
      :host > input[type=checkbox] {
        height: var(--input-checkbox-height, var(--input-height, var(--height, auto)));
        padding: var(--input-checkbox-padding, var(--input-padding, var(--padding)));
        margin: var(--input-checkbox-margin, var(--input-margin, var(--margin)));
      }
      :host > input:not(:focus):invalid {
        color: var(--input-color-invalid, var(--color-invalid, var(--color, red)));
      }
      :host > input:focus {
        outline: var(--input-outline, none);
      }
      ::placeholder {
        color: var(--placeholder-color, var(--color));
        opacity: var(--placeholder-opacity, 0.6);
      }
      :host a {
        color: var(--a-color, var(--color-secondary, var(--color, pink)));
        font-weight: var(--a-font-weight, var(--font-weight, normal));
        text-align: var(--a-text-align, unset);
        text-decoration: var(--a-text-decoration, var(--text-decoration, none));
        text-underline-offset: var(--a-text-underline-offset, unset);
        display: var(--a-display, inline);
        margin: var(--a-margin, var(--content-spacing, unset)) auto;
      }
      :host * a {
        display: var(--any-a-display, var(--a-display, inline));
      }
      :host a:hover, :host a:active, :host a:focus {
        color: var(--a-color-hover, var(--color-hover-secondary, var(--color-hover, var(--color, green))));
        text-decoration: var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, var(--text-decoration, none))));
      }
      input:-webkit-autofill,
      input:-webkit-autofill:hover, 
      input:-webkit-autofill:focus {
        border: 0;
        -webkit-text-fill-color: var(--label-color, var(--color));
        caret-color: var(--label-color, var(--color));
        text-fill-color: var(--label-color, var(--color));
        box-shadow: 0;
        transition: background-color 5000s ease-in-out 0s;
      }
      input:autofill,
      input:autofill:hover, 
      input:autofill:focus {
        border: 0;
        -webkit-text-fill-color: var(--label-color, var(--color));
        caret-color: var(--label-color, var(--color));
        text-fill-color: var(--label-color, var(--color));
        box-shadow: 0;
        transition: background-color 5000s ease-in-out 0s;
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host {
          display: var(--display-mobile, var(--display, flex));
          flex-grow: var(--flex-grow-mobile, var(--flex-grow, 0));
          flex-direction: var(--flex-direction-mobile, var(--flex-direction, column));
          height: var(--height-mobile, var(--height, min(85px, 20vw)));
          text-align: var(--text-align-mobile, var(--text-align, center));
          position: var(--position-mobile, var(--position, static));
        }
        :host(:focus-within) {
          box-shadow: var(--input-box-shadow-mobile, inset 0 0 1.5px 1.5px var(--color));
        }
        :host > input {
          background: var(--input-background-mobile, var(--background-mobile, var(--input-background, var(--background, none))));
          font-family: var(--input-font-family-mobile, var(--font-family-mobile, var(--input-font-family, var(--font-family))));
          font-weight: var(--input-font-weight-mobile, var(--font-weight-mobile, var(--input-font-weight, var(--font-weight, normal))));
          font-size: var(--input-font-size-mobile, var(--input-font-size, var(--p-font-size, var(--font-size))));
          text-align: var(--input-text-align-mobile, var(--text-align-mobile, var(--input-text-align, var(--text-align, center))));
          color: var(--input-color-mobile, var(--color-mobile, var(--input-color, var(--color, red))));
          border: var(--input-border-mobile, var(--border-mobile, var(--input-border, var(--border, none))));
          border-radius: var(--input-border-radius-mobile, var(--border-radius-mobile, var(--input-border-radius, var(--border-radius, 0px))));
          height: var(--input-height-mobile, var(--height-mobile, var(--input-height, var(--height, 100%))));
          width: var(--input-width-mobile, var(--width-mobile, var(--input-width, var(--width, 100%))));
        }
        :host > label {
          background: var(--label-background-mobile, var(--background-mobile, var(--label-background, var(--background, none))));
          font-family: var(--label-font-family-bold-mobile, var(--font-family-bold-mobile, var(--label-font-family-bold, var(--font-family-bold))));
          font-weight: var(--label-font-weight-mobile, var(--font-weight-mobile, var(--label-font-weight, var(--font-weight, normal))));
          font-size: var(--label-font-size-mobile, var(--label-font-size, var(--p-font-size, var(--font-size))));
          text-align: var(--label-text-align-mobile, var(--text-align-mobile, var(--label-text-align, var(--text-align, center))));
          color: var(--label-color-mobile, var(--color-mobile, var(--label-color, var(--color, red))));
          border: var(--label-border-mobile, var(--border-mobile, var(--label-border, var(--border, none))));
          border-radius: var(--label-border-radius-mobile, var(--border-radius-mobile, var(--label-border-radius, var(--border-radius, 0px))));
          height: var(--label-height-mobile, var(--height-mobile, var(--label-height, var(--height, 100%))));
          width: var(--label-width-mobile, var(--width-mobile, var(--label-width, var(--width, 100%))));
        }
        :host > label.normal {
          font-family: var(--label-font-family-normal-mobile, var(--label-font-family-normal, var(--font-family-mobile, var(--label-font-family, var(--font-family)))));
          text-transform: var(--label-text-transform-normal-mobile, var(--label-text-transform-normal, var(--text-transform-mobile, var(--label-text-transform, var(--text-transform)))));
        }
        :host > input[type=radio] {
          height: var(--input-radio-height-mobile, var(--radio-height, var(--input-height-mobile, var(--height-mobile, var(--input-height, var(--height, auto))))));
          padding: var(--input-radio-padding-mobile, var(--radio-padding, var(--input-padding-mobile, var(--padding-mobile, var(--input-padding, var(--padding, auto))))));
          margin: var(--input-radio-margin-mobile, var(--radio-margin, var(--input-margin-mobile, var(--margin-mobile, var(--input-margin, var(--margin, auto))))));
        }
        :host > input[type=checkbox] {
          height: var(--input-checkbox-height-mobile, var(--checkbox-height, var(--input-height-mobile, var(--height-mobile, var(--input-height, var(--height, auto))))));
          padding: var(--input-checkbox-padding-mobile, var(--checkbox-padding, var(--input-padding-mobile, var(--padding-mobile, var(--input-padding, var(--padding, auto))))));
          margin: var(--input-checkbox-margin-mobile, var(--checkbox-margin, var(--input-margin-mobile, var(--margin-mobile, var(--input-margin, var(--margin, auto))))));
        }
        :host a {
          margin: var(--a-margin-mobile, var(--a-margin, var(--content-spacing-mobile, var(--content-spacing, unset)))) auto;
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
    if (this.hasAttribute('reverse')) {
      this.html = [this.description, this.input, this.label]
    } else {
      this.html = [this.description, this.label, this.input]
    }
  }

  get description () {
    return this._description || this.root.querySelector('.description')
  }

  get label () {
    return this._label || this.root.querySelector('label')
  }

  get input () {
    return this._input || this.root.querySelector('input')
  }
}
