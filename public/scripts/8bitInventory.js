// properties by which searches can be done
var sizes = [ 'small', 'medium', 'large'];
var colors = [ 'red', 'orange', 'yellow', 'green', 'mermaid treasure', 'blue', 'purple' ];

////// global array of items in inventory //////
var items = [];

$( document ).ready( function(){
  init();
}); // end doc ready

var setUpOptions = function(){
  var outputText = '<option value=NULL>--Select a Color--</option>';
  for (var i = 0; i < colors.length; i++) {
    outputText += '<option value=' + colors[i] + '>' + colors[i] + '</option>';
  }
  $('#colorIn, #colorOption').html(outputText);

  outputText = '<option value=NULL>--Select a Size--</option>';
  for (var i = 0; i < sizes.length; i++) {
    outputText += '<option value=' + sizes[i] + '>' + sizes[i] + '</option>';
  }
  $('#sizeIn, #sizeOption' ).html(outputText);

};//end setUpOptions();

var addObject = function( colorIn, nameIn, sizeIn ){
  console.log( 'in addObject' );
  // assemble object from new fields
  var newItem = {
    color: colorIn,
    name: nameIn,
    size: sizeIn
  }; // end testObject
  console.log( 'adding:', newItem );
  $.ajax({
    type: 'POST',
    url: '/addItem',
    data: newItem,
    success: function(response){
      console.log('back from server with: ', response);
      items.push( newItem );
      displayObjects(items);
    },
    error: function(err){
      console.log('back from server with error: ', err);
    }
  });// end ajax
}; // end addObject

var findObject = function( colorCheck, sizeCheck ){
  console.log( 'in findObject. Looking for:', colorCheck, sizeCheck );
  // array of matches
  var matches = [];
  for ( var i = 0; i < items.length; i++ ) {
    if( items[i].color == colorCheck && items[i].size == sizeCheck ){
      // match, add to array
      matches.push( items[i] );
    } // end if
  } // end for
  displayFoundObjects(matches);
}; // end findObject

var displayFoundObjects = function(itemArray){
  $('.searchResults').slideUp( function(){
    var outputText = '<h2>Search Results</h2>';
    if(itemArray.length == 0){
      outputText += '<p>no matching items found</p>';
    }
    outputText += '<ul>';
    for (var i = 0; i < itemArray.length; i++) {
      outputText += '<li>a ' + itemArray[i].name + '</li>';
    } // end for
    outputText += '</ul>';
    $('.searchResults').html(outputText);
  }); // end slideTaggle
  $('.searchResults').slideDown();
}; // displayFoundObjects()

var getObjects = function(){
  console.log( 'in getObjects');
  // populate the items array
  $.ajax({
    type: 'GET',
    url: '/getInventory',
    success: function(response){
      console.log(response);
      items = response;
      displayObjects(response);
    },
    error: function (err) {
      console.log(err);
    }
  });//end ajax
}; // end getObjects

var displayObjects = function(itemArray){
  var outputText = '<ul>';
  for (var i = 0; i < itemArray.length; i++) {
    outputText += '<li>a ' + itemArray[i].size + ' ' + itemArray[i].color + ' ' + itemArray[i].name + '</li>';
  }
  outputText += '</ul>';
  $('#outputText').html(outputText);
};//end displayItems()

var userAdd = function(){
  $('.errorMessage').text('');
  var colorIn = $('#colorIn').val();
  var nameIn = $('#nameIn').val();
  var sizeIn = $('#sizeIn').val();

  if ( colorIn == 'NULL' || nameIn == '' || sizeIn == 'NULL'){
    if (colorIn == 'NULL')$('#errorColorIn').text('ERROR: missing item color');
    if (nameIn == '')$('#errorNameIn').text('ERROR: missing item name');
    if (sizeIn == 'NULL')$('#errorSizeIn').text('ERROR: missing item size');
    return;
  }
  $('.searchResults').hide()

  addObject( colorIn, nameIn, sizeIn );

  $('input').val('');
  $('select').val('NULL');

};// end userAdd()

var userSearch = function(){
  $('.errorMessage').text('');

  findObject(
    $('#colorOption').val(),
    $('#sizeOption').val()
  );
  $('input').val('');
  $('select').val('NULL');

};// end userSearch()

var userDelete = function() {
  $('.errorMessage').text('');
  var deleteName = $('#deleteName').val();

  if (deleteName == ''){
    $('#errorDeleteName').text('ERROR: missing item name');
    return;
  }

  console.log('deleting... (maybe)');
  $('input').val('');
}// end userDelete()

var init = function(){
  ////when doc is ready////
  // hide search area
  $('.searchResults').hide();
  // get objects
  getObjects();
  setUpOptions();

  eventlisteners();
}; // end init()

var eventlisteners = function(){
  $('#sellItem').on('click', userAdd);
  $('#searchItems').on('click', userSearch);
  $('#deleteItems').on('click', userDelete);

}; // end eventlisteners()
