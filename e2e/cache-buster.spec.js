/* global customElements */

const { test, expect } = require('@playwright/test')

test('named hash is propagated to component JavaScript, CSS, fetched HTML and fetched modules', async ({ page }) => {
  const assetRequests = []

  page.on('request', request => {
    if (/CacheBuster(?:Dependency)?\.(js|css|html)/.test(request.url())) assetRequests.push(request.url())
  })

  await page.goto('e2e/nested/cache-buster.html')
  await page.locator('x-cache-buster').first().waitFor({ state: 'attached' })
  await page.waitForFunction(() => customElements.get('x-cache-buster'))
  await page.waitForFunction(() => globalThis.cacheBusterImportPath)
  await page.waitForLoadState('networkidle')
  const hash = '20260813120000'
  const javaScriptRequest = assetRequests
    .map(url => new URL(url))
    .find(url => url.pathname === '/e2e/cache-buster/CacheBuster.js')
  const cssRequests = assetRequests
    .map(url => new URL(url))
    .filter(url => url.pathname === '/e2e/cache-buster/CacheBuster.css')
  const htmlRequests = assetRequests
    .map(url => new URL(url))
    .filter(url => url.pathname === '/e2e/cache-buster/CacheBuster.html')
  const moduleRequests = assetRequests
    .map(url => new URL(url))
    .filter(url => url.pathname === '/e2e/cache-buster/CacheBusterDependency.js')

  expect(javaScriptRequest).toBeDefined()
  expect(javaScriptRequest.searchParams.get('variant')).toBe('test')
  expect(javaScriptRequest.searchParams.getAll('hash')).toEqual([hash])
  expect(await page.evaluate(() => globalThis.cacheBusterImportPath)).toBe(`./e2e/cache-buster/CacheBuster.js?variant=test&hash=${hash}`)
  expect(cssRequests).toHaveLength(1)
  expect(cssRequests[0].searchParams.getAll('hash')).toEqual([hash])
  expect(htmlRequests).toHaveLength(1)
  expect(htmlRequests[0].searchParams.get('variant')).toBe('test')
  expect(htmlRequests[0].searchParams.getAll('hash')).toEqual([hash])
  expect(moduleRequests).toHaveLength(1)
  expect(moduleRequests[0].searchParams.get('variant')).toBe('test')
  expect(moduleRequests[0].searchParams.getAll('hash')).toEqual([hash])
})
