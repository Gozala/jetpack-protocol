/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true browser: true
         forin: true latedef: false globalstrict: true */
/*global define: true */

'use strict';

const protocol = require('../index')
const setTimeout = require('timers').setTimeout

const handler = protocol.about('jedi', {
  onRequest: function(request, response) {
    console.log('>>>', JSON.stringify(request, '', '  '))
    response.contentType = "text/html"
    // Delay just for fun!
    setTimeout(function() {
      console.log('! Writing a respones')
      response.end('<h1>Jedi is an awsome dude with a lightsaber!!</h1>')
    })
    console.log('<<<', JSON.stringify(response, '', '  '))
  }
})

handler.register()      // start listening
// handler.unregister() // stop listening
