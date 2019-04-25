

var sayCmd = (user, listeners) => {
	if (command.args.length < 2) {
		user.send('Say what?');
	}

	let sayText = command.args.slice(1).join(' ');
	user.send(`You say, "${sayText}"`);

	for (let u of listeners) {
		if (u !== user) {
			u.send(`${user.getClientIp()} says, "${sayText}"`);
		}
	}
}

sayCmd(user, handler.getUsers());
