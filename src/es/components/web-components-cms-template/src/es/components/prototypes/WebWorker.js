// @ts-check

/* global Blob */
/* global BlobBuilder */
/* global HTMLElement */
/* global self */
/* global Worker */

/**
 * WebWorker is a helper which executes simple functions inside a webworker (spans one worker per function)
 *
 * @export
 * @function WebWorker
 * @param {CustomElementConstructor} ChosenHTMLElement
 * @property {
      webWorker,
      getWebWorkerPromise,
      webWorkerMap,
      self._webWorkerMap
    }
 * @return {CustomElementConstructor | *}
 */
export const WebWorker = (ChosenHTMLElement = HTMLElement) => class WebWorker extends ChosenHTMLElement {
  /**
   * Convert function to web worker and receive a promise returning the results
   * more Infos at: https://github.com/Weedshaker/ProxifyJS/blob/master/JavaScript/Classes/Helper/Misc/WebWorkers.js
   *
   * @param {function|string} func
   * @param {any[]} args
   * @return {Promise<any>}
   */
  webWorker (func, ...args) {
    const key = func = typeof func === 'string' ? func : func.toLocaleString()
    if (this.webWorkerMap.has(key)) {
      const { worker, promise } = this.webWorkerMap.get(key)
      const newPromise = WebWorker.getWebWorkerPromise(worker, args, promise)
      this.webWorkerMap.set(key, { worker, promise: newPromise })
      return newPromise
    }
    func = func.replace(/this\./g, '')
    func = /^.*?=>.*?/.test(func) ? `(${func})` : !/^function/.test(func) ? `function ${func}` : func
    const response = `onmessage=(event)=>{postMessage(${func}(...event.data))}`
    let blob
    try {
      blob = new Blob([response], { type: 'application/javascript' })
    } catch (e) { // Backwards-compatibility
      // @ts-ignore
      self.BlobBuilder = self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder
      // @ts-ignore
      blob = new BlobBuilder()
      blob.append(response)
      blob = blob.getBlob()
    }
    const worker = new Worker(URL.createObjectURL(blob))
    const promise = WebWorker.getWebWorkerPromise(worker, args)
    this.webWorkerMap.set(key, { worker, promise })
    return promise
  }

  /**
   * @static
   * @param {Worker} worker
   * @param {any[]} args
   * @param {Promise<any>|null} [promise=null]
   * @return {Promise<any>}
   */
  static getWebWorkerPromise (worker, args, promise = null) {
    return new Promise((resolve, reject) => {
      const triggerWorker = () => {
        worker.onmessage = (e) => resolve(e.data)
        worker.onerror = (e) => reject(e)
        worker.postMessage(args) // can only have one argument as message
      }
      promise ? promise.finally(() => triggerWorker()) : triggerWorker()
    })
  }

  /**
   * @return {Map<string, {worker: Worker, promise: Promise<any>}>}
   */
  get webWorkerMap () {
    // @ts-ignore
    return self._webWorkerMap || (self._webWorkerMap = new Map())
  }
}
