
for (var i = 0; i < 10000; i++) {
	const obj = objectManager.createObject("test", ['Player']);
}

const obj = objectManager.createObject("test", ['Player']);
user.send(util.inspect(obj, {depth: null, colors: true, showHidden: true}));
