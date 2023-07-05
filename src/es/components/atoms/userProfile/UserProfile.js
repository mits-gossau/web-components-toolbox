// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * @export
 * @class UserProfile
 * @type {CustomElementConstructor}
 */
export default class UserProfile extends Shadow() {

  constructor(options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.clickListener = event => {
      console.log("hoi");
      this.menuDiv?.classList.toggle("active");
    }
  }


  connectedCallback() {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    this.profileImgDiv?.addEventListener('click', this.clickListener)
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
    return !this.profileImgDiv
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
      :host a {
        display:flex !important;
        align-items: center;
        flex-direction: row;
        margin:0 !important;
        text-decoration:none !important;
      }
      :host span {
        padding:0 0 0 0.5em;
      }
      :host > div {
        padding:0.8em;
        background:#f5f5f5;
        border-radius:1.6em;
      }
      :host .profile {
        display:flex;
      }
      :host .profile:hover {
        background-color:red;
        cursor: pointer;
      }
      :host .profile img {
        height: 1.2em; 
      }    
      :host .menu {
        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        border-radius: 8px;
        border: 1px solid  #F5F5F5;
        position: absolute;
        top: 3.9em;
        right: 5vw;
        padding: 0;
        background: #FFFFFF;
        width: auto;
        z-index:9999;
        visibility: hidden;
        opacity: 0;
        transition: visibility 300ms linear, opacity 300ms linear;
      }
      :host .menu.active {
        visibility: visible;
        opacity: 1;
      }
      :host .menu ul {
        padding:var(--content-spacing) auto;
        margin:0;
      }
      :host .menu ul li {
        list-style: none;
        padding: calc(var(--content-spacing) / 2) var(--content-spacing);
        border-top: 1px solid rgba(0, 0, 0, 0.05);
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
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${this.importMetaUrl}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'user-profile-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles, false)
    }
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML() {
    this.menuDiv = document.createElement('div');
    this.menuDiv.setAttribute('class', 'menu')
    const menuUL = document.createElement('ul')
    const linkNodes = [...this.root.childNodes].filter(c => c.nodeName === 'A')
    this.html = ''
    linkNodes.forEach(node => {
      const li = document.createElement('li');
      li.innerHTML = node.outerHTML
      menuUL.appendChild(li)
    })
    this.menuDiv.appendChild(menuUL)
    //
    this.profileImgDiv = document.createElement('div');
    this.profileImgDiv.setAttribute('class', 'profile')
    const profileImg = document.createElement('img')
    profileImg.setAttribute('src', this.icon)
    this.profileImgDiv.appendChild(profileImg)
    //
    //this.wrapper = this.root.querySelector('div') || document.createElement('div');
    //this.wrapper.appendChild(profileImgDiv)
    //this.wrapper.appendChild(menuDiv)
    //this.html = this.wrapper
    this.html = this.profileImgDiv
    this.html = this.menuDiv
  }

  get icon() {
    return this.getAttribute('icon')
  }
}
