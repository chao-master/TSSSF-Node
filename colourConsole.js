var colors = require('colors'),
    util = require("util"),
    path = require("path");

var masterDir = path.dirname(require.main.filename);
var INDENT = 20;

colors.setTheme({
  info: 'cyan',
  log:  'green',
  warn: 'yellow',
  error: 'red'
});
function getFilename() {
  var origPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = function (_, stack) {
    return stack;
  };
  var err = new Error();
  var stack = err.stack;
  Error.prepareStackTrace = origPrepareStackTrace;
  var ours = stack[2],
      fPath = path.relative(masterDir,ours.getFileName()),
      number = ours.getLineNumber();
  if(fPath.endsWith(".js")){
    fPath = fPath.substring(0,fPath.length-3);
  }
  return fPath+":"+number;
}

["error","log","info","warn"].forEach(function(name){
  var fn = console[name];
  console["_"+name] = fn;
  console[name] = function N(){
    var prefix = getFilename();
    if(prefix.length<INDENT){
        prefix += Array(INDENT+1-prefix.length).join(" ");
    }
    fn(colors[name](prefix+util.format.apply(null,arguments)));
  };
});
console.debug = console.info;
module.exports = console;
