// @ts-check
/* global CustomEvent */

import { Shadow } from '../../prototypes/Shadow.js'

export default class RecipeList extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.answerEventNameListener = event => {
      this.renderHTML('loading')
      event.detail.fetch.then(recipeData => {
        this.renderHTML(recipeData.items)
      })
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    this.renderHTML('loading')
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name') || 'request-event-name', {
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  shouldRenderCSS () {
    return this.hasAttribute('id') ? !this.root.querySelector(`:host > style[_css], #${this.getAttribute('id')} > style[_css]`) : !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`) 
  }

  /**
   * renders
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.html = this.style
    this.css = /* css */`
      :host {
        display: block;
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
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${this.importMetaUrl}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: false
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'recipe-list-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles, false)
    }
  }

  renderHTML (recipeList) {
    if (Array.isArray(recipeList) && !recipeList.length) {
      this.html = '' // clear previous loading element
      this.html = `${this.getAttribute('no-recipe-found-translation') || 'Leider haben wir keine Rezepte zu diesem Suchbegriff gefunden.'}`
      return
    }
    let recipeListHeight = this.offsetHeight
    this.html = ''
    const fetchModules = this.fetchModules([
      {
        path: `${this.importMetaUrl}'../../../../organisms/wrapper/Wrapper.js`,
        name: 'o-wrapper'
      },
      {
        path: `${this.importMetaUrl}'../../../../molecules/teaser/Teaser.js`,
        name: 'm-teaser'
      },
      {
        path: `${this.importMetaUrl}'../../../../atoms/picture/Picture.js`,
        name: 'a-picture'
      },
      {
        path: `${this.importMetaUrl}'../../../../atoms/loading/Loading.js`,
        name: 'a-loading'
      }
    ])
    if (recipeList === 'loading') {
      this.html = '<a-loading></a-loading>'
      const setStyleTextContent = () => {
        this.style.textContent = /* css */`
        :host {
          min-height: ${recipeListHeight}px;
        }
      `
      }
      let initialTimeoutId = null
      if (!recipeListHeight) {
        initialTimeoutId = setTimeout(() => {
          recipeListHeight = this.offsetHeight
          setStyleTextContent()
        }, 1000)
      }
      setStyleTextContent()
      let timeoutId = null
      let pictureLoadEventListener
      this.addEventListener('picture-load', (pictureLoadEventListener = event => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          clearTimeout(initialTimeoutId)
          this.style.textContent = ''
          this.removeEventListener('picture-load', pictureLoadEventListener)
        }, 200)
      }))
      return
    }
    Promise.all([recipeList, fetchModules]).then(() => {
      let row = ''
      recipeList.forEach((recipe, index) => {
        const teaser = `
            <m-teaser namespace=teaser-tile- href="${this.getAttribute('detail-page-link') || ''}?${recipe.slug}">
                <figure>
                  <a-picture namespace="picture-teaser-" picture-load
                      defaultSource="${recipe.imageSrc}" alt="${recipe.imageAlt}"></a-picture>
                  <figcaption>
                      <h5>${recipe.title}</h5>
                      <a-link namespace=underline-><a>${this.getAttribute('zum-rezept-translation') || ''}</a></a-link>
                  </figcaption>
                </figure>
            </m-teaser>
            `
        const simulateChildren = this.getAttribute('simulate-children') || 3
        if (index % simulateChildren === 0) {
          if (index === 0) {
            row += `<o-wrapper namespace="wrapper-teaser-" simulate-children="${simulateChildren}">${teaser}`
          } else {
            row += `</o-wrapper><div class="spacer"></div><o-wrapper namespace="wrapper-teaser-" simulate-children="${simulateChildren}">${teaser}`
          }
        } else {
          row += teaser
        }
      })
      this.html = row
    })
  }

  get style () {
    return this._style || (this._style = (() => {
      const style = document.createElement('style')
      style.setAttribute('protected', 'true')
      return style
    })())
  }
}
