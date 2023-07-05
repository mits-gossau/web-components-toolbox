// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * @export
 * @class UserProfile
 * @type {CustomElementConstructor}
 */
export default class UserProfile extends Shadow() {

  constructor(...args) {
    super(...args) 
  }


  connectedCallback() {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
  }
  disconnectedCallback() {
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML() {
    return !this.wrapper
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
   */
  renderCSS() {
    this.css = /* css */`
      :host {
        display:block;
      }
      :host > div {
        padding:0.8em;
        background:#f5f5f5;
        border-radius:1.6em;
      }
      :host .profile {
        height: 1.2em;
      }
      :host .profile img {
       height: 1.2em; 
      }    
      :host .menu {
        position: absolute;
        top: 3.9em;
        right: 5vw;
        padding: 0;
        background: #fff;
        width: auto;
        border-radius: 15px;
        z-index:9999999;
      }
      :host .menu ul {
        padding:var(--content-spacing) auto;
        margin:0;
      }
      :host .menu ul li {
        list-style: none;
        padding: calc(var(--content-spacing) / 2) var(--content-spacing);
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
      }
      @media only screen and (max-width: _max-width_) {
        :host {}
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate() {
    switch (this.getAttribute('namespace')) {
      case 'user-profile-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }])
      default:
        return Promise.resolve()
    }
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML() {
    const menuDiv = document.createElement('div');
    menuDiv.setAttribute('class', 'menu')
    const menuUL = document.createElement('ul')
    const linkNodes = [...this.root.childNodes].filter(c => c.nodeName === 'A')
    this.html = ''
    linkNodes.forEach(node => {
      console.log(node)
      const li = document.createElement('li');
      li.innerHTML = node.outerHTML
      menuUL.appendChild(li)
    })
    menuDiv.appendChild(menuUL)
    //
    const profileImgDiv = document.createElement('div');
    profileImgDiv.setAttribute('class', 'profile')
    const profileImg = document.createElement('img')
    profileImg.setAttribute('src', this.icon)
    profileImgDiv.appendChild(profileImg)
    //
    this.wrapper = this.root.querySelector('div') || document.createElement('div');
    this.wrapper.appendChild(profileImgDiv)
    this.wrapper.appendChild(menuDiv)
    this.html = this.wrapper
  }

  get icon() {
    return this.getAttribute('icon')
  }
}
