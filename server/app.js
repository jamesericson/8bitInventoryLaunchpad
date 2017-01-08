var express = require( 'express' );
var app = express();
var path = require( 'path' );
var bodyParser = require( 'body-parser' );
var urlEncodedParser = bodyParser.urlencoded( { extended: true } );
var pg = require( 'pg' );
var port = process.env.PORT || 3003;
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/inventory'

//global variable to control how data is gotten from DB
var sortBy = 'name'

// spin up server
app.listen( port, function(){
  console.log( 'server up on:', port );
}); // end spin up server

// base url
app.get( '/', function( req, res ){
  console.log( 'base url hit' );
  res.sendFile( path.resolve( 'views/index.html' ) );
}); // end home base


// add new objects to the inventory
app.post( '/addItem', urlEncodedParser, function( req, res ){
  console.log( 'addItem route hit:', req.body );
  // connect to db
  pg.connect(connectionString, function( err, client, done ){
    if (err){
      console.log(err);
    } else {
      console.log('connected to DB');
      client.query( 'INSERT INTO storeInventory (name, color, size, img_url) VALUES ($1, $2, $3, $4)', [req.body.name, req.body.color, req.body.size, req.body.imgURL]);
      done();
      res.send('coolio');
    } // end if else
  });// end connect

}); // end addItem route

// delete object from the inventory
app.delete( '/deleteItem/:name', urlEncodedParser, function( req, res ){
  console.log( 'deleteItem route hit:', req.params.name );
  // connect to db
  pg.connect(connectionString, function( err, client, done ){
    if (err){
      console.log(err);
    } else {
      console.log('connected to DB');
      client.query( 'DELETE FROM storeInventory WHERE name=$1', [req.params.name]);
      done();
      res.send('coolio');
    } // end if else
  });// end connect

}); // end addItem route

// change sorting variable which controls how data is displayed
app.post( '/sortBy', urlEncodedParser, function( req, res ){
  console.log( 'sortBy route hit:', req.body );
  sortBy = req.body.sortBy;

  if (sortBy === 'size')sortBy += ' DESC';
  console.log('sortBy = ', sortBy);

  res.send('coolio');
}); // end addItem route

// get all objects in the inventory
app.get( '/getInventory', function( req, res ){
  console.log( 'getInventory route hit' );
  // connect to DB
  pg.connect(connectionString, function(err, client, done){
    if(err){
      console.log(err);
    } else {
      console.log('connected to DB');
      var query = client.query( 'SELECT * FROM storeInventory ORDER BY ' + sortBy + ';');
      //array for list
      var allInventory = [];
      query.on( 'row', function( row ){
        allInventory.push (row);
      });
      query.on( 'end', function(){
      done();

      res.send( allInventory);
      });
    }//end if else
  })// end connect
}); // end addItem route

//search DB object by either name, color, or size
app.post( '/search', urlEncodedParser, function( req, res ){
  console.log( 'search route hit:', req.body );
  //create sql search string appending each search types
  var searchedBy = ''; //variable passes info by which the search was made
  var and = false; // variable tracks multiply inquiries to add an 'and'
  var searchString = 'SELECT * FROM storeInventory WHERE';
  if (req.body.name !== ''){
    searchString+= ' name LIKE \'%' + req.body.name + '%\'';
    searchedBy += 'name ("' +req.body.name+ '")';
  } // end if name
  if (req.body.color !== 'NULL'){
    searchString+= ' color = \'' + req.body.color + '\'';
    searchedBy += 'color (' +req.body.color+ ')';
    and = true;
  } // end if color
  if (req.body.size !== 'NULL'){
    if (and){
      searchString+=' AND ';
      searchedBy += ' and ';
    } // end nested if and
    searchString+= ' size = \'' + req.body.size + '\'';
    searchedBy += 'size (' +req.body.size+ ')';
  } // end if size
  searchString+= ' ;';
  // connect to db
  pg.connect(connectionString, function( err, client, done ){
    if (err){
      console.log(err);
    } else {
      console.log('connected to DB');
      var query = client.query( searchString );
      //array for list
      var matches = [];
      query.on( 'row', function( row ){
        matches.push (row);
      }); // end 1st query.on
      query.on( 'end', function(){
        done();
        res.send( {
          searchedBy: searchedBy,
          matches: matches
        } );

      }); // end 2nd query.on
    } // end if else
  });// end connect
}); // end addItem route

// static folder
app.use( express.static( 'public' ) );
