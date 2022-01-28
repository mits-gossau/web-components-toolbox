// @ts-check
import Body from './Body.js'

/* global $ */

/**
 * Extends Body.js and adds Bootstrap + Jquery into the shadow dom
 * Example at: /src/es/components/pages/GeneralBootstrap.html
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class BodyBootstrap
 * @type {CustomElementConstructor}
 * @html {
 *  scripts no scripts element is expected to make the api call
 * }
 * @css {
 *  NOTE: grid-area: body;
 * }
 */
export default class BodyBootstrap extends Body {
  connectedCallback () {
    if (this.shouldComponentRenderHTML()) {
      this.renderHTML().then(() => {
      // initiate the carousel, since this components content is not accessible from outside the shadow dom
        $(this.root).find('.carousel').each((i, carousel) => {
          carousel = $(carousel)
          carousel.find('.carousel-control-prev').click(event => carousel.carousel('prev'))
          carousel.find('.carousel-control-next').click(event => carousel.carousel('next'))
          carousel.carousel()
        })
      })
    }
    if (this.shouldComponentRenderCSS()) this.renderCSS()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return !this.scripts
  }

  /**
   * renders the a-link html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    return new Promise((resolve) => {
      const scripts = document.createElement('section')
      scripts.setAttribute('id', 'scripts')
      scripts.innerHTML = /* html */'<link rel=stylesheet href=https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css>'
      const jquery = document.createElement('script')
      jquery.setAttribute('src', 'https://code.jquery.com/jquery-3.5.1.slim.min.js')
      jquery.onload = event => {
        const bootstrap = document.createElement('script')
        bootstrap.setAttribute('src', 'https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js')
        bootstrap.setAttribute('integrity', 'sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx')
        bootstrap.setAttribute('crossorigin', 'anonymous')
        bootstrap.onload = event => resolve()
        scripts.appendChild(bootstrap)
      }
      scripts.appendChild(jquery)
      this.html = scripts
    })
  }

  get scripts () {
    return this.root.querySelector('#scripts')
  }
}
