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
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name') || 'request-event-name', {
      detail: {
        recipe: "all"
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
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
    Promise.all([this.loadChildComponents()]).then(([child]) => {
      const wrapper = document.createElement('div')
      // const wrapperTeaser = new child[1][1]() 
      // console.log(wrapperTeaser);
      const recipes = []
      
      recipeList.forEach((recipeItem, index) => {
        const recipeTeaser = new child[0][1]()
        recipeTeaser.setAttribute('namespace', "teaser-tile-")
        recipeTeaser.setAttribute('tabindex', index)
        recipeTeaser.innerHTML = `
          <figure>
            <a-picture namespace="picture-teaser-" picture-load defaultSource="https://www.alnatura.ch/.imaging/mte/m5-bk-brand/medium16To9/dam/alnatura/Rezepte/2022/Salat_limonrimon-(3).jpg/jcr:content/Salat_limonrimon%20(3).jpg" alt="randomized image"></a-picture>
            <figcaption>
              <h5>Sabichsalat</h5>
              <a-link namespace=underline-><a>Mehr erfahren</a></a-link>
            </figcaption>
          </figure>`
        recipes.push(recipeTeaser)
        wrapper.append(recipeTeaser)

        //this.html = recipeTeaser.outerHTML
      })
      //this.html = ""
      console.log(wrapper)
      //this.html = `<o-wrapper namespace="wrapper-teaser-">${wrapper.innerHTML}</o-wrapper>`
      this.html = wrapper.innerHTML
    })
    
  }

  loadChildComponents() {
    return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
      import('../../molecules/teaser/Teaser.js').then(
        module => ['m-teaser', module.default]
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
