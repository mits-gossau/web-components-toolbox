// Example: <template mock pathname="/Umbraco/Api/CourseApi/SearchPartner" response>
// Attributes: mock (required - has), pathname (rest api url pathname - string), payload (optional - has), response (optional - has), timeout (optional - number)

import { Shadow } from '../components/prototypes/Shadow.js'

let templates = []
const payloads = new Map()
const responses = new Map()
self.addEventListener('wc-config-load', event => {
  templates = Shadow().walksDownDomQueryMatchesAll(document.body, 'template[mock]')
  templates.forEach(template => {
    if (template.getAttribute('pathname')) {
      try {
        (template.hasAttribute('payload') ? payloads : responses).set(template.getAttribute('pathname'), {
          data: JSON.parse(template.content.textContent),
          string: template.content.textContent,
          template
        })
      } catch (error) {
        console.error('Could not parse mock template:', { template, error })
      }
    }
  })
})
const _fetch = self.fetch
self.fetch = (...args) => {
  try {
    const url = new URL(args[0])
    const payload = payloads.get(url.pathname)
    const response = responses.get(url.pathname)
    if (payload || response) {
      console.info(`****mocking ${url.pathname} ${payload ? `payload${response ? ' and response mocking got ignored!' : ''}` : 'response'}*****`, { args, url, payload, response })
      // payload
      if (payload) {
        args[1].body = payload.string
      } else {
        // response
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve(new Response(response.string, {
              headers: args[1] ? args[1] : {},
              status: '200',
              ok: true,
              statusText: `mocked, look into the console.info ****mocking ${url.pathname}*****`
            }))
          // give the response a little time for the call to be aborted
          }, response.template.getAttribute('timeout') || 200)
          // in case signal.abort() is triggered
          args[1]?.signal?.addEventListener('abort', event => {
            clearTimeout(timeout)
            reject(`****mocking ${url.pathname} aborted *****`)
          })
        }).catch(error => new Response(response.string, {
          headers: args[1] ? args[1] : {},
          status: '420', // https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
          ok: false,
          statusText: error
        }))
      }
    }
  } catch (error) {
    console.error(`****mocking ${url.pathname} tried but got an error *****`, { args, error })
  }
  return _fetch(...args)
}
