/* css */ `
:host > section {
  --grid-columns: ${this.getAttribute('grid-columns') || 16};
  --grid-x-gap: ${this.getAttribute('gap') || '1rem'};
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-x-gap);
  padding-bottom: var(--grid-x-padding-bottom, 0);
}

:host > section > [vertical-align-bottom] > div {
  display: flex; 
  align-items: end; 
  height: 100%;
}

/* col-lg */
${Array.from(this.section.querySelectorAll('[col-lg]')).reduce((acc, node) => acc + (acc.includes(`[col-lg="${node.getAttribute('col-lg')}"]`)
  ? ''
  : `
    :host > section >*[col-lg="${node.getAttribute('col-lg')}"] {
      grid-column: span ${node.getAttribute('col-lg') || node.getAttribute('col-md') || 'var(--grid-columns)' || '16'};
    }
  `),
'')}

/* order-lg */
${Array.from(this.section.querySelectorAll('[order-lg]')).reduce((acc, node) => acc + (acc.includes(`[order-lg="${node.getAttribute('order-lg')}"]`)
  ? ''
  : `
    :host > section >*[order-lg="${node.getAttribute('order-lg')}"] {
      order: ${node.getAttribute('order-lg')};
    }
  `),
'')}

/* col-md */
@media only screen and (max-width: ${this.getAttribute('tablet-breakpoint') || '1024px'}) {
  ${Array.from(this.section.querySelectorAll('[col-md]')).reduce((acc, node) => acc + (acc.includes(`[col-md="${node.getAttribute('col-md')}"]`)
    ? ''
    : `
      :host > section >*[col-md="${node.getAttribute('col-md')}"] {
        grid-column: span ${node.getAttribute('col-md') || node.getAttribute('col-sm') || 'var(--grid-columns)' || '16'};
      }
    `),
  '')}

  :host > section {
    gap: ${this.getAttribute('gap-mobile') || this.getAttribute('gap') || 'var(--grid-x-gap-mobile, var(--grid-x-gap, 1rem))'};
  }

  /* order-md */
  ${Array.from(this.section.querySelectorAll('[order-md]')).reduce((acc, node) => acc + (acc.includes(`[order-md="${node.getAttribute('order-md')}"]`)
    ? ''
    : `
      :host > section >*[order-md="${node.getAttribute('order-md')}"] {
        order: ${node.getAttribute('order-md')};
      }
    `),
  '')}
}

/* col-sm */
@media only screen and (max-width: _max-width_) {
  ${Array.from(this.section.querySelectorAll('[col-sm]')).reduce((acc, node) => acc + (acc.includes(`[col-sm="${node.getAttribute('col-sm')}"]`)
    ? ''
    : `
      :host > section >*[col-sm="${node.getAttribute('col-sm')}"] {
        grid-column: span ${node.getAttribute('col-sm') || 'var(--grid-columns)' || '16'};
      }
    `),
  '')}

  :host > section {
    gap: ${this.getAttribute('gap-mobile') || this.getAttribute('gap') || 'var(--grid-x-gap-mobile, var(--grid-x-gap, 1rem))'};
  }

  /* order-sm */
  ${Array.from(this.section.querySelectorAll('[order-sm]')).reduce((acc, node) => acc + (acc.includes(`[order-sm="${node.getAttribute('order-sm')}"]`)
    ? ''
    : `
      :host > section >*[order-sm="${node.getAttribute('order-sm')}"] {
        order: ${node.getAttribute('order-sm')};
      }
    `),
  '')}
}
`