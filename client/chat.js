var chatSocket = new WebSocket("ws://"+window.location.hostname+":8000");

$(document).ready(function(){
    $("#chatInput").keyup(function (e) {
        if (e.keyCode === 13) {
            chatSocket.send(JSON.stringify({type:"chat",msg:$(this).val()}));
            $(this).val("");
        }
    });
    $("body").on("submit","form[data-event]",function(event){
        event.preventDefault();
        var params={};
        $(this).find("input[name]").each(function(){
            var t=$(this);
            if (t.attr("type") == "checkbox"){
              params[t.attr("name")] = t.prop("checked");
            } else if (t.attr("type") == "number") {
              params[t.attr("name")] = t.val()*1;
            } else {
              params[t.attr("name")] = t.val();
            }
        });
        params.type = $(this).attr("data-event");
        chatSocket.send(JSON.stringify(params));
    });
});

function addToChat(message){
    $("<div>").text(message).appendTo("#chat");
}

var messageHandlers = {
    chat:function(msg){
        addToChat(msg.client.nick+" : "+msg.msg);
    },
    join:function(msg){
        addToChat(msg.client.nick+" has joined "+msg.room.name);
        $("*[data-show-for]").hide();
        for(var i=0;i<msg.room.types.length;i++){
            $("*[data-show-for='"+msg.room.types[i]+"']").show();
        }
        if (msg.room.owner){
          $("*[data-owner-only]").prop('disabled',msg.room.owner.cid != OWN_CLIENT_ID);
        }
    },
    leave:function(msg){
        addToChat(msg.client.nick+" left joined "+msg.room.name);
    },
    rooms:function(msg){
        $("#rooms").empty();
        for(var i=0;i<msg.rooms.length;i++){
            var r = msg.rooms[i];
            $("<form>").attr("data-event","join").append(
              $("<input>").attr("name","room").attr("value",r.id).attr("hidden",1).attr("type","number")
            ).append(
              $("<input>").attr("type","submit").attr("value","Join "+r.name + " / " + r.owner.nick)
            ).appendTo("#rooms");
        }
    },
    create:function(msg){
        $("<div>").text(msg.room.name + " / " + msg.room.owner.nick).appendTo("#rooms");
    },
    connected:function(msg){
        OWN_CLIENT_ID = msg.client.cid;
    },
    options:function(msg){
        var opGroup = $("#options"),
            ops = Object.keys(msg.options);
        for(var i=0;i<ops.length;i++){
            var t = opGroup.find("[name="+ops[i]+"]");
            if (t.attr("type") == "checkbox"){
                t.prop("checked",msg.options[ops[i]]);
            } else {
                t.val(msg.options[ops[i]]);
            }
        }
    }
};

chatSocket.onmessage = function(event){
    var msg = JSON.parse(event.data),
        handler = messageHandlers[msg.type];
    console.info(msg);
    if (handler !== undefined){
        handler(msg);
    }
};

chatSocket.onopen = function(){
    $("*[data-show-for='Limbo']").show();
    console.debug("Socket Opened");
};

chatSocket.onclose = function(){
    console.warn("Socket Closed");
};
