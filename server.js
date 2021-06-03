var socketio = require('socket.io');
const acknowledge = require('socket.io-acknowledge'); 
var fs = require('fs');


// Listen on port 3636
var io = socketio.listen(3636);
io.use(acknowledge)

io.sockets.on('connection', function (socket) {
    // Broadcast a user's message to everyone else in the room

    if(socket){
        let datetime = new Date();
        let logMessage = {datetime:datetime,message:"Client connected to server..."}
        fs.appendFile('log.txt', JSON.stringify(logMessage)+'\n', function(err) {
            if (err) {
               return console.error(err);
            }
         });
    }
    socket.on('send', data => {
        if(data){
            io.sockets.emit('message', data);
            let datetime = new Date();
            let logMessage = {datetime:datetime,data:data}
            fs.appendFile('message.txt', JSON.stringify(logMessage)+'\n', function(err) {
                if (err) {
                   return console.error(err);
                }
             });

        }else{
            throw new Error();
        }
    });
});
