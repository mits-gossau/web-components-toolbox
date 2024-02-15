// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * Make your own Captcha with any Ascii Image, which has on each row the same total number of characters
 * here is a great collection: https://www.asciiart.eu/
 * 
 * @export
 * @class AsciiCaptcha
 * @type {CustomElementConstructor}
*/
export default class AsciiCaptcha extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    if (!this.hasAttribute('draw') && !this.hasAttribute('fill')) this.setAttribute('draw', '')
    let timeout = null
    this.resizeListener = event => {
      return new Promise(resolve => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          // @ts-ignore
          let height = self.getComputedStyle(this).getPropertyValue(`--${this.namespace || ''}height`) || self.getComputedStyle(this).getPropertyValue('height')
          if (height === 'auto') height = '75dvh'
          this.style.textContent = /* css */`
            :host > figure > pre {
              font-size: min(${Math.round(this.getBoundingClientRect().width / this.columnCount)}px, calc(${height} / (${this.rowCount} * var(--line-height))));
            }
          `
          resolve('done')
        }, 200)
      })
    }
    const drawCondition = this.hasAttribute('draw') && this.hasAttribute('fill')
      ? target => true
      : this.hasAttribute('draw')
        ? target => !target.hasAttribute('empty')
        : target => target.hasAttribute('empty')
    const draw = (event, target, command = 'toggle') => {
      if (!target) target = event.composedPath()[0]
      if (this.pre.contains(target)) {
        target.setAttribute('touched', Number(target.getAttribute('touched') || 0) + 1)
        if (drawCondition(target)) {
          target.classList[command]('selected')
          this.lastCommand = target.classList.contains('selected') ? 'add' : 'remove'
        }
        this.updateInput(this.pre)
      }
    }
    // mouse
    this.mousedownEventListener = event => {
      draw(event)
    }
    this.mousemoveEventListener = event => {
      if (event.buttons) draw(event, this.root.elementFromPoint(event.clientX, event.clientY), this.lastCommand)
    }
    this.mouseupEventListener = event => (this.lastCommand = undefined)
    // touch
    this.touchstartEventListener = event => {
      event.preventDefault()
      draw(event)
    }
    this.touchmoveEventListener = event => {
      event.preventDefault()
      draw(event, this.root.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY), this.lastCommand)
    }
    this.touchendEventListener = event => (this.lastCommand = undefined)
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => this.resizeListener().then(() => {
      this.hidden = false
      this.updateInput(this.pre)
    }))
    self.addEventListener('resize', this.resizeListener)
    this.addEventListener('mousedown', this.mousedownEventListener)
    this.addEventListener('mouseup', this.mouseupEventListener)
    this.addEventListener('mousemove', this.mousemoveEventListener)
    this.addEventListener('touchstart', this.touchstartEventListener)
    this.addEventListener('touchend', this.touchendEventListener)
    this.addEventListener('touchmove', this.touchmoveEventListener)
  }

  disconnectedCallback () {
    self.removeEventListener('resize', this.resizeListener)
    this.removeEventListener('mousedown', this.mousedownEventListener)
    this.removeEventListener('mouseup', this.mouseupEventListener)
    this.removeEventListener('mousemove', this.mousemoveEventListener)
    this.removeEventListener('touchstart', this.touchstartEventListener)
    this.removeEventListener('touchend', this.touchendEventListener)
    this.removeEventListener('touchmove', this.touchmoveEventListener)
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
    return !this.input
  }

  /**
   * renders the css
   * @returns Promise<void>
   */
  renderCSS () {
    this.css = /* css */`
      :host > figure {
        margin: 0;
      }
      :host > figure > pre {
        --line-height: 1.15;
        --show: var(--show-custom, show 1s ease-in);
        /*aspect-ratio: ${this.rowCount}/${this.columnCount}; would need actual char width and height calc*/
        background-color: var(--background-color, canvas);
        color: var(--color, black);
        cursor: pointer;
        font-family: monospace, monospace;
        font-size: 1em;
        line-height: calc(1em * var(--line-height));
        margin: 0;
        overflow: auto;
        padding: 0;
        user-select: none;
        text-align: center;
      }
      :host([command=add]) > figure > pre {
        cursor: crosshair;
      }
      :host([command=remove]) > figure > pre {
        cursor: alias;
      }
      /* not empty means with char */
      :host([draw]) > figure > pre > *:not([empty]) {
        transition: var(--transition, color .2s ease-out, text-shadow .5s ease-out);
      }
      :host([draw][command=add]) > figure > pre > *:not([empty]):hover {
        text-shadow: var(--add-text-shadow, 0 0 10em green, 0 0 5em green, 0 0 1em green, 0 0 0.2em green);
      }
      :host([draw][command=remove]) > figure > pre > *:not([empty]):hover {
        color: var(--remove-color, red);
        text-shadow: var(--remove-text-shadow, 0 0 10em red, 0 0 5em red, 0 0 1em red, 0 0 0.2em red);
      }
      :host([draw]) > figure > pre > *:not([empty]).selected {
        color: var(--selected-color, green);
        font-weight: var(--selected-font-weight, bold);
        text-shadow: var(--selected-text-shadow, 0 0 1em lightgreen, 0 0 0.2em lightgreen);
      }
      /* empty means with space */
      :host([fill]) > figure > pre > *[empty] {
        transition: var(--empty-transition, background-color .3s ease-out, box-shadow .3s ease-out);
      }
      :host([fill][command=add]) > figure > pre > *[empty]:hover {
        box-shadow: var(--empty-add-box-shadow, 0 0 10em green, 0 0 5em green, 0 0 1em green, 0 0 0.2em green);
      }
      :host([fill][command=remove]) > figure > pre > *[empty]:hover {
        background-color: var(--empty-remove-background-color, red);
        box-shadow: var(--empty-remove-box-shadow, 0 0 10em red, 0 0 5em red, 0 0 1em red, 0 0 0.2em red);
      }
      :host([fill]) > figure > pre > *[empty].selected {
        background-color: var(--empty-selected-background-color, green);
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   */
  fetchTemplate () {
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
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
      case 'ascii-captcha-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      case 'ascii-captcha-invert-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./invert-/invert-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * Render HTML
   * @returns Promise<void>
   */
  renderHTML () {
    const fakeName = this.getAttribute('real-name') || 'ASCII MOUSE'
    const figcaption = this.root.querySelector('figcaption') || document.createElement('figcaption')
    if (!figcaption.hasAttribute('id')) figcaption.setAttribute('id', fakeName)
    Array.from(this.root.children).forEach(node => {
      if (!node.getAttribute('slot') && node !== this.pre && !node.matches('style')) figcaption.appendChild(node)
    })
    const figure = this.root.querySelector('figure') || document.createElement('figure')
    figure.appendChild(figcaption)
    this.pre.innerHTML = Array.from(this.pre.textContent).reduce((acc, char, i) => `${acc}<span count=${i + 1}${char.trim() ? '' : ' empty'}>${char}</span>`, '')
    figure.appendChild(this.pre)
    this.html = [figure, this.style]
    this.pre.setAttribute('length', Array.from(this.pre.textContent).length)
    if (!this.pre.hasAttribute('role')) this.pre.setAttribute('role', 'img')
    if (!this.pre.hasAttribute('aria-label')) this.pre.setAttribute('aria-label', fakeName)
    const input = this.root.querySelector('input') || document.createElement('input')
    input.setAttribute('type', 'hidden')
    if (!input.hasAttribute('id')) input.setAttribute('id', fakeName.replace(/\s/g, '_') || this.tagName)
    if (!input.hasAttribute('name')) input.setAttribute('name', fakeName.replace(/\s/g, '_') || this.tagName)
    // NOTE: The input must be outside the shadowRoot for native form consumption
    this.appendChild(input)
    return Promise.resolve()
  }

  updateInput (pre) {
    clearTimeout(this._updateInputTimeoutID)
    this._updateInputTimeoutID = setTimeout(() => {
      const value = {
        timestamp: Date.now(),
        chars: []
      }
      Array.from(pre.attributes).reduce((acc, attribute) => {
        acc[attribute.name] = attribute.value
        return acc
      }, value)
      Array.from(pre.children).reduce((acc, child) => {
        acc.push(Array.from(child.attributes).reduce((acc, attribute) => {
          acc[attribute.name] = attribute.value
          return acc
        }, { char: child.textContent }))
        return acc
      }, value.chars)
      // @ts-ignore
      value.selected = value.chars.some(char => (char.class === 'selected'))
      // @ts-ignore
      value.touched = value.chars.some(char => char.touched)
      this.input.value = JSON.stringify(value)
      this.dispatchEvent(new CustomEvent(this.getAttribute('ascii-captcha') || 'ascii-captcha', {
        detail: {
          input: this.input,
          value
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
      if (this.hasAttribute('debug')) console.log(`${this.tagName} set new value to input`, {input: this.input, value})
    }, 200)
  }

  get pre () {
    return this.root.querySelector('pre')
  }

  get input () {
    return this.querySelector('input')
  }

  get style () {
    return (
      this._style ||
        (this._style = (() => {
          const style = document.createElement('style')
          style.setAttribute('protected', 'true')
          return style
        })())
    )
  }

  get columnCount () {
    if (!this.pre.hasAttribute('column-count')) this.pre.setAttribute('column-count', this.pre.textContent.indexOf('\n') - 1)
    return Number(this.pre.getAttribute('column-count'))
  }
  
  get rowCount () {
    if (!this.pre.hasAttribute('row-count')) this.pre.setAttribute('row-count', (this.pre.textContent.match(/\n/g) || []).length)
    return Number(this.pre.getAttribute('row-count'))
  }

  set lastCommand (value) {
    this._lastCommand = value
    this.setAttribute('command', value)
  }

  get lastCommand () {
    return this._lastCommand
  }
}
