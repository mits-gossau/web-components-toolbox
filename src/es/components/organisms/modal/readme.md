# Modal

**Path:** `../src/es/components/organisms/modal/Modal.js`

## Summary

n/a

## Integration

n/a

## Templates (Namespace)

| Namespace | Path |
|------|------|
| null | `./default-/default-.css` |

## Attributes

| Attribute Name | Description |
|----------------|-------------|
| `listen-at` |  |
| `open-modal` |  |
| `namespace` |  |
| `media` |  |

## CSS Styles

### Selector: `:host > section`


### Selector: `:host([open]) > section`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --background-color | rgba(0 |
| height | --height | 100% |
| padding | --padding | min(var(--content-spacing |
| position | --position | fixed |
| left | --left | 0 |
| top | --top | 0 |
| transition | --transition | opacity .3s |
| width | --width | 100% |
| z-index | --z-index | 9999 |

### Selector: `:host([open]) > section > div`

| Property | Variable | Default |
|----------|----------|----------|
| position | --div-position | static |
| align-items | --align-items | end |
| display | --display | flex |
| flex-direction | --flex-direction | column-reverse |
| justify-content | --justify-content | center |

### Selector: `:host([open]) > section > div > #close`

| Property | Variable | Default |
|----------|----------|----------|
| display | --close-display | block |
| position | --close-position | static |
| top | --close-top | auto |
| right | --close-right | auto |
| bottom | --close-bottom | auto |
| left | --close-left | auto |
| margin | --close-margin | 0 0 var(--content-spacing |

### Selector: `:host([open]) > section > div > button#close.close-btn`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --close-btn-background-color | var(--color-secondary |

### Selector: `:host([open]) > section > div > button#close.close-btn span`


### Selector: `@media only screen and (max-width: _max-width_)`


### Selector: `:host([open]) > section`

| Property | Variable | Default |
|----------|----------|----------|
| padding | --padding-mobile | var(--padding |

### Selector: `:host([open]) > section > div > #close`

| Property | Variable | Default |
|----------|----------|----------|
| margin | --close-margin-mobile | var(--close-margin |

