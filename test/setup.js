import { JSDOM } from "jsdom"
import * as chai from "chai"
import sinon from "sinon"

process.env.NODE_ENV = "test"
if ( !process.env.DATABASE_PATH ) {
  process.env.DATABASE_PATH = ":memory:"
}

global.expect = chai.expect
global.sinon = sinon

const baseHtml = "<!doctype html><html><body><div id=\"content\"></div></body></html>"

function applyDom( html = baseHtml ) {
  const dom = new JSDOM( html, { url: "http://localhost" } )
  global.window = dom.window
  global.document = dom.window.document
  delete global.navigator
  Object.defineProperty( global, "navigator", {
    value: { userAgent: "node.js" },
    configurable: true,
    writable: true,
    enumerable: false
  } )
  global.HTMLElement = dom.window.HTMLElement
  global.Node = dom.window.Node
  global.CustomEvent = dom.window.CustomEvent
  global.Event = dom.window.Event
  return dom
}

global.resetDom = applyDom
applyDom()
