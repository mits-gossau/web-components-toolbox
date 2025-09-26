/* global self */

/**
 * Makes sure to have finished scrolling to the element, even if content on its way is lazy loaded and changing the scrollHeight. 
 * Ether supply a selector making sure it is not yet intersecting e.g.: ':not([intersecting])' or it will calculate the position in screen ether on window (self) or the parent scroll element
 * 
 * @function
 * @name scrollElIntoView
 * @kind variable
 * @param {()=>HTMLElement | null | undefined} getScrollElFunc
 * @param {string | null} [notIntersectingSelector=null]
 * @param {Window | HTMLElement} [parentScrollEl=Window]
 * @param {ScrollIntoViewOptions} [options={behavior: 'smooth'}]
 * @param {number} [timeout=50]
 * @param {number} [counter=0]
 * @param {number} [counterMax=15]
 * @returns {void}
 * @exports
 */
export const scrollElIntoView = (getScrollElFunc, notIntersectingSelector = null, parentScrollEl = self, options = { behavior: 'smooth' }, timeout = 50, counter = 0, counterMax = 15) => {
  counter++
  const scrollEl = getScrollElFunc()
  if (!scrollEl) return
  scrollEl.scrollIntoView(options)
  setTimeout(() => {
    const scrollEl = getScrollElFunc()
    if (!scrollEl) return
    let scrollElBoundingClientRect, parentScrollElBoundingClientRect
    if (counter < counterMax 
      && ((notIntersectingSelector && scrollEl.matches(notIntersectingSelector))
      || ((scrollElBoundingClientRect = scrollEl.getBoundingClientRect()) && (parentScrollElBoundingClientRect = parentScrollEl === self ? { y: 0, height: parentScrollEl.innerHeight } : parentScrollEl.getBoundingClientRect())
        && (Math.round(scrollElBoundingClientRect.y) < Math.round(parentScrollElBoundingClientRect.y) || Math.round(scrollElBoundingClientRect.y + scrollElBoundingClientRect.height) > Math.round(parentScrollElBoundingClientRect.y + parentScrollElBoundingClientRect.height))))
    ) {
      // when counterMax recursion is not yet reached
      // and it is ether not intersecting by the notIntersectingSelector or the bounding client rect position relative to window (self) or a parentScrollEl
      // then repeat this function
      if (counter > 2) options.behavior = 'instant'
      scrollElIntoView(getScrollElFunc, notIntersectingSelector, parentScrollEl, options, timeout, counter, counterMax)
    } else {
      // if counter hit counterMax
      // or the element is intersecting by the notIntersectingSelector or the bounding client rect position relative to window (self) or a parentScrollEl
      // then scroll a last time with an insisting reinforcement after 50ms
      options.behavior = 'instant'
      scrollEl.scrollIntoView(options)
      options.behavior = 'smooth'
      setTimeout(() => scrollEl.scrollIntoView(options), 50)
    }
  }, timeout)
}
