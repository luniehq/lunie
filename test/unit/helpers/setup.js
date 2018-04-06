import xmlhttprequest from "xmlhttprequest"

// providing the browser XMLHttpRequest in the node.js process of jest where it is not available
global.XMLHttpRequest = xmlhttprequest.XMLHttpRequest
