# protocol #

Library allowing to add new protocols.

## Install ##

    npm install protocol

## Examples ##

    require('protocol').register({
      include: 'jedi',
      onRequest: function(uri) {
        return 'data:text/html,<h1>Jedi is an awsome dude with a lightsaber</h1>'
      }
    })

## Prior art ##

 - [Adding a New Protocol to Mozilla](http://www.nexgenmedia.net/docs/protocol/)
 - [nsIProtocolHandler]

[nsIProtocolHandler]:https://developer.mozilla.org/en/nsIProtocolHandler
