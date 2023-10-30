// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

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
export default class SimpleForm extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    this.submitEventListener = event => {
      event.preventDefault()
      /*
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
      */
    }
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => (this.hidden = false))
    this.addEventListener('form-submit', this.submitEventListener)
  }

  disconnectedCallback () {
    this.removeEventListener('form-submit', this.submitEventListener)
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
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      
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
      case 'simple-form-default-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./default-/default-.css`,
          namespace: false
        }])
      default:
        return Promise.resolve()
    }
  }

  /**
  * renders the a-text-field html
  *
  * @return {Promise<void>}
  */
  renderHTML () {
    this.hasRendered = true
    return this.fetchModules([
      {
        path: `${this.importMetaUrl}../../atoms/button/Button.js`,
        name: 'a-button'
      },
      {
        path: `${this.importMetaUrl}../../atoms/input/Input.js`,
        name: 'a-input'
      }
    ]).then(children => {
      
    })
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

  get form () {
    return this.root.querySelector('form')
  }

  get valids () {
    return Array.from(this.root.querySelectorAll('[valid]'))
  }

  get inputAll () {
    return Array.from(this.root.querySelectorAll('input')).concat(Array.from(this.root.querySelectorAll('select')))
  }
}
