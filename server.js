// Зависимости модулей.
var application_root = __dirname,
 express = require( 'express' ), //Web framework
 path = require( 'path' ), //Utilities for dealing with file paths
 mongoose = require( 'mongoose' ); //MongoDB integration
// Создание сервера
 var app = express();
// Конфигурирование сервера
app.configure( function() {
 //разбор тела запроса и заполнение request.body
 app.use( express.bodyParser() );
 //проверка request.body на переопределение HTTP-методов
 app.use( express.methodOverride() );
 //поиск маршрута по URL и HTTP-методу
 app.use( app.router );
 //где сохранить статическое содержимое
 app.use( express.static( path.join( application_root, 'site') ) );
 //показать все ошибки в разработке
 app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));
});

//запуск сервера
var port = 8080;
app.listen( port, function() {
 console.log( 'Express server listening on port %d in %s mode',
 port, app.settings.env );
});

// маршруты
app.all('/api/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  if (req.method === 'OPTIONS') {
  	res.send(200)
  } else {
  	next();
  }
});


app.get( '/api', function( request, response ) {
 response.send( 'Library API is running' );
});

//получение списка всех книг
app.get( '/api/books', function( request, response ) {
 return BookModel.find( function( err, books ) {
 if( !err ) {
 return response.send( books );
 } else {
 return console.log( err );
 }
 });
});

//добавление новой книги
app.post( '/api/books', function( request, response ) {
 var book = new BookModel({
 title: request.body.title,
 author: request.body.author,
 releaseDate: request.body.releaseDate
 });
 book.save( function( err ) {
 if( !err ) {
 return console.log( 'created' );
 } else {
 return console.log( err );
 }
 });
return response.send( book );
});

app.get( '/api/books/:id', function( request, response ) {
 return BookModel.findById( request.params.id, function( err, book ) {
 if( !err ) {
 return response.send( book );
 } else {
 return console.log( err );
 }
 });
});

app.put( '/api/books/:id', function( request, response ) {
 console.log( 'Updating book ' + request.body.title );
 return BookModel.findById( request.params.id, function( err, book ) {
 book.title = request.body.title;
 book.author = request.body.author;
 book.releaseDate = request.body.releaseDate;
 return book.save( function( err ) {
 if( !err ) {
 console.log( 'book updated' );
 } else {
 console.log( err );
 }
 return response.send( book );
 });
 });
});

app.delete( '/api/books/:id', function( request, response ) {
 console.log( 'Deleting book with id: ' + request.params.id );
 return BookModel.findById( request.params.id, function( err, book ) {
 return book.remove( function( err ) {
 if( !err ) {
 console.log( 'Book removed' );
 return response.send( book );
 } else {
 console.log( err );
 }
 });
 });
});

//подключение к базе данных
mongoose.connect( 'mongodb://127.0.0.1/test' );
//схемы
var Book = new mongoose.Schema({
 title: String,
 author: String,
 releaseDate: Date
}, {
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
});

Book.virtual('releaseDateMS').get(function () {
	return this.releaseDate ? this.releaseDate.getTime() : '';
});

//модели
var BookModel = mongoose.model( 'Book', Book );

