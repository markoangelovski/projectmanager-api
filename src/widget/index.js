import api from "./lib/factory/apiInterface.js";

var aga = window.aga;

aga.loaded = true;

// Run queued api calls
while (aga.queue.length) {
  var args = aga.queue.shift();
  api.apply(aga, args);
}

// Load library
typeof window.aga != undefined && (window.aga.start = api);
console.log("[AGA Library] - Library loaded.");

// Injector code:
// !(function (win, doc, scr, url, aga) {
//   if (!win.aga) {
//     aga = win.aga = function () {
//       aga.start ? aga.start.apply(aga, arguments) : aga.queue.push(arguments);
//     };
//   }
//   aga.queue = [];
//   aga.version = "1";
//   aga.loaded = false;
//   aga.rootUrl = url.split("/v")[0];
//   var a = doc.createElement(scr);
//   a.async = true;
//   a.src = url;
//   var b = doc.getElementsByTagName(scr)[0];
//   b.parentNode.insertBefore(a, b);
// })(window, document, "script", "http://localhost:8080/aga.js");
