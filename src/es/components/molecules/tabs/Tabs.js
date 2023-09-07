// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

export default class Tabs extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    const tabs = this.root.querySelectorAll('.tab-navigation li');
    const sections = this.root.querySelectorAll('section.tab-content');

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach((tab) => {
                tab.classList.remove('active');
            });

            sections.forEach((section) => {
                section.classList.remove('active');
            });

            tab.classList.add('active');
            sections[index].classList.add('active');
        });
    });
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
  }

  shouldRenderCSS () {
    return !this.shadowRoot.querySelector(
      `:host > style[_css], ${this.tagName} > style[_css]`
    )
  }

  renderCSS () {
    this.css = /* css */ `
        :host {
            font-family: var(--font-family);
        }
        :host .tab-navigation {
            border-bottom: 1px solid var(--m-gray-300);
            list-style: none;
            display: flex;
            padding: 0;
            gap: 1.5em;
        }
        :host .tab-navigation li {
            border-top-left-radius: 0.5em;
            border-top-right-radius: 0.5em;
            color: var(--m-black);
            cursor: pointer;
            padding: 10px;
            position: relative;
        }
        :host .tab-navigation li::after {
            content: '';
            width: 100%;
            height: 3px;
            background-color: var(--m-orange-300);
            display: none;
            position: absolute;
            bottom: 0;
            left: 0;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
        }
        :host .tab-navigation li:hover {
            background-color: var(--m-orange-100);
        }
        :host .tab-navigation li:hover::after {
            display: block;
        }
        :host .tab-navigation li.active {
            color: var(--m-orange-600);
            font-family: var(--font-family-bold)
        }
        :host .tab-navigation li.active::after {
            background-color: var(--m-orange-600);
            display: block;
        }
        :host .tab-content {
            display: none;
        }
        :host .tab-content.active {
            display: block;
        }
    `
  }
}
