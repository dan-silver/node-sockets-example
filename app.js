var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(3000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/client.html');
});

/*
    Keep a global list of currently connected clients
    -----------------------------------------------
*/
var clients = [];

var stocks = {
	'AT&T': 35,
	'APPLE': 450,
	'GOOGLE': 850
};

lorem_ipsum = "Lorem ipsum dolor sit amet consectetur adipiscing elit Maecenas egestas libero eu mauris blandit vitae imperdiet dolor lacinia Sed ac diam vel urna viverra ullamcorper Nulla enim tortor mollis at venenatis at porta dui ligula sollicitudin non mollis non tincidunt arcu Mauris volat sagittis lorem nec tincidunt Vestibulum ipsum massa Mauris sit amet purus sit amet est feugiat gravida vel sed Proin quam sem Sed laoreet massa mauris laoreet non rhoncus lit iaculis Duis non risus augue vitae sagittis metus Fusce sagittis imperdiet massa sit amet mattis Proin sed scelerisque orci Aliquam grav justo non lacus rum tincidunt Donec faucibus sollicitudin felis eu porttitor dui porttitor faucibus";
lorem_ipsum_words = lorem_ipsum.split(" ");

function generateRandomWord() {
	word = lorem_ipsum_words[Math.floor(Math.random()*lorem_ipsum_words.length)];
	word = word[0].toUpperCase() + word.substring(1);
	return word;
}

function generateUserName() {
	return generateRandomWord() + generateRandomWord() + Math.floor(Math.random()*50) 
}

io.sockets.on('connection', function (socket) {
 	/*
        Handle requests to join the game
        -------------------------------------
    */
    socket.on('join', function(callback) {
    	name = generateUserName()
        // If the name isn't in use, join the user
        if (clients.indexOf(name) < 0) {

            // Store the name, we'll use it when sending messages
            socket.name = name;

            // Add the name to the global list
            clients.push(name);

            // Callback to the user with a successful flag and the list of clients
            console.log('user %s has joined', name)
            callback(true, name, stocks);

        // If the name is already in use, reject the request to join
        } else {
            callback(false);
        }
    });
});

setInterval(function() {
	Object.keys(stocks).forEach(function(stock) {
		stocks[stock] += Math.random()*stocks[stock]*0.02*(Math.random() < 0.5 ? -1 : 1);
		stocks[stock] = Math.round(100*stocks[stock])/100;
	});
  console.log(stocks)
  io.sockets.emit('stockUpdates', { stocks: stocks });	
}, 1000)