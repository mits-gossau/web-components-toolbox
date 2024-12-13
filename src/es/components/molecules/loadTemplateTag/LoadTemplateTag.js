// @ts-check
import { Intersection } from '../../prototypes/Intersection.js'

/* global customElements */

/**
 * LoadTemplateTag
 * Throw content inside a <template></template> tag into this component and it will load the template content on intersection
 * This is not going to load of customElements.define, make sure to only use components which are else in the light dom by wc-config detectable
 *
 * @export
 * @example {
    <m-load-template-tag>
      <template>
        ...
      </template>
    </m-load-template-tag>
 * }
 * @class LoadTemplateTag
 * @type {CustomElementConstructor}
 */
export default class LoadTemplateTag extends Intersection() {
  constructor (options = {}, ...args) {
    super(Object.assign(options, { mode: 'false', intersectionObserverInit: {} }), ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (!this.intersecting) {
      this.intersecting = this.shouldRenderHTML()
        ? this.renderHTML
        : () => console.warn(
            'No required template tag found within this component: ',
            this
          )
    }
    super.connectedCallback()
  }

  intersectionCallback (entries, observer) {
    if (
      (this.isIntersecting = entries && entries[0] && entries[0].isIntersecting)
    ) {
      // @ts-ignore
      this.intersecting()
      this.intersectionObserveStop()
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.hasAttribute('no-css') && !this.root.querySelector(
      `${this.cssSelector} > style[_css]`
    )
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return this.template
  }

  /**
   * renders the a-Iframe css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */ `
      :host {
        display: block !important;
      }
    `
  }

  /**
   * renders the html
   *
   * @return {void} final render function with a default of 200ms timeout
   */
  renderHTML () {
    if (!this.template) return
    const parentNode = this.parentNode
    const templateContent = this.template.content
    const notDefined = Array.from(templateContent.querySelectorAll(':not(:defined)')).filter(node => !customElements.get(node.tagName.toLowerCase()))
    this.template.remove()
    // keep a placeholder with same style attribute (height) until next scroll event, which gives enough time for the templateContent to render
    if (this.hasAttribute('style') && this.getAttribute('style').includes('height')) {
      this.after(templateContent)
      if (this.nextElementSibling) {
        let counter = 0
        const removeThisFunc = () => setTimeout(() => {
          counter++
          if (counter > 9 || this.nextElementSibling.offsetHeight) {
            this.remove()
            if (counter > 9) console.warn('The loaded template tag has no offsetHeight, check the usage of this tag!')
          } else {
            removeThisFunc()
          }
        }, 20)
        removeThisFunc()
      } else {
        this.remove()
      }
    } else {
      this.replaceWith(templateContent)
    }
    if (notDefined?.length) {
      if (document.body.hasAttribute(this.getAttribute('load-custom-elements') || 'load-custom-elements')) {
        parentNode.dispatchEvent(new CustomEvent(this.getAttribute('load-custom-elements') || 'load-custom-elements', {
          detail: {
            nodes: notDefined
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      } else {
        console.error(
          'There are :not(:defined) web components in the template. You must load through wc-config or manually:',
          notDefined,
          this
        )
      }
    }
  }

  get template () {
    return this.root.querySelector('template')
  }
}
