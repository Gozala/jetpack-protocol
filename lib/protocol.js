'use strict'

const { Cc, Ci, Cu, Cm } = require("chrome");
const xpcom = require("xpcom");
const { MatchPattern } = require('match-pattern');
const { Trait } = require("light-traits");

const IOService = Cc["@mozilla.org/network/io-service;1"].
                  getService(Ci.nsIIOService);
const { XPCOMUtils } = Cu.import("resource://gre/modules/XPCOMUtils.jsm");
const uuidGenerator = Cc["@mozilla.org/uuid-generator;1"].getService(Ci.nsIUUIDGenerator);

function generateDescription(topic) {
  return "Protocol handler for 'about:" + topic + "'";
}

function generateContract(topic) {
  return "@mozilla.org/network/protocol/about;1?what=" + topic;
}

function containSameElements(source, target) {
  let value = true;
  if (target.length !== source.length) {
    value = false;
  } else {
    for (let i = 0, ii = source.length; i < ii; i++) {
      if (source[i] != target[i]) {
        value = false;
        break;
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

const TXPCOM = {
  classID: { get: Cacheable(function classID() {
    return uuidGenerator.generateUUID()
  }), enumerable: true }
}

const TProtocolHandler = Trait(
  TXPCOM,
  Trait({
    include: Trait.required,
    onRequest: Trait.required,
    topic: Trait.required,

    newChannel: function(uri) {
      let newURI, channel
      if (this.include.test(uri.spec) && (newURI = this.onRequest(uri.spec))) {
        channel = IOService.newChannel(newURI, null, null);
        channel.originalURI = uri;
      }
      return channel
    },
    getURIFlags: function(aURI) {
      return Ci.nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT;
    },
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule])
  }),
  { classDescription: { get: Cacheable(function classDescription() {
      return generateDescription(this.topic)
    }), enumerable: true },
    contractID: { get: Cacheable(function contractID() {
      return generateContract(this.topic)
    }), enumerable: true },
  }
);

exports.register = function register(options) {
  let protocolHandler = TProtocolHandler.create({
    include: new MatchPattern("about:" + options.include),
    topic: options.include,
    onRequest: options.onRequest
  });

  xpcom.register({
    uuid: protocolHandler.classID,
    name: protocolHandler.classDescription,
    contractID: protocolHandler.contractID,
    create: function() {
      return protocolHandler
    }
  });
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
