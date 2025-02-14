// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

/**
 * Example at: /src/es/components/pages/Home.html
 *
 * @export
 * @class TagManager
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} id
 *  {boolean} test-mode
 *  {has} [wc-config-load=n.a.] trigger the render
 *  {number} [timeout=n.a.] timeout to trigger the render
 * }
 * @example {
    <c-tag-manager id="GTM-XXXXXX" test-mode="true" wc-config-load>
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    </c-tag-manager>
 * }
 */
export default class TagManager extends Shadow() {
  constructor (...args) {
    super({ mode: 'false' }, ...args) // disabling shadow-DOM to have msrc styles flow into the node

    this.wcConfigLoadListener = event => {
      if (this.getAttribute('timeout') && this.getAttribute('timeout') !== null) {
        setTimeout(() => {
          if (this.shouldRenderHTML()) this.render()
        }, Number(this.getAttribute('timeout')))
      } else if (this.shouldRenderHTML()) this.render()
    }
  }

  connectedCallback () {
    if (this.hasAttribute('wc-config-load')) {
      document.body.addEventListener(this.getAttribute('wc-config-load') || 'wc-config-load', this.wcConfigLoadListener, { once: true })
    } else if (this.getAttribute('timeout') && this.getAttribute('timeout') !== null) {
      setTimeout(() => {
        if (this.shouldRenderHTML()) this.render()
      }, Number(this.getAttribute('timeout')))
    } else if (this.shouldRenderHTML()) this.render()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.scripts.length
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  render () {
    let script
    if ((script = this.setup())) this.html = script
  }

  /**
   * setup tag manager
   *
   * @param {string} [gtmId=this.getAttribute('id') || 'GTM-XXXXXX']
   * @return {HTMLScriptElement|false}
   */
  setup (gtmId = this.getAttribute('id') || 'GTM-XXXXXX', testMode = this.getAttribute('test-mode') || false) {
    // IMPORTANT: Avoid that the tag manager injected code stops page at "beforeunload"
    /* self._addEventListener = self.addEventListener
    self.addEventListener = (...args) => {
      if (args[0] === 'beforeunload') return
      self._addEventListener(...args)
    } */
    // prefetch or pre connect o the iframes src
    if (this.hasAttribute('prefetch')) {
      const linkAnalytics = document.createElement('link')
      linkAnalytics.setAttribute('rel', 'dns-prefetch')
      linkAnalytics.setAttribute('href', 'https://www.google-analytics.com')
      document.head.appendChild(linkAnalytics)
      const linkManager = document.createElement('link')
      linkManager.setAttribute('rel', 'dns-prefetch')
      linkManager.setAttribute('href', 'https://www.googletagmanager.com')
      document.head.appendChild(linkManager)
    }
    // @ts-ignore
    self.dataLayer = self.dataLayer || []
    // cookie domain error when only localhost in url bar (only for local debugging)
    if (self.location.hostname !== 'localhost' || testMode) {
      const script = document.createElement('script')
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`
      return script
    }
    return false
  }

  get scripts () {
    return this.root.querySelectorAll('script')
  }

  // MIDUCA GTM CUSTOM HTML SCRIPTS - klubschule.ch | ibaw.ch | ksos-business.ch - November 2024
  // TODO: rewrite es5 to es6
  // TODO: bug fixes are not included 1. ERROR: document.getAttribute(...) 2. sending too much data
  startExtendedGlobalEventCollecting () {
    // awaiting update
    // https://jira.migros.net/secure/attachment/1038435/GTM%20Script_250214.txt
    this.extendedGlobalEventCollectingBodyElements()
    this.extendedGlobalEventCollectingSocialMediaIcons()
    this.extendedGlobalEventCollectingClicksScript()
    this.extendedGlobalEventCollectingHeaderFooter()
    this.extendedGlobalEventCollectingHeaderCleanUp()
  }

  // page 3
  // Body Elements
  // This script catches the body elements, precisely the teasers and the stories.
  extendedGlobalEventCollectingBodyElements () {
    (function() {
      // Set to the event you want to track
      var eventName = 'click';
      var useCapture = true;
      var callback = function(event) {
        if ('composed' in event && typeof event.composedPath === 'function') {
          var path = event.composedPath();
          // Iterate through the path to find the element with the tag 'ks-m-teaser'
          for (var i = 0; i < path.length; i++) {
            var targetElement = path[i];
            if (targetElement.tagName && targetElement.tagName.toLowerCase() === 'ks-m-teaser') {
              var dataLayerObject = {
                event: 'custom_event_click',
                element: targetElement,
                id: targetElement.id || ''
              };
              // Iterate over attributes using a traditional for loop
              var attributes = targetElement.attributes;
              for (var j = 0; j < attributes.length; j++) {
                var attr = attributes[j];
                dataLayerObject[attr.name] = attr.value;
              }
              // Push to dataLayer
              window.dataLayer.push(dataLayerObject);
              break;
            }
          }
        }
      };
      document.addEventListener(eventName, callback, useCapture);
    })();
  }

  // page 4
  // Social Media Icons
  // This script catches the social media icons when they are clicked, basically catches their attributes.
  extendedGlobalEventCollectingSocialMediaIcons () {
    (function() {
      // Set to the event you want to track
      var useCapture = true;
  
      var callback = function(event) {
        if ('composed' in event && typeof event.composedPath === 'function') {
          var path = event.composedPath();
    
          var elementTags = [];
          for (var i = 0; i < path.length; i++) {
            var tagName = path[i].tagName;
            if (tagName) {
              var className = path[i].className;
              if (className) elementTags.push(tagName.toLowerCase() + '.' + className);
              else elementTags.push(tagName.toLowerCase());
            }
            else elementTags.push('');
          };
  
          // Check if the click was on a social media icon (which are <a> tags)
          var isSocialLink = false;
          for (var i = 0; i < path.length; i++) {
            if (path[i].classList && path[i].classList.contains('social-links')) {
              isSocialLink = true;
              break;
            }
          }
  
          if (elementTags.includes('a') && isSocialLink) {
            var targetElement = path[elementTags.indexOf('a')];
            
            var dataLayerObject = {
              event: 'social_icon.click',
              target: targetElement.getAttribute('href'),
              text: targetElement.textContent.trim(),
              className: targetElement.className || '',
            };
            window.dataLayer.push(dataLayerObject);
          }
        }
      };
      
      document.addEventListener('click', callback, useCapture);
    })();
  }
  // page 5
  // All Clicks Script
  // This script pushes all the attributes of the clicked elements, like 90% of the elements.
  extendedGlobalEventCollectingClicksScript () {
    var customClickAttached;
    customClickAttached = customClickAttached || false;

    if (customClickAttached === false) {
      (function() {
        function elementToString(currentElement) {
          var string = '';

          var element = '';
          if (currentElement.tagName !== undefined) {
            element = currentElement.tagName.toLowerCase();
          }

          var id = '';
          if (currentElement.id !== undefined) {
            id = currentElement.id; 
          }

          var classes = [];
          if (currentElement.classList !== undefined) {
            for (var i = 0; i < currentElement.classList.length; i++) {
              classes.push(currentElement.classList[i]);
            }
          }

          string += element;

          if (id !== '') {
            string += '#' + id;
          }

          if (classes.length > 0) {
            string += '.' + classes.join('.');
          }

          return string;
        }

        function pathToString(path) {
          return path.reduce(
            function (previousValue, currentElement) {
              var string = '';

              var currentElementString = elementToString(currentElement);

              if (currentElementString !== '') {
                string = currentElementString;
              }

              if (currentElementString === '') {
                string = previousValue;
              }

              if (currentElementString !== '' && previousValue !== '') {
                string = currentElementString + ' > ' + previousValue;
              }

              return string;
            },
            ''
          );
        }
        
        function closestInPath(tagName, path) {
          var tagNameUppercase = tagName.toUpperCase();
          
          return path.reduce(function(previous, current) {
            return (previous !== null && previous.tagName === tagNameUppercase) ? previous : current.tagName === tagNameUppercase ? current : null;
          }, null);
        }
        
        // Declare the function outside of the block
        function getAllAttributes(element) {
          var attrs = [];
          if (element.attributes) {
            for (var i = 0; i < element.attributes.length; i++) {
              var attr = element.attributes[i];
              attrs.push(attr.name + '="' + attr.value + '"');
            }
          }
          if (element.shadowRoot) {
            var shadowChildren = element.shadowRoot.children;
            for (var j = 0; j < shadowChildren.length; j++) {
              attrs = attrs.concat(getAllAttributes(shadowChildren[j]));
            }
          }
          return attrs.join(' ');
        }
        
        function customClick(event) {
          if ('composed' in event && typeof event.composedPath === 'function') {
            var path = event.composedPath();

            var targetElementPath = pathToString(path);
            
            var formElement = closestInPath('FORM', path);

            if (path[0] !== null) {
              var attributesString = '';
              for (var i = 0; i < path[0].attributes.length; i++) {
                var attr = path[0].attributes[i];
                attributesString += attr.name + '="' + attr.value + '" ';
              }

              var dataset = {};
              for (var key in path[0].dataset) {
                if (path[0].dataset.hasOwnProperty(key)) {
                  dataset[key] = path[0].dataset[key];
                }
              }

              var allAttributes = getAllAttributes(path[0]);

              window.dataLayer.push({
                event: 'custom.click',
                element: targetElementPath, // This is the JS path of the clicked element
                elementId: path[0].id || '',
                elementClasses: path[0].className || '',
                elementUrl: path[0].href || path[0].action || '',
                elementTarget: path[0].target || '',
                elementContent: path[0].textContent || '',
                elementTagName: path[0].tagName || '',    
                elementDataset: JSON.stringify(dataset) || '',
                elementInnerHTML: String(path[0].innerHTML) || '',
                elementNamespace: path[0].namespaceURI || '',
                elementAttributes: attributesString || '',
                clickText: path[0].innerText || '',
                originalEvent: event,
                elementValue: path[0].value || '',
                elementType: path[0].type || '',
                path: targetElementPath,
              }); 
            }
          }
        }

        document.addEventListener('click', customClick);
      })();
    }
    customClickAttached = true;
  }

  // page 9
  // Header & Footer
  // This script pushes the clicked values of the header and footer navigation menu.
  extendedGlobalEventCollectingHeaderFooter () {
    (function() {
      // Set to the event you want to track
      var useCapture = true;
  
      var callback = function(event) {
        if ('composed' in event && typeof event.composedPath === 'function') {
          var path = event.composedPath();
    
          var elementTags = [];
          for (var i = 0; i < path.length; i++) {
            var tagName = path[i].tagName;
            if (tagName) {
              var className = path[i].className;
              if (className) elementTags.push(tagName.toLowerCase() + '.' + className);
              else elementTags.push(tagName.toLowerCase());
            }
            else elementTags.push('');
          };
          console.log('TAGS-list: ', elementTags);
          console.log('TAGS: ', path);
          
          
          // Top-header: text: a.only-desktop
          // Header: contains m-multi-level-navigation, text: <span>, link <a>
          // Body elements: links <ks-m-teaser>, text <figcaption>
          // Footer: text <a>, header div.footer-links-row contains-details
          
          if (elementTags.includes('a.only-desktop')) {
            var targetElement = path[elementTags.indexOf('a.only-desktop')];
            var link = targetElement.getAttribute('href');
            var text = targetElement.textContent.trim();
  
            var dataLayerObject = {
              event: 'custom_event_click_header',
              target: link,
              text: text,
              category: 'top_headers'
            };
            window.dataLayer.push(dataLayerObject);
          } 
          else if (elementTags.includes('m-multi-level-navigation')) {
            if (elementTags.includes('m-nav-level-item')) {
              var targetElement = path[elementTags.indexOf('m-nav-level-item')];
              var link = targetElement.parentElement.getAttribute('href');
              var text = targetElement.shadowRoot.querySelector('span').textContent.trim();
              var parent = targetElement.parentElement.parentElement.parentElement.getAttribute('mobile-navigation-name').trim();
            } else {
              var targetElement = path[elementTags.indexOf('a')];
              var link = targetElement.getAttribute('href');
              var text = targetElement.querySelector('span').textContent.trim();
              var parent = '';
            }
            
            var dataLayerObject = {
              event: 'custom_event_click_header',
              target: link,
              text: text,
              category: parent
            };
            window.dataLayer.push(dataLayerObject);
          } else if (elementTags.includes('ks-m-teaser.intersecting')) {
            var targetElement = path[elementTags.indexOf('ks-m-teaser.intersecting')];
            var targetElementText = path[elementTags.indexOf('figcaption')];
            var dataLayerObject = {
              event: 'custom_event_click_body',
              target: targetElement.getAttribute('href'),
              pretitle: targetElementText.querySelector('strong').textContent,
              title: targetElementText.querySelector('h3').textContent,
              text: targetElementText.querySelector('p').textContent
            };
            window.dataLayer.push(dataLayerObject);
          } else if (elementTags.includes('div.footer-links-row contains-details')) {
            var targetElement = path[elementTags.indexOf('a')];
            var targetElementHeader = path[elementTags.indexOf('div.footer-links-row contains-details')];
            var dataLayerObject = {
              event: 'custom_event_click_footer',
              target: targetElement.getAttribute('href'),
              text: targetElement.textContent.trim(),
              section: targetElementHeader.querySelector('h4').textContent,
            };
            window.dataLayer.push(dataLayerObject);
          }
        }
      };
      
      document.addEventListener('click', callback, useCapture);
    })();
  }

  // page 12
  // Header Clean-up Script
  // This script separates the target value from the previous script, so it can be sorted out as a separate category.
  extendedGlobalEventCollectingHeaderCleanUp () {
    // Function to extract navigation levels from the target URL
    function extractNavigationLevels(target) {
      // Remove the leading slash and split the path into segments
      var segments = target.replace(/^\//, '').split('/');

      // Initialize the variables
      var header_category = segments[0] || "";
      var header_subcategory1 = segments[1] || "";
      var header_subcategory2 = segments[2] || "";
      var header_subcategory3 = segments[3] || "";
      
      if ({{dlv - category}} == 'top_headers') {
        header_category = 'partner_website';
        header_subcategory1 = {{dlv - text}};
        header_subcategory2 = '';
        header_subcategory3 = '';
      }
      
      // Push the variables into the dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'navigation_levels',
        'header_category': header_category,
        'header_subcategory1': header_subcategory1,
        'header_subcategory2': header_subcategory2,
        'header_subcategory3': header_subcategory3
      });
    }

    // Get the target URL from the dataLayer variable
    var target = {{dlv - target}};
    extractNavigationLevels(target);
  }
}
