// Intercept fetch function
// window.fetch = (function (orig) {
//   return function () {
//     const res = orig.apply(this, arguments);
//     const res2 = res;

//     res2.then(res3 => {
//       console.log(res3);
//     });

//     return res;
//   };
// })(window.fetch);

// Sniff XMLHttpRequest events
// https://stackoverflow.com/questions/3596583/javascript-detect-an-ajax-event
// https://stackoverflow.com/questions/20689481/recreating-jquerys-ajaxstart-and-ajaxcomplete-functionality
// var start, end;
// XMLHttpRequest.prototype.send = (function(orig){
//     return function(){
//         console.log('pre', this);
// start = new Date().getTime()

//             this.addEventListener("loadend", function(){
//                 console.log('post', this);
// end = new Date().getTime();
// console.log("Start: ", start);
// console.log("End: ", end);
// console.log("Total: ", start - end);
//             }, false);

//         return orig.apply(this, arguments);
//     };
// })(XMLHttpRequest.prototype.send);
