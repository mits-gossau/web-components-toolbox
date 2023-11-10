// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * Creates an DoubleButton
 * https://www.figma.com/file/npi1QoTULLWLTGM4kMPUtZ/Components-Universal?node-id=2866%3A55901
 *
 * @export
 * @attribute {namespace} namespace
 * @type {CustomElementConstructor}
 */
export default class DoubleButton extends Shadow() {
  constructor (options = {}, ...args) {
    // @ts-ignore
    super({ hoverInit: undefined, importMetaUrl: import.meta.url, ...options }, ...args)

    let timeout = null
    // force the emotion image to at least fill the over layed contents height
    this.resizeListener = event => {
      clearTimeout(timeout)
      timeout = setTimeout(() => (this.labelTwo.textContent = this.getHiddenLabelsCounter()), 200)
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    self.addEventListener('resize', this.resizeListener)
  }

  disconnectedCallback () {
    self.removeEventListener('resize', this.resizeListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector('style[_css]')
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.renderedHTML
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        --justify-content: flex-start;
        display: inline-flex;
        gap: 1px;
        width: ${this.hasAttribute('width')
          ? this.getAttribute('width')
          : 'var(--width, fit-content)'
        };
      }
      :host > * {
        flex-shrink: 0;
        overflow: hidden;
      }
      :host > *:first-of-type {
        flex-grow: 1;
        flex-shrink: 1;
      }
      :host > *::part(button) {
        height: 100%;
        gap: 1em;
      }
      :host > *:first-of-type::part(button) {
        border-radius: var(--border-radius, 0.5em) 0 0 var(--border-radius, 0.5em);
      }
      :host > *:last-of-type::part(button) {
        border-radius: 0 var(--border-radius, 0.5em) var(--border-radius, 0.5em) 0;
      }
      :host > *::part(label1) {
        flex-grow: 0;
        flex-shrink: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      :host > *::part(label2) {
        flex-grow: 0;
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    const replaces = this.buttonTagName === 'a'
      ? [{
          pattern: '([^-]{1})button',
          flags: 'g',
          replacement: '$1a'
        }]
      : []
    switch (this.getAttribute('namespace')) {
      case 'double-button-default-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./default-/default-.css`,
          namespace: false,
          replaces
        }])
      default:
        return Promise.resolve()
    }
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.renderedHTML = true
    this.fetchModules([
      {
        path: `${this.importMetaUrl}../../atoms/button/Button.js`,
        name: 'a-button'
      }
    ]).then(async () => {
      await this.buttonOne.renderHTMLPromise
      const labels = this.labelOne.textContent.split(',')
      if (labels.length > 1 && this.labelTwo.hasAttribute('dynamic')) {
        this.labelOne.innerHTML = labels.reduce((acc, curr, i) => `${acc}<span>${curr.trim()}</span>${i === labels.length -1 ? '' : ', '}`,'')
        setTimeout(() => (this.labelTwo.textContent = this.getHiddenLabelsCounter()), 2000)
        setTimeout(() => (this.labelTwo.textContent = this.getHiddenLabelsCounter()), 4000)
        setTimeout(() => (this.labelTwo.textContent = this.getHiddenLabelsCounter()), 6000)
      }
    })
  }

  getHiddenLabels () {
    const labelEnd = Math.round(this.labelOne.getBoundingClientRect().right)
    return Array.from(this.labelOne.children).filter(label => Math.round(label.getBoundingClientRect().right) > labelEnd)
  }

  getHiddenLabelsCounter () {
    return this.getHiddenLabels().length
      ? `+${this.getHiddenLabels().length}`
      : ''
  }

  get buttonOne () {
    return this.root.querySelector(':host > *:first-of-type')
  }

  get labelOne () {
    if (!this.buttonOne || !this.buttonOne.root) return null
    return this.buttonOne.root.querySelector('[part=label1]')
  }

  get labelTwo () {
    if (!this.buttonOne || !this.buttonOne.root) return null
    return this.buttonOne.root.querySelector('[part=label2]')
  }
}
