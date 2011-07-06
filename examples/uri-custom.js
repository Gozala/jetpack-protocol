/* vim:set ts=2 sw=2 sts=2 expandtab */
/*jshint asi: true undef: true es5: true node: true devel: true browser: true
         forin: true latedef: false globalstrict: true */
/*global define: true */

'use strict';

const protocol = require('../index')

var root = module.id.substr(0, module.id.lastIndexOf('/') + 1)
var SEPARATOR = '|'
const handler = protocol.protocol('jedi', {
  isAbsolute: function(uri) {
    return 0 === uri.indexOf('jedi:')
  },
  onResolve: function(relative, base) {
    console.log('??', relative, base)
    if (base === 'jedi:') base = 'jedi:data|base.html'
    var path, paths, last
    if (this.isAbsolute(relative)) return relative
    paths = relative.split(SEPARATOR)
    base = base ? base.split(SEPARATOR) : [ '.' ]
    if (base.length > 1) base.pop()
    while ((path = paths.shift())) {
      if (path === '..') {
        if (base.length && base[base.length - 1] !== '..') {
          if (base.pop() === '.') base.push(path)
        } else base.push(path)
      } else if (path !== '.') {
        base.push(path)
      }
    }
    if (base[base.length - 1].substr(-1) === '.') base.push('')
    console.log('!!', base.join(SEPARATOR))
    return base.join(SEPARATOR)
  },
  onRequest: function(request, response) {
    console.log('>>>', JSON.stringify(request, '', '  '))
    // Special case just `jedi:` uri
    if (request.uri === 'jedi:') response.uri = root + 'data/about.html'
    else response.uri = root + request.uri.replace('jedi:', '').replace(SEPARATOR, '/')
    response.principalURI = response.uri
    console.log('<<<', JSON.stringify(response, '', '  '))
  }
})

handler.register()      // start listening
// handler.unregister() // stop listening

// goto: jedi:data|about.html
