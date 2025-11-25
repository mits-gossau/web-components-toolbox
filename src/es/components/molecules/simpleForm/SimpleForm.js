// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global FileReader */
/* global self */
/* global CustomEvent */
/* global location */
/* global grecaptcha */

export const FINISH_LOADING_EVENT = 'finish-loading'

/**
 * SimpleForm is a wrapper for a form html tag and allows to choose to ether post the form by default behavior, send it to an api endpoint or emit a custom event
 * Expose Internals does not work with native :valid selector... https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj, solution to turn off the shadow dom of child components
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class SimpleForm
 * @type {CustomElementConstructor | *}
 */
export const SimpleForm = (ChosenHTMLElement = Shadow()) => class SimpleForm extends ChosenHTMLElement {
  constructor (options = {}, ...args) {
    // @ts-ignore
    super({ importMetaUrl: import.meta.url, tabindex: 'no-tabindex', ...options }, ...args)

    this.clickEventListener = event => {
      // scroll the label of the first invalid element into view
      let invalidNode
      if ((invalidNode = this.form.querySelector('input:not(:valid):not([type=hidden])'))) {
        let invalidNodeLabel
        if ((invalidNodeLabel = invalidNode.parentNode.querySelector(`[for="${invalidNode.getAttribute('id')}"]`))) invalidNodeLabel.scrollIntoView()
      }
      // once the form was touched, resp. tried to submit, it is dirty. The dirty attribute signals the css to do the native validation
      this.setAttribute('dirty', 'true')
      this.form.setAttribute('dirty', 'true')
    }

    this.changeListener = event => {
      const target = event.composedPath()[0]
      if (!target) return
      switch (true) {
        // file picker stuff
        case target.getAttribute('type') === 'file':
          this.fileHandling(target)
          break
        // visibility and multiply conditional fields
        case target.getAttribute('type') === 'radio':
        case target.getAttribute('type') === 'checkbox':
        case target.tagName === 'SELECT':
          this.conditionalHandling(target)
          break
      }
    }

    // fetch if there is an endpoint attribute, else do the native behavior of form post
    this.abortController = null
    this.submitEventListener = event => {
      this.dispatchEvent(new CustomEvent(this.getAttribute('submit-event-name') || 'form-submit', {
        detail: { event },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
      if (this.getAttribute('endpoint') || this.getAttribute('dispatch-event-name')) {
        event.preventDefault()
        this.fetchOrDispatch()
      }
    }

    this.submitDisabledEventListener = event => {
      if (event.detail.disabled) {
        this.inputSubmit.setAttribute('disabled', 'true')
      } else {
        this.inputSubmit.removeAttribute('disabled')
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
      // set initial condition by triggering the change event listener
      Array.from(this.root.querySelectorAll('[selected],[checked]')).forEach(node => {
        const eventTarget = node.parentNode.tagName === 'SELECT' ? node.parentNode : node
        eventTarget.dispatchEvent(new Event('change', {
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      })
      if (this.response) this.response.hidden = true
      this.hidden = false
    })
    this.addEventListener(this.getAttribute('submit-disabled') || 'submit-disabled', this.submitDisabledEventListener)
    super.connectedCallback()
  }

  disconnectedCallback () {
    if (this.inputSubmit) this.inputSubmit.removeEventListener('click', this.clickEventListener)
    this.form.removeEventListener('change', this.changeListener)
    this.form.removeEventListener('submit', this.submitEventListener)
    this.removeEventListener(this.getAttribute('submit-disabled') || 'submit-disabled', this.submitDisabledEventListener)
    super.disconnectedCallback()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
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
      // fix css from Form.js
      this.setCss(/* css */`
        :host input[type="submit"] {
          --simple-form-default-input-type-submit-margin: var(--${this.namespace}input-submit-margin, auto 0);
          float: none;
        }
      `, undefined, false, false)
    }
    // only the most essential css, which is true for all templates
    this.css = /* css */`
      :host *:has(> input[type=file]) > *:not(input) {
        gap: 1em;
      }
      :host *:has(> input[type=file]) > *:not(input) > *:first-child {
        flex-shrink: 0;
      }
      :host *:has(> input[type=file]) *:not(input) > ul {
        padding: 0;
        margin: 0;
        list-style: none;
      }
      :host *:has(> input[type=file]) *.file-preview > ul > li:not(:last-child) {
        margin-bottom: 1em;
      }
    `
    if (this.getAttribute('grecaptcha-key')) {
      this.css = /* css */`
      :host [captcha-message] {
        color: var(--color-error, var(--color, black));
        opacity: 1;
      }
      :host [captcha-message].hidden {
        opacity: 0;
        transition: opacity .3s ease-out;
      }
    `
    }
    return Promise.all([this.fetchTemplate(), formPromise])
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    const styles = [
      {
        path: `${this.importMetaUrl}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'simple-form-default-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./default-/default-.css`,
          namespace: false
        }], false)
      case 'simple-form-miduweb-':
        return this.fetchCSS([...styles, {
          // @ts-ignore
          path: `${this.importMetaUrl}./miduweb-/miduweb-.css`,
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
    return Promise.all([
      this.fetchModules([
        {
          path: `${this.importMetaUrl}../../atoms/button/Button.js`,
          name: 'a-button'
        },
        {
          path: `${this.importMetaUrl}../../atoms/input/Input.js`,
          name: 'a-input'
        }
      ]),
      this.loadGrecaptchaDependency()
    ]).then(() => Array.from(this.root.querySelectorAll('[hidden]:not([mode])')).forEach(node => {
      if (!node.root && !node.shadowRoot) this.hide(node, true)
    }))
  }

  // do the whole file pick, delete and preview stuff
  fileHandling (target) {
    const files = Array.from(target.files) // eslint-disable-line
    let label // eslint-disable-line
    if ((label = target.parentNode.querySelector('.type-file-label'))) {
      if (files.length) {
        if (target.hasAttribute('remove-file-title')) target.setAttribute('title', (target.getAttribute('remove-file-title')))
        target.parentNode.classList.add('has-files')
        if (!label.hasAttribute('original-label')) label.setAttribute('original-label', label.innerHTML)
        label.innerHTML = ''
        label.classList.remove('file-preview')
        const ul = document.createElement('ul')
        files.forEach((file, i) => {
          const li = document.createElement('li')
          li.textContent = file.name
          ul.appendChild(li)
          // file preview
          if (target.hasAttribute('file-preview')) {
            SimpleForm.readFile(file, true).then(([base64, typeMatch]) => {
              const div = document.createElement('div')
              switch (typeMatch[1]) {
                // video-, pdf- preview
                case 'image':
                  div.innerHTML = /* html */`
                  <a-picture alt="${file.name}" defaultSource="${base64}"></a-picture>
                `
                  label.classList.add('file-preview')
                  this.fetchModules([
                    {
                      path: `${this.importMetaUrl}../../atoms/picture/Picture.js`,
                      name: 'a-picture'
                    }
                  ])
                  li.prepend(div.children[0])
                  break
                case 'video':
                  // with fallback without type, then it would try to play video/mp4
                  div.innerHTML = /* html */`
                  <a-video muted autoplay loop controls sources="[{'src':'${base64}', 'type':'${typeMatch[1]}/${typeMatch[2]}'}, {'src':'${base64}'}]"></a-video>
                `
                  label.classList.add('file-preview')
                  this.fetchModules([
                    {
                      path: `${this.importMetaUrl}../../atoms/video/Video.js`,
                      name: 'a-video'
                    }
                  ])
                  li.prepend(div.children[0])
                  break
                case 'text':
                case 'application':
                  if (typeMatch[2] !== 'pdf' && typeMatch[2] !== 'plain') break
                  div.innerHTML = /* html */`
                  <a-iframe>
                    <template>
                      <iframe src="${base64}" frameborder="0"></iframe>
                    </template>
                  </a-iframe>
                `
                  label.classList.add('file-preview')
                  this.fetchModules([
                    {
                      path: `${this.importMetaUrl}../../atoms/iframe/Iframe.js`,
                      name: 'a-iframe'
                    }
                  ])
                  li.prepend(div.children[0])
                  break
              }
            })
          }
          label.appendChild(ul)
        })
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
  }

  // deal with the visibility and multiply aka. clone conditions
  conditionalHandling (target) {
    // selector target has to be as low as possible to not affect other clones including clones
    // only reach up to the multiply, clone boundary if possible
    let el = SimpleForm.walksUpDomQuerySelecting(target, '[multiply-condition]', this.root)
    // incase none visible-by selector can be found step further up the tree
    el = SimpleForm.walksUpDomQuerySelecting(el === this.root ? target : el, `[visible-by="${target.getAttribute('id')}"],[visible-by="${target.getAttribute('name')}"]`, this.root)
    // step one further up to also regard siblings
    if (el !== this.root) el = el.parentNode || el
    // visibility
    let conditionalNodes // eslint-disable-line
    if ((conditionalNodes = el.querySelectorAll(`[visible-by="${target.getAttribute('id')}"],[visible-by="${target.getAttribute('name')}"]`))) {
      conditionalNodes.forEach(conditionalNode => {
        if (conditionalNode.hasAttribute('visible-condition')) {
          if (this.checkCondition(conditionalNode, target, 'visible-condition')) {
            this.show(conditionalNode)
          } else {
            this.hide(conditionalNode)
          }
        } else {
          this.show(conditionalNode)
        }
      })
    }
    // multiply aka. clone
    let originalNode // eslint-disable-line
    if (target.hasAttribute('multiply') && (originalNode = SimpleForm.walksUpDomQuerySelector(target, target.getAttribute('multiply'), this.root)) !== this.root && this.checkCondition(target, target, 'multiply-condition')) {
      /** @type {any} */
      const clone = originalNode.cloneNode(true)
      target.removeAttribute('multiply')
      let counter = Number(target.getAttribute('counter')) || 0
      counter++
      clone.setAttribute('visible-by', target.getAttribute('id'))
      clone.setAttribute('visible-condition', target.getAttribute('multiply-condition'))
      /** @type {any} */
      const cloneTarget = SimpleForm.walksUpDomQuerySelector(clone, `#${target.getAttribute('id')}`)
      let removedCloneTarget = null
      if (counter >= Number(target.getAttribute('multiply-max') || 100000)) {
        if (Array.from(cloneTarget.parentNode.children).length === 2 && Array.from(cloneTarget.parentNode.children).some(node => node.nodeName === 'LABEL')) {
          removedCloneTarget = cloneTarget.parentNode
        } else {
          removedCloneTarget = cloneTarget
        }
        removedCloneTarget.parentNode.setAttribute('removed-child', removedCloneTarget.tagName)
        removedCloneTarget.remove()
      } else if (cloneTarget.getAttribute('type') === 'checkbox') {
        cloneTarget.checked = false
      } else if (cloneTarget.nodeName === 'SELECT') {
        cloneTarget.value = ''
      }
      if (counter >= Number(cloneTarget.getAttribute('required'))) cloneTarget.removeAttribute('required')
      cloneTarget.setAttribute('id', `${target.getAttribute('id').replace(`-counter-${counter - 1}`, '')}-counter-${counter}`)
      cloneTarget.setAttribute('name', `${target.getAttribute('name').replace(`-counter-${counter - 1}`, '')}-counter-${counter}`)
      cloneTarget.setAttribute('counter', counter)
      let label
      if ((label = SimpleForm.walksUpDomQuerySelector(cloneTarget, `[for="${target.getAttribute('id')}"]`))) label.setAttribute('for', cloneTarget.getAttribute('id'))
      Array.from(clone.querySelectorAll(`[${target.getAttribute('multiply-text-selector') || 'multiply-text'}]`)).forEach(node => (node.textContent = node.getAttribute(target.getAttribute('multiply-text-selector') || 'multiply-text').replace(target.getAttribute('counter-placeholder'), counter)))
      if (removedCloneTarget !== clone) originalNode.after(clone)
    }
  }

  async fetchOrDispatch () {
    if (this.abortController) this.abortController.abort()
    this.abortController = new AbortController()
    let body = {}
    // allow deeper json schemas for the body to be filled and sent
    if (this.getAttribute('schema')) {
      const loop = async (obj, inputs = this.inputs, form = this.form) => {
        if (!obj) return null
        for (let key in obj) {
          let input = null
          if (Object.hasOwnProperty.call(obj, key)) {
            if (Array.isArray(obj[key])) {
              // if the key starts with a regex statement, use wildcard querySelector
              let operator = ''
              if (['^', '$', '*'].includes((operator = key.substring(0,1)))) {
                const value = obj[key]
                delete obj[key]
                key = key.substring(1)
                obj[key] = value
              }
              const parentsOfMultipleInput = Array.from(new Set(Array.from(form.querySelectorAll(`[name${operator}="${key}"]`)).concat(Array.from(form.querySelectorAll(`#${key}`)))))
              let lastObj
              await Promise.all(parentsOfMultipleInput.map(async (parentOfMultipleInput, i) => {
                // check if field is visible, which is the case when walksUpDomQueryMatches returns this.root
                const value = SimpleForm.walksUpDomQueryMatches(parentOfMultipleInput, '[hidden]', this.root) === this.root
                  ? this.isInputValueNode(parentOfMultipleInput)
                    // check if it has a value
                    ? await this.getInputValue(parentOfMultipleInput)
                    // loop through the object
                    : await loop(obj[key][i] || structuredClone(obj[key][0]) || structuredClone(lastObj), this.getInputs(parentOfMultipleInput), parentOfMultipleInput)
                  : undefined
                lastObj = structuredClone(obj[key][i]) || lastObj
                obj[key][i] = value
              }))
              // set falsy fields to empty
              const clone = structuredClone(obj[key])
              for (let i = 0; i < obj[key].length; i++) {
                if (!obj[key][i]) delete clone[i]
              }
              obj[key] = this.hasAttribute('array-include-empty')
                ? clone
                : clone.filter(entry => entry || entry === 0)
            } else {
              obj[key] = typeof obj[key] === 'object'
                ? await loop(obj[key])
                : ((input = inputs.find(input => input.getAttribute('name') === key || input.getAttribute('id') === key)))
                    ? await this.getInputValue(input)
                    : obj[key]
            }
          }
        }
        return obj
      }
      const schema = SimpleForm.parseAttribute(this.getAttribute('schema'))
      if (typeof schema === 'object' && schema !== null) {
        body = await loop(schema)
      } else {
        console.error('the attribute schema is invalid: ', (body = schema), this)
      }
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
    console.info('submitting', body)
    const mode = this.getAttribute('mode');
    (this.getAttribute('endpoint')
      ? fetch(this.getAttribute('endpoint'), {
        method: this.getAttribute('method') || 'GET',
        mode: (mode === 'closed' || mode === 'open' || mode === 'false' ? 'cors' : mode),
        headers: this.hasAttribute('headers')
          ? SimpleForm.parseAttribute(this.getAttribute('headers'))
          : {
              'Content-Type': 'application/json'
            },
        redirect: this.getAttribute('follow') || 'follow',
        body: JSON.stringify(body),
        signal: this.abortController.signal
      }).then(async response => {
        if ((response.status >= 200 && response.status <= 299) || (response.status >= 300 && response.status <= 399) || response.status === 422) return response.json() // Umbraco forms response with 422 on a validation error
        throw new Error(this.response.textContent = response.statusText)
      }).finally(() => {
        this.dispatchEvent(new CustomEvent(FINISH_LOADING_EVENT, {
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      })
      : new Promise(resolve => this.dispatchEvent(new CustomEvent(this.getAttribute('dispatch-event-name'), {
        detail: {
          method: this.getAttribute('method') || 'GET',
          mode: (mode === 'closed' || mode === 'open' || mode === 'false' ? 'cors' : mode) || 'no-cors',
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
      if ((response = this.getPropertyByKey(json, this.getAttribute('response-property-name') || 'response')) && this.response) {
        let responseTextNodes = Array.from(this.response.querySelectorAll(this.getAttribute('response-text-node-selector')))
        // if (!responseTextNodes.length) responseTextNodes = [this.response]
        // responseTextNodes.forEach(responseTextNode => (responseTextNode.innerHTML = response))
        if (!responseTextNodes.length) {
          responseTextNodes = this.response
        } else {
          responseTextNodes.forEach(responseTextNode => (responseTextNode.innerHTML = SimpleForm.htmlPurify(response)))
        }
        let onclick
        if ((onclick = this.getPropertyByKey(json, this.getAttribute('onclick-property-name') || 'onclick'))) this.response.setAttribute('onclick', onclick)
        if (this.getPropertyByKey(json, this.getAttribute('success-property-name') || 'success')) {
          this.response.classList.add('success')
          this.response.classList.remove('failure')
        } else {
          this.response.classList.add('failure')
          this.response.classList.remove('success')
        }
        this.response.hidden = false
        if (this.getPropertyByKey(json, this.getAttribute('clear-property-name') || 'clear')) this.form.remove()
      }
      if ((redirectUrl = this.getPropertyByKey(json, this.getAttribute('redirect-url-property-name') || 'redirectUrl'))) self.open(redirectUrl, this.getPropertyByKey(json, this.getAttribute('target-property-name') || 'target'), this.getPropertyByKey(json, this.getAttribute('features-property-name') || 'features'))
    })
  }

  getPropertyByKey (obj, key) {
    let result = null
    return key.split(',').some(keyEl => (result = keyEl.split(':').reduce((accumulator, propertyName) => accumulator ? accumulator[propertyName] : null, obj))) && result
  }

  /**
   * @param {HTMLInputElement} input
   * @return {boolean}
   */
  isInputValueNode (input) {
    return input.nodeName === 'INPUT' || input.nodeName === 'SELECT'
  }

  /**
   * @param {HTMLInputElement} input
   * @return {Promise<boolean | string | string[]>}
   */
  getInputValue (input) {
    switch (input.getAttribute('type')) {
      case 'file':
        // @ts-ignore
        const filePromises = Array.from(input.files).map(file => SimpleForm.readFile(file)) // eslint-disable-line
        if (input.hasAttribute('multiple')) return Promise.all(filePromises)
        return filePromises[0]
      case 'checkbox':
        return input.value && input.value !== 'on' && input.checked ? Promise.resolve(input.value) : Promise.resolve(input.checked)
      case 'radio':
        return Promise.resolve(Array.from(this.root.querySelectorAll(`[name="${input.getAttribute('name')}"]`)).find(input => input.checked)?.value || '')
      default:
        return Promise.resolve(input.value)
    }
  }

  hide (node, initial = false) {
    node.setAttribute('hidden', 'true')
    Array.from(node.querySelectorAll('input,select')).forEach(node => {
      if (initial && !node.hasAttribute('data-disabled')) node.setAttribute('data-disabled', node.hasAttribute('disabled'))
      node.setAttribute('disabled', 'true')
    })
  }

  show (node) {
    node.removeAttribute('hidden')
    // check for if right parent triggering this by walksUpDomQueryMatches
    Array.from(node.querySelectorAll('input[disabled],select[disabled]')).forEach(input => {
      if (SimpleForm.walksUpDomQueryMatches(input, '[visible-by]', this.root) === node && input.getAttribute('data-disabled') !== 'true') input.removeAttribute('disabled')
    })
  }

  checkCondition (conditionalNode, targetNode, attributeName) {
    if (targetNode.getAttribute('type') === 'checkbox') return conditionalNode.getAttribute(attributeName) === String(targetNode.checked)
    return conditionalNode.getAttribute(attributeName) === targetNode.value ||
      (conditionalNode.getAttribute(attributeName) === 'truthy' && targetNode.value) ||
      (conditionalNode.getAttribute(attributeName) === 'falsy' && !targetNode.value)
  }

  static readFile (file, returnTypeMatch = false) {
    return new Promise(resolve => { // eslint-disable-line
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(returnTypeMatch ? [reader.result, typeof reader.result === 'string' ? reader.result.match(/data:(.*?)\/(.*?);/) : []] : reader.result)
      reader.onerror = error => {
        console.error('Error: ', error)
        resolve(`File ${file.name} has the following Error: ${error}`)
      }
    })
  }

  /**
   * find html element by selector
   * ends and returns this.root when stepped up all the way but nothing found
   *
   * @param {HTMLElement | any} el
   * @param {string} selector
   * @param {HTMLElement} [root=document.documentElement]
   * @return {any}
   */
  static walksUpDomQuerySelecting (el, selector, root = document.documentElement) {
    if (el.querySelector(selector)) return el
    while ((el = el.parentNode || root) && el !== root) { // eslint-disable-line
      if (el.querySelector(selector)) return el
    }
    return el
  }

  /**
   * matches html element by selector
   * ends and returns root when stepped up all the way but nothing found
   *
   * @param {HTMLElement | any} el
   * @param {string} selector
   * @param {HTMLElement} [root=document.documentElement]
   * @return {any}
   */
  static walksUpDomQueryMatches (el, selector, root = document.documentElement) {
    if (el.matches(selector)) return el
    while ((el = el.parentNode || el.host || root) && el !== root) { // eslint-disable-line
      if (typeof el.matches === 'function' && el.matches(selector)) return el
    }
    return el
  }

  /**
   * find html element by id or class
   * return the element of whose parent finds the query
   *
   * @param {HTMLElement | any} el
   * @param {string} selector
   * @param {HTMLElement} [root=document.documentElement]
   * @return {HTMLElement}
   */
  static walksUpDomQuerySelector (el, selector, root = document.documentElement) {
    if (typeof el.matches === 'function' && el.matches(selector)) return el
    if (el.querySelector(selector)) return el.querySelector(selector)
    while ((el = el.parentNode || el.host || root) && el !== root) { // eslint-disable-line
      if (typeof el.matches === 'function' && el.matches(selector)) return el
      if (el.querySelector(selector)) return el.querySelector(selector)
    }
    return el
  }

  get form () {
    return this.root.querySelector('form')
  }

  get inputs () {
    return this.getInputs(this.form)
  }

  getInputs (target) {
    if (!target) return []
    return Array.from(target.querySelectorAll('input')).concat(Array.from(target.querySelectorAll('select'))).concat(Array.from(target.querySelectorAll('textarea')))
  }

  get inputSubmit () {
    return this.form.querySelector('[type=submit]')
  }

  get response () {
    return this.root.querySelector('#response')
  }

  /**
   * fetch dependency for google recaptcha
   * this is only triggered when the key as attribute grecaptcha-key is set
   * https://developers.google.com/recaptcha/docs/loading
   *
   * @returns {Promise<any>}
   */
  loadGrecaptchaDependency () {
    if (!this.getAttribute('grecaptcha-key')) return Promise.resolve(null)
    // @ts-ignore
    if (self.grecaptcha) return Promise.resolve(self.grecaptcha)
    return this._grecaptchaDependency || (this._grecaptchaDependency = new Promise(resolve => {
      const script = document.createElement('script')
      script.setAttribute('type', 'text/javascript')
      script.setAttribute('async', '')
      script.setAttribute('src', this.getAttribute('grecaptcha-url') || `${location.protocol || 'http:'}//www.google.com/recaptcha/api.js`)
      script.onload = () => {
        const container = document.createElement('div')
        container.classList.add('grecaptcha')
        // workaround, grecaptcha does not work within the shadow dom, since the iframe gets blocked by cors policy
        const dialog = document.createElement('dialog')
        dialog.setAttribute('open', 'true')
        dialog.setAttribute('autofocus', 'true')
        const style = `
          position: fixed;
          bottom: 14px;
          border: 0;
          padding: 0;
          margin-right: 0;
          transition: opacity 3s ease-out;
          opacity: 1;
        `
        dialog.setAttribute('style', style)
        dialog.appendChild(container)
        document.body.appendChild(dialog)
        this.inputSubmit.setAttribute('disabled', 'true')
        // @ts-ignore
        self.grecaptcha.ready(() => grecaptcha.render(container, {
          sitekey: this.getAttribute('grecaptcha-key'),
          callback: () => {
            this.root.querySelectorAll('[captcha-message]').forEach(message => message.classList.add('hidden'))
            this.inputSubmit.removeAttribute('disabled')
            dialog.setAttribute('style', style + 'opacity: 0; pointer-events: none;')
          },
          'expired-callback': () => {
            this.root.querySelectorAll('[captcha-message]').forEach(message => message.classList.remove('hidden'))
            this.inputSubmit.setAttribute('disabled', 'true')
            dialog.setAttribute('style', style + 'transition: none;')
          }
        }))
        // @ts-ignore
        if (self.grecaptcha) resolve(self.grecaptcha)
      }
      this.html = script
    }))
  }
}
