// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * @export
 * @class UserProfile
 * @type {CustomElementConstructor}
 */
export default class UserProfile extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.clickListener = event => {
      const isInside = event.composedPath().includes(this)
      const isActive = this.classList.contains('active')
      if (isInside || isActive) {
        if (this.hasAttribute('href')) {
          event.stopPropagation()
          self.open(this.getAttribute('href'), this.getAttribute('target') || '_self', this.hasAttribute('rel') ? `rel=${this.getAttribute('rel')}` : '')
          return
        }
        this.classList.toggle('active')
      }
    }
  }

  connectedCallback () {
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    this.hidden = true
    Promise.all(showPromises).then(() => (this.hidden = false))
    document.body.addEventListener('click', this.clickListener)
  }

  disconnectedCallback () {
    document.body.removeEventListener('click', this.clickListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.profileImgDiv
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
         display:var(--display, block);
         position:var(--position, relative);
         width:var(--width, fit-content);
      }
      :host a {
        align-items: center;
        display:flex !important;
        flex-direction: row;
        margin:0 !important;
        text-decoration:none !important;
      }
      :host a.sub {
        padding-left: 1em;
      }
      :host span {
        padding:var(--span-padding, 0);
      }
      :host .profile {
        --transition: none;
        background-color:var(--profile-background-color, black);
        border-radius:var(--profile-border-radius, 0);
        display:var(--profile-display, flex);
        flex-direction: column;
        padding:var(--profile-padding, 0);
        color: var(--profile-color, var(--color));
      }
      :host([icon-text]) .profile {
        height: var(--profile-height, 2.75em);
        padding:var(--profile-padding-icon-text, 0);
      }
      :host(.logged-in) .profile {
        --color: var(--profile-logged-in-color, var(--profile-color, black));
        color: var(--profile-logged-in-color, var(--profile-color, black));
        background-color:var(--profile-logged-in-background-color, black);
      }
      :host(.logged-in) .profile:hover {
        background-color:var(--profile-logged-in-background-color-hover, black);
      }
      :host(.active) .profile {
        --color:var(--profile-color-active, var(--profile-color, black));
        color:var(--profile-color-active, var(--profile-color, black));
        background-color:var(--profile-background-color-active, var(--profile-background-color, black));
      }
      :host(.active) .profile:hover {
        background-color:var(--profile-background-color-active-hover, white);
      }
      :host .profile:hover {
        background-color:var(--profile-background-color-hover, white);
        cursor: pointer;
      }
      :host .profile > .icon-text {
        font-size: 0.5em;
      }
      :host .menu {
        background: var(--menu-background, white);
        border-radius: var(--menu-border-radius, 0);
        border: 1px solid  var(--menu-border-color, black);
        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        opacity: 0;
        padding: 0;
        position: absolute;
        right: 0;
        top: var(--menu-top, 0);
        transition: visibility 100ms linear, opacity 100ms linear;
        visibility: hidden;
        width: max-content;
        z-index:9999;
      }
      :host(.active) .menu {
        opacity: 1;
        visibility: visible;
      }
      :host .menu ul {
        margin:0;
        padding:var(--menu-ul-padding, 0);
      }
      :host .menu ul li {
        border-top:var(--menu-li-border-top, none);
        list-style: none;
        padding:var(--menu-li-padding, 0);
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
  fetchTemplate () {
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
   * @return {Promise<void>}
   */
  renderHTML () {
    return this.fetchModules([
      {
        path: `${this.importMetaUrl}../iconMdx/IconMdx.js`,
        name: 'a-icon-mdx'
      }
    ]).then(children => {
      const icon = new children[0].constructorClass({ namespace: this.getAttribute('namespace') || '', namespaceFallback: this.hasAttribute('namespace-fallback'), mobileBreakpoint: this.mobileBreakpoint }) // eslint-disable-line
      icon.setAttribute('icon-name', this.classList.contains('logged-in') ? 'User' : 'LogIn')
      icon.setAttribute('size', '1em')
      const iconText = document.createElement('div')
      if (this.hasAttribute('icon-text')) {
        iconText.classList.add('icon-text')
        iconText.textContent = this.getAttribute('icon-text')
      }
      this.menuDiv = this.root.querySelector('.menu') || document.createElement('div')
      this.menuDiv.setAttribute('class', 'menu')
      const menuUL = document.createElement('ul')
      const linkNodes = [...this.root.childNodes].filter(c => c.nodeName === 'A')
      this.html = ''
      linkNodes.forEach(node => {
        const li = document.createElement('li')
        li.innerHTML = node.outerHTML
        menuUL.appendChild(li)
      })
      this.menuDiv.appendChild(menuUL)
      this.profileImgDiv = this.root.querySelector('.profile') || document.createElement('div')
      this.profileImgDiv.setAttribute('class', 'profile')
      this.profileImgDiv.appendChild(icon)
      if (this.hasAttribute('icon-text')) this.profileImgDiv.appendChild(iconText)
      this.html = this.profileImgDiv
      this.html = this.menuDiv
    })
  }
}
