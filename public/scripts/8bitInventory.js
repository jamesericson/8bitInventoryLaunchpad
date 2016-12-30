// properties by which searches can be done
// add _ in place of a space inorder to retain information in the DB
// app uses function addSpaces to replace "_" with " " for DOM use
var sizes = [ 'small', 'medium', 'large', 'extra_large'];
var colors = [ 'red', 'orange', 'yellow', 'green', 'mermaid_treasure', 'blue', 'purple' ];

////// global array of items in inventory //////
var items = [];

$( document ).ready( function(){
  init();
}); // end doc ready

var addUnderscore = function(word){
  for (var i = 0; i < word.length; i++) {
    if (word[i] == ' ') {
      word = word.substr(0,i) + '_' + word.substr(i+1)
    }// end if
  } // end for
  return word;
};// end addUnderscore()

var addSpaces = function(word){
  for (var i = 0; i < word.length; i++) {
    if (word[i] == '_') {
      word = word.substr(0,i) + ' ' + word.substr(i+1)
    }// end if
  } // end for
  return word;
}; // end addSpaces()

var setUpOptions = function(){
  var outputText = '<option value=NULL>--Select a Color--</option>';
  for (var i = 0; i < colors.length; i++) {
    outputText += '<option value=' + colors[i] + '>' + addSpaces(colors[i]) + '</option>';
  } // end for
  $('#colorIn, #colorOption').html(outputText);

  outputText = '<option value=NULL>--Select a Size--</option>';
  for (var i = 0; i < sizes.length; i++) {
    outputText += '<option value=' + sizes[i] + '>' + addSpaces(sizes[i]) + '</option>';
  } // end for
  $('#sizeIn, #sizeOption' ).html(outputText);

};//end setUpOptions();

var addObject = function( colorIn, nameIn, sizeIn ){
  console.log( 'in addObject: adding ', nameIn);

  $.ajax({
    type: 'POST',
    url: '/addItem',
    data: {
      color: colorIn,
      name: nameIn,
      size: sizeIn
    },
    success: function(response){
      console.log('back from server with: ', response);
      getObjects();
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

var findNamedObject = function( nameCheck ){
  var matches = [];
  for ( var i = 0; i < items.length; i++ ) {
    if( items[i].name == nameCheck ){
      // match, add to array
      matches.push( items[i] );
    } // end if
  } // end for
  displayFoundObjects(matches);
}; // end findNamedObject()

var deleteObject = function( objectName ){
  console.log('in deleteObject: deleting = ', {name: objectName});
  $.ajax({
    type: 'POST',
    url: '/deleteItem',
    data: {name: objectName},
    success: function(response){
      console.log(response);
      getObjects();
    },
    error: function (err) {
      console.log(err);
    }
  });//end ajax
}// end deleteObject()

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
      updateDeleteOptions(response);
    },
    error: function (err) {
      console.log(err);
    }
  });//end ajax
}; // end getObjects

var displayObjects = function(itemArray){
  var outputText = '<ul>';
  for (var i = 0; i < itemArray.length; i++) {
    outputText += '<li>a ' + addSpaces(itemArray[i].size) + ' ' + addSpaces(itemArray[i].color) + ' ' + itemArray[i].name + '</li>';
  }
  outputText += '</ul>';
  $('#outputText').html(outputText);
};//end displayItems()

var updateDeleteOptions = function(itemArray){
  var outputText = '<option value=NULL>--Select a Name--</option>';
  for (var i = 0; i < itemArray.length; i++) {
    outputText += '<option value=' + addUnderscore(itemArray[i].name) + '>' + itemArray[i].name + '</option>';
  }
  $('#deleteName').html(outputText);

}// end updateDeleteOptions()

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

  if ($('#searchItems').attr('data') === 'name'){
    console.log('searching by name');
    if ($('#nameOption').val() === ''){
      $('#errorNameOption').text('ERROR: missing item name');
      return;
    }
    findNamedObject( $('#nameOption').val() );
  }else{
    console.log('searching by type');
    findObject(
      $('#colorOption').val(),
      $('#sizeOption').val()
    );
  }//end if else

  $('input').val('');
  $('select').val('NULL');

};// end userSearch()

var userDelete = function() {
  $('.errorMessage').text('');
  var deleteName = $('#deleteName').val();

  if (deleteName == 'NULL'){
    $('#errorDeleteName').text('ERROR: missing item name');
    return;
  }
  console.log('to be deleted: ', deleteName);
  deleteObject( addSpaces(deleteName) );

  $('input').val('');
  $('select').val('NULL');

}// end userDelete()

var setSearchAs = function(){
  $('.errorMessage').text('');
  $('.searchBy').addClass('notSelectedOption');
  $( this ).removeClass('notSelectedOption');

  switch ($( this ).attr( 'name' ) ) {
    case 'name':
      $('#sizeOption').hide();
      $('#colorOption').hide();
      $('#nameOption').show();

      $('#searchItems').attr('data', 'name');
      break;
    case 'type':
      $('#sizeOption').show();
      $('#colorOption').show();
      $('#nameOption').hide();

      $('#searchItems').attr('data', 'type');
      break;
    default:
  } // end switch

}; // setSearchAs()

var init = function(){
  ////when doc is ready////
  // set search to 'by type'
  $('#searchByName').hide();
  $('#nameOption').hide();
  // hide search area
  $('.searchResults').hide();
  // get objects
  getObjects();
  setUpOptions();

  eventlisteners();
}; // end init()

var eventlisteners = function(){
  $('#addItem').on('click', userAdd);
  $('#searchItems').on('click', userSearch);
  $('#deleteItems').on('click', userDelete);

  $('.searchBy').on('click', setSearchAs);

}; // end eventlisteners()
