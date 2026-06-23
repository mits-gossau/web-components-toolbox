// @ts-check

/**
 * grid namespace css template, returns the css string with resolved variables (CSP-safe, no eval)
 * @param {import('../Grid.js').default} self
 * @returns {string}
 */
export default self => /* css */`
:host {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
}
:host > section {
    grid-template-columns: ${self.getAttribute('column-with') || 'auto'};
    grid-template-rows: auto;
    justify-content: space-evenly;
}
:host > section > * {
    padding: var(--grid-1column-align-center-padding-custom, var(--content-spacing));
}

@media only screen and (max-width: _max-width_) {
    :host(:not([no-mobile])) > section {
        grid-template-columns: 100%;
    }
    :host > section > * {
        padding: var(--grid-1column-align-center-padding-mobile-custom, var(--grid-1column-align-center-padding-custom, var(--content-spacing-mobile, var(--content-spacing))));
    }
}`
