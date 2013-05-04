var express = require('express')
  , path = require('path')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(3000);
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.get('/', function (req, res) {
  sendStocks = []
  Object.keys(stocks).forEach(function(stock) {
    sendStocks.push({name: stock, price: stocks[stock].price})
  })
  res.render('client.hbs', {stocks: sendStocks});
});
app.use(express.static(path.join(__dirname, 'public')))

/*
    Keep a global list of currently connected clients
    -----------------------------------------------
*/
var clients = [];

var stocks = {};
stocks.AMAZON =  {price: 450, direction:1};
stocks.APPLE =  {price: 750, direction:1};
stocks.DELL = {price: 200, direction:1};
stocks.FACEBOOK = {price: 90, direction:1};
stocks.GOOGLE =  {price: 850, direction:1};
stocks.HP =  {price: 10, direction:1};
stocks.MICROSOFT = {price: 350, direction:1};
stocks.YAHOO = {price: 90, direction:1};

lorem_ipsum = "Lorem ipsum dolor sit amet consectetur adipiscing elit Maecenas egestas libero eu mauris blandit vitae imperdiet dolor lacinia Sed ac diam vel urna viverra ullamcorper Nulla enim tortor mollis at venenatis at porta dui ligula sollicitudin non mollis non tincidunt arcu Mauris volat sagittis lorem nec tincidunt Vestibulum ipsum massa Mauris sit amet purus sit amet est feugiat gravida vel sed Proin quam sem Sed laoreet massa mauris laoreet non rhoncus lit iaculis Duis non risus augue vitae sagittis metus Fusce sagittis imperdiet massa sit amet mattis Proin sed scelerisque orci Aliquam grav justo non lacus rum tincidunt Donec faucibus sollicitudin felis eu porttitor dui porttitor faucibus";
lorem_ipsum_words = lorem_ipsum.split(" ");

function generateRandomWord() {
	word = lorem_ipsum_words[Math.floor(Math.random()*lorem_ipsum_words.length)];
	word = word[0].toUpperCase() + word.substring(1);
	return word;
}

function generateUserName() {
	return generateRandomWord() + Math.floor(Math.random()*50) 
}

io.sockets.on('connection', function (socket) {
 	/*
        Handle requests to join the game
        -------------------------------------
    */
    socket.on('join', function(callback) {
    	name = generateUserName()
            // Add the name to the global list
            clients.push(name);

            // Callback to the user with a successful flag and the list of clients
            console.log('User %s has connected.', name)
            callback(true, name, stocks);
    });
    socket.on('purchase', function(info, callback) {
    	console.log(getStockPrice(info.stock))
    });
});

setInterval(function() {
	Object.keys(stocks).forEach(function(stock) {
		oldPrice = stocks[stock].price;
		stocks[stock].price += Math.random()*stocks[stock].price*0.02*(Math.random() < 0.5 ? -1 : 1);
		stocks[stock].price = Math.round(100*stocks[stock].price)/100;
		if (stocks[stock].price > oldPrice) {
			stocks[stock].direction = 1;
		} else {
			stocks[stock].direction = -1;
		}
	});
  io.sockets.emit('stockUpdates', { stocks: stocks });	
}, 1000)