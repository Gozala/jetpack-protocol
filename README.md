# protocol #

Library allowing to add new protocols.

## Install ##

    git clone https://github.com/Gozala/jetpack-protocol.git

## Examples ##

Register protocol handler for "about:jedi"

    // Create protocol handler.
    var handler = require('protocol').Handler({
      onRequest: function(request, response) {
        console.log('>>>', JSON.stringify(request, '', '  '))
        response.content = "<h1>Jedi is an awsome dude with a lightsaber!!</h1>"
        response.contentType = "text/html"
        console.log('<<<', JSON.stringify(response, '', '  '))
      }
    })
    // Register handler for 'about:jedi'
    handler.listen({ about: 'jedi' })

Map the file from 'data' folder to 'about:myaddon' URI.

    // Create protocol handler.
    var handler = require('protocol').Handler({
      onRequest: function(request, response) {
        console.log('>>>', JSON.stringify(request, '', '  '))
        response.uri = require('self').data.url("about.html");
        console.log('<<<', JSON.stringify(response, '', '  '))
      }
    })
    // Register handler for 'about:jedi'
    handler.listen({ about: 'myaddon' })

Register protocol handler for "jedi:":

      var handler = require('protocol').Handler({
        onRequest: function(request, response) {
          console.log('>>>', JSON.stringify(request, '', '  '))
          response.content = '<h1>Jedi "' + request.uri + '" is at your service!'
          console.log('<<<', JSON.stringify(response, '', '  '))
        }
      })
      // Listen to the 'jedi:*' URIs.
      handler.listen({ scheme: 'jedi' })
      // Navigate to:
      // jedi:
      // jedi:trick
      // jedi://hello/world


Register protocol handler that maps data directory:

      var handler = require('protocol').Handler({
        onRequest: function(request, response) {
          console.log('>>>', JSON.stringify(request, '', '  '))

          // If `request.referer` is given request is made from the given
          // `request.referer` and `request.uri` maybe relative to it.
          if (request.referer) {
            // If request does not starts with scheme we implement it's
            // relative, so we need to resolve uri.
            if (request.uri.indexOf('content:') !== 0) {
              // TODO: normalize uri from double '//', '../', './'
              response.uri = request.referer + '/' + request.uri
            }
          } else {
            let path = request.uri.substr('content:'.length)
            let targetURI = require('self').data.url(path)
            // If you're fine to redirect to the resource: uri here just do this
            // response.uri = targetURI
            // If you do not want to redirect, but want to return conntent from
            // the data folder:
            try {
              response.content = require('self').data.load(path)
              // 'resource:' URIs have certain privileges like performing XHR
              // requsets to the content under relative URIs, to preserve this
              // privileges you need to set originalURI property:
              response.originalURI = targetURI
            } catch (error) {
              response.content = 'File not found: ' + targetURI
            }
            // Optionally you can set mime type.
            // response.contentType = 'text/html'
          }
          console.log('<<<', JSON.stringify(response, '', '  '))
        }
      })
      handler.listen({ scheme: 'content' })

## Prior art ##

 - [Adding a New Protocol to Mozilla](http://www.nexgenmedia.net/docs/protocol/)
 - [nsIProtocolHandler]
 - [Extending the Chrome Protocol](http://kb.mozillazine.org/Dev_:_Extending_the_Chrome_Protocol)

[nsIProtocolHandler]:https://developer.mozilla.org/en/nsIProtocolHandler
