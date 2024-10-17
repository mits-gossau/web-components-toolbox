// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global customElements */
/* global self */

/**
 * https://docs.auvious.com/docs/get-started/widget/
 *
 * @export
 * @class Auvious
 * @type {CustomElementConstructor}
 */
export default class Auvious extends Shadow() {
  #json

  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    this.auviousLaunchEventListener = event => this.widget.launch('video')

    this.callEndedEventListener = event => {
      this.widget.terminate(false)
      if (this.hasAttribute('reload-on-callEnded')) setTimeout(() => location.reload(), 2000)
    }

    this.notificationOpenedEventListener = event => {
      if (event.detail === 'error') this.callEndedEventListener()
    }
  }

  connectedCallback () {
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    document.body.addEventListener('auvious-launch', this.auviousLaunchEventListener)
    Promise.all(showPromises).then(async () => {
      this.widget.addEventListener('callEnded', this.callEndedEventListener)
      this.widget.addEventListener('notificationOpened', this.notificationOpenedEventListener)
      this.widget.addEventListener('ready', event => Auvious.injectAttributePart(this.widget), { once: true })
      const showFunc = () => {
        this.widget.classList.remove('hidden')
        this.loadingSpinner.classList.add('hidden')
      }
      setTimeout(showFunc, 10000)
      this.widget.addEventListener('notificationOpened', event => setTimeout(() => {
        Auvious.injectAttributePart(this.widget)
        showFunc()
      }, 50), { once: true })
      self.addEventListener('beforeunload', this.callEndedEventListener, { once: true })
      // see all translation keys: https://docs.auvious.com/assets/files/de-4eebf6730ba65b91064fb20f6f97234b.json
      if (this.json.translations) this.widget.setTranslations({...(await fetch(`${this.importMetaUrl}./${this.getAttribute('translations-path') || 'de-4eebf6730ba65b91064fb20f6f97234b.json'}`).then(response => response.json())), ...this.json.translations})
    })
  }

  disconnectedCallback () {
    document.body.removeEventListener('auvious-launch', this.auviousLaunchEventListener)
    this.widget.removeEventListener('callEnded', this.callEndedEventListener)
    this.widget.removeEventListener('notificationOpened', this.notificationOpenedEventListener)
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
    return !this.widget
  }

  /**
   * renders the css
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        --av-color-primary: var(--color-secondary);
        --av-container-round-width: ${this.getAttribute('button-size') || '5em'};
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
      }
      :host > * {
        grid-column: 1;
        grid-row: 1;
      }
      :host > app-auvious-widget, :host > section.loading {
        transition: opacity 0.3s ease-out;
      }
      :host > app-auvious-widget.hidden, :host > section.loading.hidden {
        opacity: 0;
      }
      ${this.hasAttribute('static')
        ? /* css */`
          :host {
            flex: 0 !important;
          }
          :host > app-auvious-widget::part(DIV-av-floating-av-floating-right-av-floating-bottom-av-floating-offset) {
            position: relative;
            left: 0;
            top: 0;
          }
        `
        : ''
      }
      ${this.json?.texts?.privacy
        ? /* css */`
          :host > app-auvious-widget::part(APP-LAUNCHER) {
            display: flex;
            align-items: center;
          }
          :host > app-auvious-widget::part(APP-LAUNCHER)::before {
            content: "${this.json?.texts?.privacy}";
            font: var(--mdx-sys-font-fix-body3);
            margin-right: 1em;
          }
        `
        : ''
      }
      @media only screen and (max-width: _max-width_) {
        :host {}
      }
    `
    return Promise.resolve()
  }

  /**
   * Render HTML
   * @returns void
   */
  renderHTML () {
    this.html = Array.from(this.attributes).reduce((acc, attribute) => {
      if (attribute.name && attribute.name !== 'style' && attribute.name !== 'namespace' && attribute.name !== 'tabindex' && !attribute.name.includes('hidden')) return `${acc} ${attribute.name}="${attribute.value || 'true'}"`
      return acc
    }, '<app-auvious-widget class=hidden') + '></app-auvious-widget>' + this.loadingSpinnerHTML
    return Promise.all([
      customElements.whenDefined('app-auvious-widget'),
      this.loadDependency('auviousesm', 'https://auvious.video/widget/dist/auvious/auvious.esm.js')
    ])
  }

  /**
   * fetch dependency
   *
   * @returns {Promise<any>}
   */
  loadDependency (globalNamespace, url) {
    // make it global to self so that other components can know when it has been loaded
    return this[`#loadDependency${globalNamespace}`] || (this[`#loadDependency${globalNamespace}`] = new Promise((resolve, reject) => {
      // @ts-ignore
      if (document.head.querySelector(`#${globalNamespace}`) || self[globalNamespace]) return resolve(self[globalNamespace])
      const script = document.createElement('script')
      script.setAttribute('type', 'module')
      script.setAttribute('id', globalNamespace)
      script.setAttribute('src', url)
      // @ts-ignore
      script.onload = () => self[globalNamespace]
        // @ts-ignore
        ? resolve(self[globalNamespace])
        : reject(new Error(`${globalNamespace} does not load into the global scope!`))
      document.head.appendChild(script)
    }))
  }

  static injectAttributePart (node) {
    node.setAttribute('part', Array.from(node.classList).reduce((acc, curr) => `${acc}-${curr}`, node.nodeName))
    if (node.shadowRoot) node = node.shadowRoot
    let children
    if ((children = node.children) && children.length) Array.from(children).forEach(node => Auvious.injectAttributePart(node))
  }

  get widget () {
    return this.root.querySelector('app-auvious-widget')
  }

  get template () {
    return this.root.querySelector('template')
  }

  get json () {
    return this.#json || (this.#json = JSON.parse(this.template.content.textContent))
  }

  get loadingSpinner () {
    return this.root.querySelector('section.loading')
  }

  get loadingSpinnerHTML () {
    return /* html */`
      <!-- start - important for loading animation -->
      <section class="loading">
      <svg class="ring" viewBox="25 25 50 50" stroke-width="5"> <circle cx="50" cy="50" r="20" /> </svg>
      <script>
        if (document.body.hasAttribute('wc-config-load')) {
          document.querySelector('section.loading').remove()
        } else {
          document.body.addEventListener('wc-config-load', event => document.querySelector('section.loading').remove())
        }
      </script>
      <style>
        section.loading {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ring {
          --uib-size: min(50px, 20dvw);
          --uib-speed: 2s;
          --uib-color: var(--color-secondary, black);
          
          height: var(--uib-size);
          width: var(--uib-size);
          vertical-align: middle;
          transform-origin: center;
          animation: rotate var(--uib-speed) linear infinite;
        }

        .ring circle {
          fill: none;
          stroke: var(--uib-color);
          stroke-dasharray: 1, 200;
          stroke-dashoffset: 0;
          stroke-linecap: round;
          animation: stretch calc(var(--uib-speed) * 0.75) ease-in-out infinite;
        }

        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes stretch {
          0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 90, 200;
            stroke-dashoffset: -35px;
          }
          100% {
            stroke-dashoffset: -124px;
          }
        }
      </style>
      <div></div>
      <div></div>
      </section>
    `
  }
}
