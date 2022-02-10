document.body.addEventListener('wc-config-load', event => event.detail.imports.forEach(importPromise => importPromise.then(importEl => {
  //TODO fix path
  //console.log(importEl[3], location.origin)
    fetch(importEl[3].replace('./', `${location.origin}/`)).then(res => res.text()).then(file => console.log('changed', file))
  })))