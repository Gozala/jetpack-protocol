/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true browser: true
         forin: true latedef: false globalstrict: true */
/*global define: true */

'use strict';

const protocol = require('../index')
const setTimeout = require('timers').setTimeout

const handler = protocol.protocol('simple', {
  onRequest: function(request, response) {
    console.log('>>>', JSON.stringify(request, '', '  '))
    // Write 
    response.write('Hello ')
    setTimeout(function() {
      // Write and end!
      response.end('World !')
    }, 1000)
    console.log('<<<', JSON.stringify(response, '', '  '))
  }
})

handler.register()      // start listening
// handler.unregister() // stop listening
