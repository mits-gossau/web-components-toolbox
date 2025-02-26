# Pagination

**Path:** `../src/es/components/molecules/pagination/Pagination.js`

## Summary

n/a

## Integration

n/a

## Templates (Namespace)

| Namespace | Path |
|------|------|
| pagination-default- | `./default-/default-.css` |

## Attributes

| Attribute Name | Description |
|----------------|-------------|
| `answer-event-name` |  |
| `request-event-name` |  |
| `page-name` |  |
| `namespace` |  |

## CSS Styles

### Selector: `:host`


### Selector: `:host > div`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --background-color | black |
| display | --display | block |
| height | --height | 100% |

### Selector: `:host ul`

| Property | Variable | Default |
|----------|----------|----------|
| display | --ul-display | flex |
| float | --ul-float | right |
| margin | --ul-margin | 0 |

### Selector: `:host li`

| Property | Variable | Default |
|----------|----------|----------|
| border-top | --li-border-top | 1px solid black |
| display | --li-display | inline-block |
| font-size | --li-font-size | 1em |
| height | --li-height | 5em |
| width | --li-width | 5em |

### Selector: `:host li.active`

| Property | Variable | Default |
|----------|----------|----------|
| background | --li-background-active | white |

### Selector: `:host nav ul li:hover`

| Property | Variable | Default |
|----------|----------|----------|
| border-top | --li-border-top-hover | 1px solid red |

### Selector: `:host nav ul li > a`

| Property | Variable | Default |
|----------|----------|----------|
| align-items | --li-a-align-items | center |
| border-left | --li-a-border-left | 1px var(--li-background-active |
| display | --li-a-display | flex |
| height | --li-a-height | 100% |
| justify-content | --li-a-justify-content | center |
| margin | --li-a-margin | 0 |
| text-decoration | --li-a-text-decoration | none |

### Selector: `:host nav ul li > a.active`

| Property | Variable | Default |
|----------|----------|----------|
| color | --li-a-color-active | black |

### Selector: `:host nav ul li:has(> a.active) + li > a`

| Property | Variable | Default |
|----------|----------|----------|
| border-left | --li-hover-a-active-border-left | 1px transparent solid |

### Selector: `@media only screen and (max-width: _max-width_)`

| Property | Variable | Default |
|----------|----------|----------|
| height | --li-height-mobile | var(--li-height |
| width | --li-width-mobile | var(--li-width |

### Selector: `:host nav ul li:has(> a.active) + li > a`

| Property | Variable | Default |
|----------|----------|----------|
| border-left | --li-hover-a-active-border-left-mobile | var(--li-hover-a-active-border-left |

