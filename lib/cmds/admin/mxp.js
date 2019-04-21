if (user.mxp) {
  user.send('[1z<send "command1|command2|command3" hint="click to see menu|Item 1|Item 2|Item 2">this is a menu link</SEND>');
} else {
  user.send('Your client either does not support MXP or has it disabled.');
}
