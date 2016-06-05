//send memory info per seconds
var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({port:8181});


var spawn = require('child_process').spawn;

function sendMemInfo(ws){
	var free = spawn('free',['-k']);
	free.stdout.on('data',function(data){
        	var strdata = ""+data;
        	//console.log(strdata);
        	//正则匹配，获取数据
       		var re = /Mem: *(\d*) *(\d*) *(\d*) *(\d*) *(\d*) *(\d*)/;
        	var result = strdata.match(re);
		var mem = {};
        	if(result.length>0){
                	mem["total"] = parseInt(result[1]);
                	mem["used"] = parseInt(result[2]);
                	mem["free"] = parseInt(result[3]);
                	//mem["shared"] = parseInt(result[4]);
                	mem["buffers"] = parseInt(result[5]);
                	mem["cached"] = parseInt(result[6]);
                	ws.send(JSON.stringify(mem));
        	}
	});
}

wss.on('connection',function(ws){
	var clientMemUpdater;
	var sendMemUpdates = function(ws){
		if(ws.readyState == 1){
			sendMemInfo(ws);
		}
	}
	clientMemUpdater = setInterval(function(){
		sendMemUpdates(ws);
	},1000);
	var clientStocks = [];
	sendMemUpdates(ws);
	ws.on("close",function(){
		if(typeof clientMemUpdater != 'undefined'){
			clearInterval(clientMemUpdater);
		}
	});
});
