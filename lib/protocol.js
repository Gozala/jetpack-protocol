'use strict'

const { Cc, Ci, Cu, Cm } = require("chrome")
  ,   { MatchPattern } = require('match-pattern')
  ,   { Trait } = require("light-traits")
  ,   xpcom = require("xpcom")

  ,   { XPCOMUtils } = Cu.import("resource://gre/modules/XPCOMUtils.jsm")

  ,   IOService = Cc["@mozilla.org/network/io-service;1"].
                  getService(Ci.nsIIOService)
  ,   uuidGenerator = Cc["@mozilla.org/uuid-generator;1"].
                      getService(Ci.nsIUUIDGenerator)
  ,   streamConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
                        createInstance(Ci.nsIScriptableUnicodeConverter)
  ,   streamChannel = Cc["@mozilla.org/network/input-stream-channel;1"]

  ,   SimpleURI = Cc["@mozilla.org/network/simple-uri;1"]
  
streamConverter.charset = 'UTF-8'


function getInputStreamForString(content) {
  return streamConverter.convertToInputStream(content)
}

function createContentChannel(content, uri) {
  let channel = streamChannel.createInstance(Ci.nsIInputStreamChannel)
  channel.setURI(uri)
  channel.contentStream = getInputStreamForString(content)
  return channel
}

function createChannel(content, uri) {
  let channel
  // Trying to create a channel from content as if content was redirection URI.
  // If that fails then creating input stream channel from content.
  try {
    channel = IOService.newChannel(content, null, null)
    channel.originalURI = uri
  } catch (e) {
    channel = createContentChannel(content, uri)
  }
  return channel
}

function containSameElements(source, target) {
  let value = true
  if (target.length !== source.length) {
    value = false
  } else {
    for (let i = 0, ii = source.length; i < ii; i++) {
      if (source[i] != target[i]) {
        value = false
        break
      }
    }
  }
  return value
}

function Cacheable(callee) {
  let params, value
  return function cacheable() {
    let rest = Array.slice(arguments)
    if (!params || !containSameElements(rest, params))
      value = callee.apply(this, params = rest)
    return value
  }
}

const TXPCOM = Trait(
  Trait({
    interfaces: Trait.required,
    contractID: Trait.required,
  }),
  {
    QueryInterface: { get: function QueryInterface() {
      Object.defineProperty(this, 'QueryInterface', {
        value: XPCOMUtils.generateQI(this.interfaces),
        configurable: false
      })
      return this.QueryInterface
    }, configurable: true },
    classID: { get: function classID() {
      Object.defineProperty(this, 'classID', {
        value: uuidGenerator.generateUUID(),
        configurable: false
      })
      return this.classID
    }, configurable: true },
    classDescription: { get: function classDescription() {
      Object.defineProperty(this, 'classDescription', {
        value: this.description || "Jetpack generated class",
        configurable: false
      })
      return this.classDescription
    }, configurable: true }
  }
)

const TAboutHandler = Trait(
  TXPCOM,
  Trait({
    onRequest: Trait.required,
    about: Trait.required,

    interfaces: [Ci.nsIAboutModule],
    get description() {
      return 'Protocol handler for "about:' + this.about + '"'
    },
    get contractID() {
      return "@mozilla.org/network/protocol/about;1?what=" + this.about
    },
    getURIFlags: function(aURI) {
      return Ci.nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT
    },
    newChannel: function(uri) {
      let newURI, channel
      if (uri.path == this.about && (newURI = this.onRequest(uri.spec)))
        channel = createChannel(newURI, uri)
      return channel
    }
  })
)

const TProtocolHandler = Trait(
  TXPCOM,
  Trait({
    scheme: Trait.required,
    onRequest: Trait.required,

    interfaces: [ Ci.nsIProtocolHandler ],
    get protocolFlags() {
      let value = Ci.nsIProtocolHandler.URI_LOADABLE_BY_ANYONE

      if (!this.onRelative) value = value | Ci.nsIProtocolHandler.URI_NORELATIVE
      Object.defineProperty(this, 'protocolFlags', { value: value })
      return this.protocolFlags
    },
    defaultPort: -1,
    allowPort: function allowPort(port, scheme) {
      return false
    },
    newURI: function newURI(relativeURI, charset, baseURI) {
      let absoluteURI = SimpleURI.createInstance(Ci.nsIURI)
      if (baseURI) absoluteURI.spec = this.onRelative(relativeURI, baseURI.spec)
      else absoluteURI.spec = relativeURI
      return absoluteURI
    },
    newChannel: function newChannel(uri) {
      let newURI, channel
      if (uri.scheme == this.scheme && (newURI = this.onRequest(uri.spec)))
        channel = createChannel(newURI, uri)
      return channel
    },
    get contractID() {
      return "@mozilla.org/network/protocol;1?name=" + this.scheme
    },
    get description() {
      return 'Protocol handler for "' + this.scheme + ':*"'
    }
  })
)

exports.register = function register(options) {
  let protocolHandler = options.scheme ? TProtocolHandler.create(options)
                                       : TAboutHandler.create(options)

  xpcom.register({
    uuid: protocolHandler.classID,
    name: protocolHandler.classDescription,
    contractID: protocolHandler.contractID,
    create: function() {
      return protocolHandler
    }
  })
  /*
  Cm.registerFactory(
    protocolHandler.classID,
    protocolHandler.classDescription,
    protocolHandler.contractID,
    { create: function() {
        return protocolHandler
      }
    }
  )
  */
}
