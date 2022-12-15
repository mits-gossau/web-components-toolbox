// @ts-check
/* global customElements */

import { Shadow } from '../../prototypes/Shadow.js'

export default class RecipeList extends Shadow() {
  constructor(...args) {
    super(...args)
    this.answerEventNameListener = event => {
      event.detail.fetch.then(recipeData => {
        console.log('answer....', recipeData.products)
        this.renderHTML(recipeData.products)
      })
    }
  }

  connectedCallback() {
    const showPromises = []
    if (this.shouldComponentRenderCSS()) showPromises.push(this.renderCSS(), this.loadChildComponents())
    if (showPromises.length) {
      this.hidden = true
      Promise.all(showPromises).then((p) => {
        this.hidden = false
        this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name') || 'request-event-name', {
          detail: {
            recipe: "all"
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      })
    }
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)

  }

  disconnectedCallback() {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  shouldComponentRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  shouldComponentRenderHTML() {
    return !this.recipeListWrapper
  }

  renderCSS() {
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
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  renderHTML(recipeList) {
    if (!recipeList.length) return


    const list = recipeList.map((recipe, index) => {
      return /* html */`
            <m-teaser namespace=teaser-tile- href="https://www.migrosbank.ch">
                <figure>
                  <a-picture namespace="picture-teaser-" picture-load
                      defaultSource="https://www.alnatura.ch/.imaging/mte/m5-bk-brand/medium16To9/dam/alnatura/Rezepte/2022/Salat_limonrimon-(3).jpg/jcr:content/Salat_limonrimon%20(3).jpg" alt="randomized image"></a-picture>
                  <figcaption>
                      <h5>${recipe.title}</h5>
                      <a-link namespace=underline-><a>Mehr erfahren</a></a-link>
                  </figcaption>
                </figure>
            </m-teaser>
            `
    })
    let row = ""
    list.forEach((item, index) => {
      if (index % 3 === 0) {
        if (index === 0) {
          row += `<o-wrapper namespace="wrapper-teaser-">${item}`
        } else {
          row += `</o-wrapper><div class="spacer"></div><o-wrapper namespace="wrapper-teaser-">${item}`
        }
      } else {
        row += item
      }
    })
    const dummy = document.createElement('div')
    dummy.innerHTML = row
    this.html = dummy
  }

  loadChildComponents() {
    return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
      import('../../molecules/teaser/Teaser.js').then(
        module => ['m-teaser', module.default]
      ),
      import('../../atoms/picture/Picture.js').then(
        module => ['a-picture', module.default]
      ),
      import('../../organisms/wrapper/Wrapper.js').then(
        module => ['o-wrapper', module.Wrapper()]
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
