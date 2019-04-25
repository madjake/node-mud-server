
let userIps = handler.getUsers().map((u) => { return u.getClientIp() });

if (userIps.length) {
	user.send(`Users:\n\n${userIps.join('\n')}`);
} else {
	user.send('Nobody online?!');
}
