// @ts-check
import Body from './Body.js'

/* global AbortController */
/* global fetch */

/**
 * Extends Body.js and renders the getNews api call at the connectedCallback
 * Example at: /src/es/components/pages/GeneralGetNews.html
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class BodyGetNews
 * @type {CustomElementConstructor}
 * @html {
 *  section no section element is expected to make the api call
 * }
 * @css {
 *  NOTE: grid-area: body;
 * }
 */
export default class BodyGetNews extends Body {
  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return !this.section
  }

  /**
   * renders the a-link html
   *
   * @return {void}
   */
  renderHTML () {
    if (this.abortController) this.abortController.abort()
    this.abortController = new AbortController()
    const url = 'http://umb.poc.ch/headless/home/getNews'
    const success = (json = JSON.parse('{"news":[{"title":"Mock Data","updateDate":"2020-12-05T23:52:44.713Z","abstract":"<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>"},{"title":"Herzliche Gratulation","updateDate":"2020-12-05T00:06:58.733Z","abstract":"<p>Die diesjährige Siegerin der Demotape Clinic steht fest!</p>"},{"title":"News 3","updateDate":"2020-12-04T23:18:47.25Z","abstract":"<p>Bla bla bla</p>"},{"title":"News 4","updateDate":"2020-12-04T23:17:31.22Z","abstract":"<p>afsadfsdfafsd</p>"},{"title":"News2","updateDate":"2020-12-04T23:16:03.61Z","abstract":"<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>"}],"totalItems":5}')) => {
      this.html = ''
      json.news.forEach(newsEl => {
        this.html = /* html */`
          <section><h2>${newsEl.title}</h2>${newsEl.abstract}<p><time>${newsEl.updateDate}</time></p></section>
        `
      })
    }
    fetch(url, { signal: this.abortController.signal }).then(response => {
      if (response.status >= 200 && response.status <= 299) return response.json()
      throw new Error(response.statusText)
    // @ts-ignore
    })
      .then(success)
      .catch(error => {
        success() // blow out the mock data
        return console.warn(url, error) || error
      })
  }

  get section () {
    return this.root.querySelector('section')
  }
}
