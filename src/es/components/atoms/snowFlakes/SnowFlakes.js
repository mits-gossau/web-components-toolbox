// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

/** @type {(any)=>void} */
const gameResolve = map => map
/** @type {Promise<string>} */
// const game = new Promise(resolve => (gameResolve = resolve))

/**
* @export
* @class SnowFlakes
* @type {CustomElementConstructor}
*/
export default class SnowFlakes extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    this.keyupListener = event => {
      // ctrl + shift + escape
      if (event.key === 'Escape' && event.ctrlKey && event.shiftKey && this.shouldRenderHTML()) this.renderHTML()
    }
  }

  connectedCallback () {
    // TODO: - [ ] Mobile/Touch-Screen Easter Egg Trigger
    document.addEventListener('keyup', this.keyupListener)
  }

  disconnectedCallback () {
    document.removeEventListener('keyup', this.keyupListener)
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
    // example code ➴ ➴ ➴
    this.html = '<h1 style="color: red;">Easter Egg - Triggered</h1>'
    // example code ➶ ➶ ➶
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
        `,
        width: '100%',
        height: '100%',
        parent: 'game-container',
        transparent: true,
        pixelArt: true,
        physics: {
          default: 'matter',
          matter: {
            gravity: { y: 0.05 },
            debug: true
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

// TODO: - [ ] Load assets dynamically by including a json in a template tag placed inside <a-easter-egg>
// TODO: - [ ] Design rocket effect with:
// - [ ] tween for rocket from random edge to center of the screen
// - [ ] emitter for fire
// - [ ] rocket sound
// - [ ] rocket explosion with emitter
// - [ ] dynamic picture, text + sound (loaded through json as described above), which then ejects out from the rocket eg.: https://hammertime.studio/en/firestarter

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
    //this.load.spritesheet('snowflakes', `${importMetaUrl}./assets/snowflakes.png`, 17, 17)
    this.load.spritesheet('snowflakes_large', `${importMetaUrl}./assets/snowflakes_large.png`, 64, 64)
  }

  create () {
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      // example code ➴ ➴ ➴
      this.add.text(200, 200, 'Loading...', { fill: '#00ff00', fontSize: '60px' })
      // example code ➶ ➶ ➶
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
    self.addEventListener('click', event => {
      /*console.log('changed', event);
      const migi = this.matter.add.image(event.layerX, event.layerY, 'migi', {
        // https://newdocs.phaser.io/docs/3.60.0/Phaser.Types.Physics.Matter.MatterBodyConfig
        density: 0.0001,
        friction: 1,
        frictionAir: 100
      })
      migi.setCircle()
      migi.setBounce(0)
      migi.setScale(0.2, 0.2)
      console.log('changed', migi);*/
    })
  }

  create () {
    this.matter.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height)
  }
}
