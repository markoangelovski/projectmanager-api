import arg from "./lib/file";

const AGA = (window.AGA = {});

AGA.woo = () => console.log("Woo!!");
AGA.arg = arg;

console.log("AGA loaded.");
