// @ts-check

/**
 * grid namespace css template, returns the css string with resolved variables (CSP-safe, no eval)
 * @param {import('../Grid.js').default} self
 * @returns {string}
 */
export default self => /* css */`
:host > section {
  grid-template-columns: repeat(12, 1fr);
  gap: ${self.getAttribute('gap') || 'var(--grid-12er-grid-gap, 1rem)'};
}
/* col-lg */
${Array.from(self.section.querySelectorAll('[col-lg]')).reduce((acc, node) => acc + (acc.includes(`[col-lg="${node.getAttribute('col-lg')}"]`)
  ? ''
  : `
    :host > section >*[col-lg="${node.getAttribute('col-lg')}"] {
      grid-column: span ${node.getAttribute('col-lg') || node.getAttribute('col-md') || '12'};
    }
  `),
'')}

/* row-lg */
${Array.from(self.section.querySelectorAll('[row-lg]')).reduce((acc, node) => acc + (acc.includes(`[row-lg="${node.getAttribute('row-lg')}"]`)
  ? ''
  : `
    :host > section >*[row-lg="${node.getAttribute('row-lg')}"] {
      grid-row: span ${node.getAttribute('row-lg') || node.getAttribute('row-md') || 'auto'};
    }
  `),
'')}

@media only screen and (max-width: ${self.getAttribute('tablet-breakpoint') || '1024px'}) {
  /* col-md */
  ${Array.from(self.section.querySelectorAll('[col-md]')).reduce((acc, node) => acc + (acc.includes(`[col-md="${node.getAttribute('col-md')}"]`)
    ? ''
    : `
      :host > section >*[col-md="${node.getAttribute('col-md')}"] {
        grid-column: span ${node.getAttribute('col-md') || node.getAttribute('col-sm') || '12'};
      }
    `),
  '')}

  /* row-md */
  ${Array.from(self.section.querySelectorAll('[row-md]')).reduce((acc, node) => acc + (acc.includes(`[row-md="${node.getAttribute('row-md')}"]`)
    ? ''
    : `
      :host > section >*[row-md="${node.getAttribute('row-md')}"] {
        grid-row: span ${node.getAttribute('row-md') || node.getAttribute('row-sm') || 'auto'};
      }
    `),
  '')}

  :host > section {
    gap: ${self.getAttribute('gap-mobile') || self.getAttribute('gap') || 'var(--grid-12er-grid-gap-mobile, var(--grid-12er-grid-gap, 1rem))'};
  }
}

@media only screen and (max-width: _max-width_) {
  /* col-sm */
  ${Array.from(self.section.querySelectorAll('[col-sm]')).reduce((acc, node) => acc + (acc.includes(`[col-sm="${node.getAttribute('col-sm')}"]`)
    ? ''
    : `
      :host > section >*[col-sm="${node.getAttribute('col-sm')}"] {
        grid-column: span ${node.getAttribute('col-sm') || '12'};
      }
    `),
  '')}

  /* row-sm */
  ${Array.from(self.section.querySelectorAll('[row-sm]')).reduce((acc, node) => acc + (acc.includes(`[row-sm="${node.getAttribute('row-sm')}"]`)
    ? ''
    : `
      :host > section >*[row-sm="${node.getAttribute('row-sm')}"] {
        grid-row: span ${node.getAttribute('row-sm') || 'auto'};
      }
    `),
  '')}

  :host > section {
    gap: ${self.getAttribute('gap-mobile') || self.getAttribute('gap') || 'var(--grid-12er-grid-gap-mobile, var(--grid-12er-grid-gap, 1rem))'};
  }
}`
