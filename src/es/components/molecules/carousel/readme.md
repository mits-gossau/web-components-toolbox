# Carousel

**Path:** `../src/es/components/molecules/carousel/Carousel.js`

## Summary

n/a

## Integration

n/a

## Templates (Namespace)

| Namespace | Path |
|------|------|
| carousel-default- | `./default-/default-.css` |
| carousel-emotion- | `./emotion-/emotion-.css` |
| carousel-portrait- | `./portrait-/portrait-.css` |

## Attributes

| Attribute Name | Description |
|----------------|-------------|
| `undefined` |  |
| `macro-carousel-selected-changed` |  |
| `sync-id` |  |
| `open-modal` |  |
| `interval` |  |
| `namespace` |  |

## CSS Styles

### Selector: `:host`

| Property | Variable | Default |
|----------|----------|----------|
| background | --background | none |

### Selector: `:host > macro-carousel`

| Property | Variable | Default |
|----------|----------|----------|
| width | --width | 100% |

### Selector: `:host > macro-carousel > *`

| Property | Variable | Default |
|----------|----------|----------|
| align-items | --align-items | center |
| flex-direction | --flex-direction | row |
| justify-content | --justify-content | center |

### Selector: `:host > macro-carousel > .container`

| Property | Variable | Default |
|----------|----------|----------|
| color | --color | red |

### Selector: `:host> macro-carousel >  macro-carousel-nav-button`


### Selector: `:host > macro-carousel > .container`

| Property | Variable | Default |
|----------|----------|----------|
| font-size | --font-size | 1em |

### Selector: `:host > macro-carousel > div > .text`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --text-background-color | red |

### Selector: `:host > macro-carousel > div > .text p`

| Property | Variable | Default |
|----------|----------|----------|
| padding | --text-padding | 0 |

### Selector: `:host .title`

| Property | Variable | Default |
|----------|----------|----------|
| position | --title-position | absolute |
| top | --title-top | 4vw |
| left | --title-left | 10vw |
| right | --title-right | 10vw |

### Selector: `:host .macro-carousel-previous, .macro-carousel-next`


### Selector: `:host([open-modal])`


### Selector: `:host([open]) > .close-btn`


### Selector: `:host(:not([open])) > .close-btn`


### Selector: `:host([open-modal]) > .close-btn`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --close-btn-background-color | var(--color-secondary |
| right | --close-btn-right | var(--content-spacing |
| bottom | --close-btn-bottom | var(--content-spacing |

### Selector: `:host([open-modal]) > .close-btn > span`


### Selector: `@media only screen and (max-width: _max-width_)`


### Selector: `:host > macro-carousel > div > .text p`

| Property | Variable | Default |
|----------|----------|----------|
| padding | --text-padding-mobile | 0 |

### Selector: `:host .macro-carousel-previous, :host .macro-carousel-next`


### Selector: `:host .title > h1.font-size-big`

| Property | Variable | Default |
|----------|----------|----------|
| font-size | --h1-font-size-mobile |  |

### Selector: `:host .title`

| Property | Variable | Default |
|----------|----------|----------|
| margin | --div-margin-mobile |  |

### Selector: `:host(:not([open-modal-mobile]))`


### Selector: `:host(:not([open-modal-mobile])) > .close-btn`


### Selector: `:host([open-modal-mobile]) > .close-btn`

| Property | Variable | Default |
|----------|----------|----------|
| right | --close-btn-right-mobile | var(--close-btn-right |
| bottom | --close-btn-bottom-mobile | var(--close-btn-bottom |

### Selector: `:host`

| Property | Variable | Default |
|----------|----------|----------|
| --macro-carousel-transition-duration | --transition-duration | 0.5s |

### Selector: `:host > #pagination`

| Property | Variable | Default |
|----------|----------|----------|
| position | --pagination-position |  |
| top | --pagination-top |  |
| bottom | --pagination-bottom |  |

### Selector: `:host div ::slotted(macro-carousel-pagination-indicator)`

| Property | Variable | Default |
|----------|----------|----------|
| --macro-carousel-pagination-color | --pagination-background-color | var(--background-color |
| --macro-carousel-pagination-color-selected | --pagination-background-color-selected | var(--background-color-selected |
| --macro-carousel-pagination-size-dot | --pagination-width | 12px |
| --macro-carousel-pagination-border-selected | --pagination-border-selected |  |
| opacity | --pagination-opacity | 1 |

### Selector: `:host div ::slotted(macro-carousel-nav-button)`

| Property | Variable | Default |
|----------|----------|----------|
| --macro-carousel-navigation-color | --navigation-color | var(--color |
| --macro-carousel-navigation-color-focus | --navigation-color-focus | var(--color-focus |
| --macro-carousel-navigation-color-background | --navigation-background-color | var(--background-color |
| --macro-carousel-navigation-color-background-focus | --navigation-background-color-focus | var(--navigation-background-color |
| --macro-carousel-navigation-button-size | --navigation-button-size | 6em |
| --macro-carousel-navigation-icon-size | --navigation-icon-size | 5em |

