var readline = require('readline');
var socketio = require('socket.io-client');
var color = require("ansi-color").set;
const acknowledge = require('socket.io-acknowledge');
var fs = require('fs');

const NodeRSA = require('node-rsa');
var key = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n'+
'MIIBOQIBAAJAVY6quuzCwyOWzymJ7C4zXjeV/232wt2ZgJZ1kHzjI73wnhQ3WQcL\n'+
'DFCSoi2lPUW8/zspk0qWvPdtp6Jg5Lu7hwIDAQABAkBEws9mQahZ6r1mq2zEm3D/\n'+
'VM9BpV//xtd6p/G+eRCYBT2qshGx42ucdgZCYJptFoW+HEx/jtzWe74yK6jGIkWJ\n'+
'AiEAoNAMsPqwWwTyjDZCo9iKvfIQvd3MWnmtFmjiHoPtjx0CIQCIMypAEEkZuQUi\n'+
'pMoreJrOlLJWdc0bfhzNAJjxsTv/8wIgQG0ZqI3GubBxu9rBOAM5EoA4VNjXVigJ\n'+
'QEEk1jTkp8ECIQCHhsoq90mWM/p9L5cQzLDWkTYoPI49Ji+Iemi2T5MRqwIgQl07\n'+
'Es+KCn25OKXR/FJ5fu6A6A+MptABL3r8SEjlpLc=\n'+
'-----END RSA PRIVATE KEY-----');



 
var dev;
var socket = socketio.connect('http://localhost:3636');
acknowledge(socket)
var rl = readline.createInterface(process.stdin, process.stdout);


 rl.question("Please enter a your name: ", function(name) {
    dev = name;
    var msg = dev + " has joined the chat";
    try{
        const encryptedmsg = key.encrypt(msg, 'base64');
        socket.emit('send', { type: 'notice', message: encryptedmsg });
        let datetime = new Date();
        let logMessage = {datetime:datetime,message:"User join boradcast...", user :msg}
        fs.appendFile('log.txt', JSON.stringify(logMessage)+'\n', function(err) {
            if (err) {
               return console.error(err);
            }
         });
    }catch(err){
        console.log({"err":err})
    }
    
    rl.prompt(true);
});




rl.on('line', function (line) {
    if (line[0] == "/" && line.length > 1) {
        var cmd = line.match(/[a-z]+\b/)[0];
        var arg = line.substr(cmd.length+2, line.length);
        chat_command(cmd, arg);
 
    } else {
        // send chat message
        const encryptedLine = key.encrypt(line, 'base64');
        socket.emit('send', { type: 'chat', message: encryptedLine, sender: dev });
        let datetime = new Date();
        let logMessage = {datetime:datetime,message:"Message sent", message: encryptedLine, sender: dev}
        fs.appendFile('log.txt', JSON.stringify(logMessage)+'\n', function(err) {
            if (err) {
               return console.error(err);
            }
         });
        rl.prompt(true);
    }
});


function chat_command(cmd, arg) {
    switch (cmd) {
 
        case 'msg':
            var to = arg.match(/[a-z]+\b/)[0];
            var message = arg.substr(to.length, arg.length);
            socket.emit('send', { type: 'tell', message: message, to: to, from: dev });
            break;
 
        case 'me':
            var emote = dev + " " + arg;
            socket.emit('send', { type: 'emote', message: emote });
            break;
 
        default:
            console_out("That is not a valid command.");
 
    }
}



socket.on('message', function (data) {
    var leader;
    if (data.type == 'chat' && data.sender != dev) {
        leader = color(data.sender+" : ", "green");
        const decryptedMessage = key.decrypt(data.message, 'utf-8');
        console_out(leader + decryptedMessage);
    }
    else if (data.type == "notice") {
        const decryptedMessage = key.decrypt(data.message, 'utf-8');
        console_out(color(decryptedMessage, 'cyan'));
    }
    // else if (data.type == "tell" && data.to == dev) {
    //     leader = color("["+data.from+"->"+data.to+"]", "red");
    //     console_out(leader + data.message);
    // }
    // else if (data.type == "emote") {
    //     console_out(color(data.message, "cyan"));
    // }
});



//For desplaying message on console
function console_out(msg) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(msg);
    rl.prompt(true);
}