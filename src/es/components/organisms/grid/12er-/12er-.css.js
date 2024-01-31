/* css */ `
:host > section {
  grid-template-columns: repeat(12, 1fr);
  gap: ${this.getAttribute('gap') || 'var(--grid-12er-grid-gap, 1rem)'};
}
/* col-lg */
${Array.from(this.section.querySelectorAll('[col-lg]')).reduce((acc, node) => acc + (acc.includes(`[col-lg="${node.getAttribute('col-lg')}"]`)
  ? ''
  : `
    :host > section >*[col-lg="${node.getAttribute('col-lg')}"] {
      grid-column: span ${node.getAttribute('col-lg') || node.getAttribute('col-md') || '12'};
    }
  `),
'')}

/* col-md */
@media only screen and (max-width: ${this.getAttribute('tablet-breakpoint') || '1024px'}) {
  ${Array.from(this.section.querySelectorAll('[col-md]')).reduce((acc, node) => acc + (acc.includes(`[col-md="${node.getAttribute('col-md')}"]`)
    ? ''
    : `
      :host > section >*[col-md="${node.getAttribute('col-md')}"] {
        grid-column: span ${node.getAttribute('col-md') || node.getAttribute('col-sm') || '12'};
      }
    `),
  '')}

  :host > section {
    gap: ${this.getAttribute('gap-mobile') || this.getAttribute('gap') || 'var(--grid-12er-grid-gap-mobile, var(--grid-12er-grid-gap, 1rem))'};
  }
}

/* col-sm */
@media only screen and (max-width: _max-width_) {
  ${Array.from(this.section.querySelectorAll('[col-sm]')).reduce((acc, node) => acc + (acc.includes(`[col-sm="${node.getAttribute('col-sm')}"]`)
    ? ''
    : `
      :host > section >*[col-sm="${node.getAttribute('col-sm')}"] {
        grid-column: span ${node.getAttribute('col-sm') || node.getAttribute('col-sm') || '12'};
      }
    `),
  '')}

  :host > section {
    gap: ${this.getAttribute('gap-mobile') || this.getAttribute('gap') || 'var(--grid-12er-grid-gap-mobile, var(--grid-12er-grid-gap, 1rem))'};
  }
}`