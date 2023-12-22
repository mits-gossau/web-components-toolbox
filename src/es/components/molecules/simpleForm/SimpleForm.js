// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global FileReader */
/* global self */
/* global CustomEvent */

/**
 * SimpleForm is a wrapper for a form html tag and allows to choose to ether post the form by default behavior, send it to an api endpoint or emit a custom event
 * TODO: https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class SimpleForm
 * @type {CustomElementConstructor}
 * @attribute {
 *
 * }
 * @css {
 *
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
    this.changeListener = event => {
      const target = event.composedPath()[0]
      if (!target) return
      switch (true) {
        // file picker stuff
        case target.getAttribute('type') === 'file':
          const files = Array.from(target.files) // eslint-disable-line
          let label // eslint-disable-line
          if ((label = target.parentNode.querySelector('.type-file-label'))) {
            if (files.length) {
              if (target.hasAttribute('remove-file-title')) target.setAttribute('title', (target.getAttribute('remove-file-title')))
              target.parentNode.classList.add('has-files')
              if (!label.hasAttribute('original-label')) label.setAttribute('original-label', label.innerHTML)
              label.innerHTML = files.reduce((acc, file, i) => `${acc}${file.name}${files[i + 1] ? '<br>' : ''}`, '&nbsp;')
              target.addEventListener('click', event => {
                event.preventDefault()
                target.value = ''
                this.changeListener(event)
              }, { once: true })
            } else if (label.hasAttribute('original-label')) {
              if (target.hasAttribute('remove-file-title')) target.removeAttribute('title')
              target.parentNode.classList.remove('has-files')
              label.innerHTML = label.getAttribute('original-label')
            }
          }
          break
        // visibly conditional fields
        case target.getAttribute('type') === 'checkbox':
        case target.tagName === 'SELECT':
          let conditionalNodes // eslint-disable-line
          if ((conditionalNodes = this.root.querySelectorAll(`[visible-by=${target.getAttribute('id')}]`))) {
            conditionalNodes.forEach(conditionalNode => {
              if (conditionalNode.hasAttribute('visible-condition')) {
                if (
                  conditionalNode.getAttribute('visible-condition') === target.value ||
                  (conditionalNode.getAttribute('visible-condition') === 'truthy' && target.value) ||
                  (conditionalNode.getAttribute('visible-condition') === 'falsy' && !target.value) ||
                  (target.getAttribute('type') === 'checkbox' && conditionalNode.getAttribute('visible-condition') === String(target.checked))
                ) {
                  this.show(conditionalNode)
                } else {
                  this.hide(conditionalNode)
                }
              } else {
                this.show(conditionalNode)
              }
            })
          }
          break
      }
    }
    // fetch if there is an endpoint attribute, else do the native behavior of form post
    this.abortController = null
    this.submitEventListener = async event => {
      if (this.getAttribute('endpoint') || this.getAttribute('dispatch-event-name')) {
        event.preventDefault()
        if (this.abortController) this.abortController.abort()
        this.abortController = new AbortController()
        let body = {}
        // allow deeper json schemas for the body to be filled and sent
        if (this.getAttribute('schema')) {
          const loop = async obj => {
            for (const key in obj) {
              let input = null
              if (Object.hasOwnProperty.call(obj, key)) {
                obj[key] = typeof obj[key] === 'object'
                  ? await loop(obj[key])
                  : ((input = this.inputs.find(input => input.getAttribute('name') === key || input.getAttribute('id') === key)))
                      ? await this.getInputValue(input)
                      : obj[key]
              }
            }
            return obj
          }
          body = await loop(SimpleForm.parseAttribute(this.getAttribute('schema')))
        } else {
          body = await this.inputs.reduce(async (acc, input) => {
            acc = await acc
            if (input.getAttribute('name')) {
              acc[input.getAttribute('name')] = await this.getInputValue(input)
            } else if (input.getAttribute('id')) {
              acc[input.getAttribute('id')] = await this.getInputValue(input)
            }
            return acc
          }, Promise.resolve({}))
        }
        // TODO: remove the console log below
        console.log('body', body);
        (this.getAttribute('endpoint')
          ? fetch(this.getAttribute('endpoint'), {
            method: this.getAttribute('method') || 'GET',
            mode: this.getAttribute('mode') || 'no-cors',
            headers: this.hasAttribute('headers')
              ? SimpleForm.parseAttribute(this.getAttribute('headers'))
              : {
                  'Content-Type': 'application/json'
                },
            redirect: this.getAttribute('follow') || 'follow',
            body: JSON.stringify(body),
            signal: this.abortController.signal
          }).then(async response => {
            if ((response.status >= 200 && response.status <= 299) || (response.status >= 300 && response.status <= 399)) return response.json()
            throw new Error(response.statusText)
          })
          : new Promise(resolve => this.dispatchEvent(new CustomEvent(this.getAttribute('dispatch-event-name'), {
            detail: {
              method: this.getAttribute('method') || 'GET',
              mode: this.getAttribute('mode') || 'no-cors',
              headers: this.hasAttribute('headers')
                ? SimpleForm.parseAttribute(this.getAttribute('headers'))
                : {
                    'Content-Type': 'application/json'
                  },
              redirect: this.getAttribute('follow') || 'follow',
              body,
              resolve
            },
            bubbles: true,
            cancelable: true,
            composed: true
          })))
        ).then(json => {
          let response
          let redirectUrl
          if ((response = json[this.getAttribute('response-property-name')] || json.response) && this.response) {
            this.response.textContent = response
            let onclick
            if ((onclick = json[this.getAttribute('onclick-property-name')] || json.onclick)) this.response.setAttribute('onclick', onclick)
            if (json[this.getAttribute('success-property-name')] === true || json.success === true) this.response.classList.add('success')
            if (json[this.getAttribute('clear-property-name')] === true || json.clear === true) this.form.remove()
          } else if ((redirectUrl = json[this.getAttribute('redirect-url-property-name')] || json.redirectUrl)) {
            self.open(redirectUrl, json[this.getAttribute('target-property-name')] || json.target, json[this.getAttribute('features-property-name')] || json.features)
          }
        })
      }
    }
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => {
      if (this.inputSubmit) this.inputSubmit.addEventListener('click', this.clickEventListener)
      this.form.addEventListener('change', this.changeListener)
      this.form.addEventListener('submit', this.submitEventListener)
      Array.from(this.root.querySelectorAll('[selected],[checked]')).forEach(node => {
        const eventTarget = node.parentNode.tagName === 'SELECT' ? node.parentNode : node
        eventTarget.dispatchEvent(new Event('change', {
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      })
      this.hidden = false
    })
  }

  disconnectedCallback () {
    if (this.inputSubmit) this.inputSubmit.removeEventListener('click', this.clickEventListener)
    this.form.removeEventListener('change', this.changeListener)
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
        const form = new children[0].constructorClass({ mode: 'open', namespace: this.getAttribute('namespace'), namespaceFallback: true })
        form.hidden = true
        this.html = form
        if (form.renderCssPromise) {
          form.renderCssPromise.then(styles => Array.from(form.root.querySelectorAll('style:not([_csshidden])')).forEach(style => {
            style.setAttribute('load-form-styles', 'molecules/form/Form.js')
            this.html = style
          }))
        } else {
          this.css = form.css
        }
        form.remove()
        return form.renderCssPromise
      })
    }
    this.css = /* css */''
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
    ]).then(() => Array.from(this.root.querySelectorAll('[hidden]')).forEach(node => this.hide(node)))
  }

  /**
   * @param {HTMLInputElement} input
   * @return {Promise<boolean | string | string[]>}
   */
  getInputValue (input) {
    switch (input.getAttribute('type')) {
      case 'file':
        // @ts-ignore
        const filePromises = Array.from(input.files).map(file => new Promise(resolve => { // eslint-disable-line
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result)
          reader.onerror = error => {
            console.error('Error: ', error)
            resolve(`File ${input.getAttribute('name') || input.getAttribute('id')} has the following Error: ${error}`)
          }
        }))
        if (input.hasAttribute('multiple')) return Promise.all(filePromises)
        return filePromises[0]
      case 'checkbox':
        return Promise.resolve(input.checked)
      default:
        return Promise.resolve(input.value)
    }
  }

  hide (node) {
    node.setAttribute('hidden', 'true')
    Array.from(node.querySelectorAll('[required]')).forEach(node => {
      node.setAttribute('data-required', 'true')
      node.removeAttribute('required')
    })
  }

  show (node) {
    node.removeAttribute('hidden')
    Array.from(node.querySelectorAll('[data-required]')).forEach(node => {
      node.setAttribute('required', 'true')
      node.removeAttribute('data-required')
    })
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

  get response () {
    return this.root.querySelector('#response')
  }
}
