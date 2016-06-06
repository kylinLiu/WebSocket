//send memory info per seconds
var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({port:8181});


var spawn = require('child_process').spawn;

var mem = {};

var clientMemUpdater = undefined;


function updateMemInfo(){
	var free = spawn('free',['-k']);
	free.stdout.on('data',function(data){
        	var strdata = ""+data;
        	console.log(strdata);
        	//正则匹配，获取数据
       		var re = /Mem: *(\d*) *(\d*) *(\d*) *(\d*) *(\d*) *(\d*)/;
        	var result = strdata.match(re);
        	if(result.length>0){
                	mem["total"] = parseInt(result[1]);
                	mem["used"] = parseInt(result[2]);
                	mem["free"] = parseInt(result[3]);
                	//mem["shared"] = parseInt(result[4]);
                	mem["buffers"] = parseInt(result[5]);
                	mem["cached"] = parseInt(result[6]);
      
        	}
	});
}
updateMemInfo();

wss.on('connection',function(ws){
	var clientMemSend;
	var sendMemUpdates = function(ws){
		if(ws.readyState == 1){
			ws.send(JSON.stringify(mem));
		}
	}
	clientMemSend = setInterval(function(){
        	if(typeof clientMemUpdater == 'undefined'){
                	clientMemUpdater = setInterval(updateMemInfo,1000);
        	}
		sendMemUpdates(ws);
	},1000);

	sendMemUpdates(ws);
	if(typeof clientMemUpdater == 'undefined'){
		clientMemUpdater = setInterval(updateMemInfo,1000);
	}
	ws.on("close",function(){
		if(typeof clientMemSend != 'undefined'){
			clearInterval(clientMemSend);
		}
		if(typeof clientMemUpdater !='undefined'){
			clearInterval(clientMemUpdater);
			clientMemUpdater = undefined;
		}
	});
});
