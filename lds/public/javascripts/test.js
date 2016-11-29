var vm;
var word;
var count;
var onload;

function init() {
	vm = new Vue({
		el: '#vm',
		data: {
			word: 'word',
			score: 0,
		}
	});
	count = 0;
	onload = false;
	getWord();
}

function test(l) {
	if(onload) return;
	vm.score = (vm.score / 20 * count + l) / (count + 1) * 20;
	count += 1;
	getWord(l);
}

function getWord(level) {
	var xhr = function(){
		if (window.XMLHttpRequest) {
			return new XMLHttpRequest();
		}else{
			return new ActiveObject('Micrsorf.XMLHttp');
		}
	}();
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4) {
			if(xhr.status == 200) {
				if(xhr.responseText[0] == '{') {
					word = JSON.parse(xhr.responseText);
					vm.word = word.word;
				} else {
					alert(xhr.responseText);
					if(xhr.responseText == '测试完成！')
						window.location.href = '/';
				}
			}
			onload = false;
		}
	};
	xhr.open('post','/test');
	xhr.setRequestHeader('Content-Type','application/json');
	if(word && level != undefined) {
		xhr.send(JSON.stringify({
			wid: word.id,
			grade: level
		}));
	} else {
		xhr.send('');
	}
	onload = true;
}
