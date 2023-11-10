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
 *  {search|newsletter} [type] used to determine what should happen on submit success/failure (search shows an answer message, newsletter takes the form.getAttribute('redirect') to redirect)
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

    // once the form was touched, resp. tried to submit, it is dirty. The dirty attribute signals the css to do the native validation
    this.clickEventListener = event => {
      let invalidNode
      if ((invalidNode = this.form.querySelector('input:not(:valid):not([type=hidden])'))) {
        let invalidNodeLabel
        if ((invalidNodeLabel = invalidNode.parentNode.querySelector(`[for=${invalidNode.getAttribute('id')}]`))) invalidNodeLabel.scrollIntoView()
      }
      this.setAttribute('dirty', 'true')
    }
    // fetch if there is an endpoint attribute, else do the native behavior of form post
    this.abortController = null
    this.submitEventListener = event => {
      if (this.getAttribute('endpoint')) {
        event.preventDefault()
        if (this.abortController) this.abortController.abort()
        this.abortController = new AbortController()
        let body = {}
        // allow deeper json schemas for the body to be filled and sent
        if (this.getAttribute('schema')) {
          const loop = obj => {
            for (const key in obj) {
              let input = null
              if (Object.hasOwnProperty.call(obj, key)) {
                obj[key] = typeof obj[key] === 'object'
                  ? loop(obj[key])
                  : ((input = this.inputs.find(input => input.getAttribute('name') === key || input.getAttribute('id') === key)))
                      ? this.getInputValue(input)
                      : obj[key]
              }
            }
            return obj
          }
          body = loop(SimpleForm.parseAttribute(this.getAttribute('schema')))
        } else {
          this.inputs.forEach(input => {
            if (input.getAttribute('name')) {
              body[input.getAttribute('name')] = this.getInputValue(input)
            } else if (input.getAttribute('id')) {
              body[input.getAttribute('id')] = this.getInputValue(input)
            }
          })
        }
        // TODO: remove the console log below
        console.log('fetch', body)
        fetch(this.getAttribute('endpoint'), {
          method: this.getAttribute('method') || 'GET',
          mode: this.getAttribute('mode') || 'no-cors',
          headers: this.hasAttribute('headers')
            ? SimpleForm.parseAttribute(this.getAttribute('headers'))
            : {
              'Content-Type': 'application/json'
            }
          ,
          redirect: this.getAttribute('follow') || 'follow',
          body: JSON.stringify(body),
          signal: this.abortController.signal
        })
      }
    }
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => (this.hidden = false))
    if (this.inputSubmit) this.inputSubmit.addEventListener('click', this.clickEventListener)
    this.form.addEventListener('submit', this.submitEventListener)
  }

  disconnectedCallback () {
    if (this.inputSubmit) this.inputSubmit.removeEventListener('click', this.clickEventListener)
    this.form.removeEventListener('submit', this.submitEventListener)
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
   * @return {Promise<[void, void]>}
   */
  renderCSS () {
    let formPromise = Promise.resolve()
    // grab the styles form Form.js
    if (this.hasAttribute('load-form-styles')) {
      formPromise = this.fetchModules([
        {
          path: `${this.importMetaUrl}../form/Form.js`,
          name: 'm-form'
        }
      ]).then(children => {
        // eslint-disable-next-line new-cap
        const form = new children[0].constructorClass({ mode: 'open' })
        form.hidden = true
        this.html = form
        if (form.renderCssPromise) form.renderCssPromise.then(styles => Array.from(form.root.querySelectorAll('style:not([_csshidden])')).forEach(style => (this.html = style)))
        this.css = form.css
        form.remove()
        return form.renderCssPromise
      })
    }
    this.css = /* css */`
      
    `
    return Promise.all([this.fetchTemplate(), formPromise])
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
        }], false)
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

  getInputValue (input) {
    return input.getAttribute('type') === 'checkbox'
      ? input.checked
      : input.value
  }

  get form () {
    return this.root.querySelector('form')
  }

  get inputs () {
    return Array.from(this.form.querySelectorAll('input')).concat(Array.from(this.root.querySelectorAll('select')))
  }

  get inputSubmit () {
    return this.form.querySelector('[type=submit]')
  }
}
