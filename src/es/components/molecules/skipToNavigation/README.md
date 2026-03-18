# SkipToNavigation

Barrierefreie Skip-Links-Komponente gemäss [WCAG 2.4.1 (Bypass Blocks)](https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html). Ermöglicht Tastaturnutzern, direkt zu den Hauptbereichen der Seite zu springen.

## Verwendung

```html
<m-skip-to-navigation
    namespace="skip-to-navigation-default-"
    host="o-body"
>
    <a href="#content">Skip to main content</a>
    <a href="#navigation">Skip to navigation</a>
    <a href="#footer">Skip to footer</a>
</m-skip-to-navigation>
```

Die Ziel-IDs (`#content`, `#navigation`, `#footer`) müssen als `id`-Attribute auf den entsprechenden Seitenbereichen vorhanden sein:

```html
<main id="content">…</main>
<nav id="navigation">…</nav>
<footer id="footer">…</footer>
```

## Steuerung

### Tab-Navigation

| Aktion | Beschreibung |
|---|---|
| `Tab` | Skip-Links-Bereich wird sichtbar, Fokus wandert durch die Links |
| `Enter` | Aktiviert den fokussierten Link und setzt den Fokus auf das Ziel |
| `Escape` | Schliesst den Skip-Links-Bereich |
| `Shift + Tab` | Rückwärts durch die Links navigieren |

Der Bereich schliesst sich automatisch, wenn der Fokus ihn verlässt (z. B. durch Weiter-Tabben nach dem letzten Link).

### Accesskeys

Direkter Sprung zu einem Seitenbereich über Tastenkombination:

| Accesskey | Ziel |
|---|---|
| `1` | Hauptinhalt (`#content`) |
| `2` | Navigation (`#navigation`) |
| `3` | Footer (`#footer`) |

**Aktivierung je nach Browser/OS:**

| Betriebssystem | Browser | Tastenkombination |
|---|---|---|
| macOS | Safari, Chrome, Edge | `Ctrl + ⌥ (Option) + Zahl` |
| macOS | Firefox | `Alt (⌥) + Shift + Zahl` |
| Windows / Linux | Chrome, Edge, Firefox | `Alt + Zahl` |

### Fokus nach Sprung

Nach Aktivierung eines Skip-Links wird der Fokus auf das erste interaktive Element (Link, Button, Input) oder die erste Überschrift im Zielbereich gesetzt. Falls keines vorhanden ist, erhält der Zielcontainer selbst den Fokus.

## Attribute

| Attribut | Typ | Beschreibung |
|---|---|---|
| `namespace` | `string` | CSS-Namespace für Styling (z. B. `skip-to-navigation-default-`) |
| `host` | `string` | Host-Element für Shadow-DOM-Rendering |

## Events

| Event | Beschreibung |
|---|---|
| `open-and-focus-nav` | Wird ausgelöst, wenn der Navigations-Link aktiviert wird |
| `open-and-focus-footer` | Wird ausgelöst, wenn der Footer-Link aktiviert wird |
| `close-other-flyout` | Wird ausgelöst, wenn ein anderer Link (nicht Navigation) aktiviert wird |

## Demo

Lokale Demo-Datei: [`default-/default-.html`](default-/default-.html)
