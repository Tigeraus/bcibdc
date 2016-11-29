var OpenBCIBoard = require('openbci').OpenBCIBoard;
var fs = require('fs');
if(!fs.existsSync('../test/'))
	fs.mkdirSync('../test/');
var ourBoard = new OpenBCIBoard({
	simulate: true
});
var log = false;
var portName;
var isLoading = false;
var date = (new Date()).getMonth()+'-'+(new Date).getDate()+'-'+(new Date()).getHours()+'-'+(new Date()).getMinutes();
fs.mkdirSync('../test/'+date);
var wid;
var tid;
module.exports.connect = function() {
	ourBoard.listPorts().then(function(portNames) {
		for(var i = 0; i < portNames.length; i ++) {
			if(portNames[i].pnpId == 'usb-Prolific_Technology_Inc._USB-Serial_Controller-if00-port0') {
				portName = portNames[i].comName;
				break;
			}
		}
	})
	.then(function() {
		ourBoard.connect(portName) // Port name is a serial port name, see `.listPorts()`
		.then(function() {
			ourBoard.on('ready',function() {
				ourBoard.streamStart();
				ourBoard.on('sample',function(sample) {
					/** Work with sample */
					if(!isLoading) return;
					var data = '';
					for (var i = 0; i < ourBoard.numberOfChannels(); i++) {
						if(log)
							console.log("Channel " + (i + 1) + ": " + sample.channelData[i].toFixed(8) + " Volts.");
						data += sample.channelData[i].toFixed(8) + '\t';
					}
					fs.appendFile('..//test/'+date+'/wid_'+wid+'.dat', data+'\n', 'utf-8');
				});
			});
		});
	});
}
module.exports.start = function(id) {
	isLoading = true;
	wid = id;
	tid = setTimeout(function() {
		isLoading = false;
	},3000);
}
module.exports.pause = function(wid,grade) {
	if(tid != undefined) {
		clearTimeout(tid);
		tid = undefined;
	}
	isLoading = false;
	fs.appendFile('..//test/'+date+'/user.dat', wid+'\t'+grade+'\n', 'utf-8');
}
module.exports.disconnect = function() {
	if(ourBoard.isConnected()) {
		if(ourBoard.isStreaming()) {
			ourBoard.streamStop();
		}
		ourBoard.disconnect().then(function() {
			console.log('disconnect!')
		});
	}
}
