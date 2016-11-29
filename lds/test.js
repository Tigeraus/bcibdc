var machine = require('./routes/machine');
var i=0;
var test = function() {
	if(i++ > 1) {
		machine.disconnect();
		return;
	}
	machine.start();
	setTimeout(function() {
		machine.pause();
		setTimeout(function() {
			test();
		},2000);
	},2000);
}
machine.connect();
test();
