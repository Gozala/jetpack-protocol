# protocol #

Library allowing to add new protocols.

## Install ##

    npm install protocol

## Examples ##

Register protocol handler for "about:jedi"

    require('protocol').register({
      about: 'jedi',
      onRequest: function(uri) {
        return 'data:text/html,<h1>Jedi is an awsome dude with a lightsaber</h1>'
      }
    })
    // Navigate to 'about:jedi'

Register protocol handler for "jedi:*"

    require('protocol').register({
      scheme: 'jedi',
      onRequest: function(uri) {
        return 'data:text/html,<h1>Jedi "' + uri.substr(this.scheme.length + 1) + '" is at your service!';
      }
    })
    // navigate to 'jedi:yoda'

## Prior art ##

 - [Adding a New Protocol to Mozilla](http://www.nexgenmedia.net/docs/protocol/)
 - [nsIProtocolHandler]

[nsIProtocolHandler]:https://developer.mozilla.org/en/nsIProtocolHandler
