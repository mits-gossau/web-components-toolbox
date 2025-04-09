// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global HTMLElement */
/* global self */

/**
 * Modal is sticky and hosts uls
 * Example at: /src/es/components/pages/Home.html
 * As an organism, this component shall hold molecules and/or atoms
 * TODO: Once Firefox supports this feature use dialog instead of section => https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
 *
 * @export
 * @class Modal
 * @type {CustomElementConstructor}
 * @event.detail {
 *  {HTMLElement | undefined} child
 *  {boolean} [showOriginal=false] shall the original HTMLElement be shown in the modal. Use this for forms and other stuff which will be updated when open and closed.
 * }
 * @attribute {
 *  {boolean} [open=undefined]
 *  {querySelector string} [listen-at=body]
 *  {string} [open-modal=open-modal] event name to which to listen to
 *  {bool} [no-click] if set, the Modal won't close at onclick
 * }
 * @css {
 * --background-color, rgba(0, 0, 0, 0.8)
 * --height, 100%
 * --padding, min(50px, 4vw)
 * --position, fixed
 * --top, 0
 * --width, 100%
 * --z-index, 9999
 * --align-items, start
 * --display, flex
 * --flex-direction, row
 * --justify-content, center
 * --close-margin, 0 10px
 * --padding-mobile, min(50px, 4vw)
 * --align-items-mobile, start
 * --flex-direction-mobile, row
 * --justify-content-mobile, center
 * }
 */
