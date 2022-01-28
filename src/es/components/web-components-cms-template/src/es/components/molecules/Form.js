// @ts-check
import Button from '../atoms/Button.js'
import Input from '../atoms/Input.js'
import { Shadow } from '../prototypes/Shadow.js'

/* global fetch */
/* global FormData */
/* global location */
/* global self */
/* global customElements */

/**
 * Form is a wrapper for a form
 * Example at: /src/es/components/pages/ClassicsSearch.html
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class Form
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} [type] used to determine what should happen on form-submit success/failure
 *  {string} [redirect=n.a.] controls for type newsletter if and where it shall be redirected on success
 *  {has} [use-html-submit=n.a.] controls if the form shall fetch or use plain html action, which then creates a form and triggers it by button[submit].click
 * }
 * @css {
 *  --display [block]
 *  --form-display [flex]
 *  --form-align-items [center]
 *  --display-mobile [block]
 *  --form-display-mobile [flex]
 *  --form-align-items-mobile [center]
 * }
 */
export default class Form extends Shadow() {
  constructor (...args) {
    super(...args)

    this.hasRendered = false // TODO: somehow the umbraco bundled js does execute the connectedCallback twice
    this.inputFields = []
    this.validateFunctions = []
    this.submitEventListener = event => {
      event.preventDefault()
      if ((!this.emptyInput || !this.emptyInput.value) && this.form && this.inputFields.every(input => input.validity.valid) && this.valids.every(valid => valid.getAttribute('valid') === 'true')) {
        const method = this.form.getAttribute('method')
        const action = this.form.getAttribute('action')
        const body = this.getAllInputValues(this.form)

        if (this.hasAttribute('use-html-submit')) {
          this.submitByHTML(body, method, action)
        } else if (this.hasAttribute('use-url-params')) {
          const headers = {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          }
          const body = this.getAllInputValuesAsUrlParams(this.form)
          fetch(action, { method, body, headers })
            .then(response => {
              return response.ok
            })
            .catch(error => {
              this.submitFailure(error, this.getAttribute('type'))
            })
        } else {
          fetch(action, { method, body })
            .then(response => {
              if (event.detail && event.detail.button) event.detail.button.disabled = false
              if (response.ok) {
                this.submitSuccess(response, this.getAttribute('type'))
              } else {
                this.submitFailure(response, this.getAttribute('type'))
              }
            })
            .catch(error => {
              if (event.detail && event.detail.button) event.detail.button.disabled = false
              this.submitFailure(error, this.getAttribute('type'))
            })
        }
        return true
      } else {
        this.validateFunctions.forEach(func => func())
        return false
      }
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    this.addEventListener('form-submit', this.submitEventListener)
  }

  disconnectedCallback () {
    this.removeEventListener('form-submit', this.submitEventListener)
  }

  submitByHTML (formData, method, action) {
    const form = document.createElement('form')
    form.setAttribute('method', method)
    form.setAttribute('action', action);
    [...formData].forEach(([key, val]) => {
      if (key !== 'ufprt') {
        const input = document.createElement('input')
        input.setAttribute('name', key)
        input.setAttribute('value', val)
        form.appendChild(input)
      } else {
        const input = this.form.querySelector('input[name="ufprt"]').cloneNode()
        form.appendChild(input)
      }
    })
    const button = document.createElement('button')
    button.setAttribute('type', 'submit')
    form.appendChild(button)
    document.body.appendChild(form)
    form.hidden = true
    button.click()
  }

  /**
   * Form-submit success function
   *
   * @return {void}
   */
  submitSuccess (response, type) {
    if (type === 'search') {
      if (this.searchResultsContainer) {
        response.text().then(results => {
          this.searchResultsContainer.innerHTML = results
        })
      } else {
        console.error('<div class="searchResultsContainer"> for adding search-results was not found')
      }
    } else if (type === 'newsletter') {
      if (this.form.getAttribute('redirect')) location.href = this.form.getAttribute('redirect')
    } else {
      console.warn('Form submit was successful, but type is missing on <m-form>')
    }
  }

  /**
   * Form-submit success function
   *
   * @return {void}
   */
  submitFailure (response, type) {
    console.error(`Error submitting form of type ${type}: `, response)
  }

  /**
   * Extracts all input values and returns the name/value pairs as FormData for submitting
   * Values are being manually extracted because form does not see the inputs inside the web components due to the Shadow-DOM
   *
   * @return {FormData}
   */
  getAllInputValues (form) {
    if (form) {
      const formData = new FormData();
      [...this.root.querySelectorAll(`input${this.getAttribute('type') !== 'newsletter' ? ', a-input' : ''}`)].forEach(i => {
        if ((this.getAttribute('type') !== 'newsletter' || i.id !== 'Policy') &&
          (i.getAttribute('type') !== 'radio' || i.checked) &&
          (i.getAttribute('type') !== 'checkbox' || i.checked)) formData.append(i.getAttribute('name'), i.value || i.getAttribute('value'))
      });
      [...this.root.querySelectorAll(`select${this.getAttribute('type') !== 'newsletter' ? ', a-select' : ''}`)].forEach(i =>
        formData.append(i.getAttribute('name'), i.options[i.selectedIndex].text)
      )
      return formData
    }
    return new FormData()
  }

  /**
   * Extracts all input values and returns the form data as a URL Querystring
   * @returns {string}
   */
  getAllInputValuesAsUrlParams (form) {
    if (form) {
      let formData = '';
      [...this.root.querySelectorAll('input')].forEach(i => {
        if (i && (i.getAttribute('type') !== 'radio' || i.checked) &&
            (i.getAttribute('type') !== 'checkbox' || i.checked)) {
          formData += `${i.getAttribute('name')}=${i.value || i.getAttribute('value')}&`
        }
      })
      return formData
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
    return !this.hasRendered
  }

  /**
   * renders the css
   *
   * @params {boolean} [balloon=true]
   * @return {void}
   */
  renderCSS (balloon = true) {
    this.css = /* css */`
      :host {
        --balloon-color: var(--background-color, white);
        --balloon-text-color: var(--color, red);
        display: var(--display, block);
        width: var(--width, auto) !important;
      }
      :host form {
        display: var(--form-display, flex);
        margin: var(--form-margin, 0 0 50px 0);
        flex-direction: var(--form-flex-direction, column);
        align-items: var(--form-align-items, center);
      }
      :host form a-input:last-of-type {
        border-top: var(--a-input-border-top-last, none);
        border-right: var(--a-input-border-right-last, none);
        border-bottom: var(--a-input-border-bottom-last, none);
        border-left: var(--a-input-border-left-last, none);
      }
      :host form a-input:first-of-type {
        border-top: var(--a-input-border-top-first, none);
        border-right: var(--a-input-border-right-first, none);
        border-bottom: var(--a-input-border-bottom-first, none);
        border-left: var(--a-input-border-left-first, none);
      }
      :host form a-input {
        border-top: var(--a-input-border-top, none);
        border-right: var(--a-input-border-right, none);
        border-bottom: var(--a-input-border-bottom, none);
        border-left: var(--a-input-border-left, none);
      }
      :host form #oceans {
        display: none;
      }
      .searchResultsContainer {
        width: var(--content-width, 100%);
        margin: 0 auto;
      }
      .searchResultsContainer div {
        margin: var(--div-margin, 30px) auto;
      }
      .searchResultsContainer h3 {
          color: var(--h3-color, var(--color, black));
          font-size: var(--h3-font-size, min(3rem, 10vw));
          font-family: var(--h3-font-family, var(--font-family-bold));
          font-weight: var(--h3-font-weight, var(--font-weight, normal));
          line-height: var(--h3-line-height, normal);
          text-align: var(--h3-text-align, start);
          word-break: var(--h3-word-break, normal);
          text-transform: var(--h3-text-transform, none);
          margin: var(--h3-margin, var(--content-spacing, unset)) auto;
      }
      .searchResultsContainer h4 {        
          color: var(--h4-color, var(--color, black));
          font-size: var(--h4-font-size, min(2rem, 10vw));
          font-family: var(--h4-font-family, var(--font-family));
          font-weight: var(--h4-font-weight, var(--font-weight, normal));
          line-height: var(--h4-line-height, normal);
          text-align: var(--h4-text-align, start);
          word-break: var(--h4-word-break, normal);
          text-transform: var(--h4-text-transform, normal);
          margin: var(--h4-margin, var(--content-spacing, unset)) auto;
      }
      .searchResultsContainer p {
        color: var(--p-color, var(--color, black));
        font-family: var(--p-font-family, var(--font-family-secondary));
        font-weight: var(--p-font-weight, var(--font-weight, normal));
        margin: var(--p-margin, var(--content-spacing, unset)) auto;
        text-align: var(--p-text-align, start);
        text-transform: var(--p-text-transform, none);
      }
      .searchResultsContainer a {
        font-size: var(--a-font-size, 0.9rem);
        font-weight: var(--a-font-weight, var(--font-weight, normal));
        color: var(--a-color, var(--color-secondary, var(--color, pink)));
        text-align: var(--a-text-align, unset);
        text-decoration: var(--a-text-decoration, var(--text-decoration, none));
        text-underline-offset: var(--a-text-underline-offset, unset);
        display: var(--a-display, inline);
        margin: var(--a-margin, var(--content-spacing, unset)) auto;
      }
      .searchResultsContainer a:hover, .searchResultsContainer a:focus, .searchResultsContainer a:active {
        color: var(--a-color-hover, var(--color-hover-secondary, var(--color-hover, var(--color, green))));
        text-decoration: var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, var(--text-decoration, none))));
        font-family: var(--a-font-family-hover);
      }
      .searchResultsContainer ul {
        padding-left: 15px;
        text-align: var(--ul-text-align, var(--ol-text-align, start));
        display: var(--ul-display, var(--ol-display, block));
        flex-direction: var(--ul-flex-direction, var(--ol-flex-direction, column));
      }
      .searchResultsContainer ul li, .searchResultsContainer ol li {
        align-self: var(--li-align-self, auto);
      }
      .searchResultsContainer ol {
        text-align: var(--ol-text-align, var(--ul-text-align, start));
        display: var(--ol-display, var(--ul-display, block));
        flex-direction: var(--ol-flex-direction, var(--ul-flex-direction, column));
      }
      :host .highlight {
        color: var(--highlight-color, var(--background-color));
        background-color: var(--highlight-background-color, var(--color));
        padding: var(--highlight-padding, 0 0.2em);
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host {
          display: var(--display-mobile, var(--display, block));
          width: var(--width-mobile, var(--width, auto)) !important;
        }
        :host form {
          display: var(--form-display-mobile, var(--form-display, flex));
          flex-direction: var(--form-flex-direction-mobile, var(--form-flex-direction, column));
          align-items: var(--form-align-items-mobile, var(--form-align-items, center));
        }
        .searchResultsContainer {
          width: var(--content-width-mobile, 100%);
        }
        .searchResultsContainer h3 {
          font-size: var(--h3-font-size-mobile, var(--h3-font-size, min(3rem, 14vw)));
          line-height: var(--h3-line-height-mobile, var(--h3-line-height, normal));
          word-break: var(--h3-word-break-mobile, var(--h3-word-break, normal));
          text-transform: var(--h3-text-transform-mobile, var(--h3-text-transform, normal));
          margin: var(--h3-margin-mobile, var(--h3-margin)) auto;
        }
        .searchResultsContainer h4 {
          font-size: var(--h4-font-size-mobile, var(--h4-font-size, min(2rem, 14vw)));
          line-height: var(--h4-line-height-mobile, var(--h4-line-height, normal));
          word-break: var(--h4-word-break-mobile, var(--h4-word-break, normal));
          text-transform: var(--h4-text-transform-mobile, var(--h4-text-transform, normal));
          margin: var(--h4-margin-mobile, var(--h4-margin)) auto;
        }
      }
    `
    if (balloon) {
      this.css = /* css */`
      /* https://kazzkiq.github.io/balloon.css/ */
      /* https://raw.githubusercontent.com/kazzkiq/balloon.css/master/balloon.css */
      :root {
        --balloon-border-radius: 2px;
        --balloon-color: rgba(16, 16, 16, 0.95);
        --balloon-text-color: #fff;
        --balloon-font-size: 12px;
        --balloon-move: 4px; }
      
      button[aria-label][data-balloon-pos] {
        overflow: visible; }
      
      [aria-label][data-balloon-pos] {
        position: relative;
        cursor: pointer; }
        [aria-label][data-balloon-pos]:after {
          /* custom */
          max-width: 100vw;
          /* /custom */
          opacity: 0;
          pointer-events: none;
          transition: all 0.18s ease-out 0.18s;
          text-indent: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          font-weight: normal;
          font-style: normal;
          text-shadow: none;
          font-size: var(--balloon-font-size);
          background: var(--balloon-color);
          border-radius: 2px;
          color: var(--balloon-text-color);
          border-radius: var(--balloon-border-radius);
          content: attr(aria-label);
          padding: .5em 1em;
          position: absolute;
          white-space: nowrap;
          z-index: 10; }
        [aria-label][data-balloon-pos]:before {
          width: 0;
          height: 0;
          border: 5px solid transparent;
          border-top-color: var(--balloon-color);
          opacity: 0;
          pointer-events: none;
          transition: all 0.18s ease-out 0.18s;
          content: "";
          position: absolute;
          z-index: 10; }
        [aria-label][data-balloon-pos]:hover:before, [aria-label][data-balloon-pos]:hover:after, [aria-label][data-balloon-pos][data-balloon-visible]:before, [aria-label][data-balloon-pos][data-balloon-visible]:after, [aria-label][data-balloon-pos]:not([data-balloon-nofocus]):focus:before, [aria-label][data-balloon-pos]:not([data-balloon-nofocus]):focus:after {
          /* custom */
          opacity: var(--balloon-opacity, 0.8);
          pointer-events: none; }
        [aria-label][data-balloon-pos].font-awesome:after {
          font-family: FontAwesome, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
        [aria-label][data-balloon-pos][data-balloon-break]:after {
          white-space: pre; }
        [aria-label][data-balloon-pos][data-balloon-break][data-balloon-length]:after {
          white-space: pre-line;
          word-break: break-word; }
        [aria-label][data-balloon-pos][data-balloon-blunt]:before, [aria-label][data-balloon-pos][data-balloon-blunt]:after {
          transition: none; }
        [aria-label][data-balloon-pos][data-balloon-pos="up"]:hover:after, [aria-label][data-balloon-pos][data-balloon-pos="up"][data-balloon-visible]:after, [aria-label][data-balloon-pos][data-balloon-pos="down"]:hover:after, [aria-label][data-balloon-pos][data-balloon-pos="down"][data-balloon-visible]:after {
          transform: translate(-50%, 0); }
        [aria-label][data-balloon-pos][data-balloon-pos="up"]:hover:before, [aria-label][data-balloon-pos][data-balloon-pos="up"][data-balloon-visible]:before, [aria-label][data-balloon-pos][data-balloon-pos="down"]:hover:before, [aria-label][data-balloon-pos][data-balloon-pos="down"][data-balloon-visible]:before {
          transform: translate(-50%, 0); }
        [aria-label][data-balloon-pos][data-balloon-pos*="-left"]:after {
          left: 0; }
        [aria-label][data-balloon-pos][data-balloon-pos*="-left"]:before {
          left: 5px; }
        [aria-label][data-balloon-pos][data-balloon-pos*="-right"]:after {
          right: 0; }
        [aria-label][data-balloon-pos][data-balloon-pos*="-right"]:before {
          right: 5px; }
        [aria-label][data-balloon-pos][data-balloon-pos*="-left"]:hover:after, [aria-label][data-balloon-pos][data-balloon-pos*="-left"][data-balloon-visible]:after, [aria-label][data-balloon-pos][data-balloon-pos*="-right"]:hover:after, [aria-label][data-balloon-pos][data-balloon-pos*="-right"][data-balloon-visible]:after {
          transform: translate(0, 0); }
        [aria-label][data-balloon-pos][data-balloon-pos*="-left"]:hover:before, [aria-label][data-balloon-pos][data-balloon-pos*="-left"][data-balloon-visible]:before, [aria-label][data-balloon-pos][data-balloon-pos*="-right"]:hover:before, [aria-label][data-balloon-pos][data-balloon-pos*="-right"][data-balloon-visible]:before {
          transform: translate(0, 0); }
        [aria-label][data-balloon-pos][data-balloon-pos^="up"]:before, [aria-label][data-balloon-pos][data-balloon-pos^="up"]:after {
          /* custom */
          bottom: var(--balloon-bottom, 0%);
          transform-origin: top;
          transform: translate(0, var(--balloon-move)); }
        [aria-label][data-balloon-pos][data-balloon-pos^="up"]:after {
          margin-bottom: 10px; }
        [aria-label][data-balloon-pos][data-balloon-pos="up"]:before, [aria-label][data-balloon-pos][data-balloon-pos="up"]:after {
          left: 50%;
          transform: translate(-50%, var(--balloon-move)); }
        [aria-label][data-balloon-pos][data-balloon-pos^="down"]:before, [aria-label][data-balloon-pos][data-balloon-pos^="down"]:after {
          top: var(--balloon-top, 0%);
          transform: translate(0, calc(var(--balloon-move) * -1)); }
        [aria-label][data-balloon-pos][data-balloon-pos^="down"]:after {
          margin-top: 10px; }
        [aria-label][data-balloon-pos][data-balloon-pos^="down"]:before {
          width: 0;
          height: 0;
          border: 5px solid transparent;
          border-bottom-color: var(--balloon-color); }
        [aria-label][data-balloon-pos][data-balloon-pos="down"]:after, [aria-label][data-balloon-pos][data-balloon-pos="down"]:before {
          left: 50%;
          transform: translate(-50%, calc(var(--balloon-move) * -1)); }
        [aria-label][data-balloon-pos][data-balloon-pos="left"]:hover:after, [aria-label][data-balloon-pos][data-balloon-pos="left"][data-balloon-visible]:after, [aria-label][data-balloon-pos][data-balloon-pos="right"]:hover:after, [aria-label][data-balloon-pos][data-balloon-pos="right"][data-balloon-visible]:after {
          transform: translate(0, -50%); }
        [aria-label][data-balloon-pos][data-balloon-pos="left"]:hover:before, [aria-label][data-balloon-pos][data-balloon-pos="left"][data-balloon-visible]:before, [aria-label][data-balloon-pos][data-balloon-pos="right"]:hover:before, [aria-label][data-balloon-pos][data-balloon-pos="right"][data-balloon-visible]:before {
          transform: translate(0, -50%); }
        [aria-label][data-balloon-pos][data-balloon-pos="left"]:after, [aria-label][data-balloon-pos][data-balloon-pos="left"]:before {
          right: 100%;
          top: 50%;
          transform: translate(var(--balloon-move), -50%); }
        [aria-label][data-balloon-pos][data-balloon-pos="left"]:after {
          margin-right: 10px; }
        [aria-label][data-balloon-pos][data-balloon-pos="left"]:before {
          width: 0;
          height: 0;
          border: 5px solid transparent;
          border-left-color: var(--balloon-color); }
        [aria-label][data-balloon-pos][data-balloon-pos="right"]:after, [aria-label][data-balloon-pos][data-balloon-pos="right"]:before {
          left: 100%;
          top: 50%;
          transform: translate(calc(var(--balloon-move) * -1), -50%); }
        [aria-label][data-balloon-pos][data-balloon-pos="right"]:after {
          margin-left: 10px; }
        [aria-label][data-balloon-pos][data-balloon-pos="right"]:before {
          width: 0;
          height: 0;
          border: 5px solid transparent;
          border-right-color: var(--balloon-color); }
        [aria-label][data-balloon-pos][data-balloon-length]:after {
          white-space: normal; }
        [aria-label][data-balloon-pos][data-balloon-length="small"]:after {
          width: 80px; }
        [aria-label][data-balloon-pos][data-balloon-length="medium"]:after {
          width: 150px; }
        [aria-label][data-balloon-pos][data-balloon-length="large"]:after {
          width: 260px; }
        [aria-label][data-balloon-pos][data-balloon-length="xlarge"]:after {
          width: 380px; }
          @media screen and (max-width: 768px) {
            [aria-label][data-balloon-pos][data-balloon-length="xlarge"]:after {
              width: 90vw; } }
        [aria-label][data-balloon-pos][data-balloon-length="fit"]:after {
          width: 100%; }  
    `
    }
  }

  /**
  * renders the a-text-field html
  *
  * @return {void}
  */
  renderHTML () {
    this.hasRendered = true
    this.loadChildComponents().then(children => {
      this.inputAll
        .filter(i => i.getAttribute('type') !== 'hidden').forEach(input => {
          this.inputFields.push(input)
          const label = this.root.querySelector(`label[for='${input.getAttribute('id')}']`) || this.root.querySelector(`label[for='${input.getAttribute('name')}']`)
          const description = this.getDescription(input)
          const aInput = new children[0][1](input, label, description, { mode: 'false', namespace: this.getAttribute('namespace-children') || this.getAttribute('namespace') || '', namespaceFallback: this.hasAttribute('namespace-fallback-children') || this.hasAttribute('namespace-fallback') })
          aInput.setAttribute('type', input.getAttribute('type'))
          if (input.hasAttribute('reverse')) aInput.setAttribute('reverse', input.getAttribute('reverse'))
          input.replaceWith(aInput)
          if (input.hasAttribute('validation-message')) {
            const changeListener = event => {
              if (input.hasAttribute('valid') ? input.getAttribute('valid') === 'true' : input.validity.valid) {
                label.removeAttribute('data-balloon-visible')
                label.removeAttribute('aria-label')
                label.removeAttribute('data-balloon-pos')
              } else {
                label.setAttribute('data-balloon-visible', 'true')
                label.setAttribute('aria-label', input.getAttribute('validation-message'))
                label.setAttribute('data-balloon-pos', input.hasAttribute('reverse') ? 'down' : 'up')
              }
            }
            this.validateFunctions.push(changeListener)
            input.changeListener = changeListener
            input.addEventListener('blur', changeListener)
            input.addEventListener('blur', event => {
              input.addEventListener('change', changeListener)
              input.addEventListener('keyup', changeListener)
            }, { once: true })
          }
        })
      // spam protection
      if (this.getAttribute('type') === 'newsletter') {
        this.emptyInput = document.createElement('input')
        this.emptyInput.type = 'text'
        this.emptyInput.id = 'oceans'
        this.form.appendChild(this.emptyInput)
      }
      // TODO: Textarea support => https://github.com/roli81/web-components-cms-template-base/blob/main/src/es/components/molecules/ContactForm.js
      Array.from(this.root.querySelectorAll('button')).forEach(button => {
        const aButton = new children[1][1](button, { namespace: this.getAttribute('namespace-button') || this.getAttribute('namespace-children') || this.getAttribute('namespace') || '', namespaceFallback: this.hasAttribute('namespace-fallback-children') || this.hasAttribute('namespace-fallback') })
        button.replaceWith(aButton)
      })
    })
  }

  /**
   * fetch children when first needed
   *
   * @returns {Promise<[string, CustomElementConstructor][]>}
   */
  loadChildComponents () {
    if (this.childComponentsPromise) return this.childComponentsPromise
    let inputPromise
    try {
      inputPromise = Promise.resolve({ default: Input })
    } catch (error) {
      inputPromise = import('../atoms/Input.js')
    }
    let buttonPromise
    try {
      buttonPromise = Promise.resolve({ default: Button })
    } catch (error) {
      buttonPromise = import('../atoms/Button.js')
    }
    return (this.childComponentsPromise = Promise.all([
      inputPromise.then(
        /** @returns {[string, CustomElementConstructor]} */
        module => ['a-input', module.default]
      ),
      buttonPromise.then(
        /** @returns {[string, CustomElementConstructor]} */
        module => ['a-button', module.default]
      )
    ]).then(elements => {
      elements.forEach(element => {
        // don't define already existing customElements
        // @ts-ignore
        if (!customElements.get(element[0])) customElements.define(...element)
      })
      return elements
    }))
  }

  get form () {
    return this.root.querySelector('form')
  }

  get searchResultsContainer () {
    if (this.root.querySelector('.searchResultsContainer')) { return this.root.querySelector('.searchResultsContainer') }

    const searchResultsContainer = document.createElement('DIV')
    searchResultsContainer.classList.add('searchResultsContainer')
    this.html = searchResultsContainer
    return searchResultsContainer
  }

  get valids () {
    return Array.from(this.root.querySelectorAll('[valid]'))
  }

  get inputAll () {
    return Array.from(this.root.querySelectorAll('input')).concat(Array.from(this.root.querySelectorAll('select')))
  }

  getDescription (input) {
    return this.root.querySelector(`.description[data-for='${input.getAttribute('id')}']`) || this.root.querySelector(`.description[data-for='${input.getAttribute('name')}']`)
  }
}
