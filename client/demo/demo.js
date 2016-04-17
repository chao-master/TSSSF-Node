function getUserInput(prompt,type){
  return new Promise(function(good,bad){
    var modal = document.createElement("form"),
        input = document.createElement("input");
    input.type = type;
    input.placeholder = prompt;
    modal.onsubmit = function(){
      good(input.value);
      document.body.removeChild(modal);
      return false;
    };
    modal.appendChild(input);
    document.body.appendChild(modal);
    input.focus();
  });
}

function getUserSelection(prompt,options){
  return new Promise(function(good,bad){
    var modal = document.createElement("form"),
        submit = function(val){
          good(val);
          document.body.removeChild(modal);
          return false;
        };
    modal.textContent = prompt;
    options.forEach(function(n){
      var selection = document.createElement("button");
      selection.textContent = n.text;
      selection.onclick = submit.bind(null,n.value);
      modal.appendChild(selection);
    });
    document.body.appendChild(modal);
  });
}

var ws = new WebSocket("ws://" + location.host + location.search);
ws.onmessage = function(msg){
  var data = JSON.parse(msg.data),
      handler = handlers[data.type];
  if(handler === undefined){
    console.warn("No handler for ",data.type,data);
  } else {
    console.debug(data);
    handlers[data.type](data);
  }
};

ws._send = ws.send;
ws.send = function(data){
  ws._send(JSON.stringify(data));
};
