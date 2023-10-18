// @ts-check
import Form from '../form/Form.js'

/* global fetch */
/* global FormData */
/* global location */
/* global self */
/* global customElements */

/**
 * SimpleForm is a wrapper for a form html tag and allows to choose to ether post the form by default behavior or send it to an api endpoint
 * TODO: https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class SimpleForm
 * @type {CustomElementConstructor}
 * @attribute {
 *  {search|newsletter} [type] used to determine what should happen on form-submit success/failure (search shows an answer message, newsletter takes the form.getAttribute('redirect') to redirect)
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
export default class SimpleForm extends Form {
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
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
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
   * SimpleForm-submit success function
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
    } else if (type === 'newsletter' && this.form.getAttribute('redirect')) {
      location.href = this.form.getAttribute('redirect')
    } else {
      console.warn('SimpleForm submit was successful, but type is missing on <m-form>')
    }
  }

  /**
   * SimpleForm-submit success function
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
   * @return {string|undefined}
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
   * renders the css
   *
   * @params {boolean} [balloon=true]
   * @return {Promise<void>}
   */
  renderCSS (balloon = true) {
    const result = super.renderCSS()
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
          opacity: var(--balloon-opacity, 1.0);
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
    return result
  }

  /**
  * renders the a-text-field html
  *
  * @return {void}
  */
  renderHTML () {
    this.hasRendered = true
    this.fetchModules([
      {
        path: `${this.importMetaUrl}../../atoms/button/Button.js`,
        name: 'a-button'
      },
      {
        path: `${this.importMetaUrl}../../atoms/input/Input.js`,
        name: 'a-input'
      }
    ]).then(children => {
      this.inputAll
        .filter(i => i.getAttribute('type') !== 'hidden').forEach(input => {
          this.inputFields.push(input)
          const label = this.root.querySelector(`label[for='${input.getAttribute('id')}']`) || this.root.querySelector(`label[for='${input.getAttribute('name')}']`)
          const description = this.getDescription(input)
          const aInput = new children[1].constructorClass(input, label, description, { mode: 'false', namespace: this.getAttribute('namespace') || this.getAttribute('namespace') || '', namespaceFallback: this.hasAttribute('namespace-fallback') })
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
      // TODO: Textarea support => https://github.com/roli81/web-components-cms-template-base/blob/main/src/es/components/molecules/ContactSimpleForm.js
      Array.from(this.root.querySelectorAll('button')).forEach(button => {
        const aButton = new children[0].constructorClass(button, { namespace: this.getAttribute('namespace') || '', namespaceFallback: this.hasAttribute('namespace-fallback') })
        button.replaceWith(aButton)
      })
    })
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
