import { Shadow } from '../../prototypes/Shadow.js'

export default class ProductCategories extends Shadow() {
    constructor(...args) {
        super(...args)


        // this.clickListener = event => {
        //     if (!event.target || event.target.tagName !== 'A') return false
        //     event.preventDefault()
        //     console.log("clicked!")
        // }


    }

    connectedCallback() {
        if (this.shouldComponentRenderCSS()) this.renderCSS()
        // this.pagination.addEventListener('click', this.clickListener)
    }

    disconnectedCallback() {
        this.pagination.removeEventListener('click', this.clickListener)
    }

    dispatchRequestNewsEvent() {
        this.dispatchEvent(new CustomEvent('requestArticleCategory', {
            detail: {
                category: "whatever"
            },
            bubbles: true,
            cancelable: true,
            composed: true
        }))
    }

    shouldComponentRenderCSS() {
        return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
    }

    renderHTML(pages, limit, skip) {
        for (let i = 0; i < pages; ++i) {
            const active = (skip / limit)
            pageItems += `<li class="page-item ${i === active ? 'active' : ''} "page="${i + 1}" ><a target="_self" class="page-link ${i === active ? 'active' : ''}">${i + 1}</a></li>`
            this.html = "hello"
        }
    }



    renderCSS() {
        this.css = /* css */ `
        :host {
            background - color: var(--background - color, black);
            display: var(--display, block);
            height: var(--height, 100 %);
        }
        :host ul {}
        :host li {}
        :host li::after {}
        @media only screen and(max - width: _max - width_) {
            :host li {}
        }`

        /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
        const styles = [
            {
                path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/reset.css`, // no variables for this reason no namespace
                namespace: false
            },
            {
                path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
                namespaceFallback: true
            }
        ]

        switch (this.getAttribute('namespace')) {
            case 'categories-default-':
                return this.fetchCSS([{
                    path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default -.css`, // apply namespace since it is specific and no fallback
                    namespace: false
                }, ...styles])
            default:
                return this.fetchCSS(styles)
        }
    }

    
}