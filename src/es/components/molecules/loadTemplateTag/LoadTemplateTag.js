// @ts-check
import { Intersection } from '../../prototypes/Intersection.js'

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
    super(Object.assign(options, { intersectionObserverInit: {} }), ...args)
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.shouldRenderCSS()) this.renderCSS()
    if (!this.intersecting) {
      this.intersecting = this.shouldRenderHTML()
        ? this.renderHTML
        : () =>
            console.warn(
              'No required template tag found within this component: ',
              this
            )
    }
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
    return !this.root.querySelector(
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
        display: inline;
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
    const templateContent = this.template.content
    this.template.remove()
    this.html = templateContent
    // TODO: have wc-config.js load the missing web components by event
    let notDefined
    if ((notDefined = this.root.querySelectorAll(':not(:defined)')) && notDefined.length) {
      console.error(
        'There are :not(:defined) web components in the template. You must load through wc-config or manually:',
        notDefined,
        this
      )
    }
  }

  get template () {
    return this.root.querySelector('template')
  }
}