export default class Modal extends Shadow() {
  static get observedAttributes () {
    return ['open']
  }

  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    // this.setAttribute('aria-label', 'Section')
    this.setAttribute('role', 'dialog') // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role
    this.setAttribute('aria-expanded', 'false')
    this.open = false
    this.clone = null
    this.eventDetail = null
    // open
    this.openModalListener = event => {
      if (event && event.detail && event.detail.forceOpen && this.hasAttribute('no-mobile')) {
        this.setAttribute('had-no-mobile', '')
        this.removeAttribute('no-mobile')
      }
      if (!this.open && (!this.hasAttribute('no-mobile') || this.checkMedia('desktop'))) {
        let actionAtLast = () => {}
        this.open = true
        this.eventDetail = event.detail
        if (event && typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation()
        let child
        if (!this.clone && event && event.detail && (child = event.detail.child) && child instanceof HTMLElement) {
          // if there is to be shown an other target, expl. an image is clicked but a gallery has to be shown
          let parentChild
          if (child.hasAttribute('open-modal-target') && child.parentNode && (parentChild = child.parentNode.querySelector(child.getAttribute('open-modal-target')))) {
            if (parentChild.hasAttribute('hidden')) {
              parentChild.removeAttribute('hidden')
              parentChild.setAttribute('was-hidden', 'true')
            }
            const carouselTwo = parentChild.tagName === 'M-CAROUSEL-TWO'
              ? parentChild
              : parentChild.querySelector('m-carousel-two')
            if (carouselTwo) {
              this.eventDetail.btnCloseOnly = true
              const selector = `[alt="${child.getAttribute('alt')}"], [defaultSource*="${(child.getAttribute('defaultSource') || '').replace(/.*\/(.*)/, '$1')}"]`
              // @ts-ignore
              actionAtLast = () => carouselTwo.scrollIntoView(selector, false, true)
            }
            child = parentChild
          }
          let closeBtn
          if (event.detail.child.root && (closeBtn = event.detail.child.root.querySelector('button.close-btn'))) {
            this.style.textContent = ''
            this.setCss(/* CSS */`
              :host([open]) > section > div > button#close.close-btn {
                background-color: ${self.getComputedStyle(closeBtn).getPropertyValue('background-color')};
              }
            `, undefined, undefined, true, this.style)
          }
          if (event.detail.showOriginal === false) {
            this.clone = child.cloneNode(true)
            this.container.appendChild(this.clone)
          } else {
            // clone node to have a placeholder keeping the space a picture would occupy
            const height = child.offsetHeight
            child.replaceWith(this.clone = document.createElement('div'))
            this.container.appendChild(child)
            this.clone.style.height = `${height}px`
            this.clone.style.visibility = 'hidden'
            if (child.hasAttribute('was-hidden')) this.clone.style.display = 'none'
            // below correct certain template settings of Pictures to display fullscreen without any side effects
            this.container.querySelectorAll('a-picture').forEach(aPicture => {
              if (aPicture.root && aPicture.img) aPicture.img.setAttribute('style', 'transform: none; height: auto; width: max-content;')
            })
          }
        } else {
          this.container.appendChild(this.initialContent)
        }
        this.origChild = child
        if (this.closeBtn) this.container.appendChild(this.closeBtn)
        if (!this.hasAttribute('open')) {
          this.setAttribute('open', '')
          this.clone.setAttribute('open', '')
          child.setAttribute('open', '')
          this.setAttribute('aria-expanded', 'true')
        }
        if (this.eventDetail && typeof this.eventDetail.openFunc === 'function') this.eventDetail.openFunc()
        actionAtLast()
      }
    }
    // close
    this.anyCloseModalListener = event => {
      if (this.eventDetail && !this.eventDetail.btnCloseOnly) this.closeModalListener(event)
    }
    this.closeModalListener = event => {
      if (this.open) {
        if (this.hasAttribute('had-no-mobile')) {
          this.setAttribute('no-mobile', '')
          this.removeAttribute('had-no-mobile')
        }
        this.open = false
        let duration = self.getComputedStyle(this).getPropertyValue(`--${this.namespace || ''}transition`)
        duration = duration ? Number(duration.replace(/.*?\s([\d.]*)s/g, '$1')) * 1000 : 300
        this.section.animate({ opacity: '0' }, { duration }).onfinish = () => {
          // move closeBtn back outside shadowDom
          if (this.closeBtn) this.appendChild(this.closeBtn)
          let child
          // if showOriginal this will be triggered by this.clone !== child to move the original back to its origin
          if (this.clone && (child = this.container.childNodes[0]) && this.clone !== child) {
            this.clone.replaceWith(child)
            // undo: below correct certain template settings of Pictures to display fullscreen without any side effects
            if (child.tagName === 'A-PICTURE' && child.root && child.img) {
              child.img.removeAttribute('style')
            }
          }
          if (child.hasAttribute('was-hidden')) {
            child.removeAttribute('was-hidden')
            child.setAttribute('hidden', 'true')
          }
          if (this.hasAttribute('open')) {
            this.removeAttribute('open')
            this.clone.removeAttribute('open')
            child.removeAttribute('open', '')
            this.origChild.removeAttribute('open', '')
            this.setAttribute('aria-expanded', 'false')
          }
          this.clone = null
          this.container.innerHTML = ''
          if (typeof this.eventDetail.closeFunc === 'function') this.eventDetail.closeFunc()
        }
      }
    }
    this.clickListener = event => event.stopPropagation()
    this.resizeListener = event => {
      if (this.hasAttribute('no-mobile') && this.checkMedia('mobile')) this.closeModalListener()
    }
    this.keyupListener = event => {
      if (event.key === 'Escape') this.closeModalListener()
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML();
    (this.getAttribute('listen-at') ? document.querySelector(this.getAttribute('listen-at')) : document.body).addEventListener(this.getAttribute('open-modal') || 'open-modal', this.openModalListener)
    if (!this.hasAttribute('no-click')) {
      this.addEventListener('click', this.clickListener)
      this.addEventListener('click', this.anyCloseModalListener)
    }
    if (this.closeBtn) this.closeBtn.addEventListener('click', this.closeModalListener)
    self.addEventListener('resize', this.resizeListener)
    document.addEventListener('keyup', this.keyupListener)
  }

  disconnectedCallback () {
    (this.getAttribute('listen-at') ? document.querySelector(this.getAttribute('listen-at')) : document.body).removeEventListener(this.getAttribute('open-modal') || 'open-modal', this.openModalListener)
    if (!this.hasAttribute('no-click')) {
      this.removeEventListener('click', this.clickListener)
      this.removeEventListener('click', this.anyCloseModalListener)
    }
    if (this.closeBtn) this.closeBtn.removeEventListener('click', this.closeModalListener)
    self.removeEventListener('resize', this.resizeListener)
    document.removeEventListener('keyup', this.keyupListener)
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'open') {
      if (this.hasAttribute('open')) {
        this.scrollY = self.scrollY
        this.openModalListener()
      } else {
        self.scrollTo(0, this.scrollY || 0)
        this.closeModalListener()
      }
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.section
  }

  /**
   * renders the o-modal css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host > section {
        height: 0;
        opacity: 0;
        overscroll-behavior: contain;
        width: 0;
      }
      :host([open]) > section {
        align-items: center;
        background-color: var(--background-color, rgba(0, 0, 0, 0.85));
        box-sizing: border-box;
        display: flex;
        height: var(--height, 100%);
        justify-content: center;
        opacity: 1;
        padding: var(--padding, min(var(--content-spacing), 4vw));
        position: var(--position, fixed);
        left: var(--left, 0);
        top: var(--top, 0);
        transition: var(--transition, opacity .3s);
        width: var(--width, 100%);
        z-index: var(--z-index, 9999);
      }
      :host([open]) > section > div {
        position: var(--div-position, static);
        align-items: var(--align-items, end);
        display: var(--display, flex);
        flex-direction: var(--flex-direction, column-reverse);
        justify-content: var(--justify-content, center);
      }
      :host([open]) > section > div:where(:has(> *[scroll-image-in-modal]), :has(> *[scroll-image-in-modal-mobile])) {
        width: 100%;
      }
      :host([open]) > section > div > #close {
        display: var(--close-display, block);
        position: var(--close-position, static);
        top: var(--close-top, auto);
        right: var(--close-right, auto);
        bottom: var(--close-bottom, auto);
        left: var(--close-left, auto);
        margin: var(--close-margin, 0 0 var(--content-spacing)) 0;
      }
      :host([open]) > section > div > button#close.close-btn {
        background-color: var(--close-btn-background-color, var(--color-secondary, var(--background-color)));
        border-radius: 50%;
        border: 0;
        box-sizing: border-box;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 14px;
        padding: 1.5em;
        width: 14px;
        position: absolute;
        top: 1em;
        right: 1em;
        z-index: 2;
      }
      :host([open]) > section > div > button#close.close-btn span {
        height: 14px;
        width: 14px;
      }
      @media only screen and (max-width: _max-width_) {
        :host([no-mobile]) {
          display: none;
        }
        :host([open]) > section {
          padding: var(--padding-mobile, var(--padding, min(var(--content-spacing-mobile, var(--content-spacing)), 4vw)));
        }
        :host([open]) > section > div > #close {
          margin: var(--close-margin-mobile, var(--close-margin, 0 0 var(--content-spacing-mobile, var(--content-spacing)) 0));
        }
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
    switch (this.getAttribute('namespace')) {
      case 'modal-default-':
      default:
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./default-/default-.css`,
          namespace: false
        }], false)
    }
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.initialContent = document.createElement('div')
    Array.from(this.root.children).forEach(node => {
      if (node.id === 'close') {
        // move close btn outside of shadow
        this.appendChild(this.closeBtn = node)
        if (!this.closeBtn.innerHTML) {
          this.closeBtn.innerHTML = `
            <span>
              <svg id="Untitled-Seite%201" viewBox="0 0 14 14" style="background-color:#ffffff00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" x="0px" y="0px" width="14px" height="14px">
                <path d="M 5.9689 7.7071 L 7.7071 5.9689 L 12.5416 10.8034 L 10.8033 12.5416 L 5.9689 7.7071 Z" fill="#FFFFFF"/>
                <path d="M 5.9033 5.9689 L 7.6415 7.7071 L 2.807 12.5416 L 1.0688 10.8034 L 5.9033 5.9689 Z" fill="#FFFFFF"/>
                <path d="M 7.6415 5.9034 L 5.9033 7.6416 L 1.0688 2.8071 L 2.807 1.0689 L 7.6415 5.9034 Z" fill="#FFFFFF"/>
                <path d="M 7.707 7.6416 L 5.9689 5.9033 L 10.8033 1.0689 L 12.5416 2.8071 L 7.707 7.6416 Z" fill="#FFFFFF"/>
              </svg>
            </span>
          `
          this.closeBtn.setAttribute('aria-label', 'Close')
          this.closeBtn.classList.add('close-btn')
        }
        return false
      }
      if (node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      this.initialContent.appendChild(node)
    })
    this.section = document.createElement('section')
    this.section.appendChild(this.container = document.createElement('div'))
    this.html = this.section
  }

  /**
   *
   *
   * @param {'mobile' | 'desktop'} [media=this.getAttribute('media')]
   * @returns {boolean}
   * @memberof IntersectionScrollEffect
   */
  checkMedia (media = this.getAttribute('media')) {
    const isMobile = self.matchMedia(`(max-width: ${this.mobileBreakpoint})`).matches
    return (isMobile ? 'mobile' : 'desktop') === media
  }

  get style () {
    return this._style || (this._style = (() => {
      const style = document.createElement('style')
      style.setAttribute('protected', 'true')
      return style
    })())
  }
}
