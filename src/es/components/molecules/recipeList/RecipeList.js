// @ts-check
/* global customElements */
/* global CustomEvent */
/* global location */

import { Shadow } from '../../prototypes/Shadow.js'

export default class RecipeList extends Shadow() {
  constructor (...args) {
    super(...args)
    this.answerEventNameListener = event => {
      event.detail.fetch.then(recipeData => {
        this.renderHTML(recipeData.items)
      })
    }
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldComponentRenderCSS()) showPromises.push(this.renderCSS())
    Promise.all(showPromises).then(() => {
      this.hidden = false
      this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name') || 'request-event-name', {
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    })
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  shouldComponentRenderHTML () {
    return !this.recipeListWrapper
  }

  /**
   * renders
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */ `
    :host {}
    @media only screen and (max-width: _max-width_) {}
    `
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: false
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'recipe-list-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles, false)
    }
  }

  renderHTML (recipeList) {
    if (!recipeList.length) return
    this.html = ''
    Promise.all([recipeList, this.loadChildComponents()]).then(() => {
      let row = ''
      recipeList.forEach((recipe, index) => {
        const teaser = `
            <o-wrapper namespace="wrapper-teaser-"><m-teaser namespace=teaser-tile- href="${this.getAttribute('detail-page-link') ?? ''}?${recipe.slug}">
                <figure>
                  <a-picture namespace="picture-teaser-" picture-load
                      defaultSource="${recipe.imageSrc}" alt="${recipe.imageAlt}"></a-picture>
                  <figcaption>
                      <h5>${recipe.title}</h5>
                      <a-link namespace=underline-><a>Zum Rezept</a></a-link>
                  </figcaption>
                </figure>
            </m-teaser></o-wrapper>
            `
        if (index % 3 === 0) {
          if (index === 0) {
            row += `<o-wrapper namespace="wrapper-teaser-">${teaser}`
          } else {
            row += `</o-wrapper><div class="spacer"></div><o-wrapper namespace="wrapper-teaser-">${teaser}`
          }
        } else {
          row += teaser
        }
      })
      this.html = row
    })
  }

  loadChildComponents () {
    return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
      import('../../organisms/wrapper/Wrapper.js').then(
        module => ['o-wrapper', module.Wrapper()]
      ),
      import('../../molecules/teaser/Teaser.js').then(
        module => ['m-teaser', module.default]
      ),
      import('../../atoms/picture/Picture.js').then(
        module => ['a-picture', module.default]
      )
    ]).then(elements => {
      elements.forEach(element => {
        // @ts-ignore
        if (!customElements.get(element[0])) customElements.define(...element)
      })
      return elements
    }))
  }
}
