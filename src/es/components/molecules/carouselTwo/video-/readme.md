# CarouselTwo – Video-Only (Museum)

Namespace: `carousel-two-video-museum-`

Zweck: Video-Karussell für mehrere Videos (YouTube, Vimeo und lokale Videos). Einheitliche Höhe unabhängig von Video-Ratio. Interface identisch zum Bild-Carousel (`carousel-two-museum-`).

## Features
- Unterstützt `<a-iframe>` (YouTube/Vimeo) und `<a-video>` (lokale Videos) gemischt
- Einheitliche Höhe via `aspect-ratio`-Container, Default `--video-aspect: 16/9`
- Play-Overlay: Weisses Dreieck auf halbtransparentem Hintergrund, startet Video bei Klick
- Pfeile: Unsichtbar mit Custom-SVG-Cursor (identisch zu `carousel-two-museum-`), nur 15% Randzonen klickbar
- Pfeile werden bei Video-Play automatisch deaktiviert, bei Pause/Ende wieder aktiviert
- Video-Unterschriften via `<p class="video-caption">` unterhalb des Videos
- Dots im Museum-Stil (`nav-color`-Attribut), linksbündig
- Mobile: Swipen per Touch, Snap-to-Slide

## Verwendung

### YouTube + Vimeo (a-iframe)
```html
<m-carousel-two namespace="carousel-two-video-museum-" nav-separate nav-align-self="end" nav-color="yellow" background-color="green">
  <section>
    <div>
      <a-iframe>
        <template>
          <iframe src="https://player.vimeo.com/video/76979871?dnt=1&title=0&byline=0&portrait=0&color=000000"
                  width="640" height="360"
                  allow="autoplay; fullscreen; picture-in-picture"
                  title="Vimeo Video"></iframe>
        </template>
      </a-iframe>
      <p class="video-caption">Beschreibung des Videos</p>
    </div>
    <div>
      <a-iframe>
        <template>
          <iframe src="https://www.youtube.com/embed/aqz-KE-bpKQ"
                  width="640" height="360"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  title="YouTube Video"></iframe>
        </template>
      </a-iframe>
      <p class="video-caption">Beschreibung des Videos</p>
    </div>
  </section>
</m-carousel-two>
```

### Lokale Videos (a-video)
```html
<div>
  <a-video controls>
    <source type="video/mp4" src="/path/to/video.mp4">
  </a-video>
  <p class="video-caption">Beschreibung des Videos</p>
</div>
```

## Konfiguration
- Attribute auf `<m-carousel-two>`:
  - `nav-color`: Farbe der Dots und Video-Unterschriften (z.B. `"yellow"`)
  - `background-color`: Hintergrundfarbe für Unterschriften-Bereich
  - `nav-separate nav-align-self="end"`: Dots unterhalb der Videos
- CSS-Variablen:
  - `--video-aspect`: Standard `16/9`
  - `--video-max-height`: Standard `70dvh` (Mobile `55dvh`)

## Pfeil-Verhalten bei Video-Playback
- **a-iframe (YouTube/Vimeo)**: Pfeile deaktiviert bei Play, reaktiviert bei Pause/Ende (via postMessage API)
- **a-video (lokal)**: Pfeile deaktiviert bei Play, reaktiviert bei Pause/Ende (via native Video-Events)
- **Slide-Wechsel**: Pfeile werden immer reaktiviert
