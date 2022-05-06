// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * Arrow is an icon
 * Example at: /src/es/components/pages/Home.html
 * As an atom, this component can not hold further children (those would be quantum)
 *
 * @export
 * @class Arrow
 * @type {CustomElementConstructor}
 * @attribute {
 *
 * }
 * @css {
 * }
 */
export default class Textarea extends Shadow() {
  constructor (...args) {
    super({ mode: 'false' }, ...args)

    // super(...args)
    this.keyUpListener = event => {
      this.updateCounter()
    }
  }

  updateCounter () {
    const max = Number(this.textarea.getAttribute('maxlength'))
    const value = this.textarea.value.length
    const lable = this.textarea.getAttribute('data-maxlength-lable')
    this.counter.innerHTML = lable.replace('#number', (max - value).toString())
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.textarea.hasAttribute('maxlength')) this.textarea.addEventListener('keyup', this.keyUpListener)
  }

  disconnectedCallback () {
    if (this.textarea.hasAttribute('maxlength')) this.textarea.removeEventListener('keyup', this.keyUpListener)
    this.parentNodeShadowRootHost = null
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
    return !this.svg
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        position: relative;
        display: block;
      }
      :host > textarea {
        resize: none;
        border-radius: var(--border-radius, 0.5em);
        background-color: transparent;
        box-sizing: border-box;
        border: 1px solid var(--m-gray-400);
        color: var(--color);
        padding: 0.625em;
        font-size: var(--font-size);
        outline: none;
        width: 100%;
      }
      :host > textarea:hover {
        border-color: var(--m-gray-600);
      }
      :host > textarea:focus {
        border-color: var(--color-secondary);
      }

      :host > span.counter{
        position: absolute;
        top: -1.5em;
        right: 0;
      }
    `
  }

  renderHTML () {
    const lable = this.textarea.hasAttribute('data-maxlength-lable') ? this.textarea.getAttribute('data-maxlength-lable') : ''
    if (!lable.includes('#number')) {
      this.textarea.setAttribute('data-maxlength-lable', lable + '#number')
      this.counter.innerHTML += '#number'
    }
    this.updateCounter()

    this.counter.classList.add('counter')
    this.html = this.counter
    this.html = this.style
  }

  get style () {
    return this._style || (this._style = (() => {
      const style = document.createElement('style')
      style.setAttribute('protected', 'true')
      return style
    })())
  }

  get parentNodeShadowRootHost () {
    if (this._parentNodeShadowRootHost) return this._parentNodeShadowRootHost
    const searchShadowRoot = node => node.root || node.shadowRoot ? node : node.parentNode ? searchShadowRoot(node.parentNode) : node.host ? searchShadowRoot(node.host) : node
    return (this._parentNodeShadowRootHost = searchShadowRoot(this.parentNode))
  }

  set parentNodeShadowRootHost (node) {
    this._parentNodeShadowRootHost = node
  }

  get textarea () {
    return this.root.querySelector('textarea')
  }

  get counter () {
    return this._counter || (this._counter = document.createElement('span'))
  }
}
