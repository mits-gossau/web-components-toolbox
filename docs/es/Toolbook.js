// @ts-check
import { Shadow } from '../../src/es/components/prototypes/Shadow.js'

/**
* @export
* @class Toolbook
* @type {CustomElementConstructor}
*/
export default class Toolbook extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    if (this.template) ({ example: this.example, attributes: this.dataAttributes, savedAttributes: this.savedAttributes } = JSON.parse(this.template.content.textContent))

    this.checkboxChangeEventListener = event => this.setAttribute('touched', '')
    this.valueSelectChangeEventListener = event => {
      event.target.previousElementSibling.value = event.target.value
      this.valueInputChangeEventListener({...event, target: event.target.previousElementSibling})
    }
    this.valueInputChangeEventListener = event => {
      this.root.querySelector(`#${event.target.getAttribute('data-checkbox-id')}`).checked = !!event.target.value
      this.setAttribute('touched', '')
    }
    this.saveButtonClickEventListener = event => self.top?.postMessage({
      [this.getAttribute('index')]: this.valueInputs.reduce((acc, input) => ({...acc, [input.getAttribute('key')]: {
        has: Toolbook.walksUpDomQueryMatches(input, 'li', this).querySelector('#label-group > input').checked,
        value: input.value
      }}), {})
    })
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => (this.hidden = false))
    this.checkboxes.forEach(checkbox => checkbox.addEventListener('change', this.checkboxChangeEventListener))
    this.valueInputs.forEach(valueSelect => valueSelect.addEventListener('change', this.valueInputChangeEventListener))
    this.valueSelects.forEach(valueSelect => valueSelect.addEventListener('change', this.valueSelectChangeEventListener))
    this.saveButton.addEventListener('click', this.saveButtonClickEventListener)
  }

  disconnectedCallback () {
    this.checkboxes.forEach(checkbox => checkbox.removeEventListener('change', this.checkboxChangeEventListener))
    this.valueInputs.forEach(valueSelect => valueSelect.removeEventListener('change', this.valueInputChangeEventListener))
    this.valueSelects.forEach(valueSelect => valueSelect.removeEventListener('change', this.valueSelectChangeEventListener))
    this.saveButton.removeEventListener('click', this.saveButtonClickEventListener)
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
    return !this.ul
  }

  /**
   * renders the css
   * @returns Promise<void>
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        --any-display: flex;
        flex-direction: column;
        align-items: end;
        border: 1px solid black;
      }
      :host > button {
        display: none;
        cursor: pointer;
        margin: 0 0.5em 0.5em 0;
      }
      :host([touched]) > button {
        display: block;
      }
      :host div#value-group, :host > ul > li {
        display: flex;
        flex-direction: column;
        gap: 0.25em;
      }
      :host > ul {
        --ul-display: grid;
        --ul-margin: 0;
        gap: 0.25em;
        grid-template-columns: repeat(auto-fill, minmax(${this.getAttribute('auto-fill') || 'var(--auto-fill-grid-template-columns, 12.5em)'}, 1fr));
        grid-template-rows: var(--auto-fill-grid-template-rows, auto);
        padding: 0.5em;
        width: 100%;
      }
      :host > ul > li {
        --ul-li-padding-left: 0.5em;
        border: 1px solid black;
        padding: var(--ul-li-padding-left);
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   */
  fetchTemplate () {
    /** @type {import("../../src/es/components/prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${this.importMetaUrl}../../src/css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../src/css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * Render HTML
   * @returns Promise<void>
   */
  renderHTML () {
    let html = '<ul>'
    Array.from(new Set(Object.keys(this.dataAttributes || {}).concat(Object.keys(this.savedAttributes?.[this.getAttribute('index')] || {})))).forEach(key => {
      let activeValue
      if (this.dataAttributes[key]) {
        this.dataAttributes[key].has.find(entry => {
          const entryArr = JSON.parse(entry)
          return entryArr[0] === Number(this.getAttribute('index') || undefined) && (activeValue = entryArr[1])
        })
      }
      if(this.savedAttributes?.[this.getAttribute('index')]?.[key]?.has) {
        activeValue = this.savedAttributes[this.getAttribute('index')][key].value
      }
      const optionValues = []
      html += /* html */`
        <li>
          <div id="label-group">
            <input id="${key}-key" name="${key}-key" type=checkbox ${activeValue ? 'checked' : ''} value="${key}" data-value-id="${key}-value" />
            <label for="${key}-key">${key}</label>
          </div>
          <div id="value-group">
            <input id="${key}-value" key="${key}" name="${key}-value"${activeValue ? ` value="${activeValue}"` : ''} data-checkbox-id="${key}-key" />
            ${this.dataAttributes[key]?.values.length || this.savedAttributes?.[this.getAttribute('index')]?.[key]?.value
              ? /*html */`
                <select id="${key}-select" name="${key}-select">
                  <option value="">--Please choose a predefined value--</option>
                  ${this.dataAttributes[key]?.values.reduce((acc, data) => {
                    optionValues.push(data)
                    return /* html */`${acc}<option value="${data}"${data === activeValue ? ' selected' : ''}>${data}</option>`
                  }, '') || ''}
                  ${this.savedAttributes?.[this.getAttribute('index')]?.[key]?.value && !optionValues.includes(this.savedAttributes[this.getAttribute('index')][key].value)
                    ? /* html */`<option value="${this.savedAttributes[this.getAttribute('index')][key].value}"${this.savedAttributes[this.getAttribute('index')][key].value === activeValue ? ' selected' : ''}>${this.savedAttributes[this.getAttribute('index')][key].value}</option>`
                    : ''
                  }
                </select>
              `
              : ''
            }
            
          </div>
        </li>`
    })
    html += '</ul><button id=save>save</button'
    this.html = html
  }

  get ul () {
    return this.root.querySelector('ul')
  }

  get checkboxes () {
    return Array.from(this.root.querySelectorAll('#label-group > input'))
  }

  get valueInputs () {
    return Array.from(this.root.querySelectorAll('#value-group > input'))
  }

  get valueSelects () {
    return Array.from(this.root.querySelectorAll('#value-group > select'))
  }

  get saveButton () {
    return this.root.querySelector('#save')
  }

  get template () {
    return this.root.querySelector('template')
  }
}
