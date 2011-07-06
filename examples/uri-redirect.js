/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true browser: true
         forin: true latedef: false globalstrict: true */
/*global define: true */

'use strict';

const protocol = require('../index')
const setTimeout = require('timers').setTimeout

const handler = protocol.protocol('redirect', {
  onRequest: function(request, response) {
    console.log('>>>', JSON.stringify(request, '', '  '))
    // redirect
    response.uri = 'resource:///chrome/browser/content/browser/aboutRobots.xhtml'
    console.log('<<<', JSON.stringify(response, '', '  '))
  }
})

handler.register()      // start listening
// handler.unregister() // stop listening
