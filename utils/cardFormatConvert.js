/*jshint esnext:true*/
var argv = require('yargs')
    .usage('Usage: $0 [options]')
    .choices('format',["tsssf.cards"])
    .demand("format")
    .demand(1)
    .help('h').alias('h', 'help')
    .argv;
var process = require("process"),
    fs = require("fs"),
    http = require("http"),
    path = require("path");


var format = argv.format,
    file = argv._[0],
    data = fs.readFileSync(file);

if(format == "tsssf.cards"){
  console.log(tsssfCards(data));
}

function downloadImage(url){
  var filename = path.basename(url);
  var sFile = fs.createWriteStream(filename);
  http.get(url,function(r){
    r.pipe(sFile);
    sFile.on("finish",function(){
      sFile.close();
    });
  });
  return filename;
}

function tsssfCards(data){
  var jsonData = JSON.parse(data);
  var mappedData = jsonData.map(function(obj){
    var capType = obj.type.charAt(0).toUpperCase() + obj.type.slice(1),
        img = "../art2/"+capType+"-"+obj.name.replace(/[^a-z0-9]|-/ig,"")+".png";

    if(obj.type == "goal"){
      return {
        name:obj.name,
        score:obj.points,
        condition:obj.text,
        imgSrc:img
      };
    } else {
      return {
        name:obj.name,
        gender:obj.gender,
        race:obj.race,
        effect:obj.power?obj.power.type:undefined,
        imgSrc:img
      };
    }
  });
  return JSON.stringify(mappedData,null,1);
}
