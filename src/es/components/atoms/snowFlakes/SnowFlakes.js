// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

/** @type {(any)=>void} */
let gameResolve = map => map
/** @type {Promise<string>} */
const game = new Promise(resolve => (gameResolve = resolve))
// mouse movements
let movement = [0, 0]
// passing attributes
let spawnMin = 3
let spawnMax = 9
let disappear = 60000
/**
* @export
* @class SnowFlakes
* @type {CustomElementConstructor}
*/
export default class SnowFlakes extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    if (this.hasAttribute('spawn-min')) spawnMin = Number(this.getAttribute('spawn-min'))
    if (this.hasAttribute('spawn-max')) spawnMax = Number(this.getAttribute('spawn-max'))
    if (this.hasAttribute('disappear')) disappear = Number(this.getAttribute('disappear'))

    let timeout
    this.mousemoveEventListener = event => {
      movement = [event.movementX, event.movementY]
      clearTimeout(timeout)
      timeout = setTimeout(() => (movement = [0, 0]), 5)
    }
  }

  connectedCallback () {
    self.addEventListener('click', () => {
      if (this.shouldRenderHTML()) this.renderHTML()
    }, { once: true })
    document.addEventListener('mousemove', this.mousemoveEventListener)
  }

  disconnectedCallback () {
    document.removeEventListener('mousemove', this.mousemoveEventListener)
  }

  /**
  * evaluates if a render is necessary
  *
  * @return {boolean}
  */
  shouldRenderHTML () {
    return !this.getScript()
  }

  /**
  * Render HTML
  * @returns void
  */
  renderHTML () {
    // Phaser Bundled expects exports in the global scope
    self.exports = {}
    this.loadDependency('Phaser', 'https://cdn.jsdelivr.net/npm/phaser@3.85.2/dist/phaser.js').then(Phaser => {
      document.body.setAttribute('style', `${document.body.getAttribute('style') || ''}margin: 0;`)
      const config = {
        type: Phaser.AUTO,
        canvasStyle: `
          margin: 0;
          padding: 0;
          position: fixed;
          top: 0;
          left: 0;
          image-rendering: pixelated;
          pointer-events: none;
          z-index: 100001;
        `,
        width: '100%',
        height: '100%',
        parent: 'game-container',
        transparent: !this.hasAttribute('debugger'),
        pixelArt: true,
        physics: {
          default: 'matter',
          matter: {
            gravity: { y: 0.05 },
            debug: this.hasAttribute('debugger')
          }
        },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        scene: [
          createBootScene(this.importMetaUrl, Phaser.Scene),
          createPreloaderScene(this.importMetaUrl, Phaser.Scene, Phaser),
          createGameScene(this.importMetaUrl, Phaser.Scene, Phaser)
        ]
      }
      this.game = new Phaser.Game(config)
      gameResolve(this.game)
    })
  }

  /**
  * fetch dependency
  *
  * @returns {Promise<any>}
  */
  loadDependency (globalNamespace, url) {
    // make it global to self so that other components can know when it has been loaded
    return this[`#loadDependency${globalNamespace}`] || (this[`#loadDependency${globalNamespace}`] = new Promise((resolve, reject) => {
      // @ts-ignore
      if (this.getScript(globalNamespace) || self[globalNamespace]) return resolve(self[globalNamespace])
      // TODO: Add Sha-256 check
      const script = document.createElement('script')
      script.setAttribute('type', 'module')
      script.setAttribute('id', globalNamespace)
      script.setAttribute('src', url)
      // @ts-ignore
      script.onload = () => self[globalNamespace]
      // @ts-ignore
        ? resolve(self[globalNamespace])
        : reject(new Error(`${globalNamespace} does not load into the global scope!`))
      this.html = script
    }))
  }

  getScript (globalNamespace) {
    return this.root.querySelector(`${globalNamespace ? `#${globalNamespace}` : 'script'}`)
  }
}

// Scenes *******************************************************************************************************************************************************
// BootScene (is empty but set for preloading PreloaderScene assets eg. loading icon...)
const createBootScene = (importMetaUrl, Scene) => class Boot extends Scene {
  constructor () {
    super('Boot')
  }

  preload () {
  }

  create () {
    this.scene.start('Preloader')
  }
}

// PreloaderScene (preload all assets needed for the GameScene)
const createPreloaderScene = (importMetaUrl, Scene, Phaser) => class Preloader extends Scene {
  constructor () {
    super('Preloader')
  }

  preload () {
    this.load.spritesheet('snowflakes', `${importMetaUrl}./assets/snowflakes.png`, { frameWidth: 17, frameHeight: 17 })
    this.load.spritesheet('snowflakes_large', `${importMetaUrl}./assets/snowflakes_large.png`, { frameWidth: 64, frameHeight: 64 })
  }

  create () {
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      this.scene.start('Game')
    })
    this.load.start()
  }
}

// GameScene (the whole scenery and game behavior is in this Game Class)
const createGameScene = (importMetaUrl, Scene, Phaser) => class Game extends Scene {
  constructor () {
    super('Game')
  }

  init () {
    self.addEventListener('mouseup', event => {
      for (let i = 0; i < Phaser.Math.Between(spawnMin, spawnMax); i++) {
        const body = this.emit(event)
        this.tweens.add({
          targets: body,
          alpha: 0,
          scaleX: 0,
          scaleY: 0,
          duration: disappear,
          ease: 'Sine.easeOut',
          onComplete: () => body.destroy()
        })
      }
    })
    let lastScrollHeight = document.body.scrollHeight
    self.addEventListener('scroll', event => {
      this.cameras.main.setScroll(0, self.scrollY)
      if (lastScrollHeight !== document.body.scrollHeight) this.setBound()
      lastScrollHeight = document.body.scrollHeight
    })
  }

  create () {
    this.setBound()
  }

  emit (event) {
    let isLargeFlake = false
    const body = this.matter.add.image(event.clientX, event.clientY + this.cameras.main.scrollY, (isLargeFlake = Phaser.Math.Between(0, 1)) ? 'snowflakes_large' : 'snowflakes', Phaser.Math.Between(0, 5), {
      // https://newdocs.phaser.io/docs/3.60.0/Phaser.Types.Physics.Matter.MatterBodyConfig
      density: 0.0000001,
      restitution: 0.001,
      friction: 1,
      frictionAir: 100
    })
    body.setCircle(isLargeFlake ? 15 : 4)
    body.setBounce(0)
    body.setRotation(Phaser.Math.Between(0, 360))
    body.setVelocityX(movement[0])
    body.setVelocityY(movement[1])
    return body
  }

  setBound () {
    this.matter.world.setBounds(-50, -50, this.cameras.main.width + 100, document.body.scrollHeight + 50)
  }
}
