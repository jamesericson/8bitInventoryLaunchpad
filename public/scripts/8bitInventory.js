// properties by which searches can be done
// add _ in place of a space inorder to retain information in the DB
// app uses function addSpaces to replace "_" with " " for DOM use
var sizes = [ 'small', 'medium', 'large', 'extra_large'];
var colors = [ 'black', 'red', 'orange', 'yellow', 'green', 'mermaid_treasure', 'blue', 'purple' ];

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

var formateDate = function(date){
  var dateString = date.slice(5,10) + '-' + date.slice(2,4) + ' @ ';

  var time = date.slice(11,13);
  // change time to central time zone
  var time = parseInt(time) - 6;
  if (time < 0){
    time += 24;
  }
  // make time in AM/PM formate
  if (time<12){
    dateString += time + date.slice(13,16) + 'am';
  } else if ( time == 12 ){
    dateString += '12' + date.slice(13,16) + 'pm';
  } else {
    dateString += (time-12) + date.slice(13,16) + 'pm';
  } // end if else

  return dateString
}//end formateDate()

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

var addObject = function( colorIn, nameIn, sizeIn, imgIn ){
  console.log( 'in addObject: adding ', nameIn);

  $.ajax({
    type: 'POST',
    url: '/addItem',
    data: {
      color: colorIn,
      name: nameIn,
      size: sizeIn,
      imgURL : imgIn
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

  $.ajax({
    type: 'POST',
    url: '/findObject',
    data: {color: colorCheck, size: sizeCheck},
    success: function(response){
      console.log('back from server, data: ', response);
      displayFoundObjects(response);
    },
    error: function(err){
      console.log('back from server with error: ', err);
    }
  });// end ajax
}; // end findObject

var findNamedObject = function( nameCheck ){
  console.log( 'in findNamedObject. Looking for:', nameCheck );

  $.ajax({
    type: 'POST',
    url: '/findNamedObject',
    data: {name: nameCheck},
    success: function(response){
      console.log('back from server, data: ', response);
      displayFoundObjects(response);
    },
    error: function(err){
      console.log('back from server with error: ', err);
    }
  });// end ajax
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
    for (var i = 0; i < itemArray.length; i++) {
      outputText += '<div class="item"><div class="itemImg"><img src="'+ itemArray[i].img_url +'" alt="'+ itemArray[i].name +' image"></div>' +
                    '<div><p class="itemName">' + itemArray[i].name + '</p>' +
                    '<p>Size: ' + addSpaces(itemArray[i].size) + '</p> '+
                    '<p>Color: ' + addSpaces(itemArray[i].color) + '</p></div>'+
                    '<div><p class="itemCreated" >Created: '+ formateDate(itemArray[i].created) +'</p></div></div>';
    } // end for
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
      displayObjects(response);
      updateDeleteOptions(response);
    },
    error: function (err) {
      console.log(err);
    }
  });//end ajax
}; // end getObjects

var displayObjects = function(itemArray){
  var outputText = '';
  for (var i = 0; i < itemArray.length; i++) {
    outputText += '<div class="item"><div class="itemImg"><img src="'+ itemArray[i].img_url +'" alt="'+ itemArray[i].name +' image"></div>' +
                  '<div><p class="itemName">' + itemArray[i].name + '</p>' +
                  '<p>Size: ' + addSpaces(itemArray[i].size) + '</p> '+
                  '<p>Color: ' + addSpaces(itemArray[i].color) + '</p></div>'+
                  '<div><p class="itemCreated" >Created: '+ formateDate(itemArray[i].created) +'</p></div></div>';
  } // end for
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
  var imgIn = $('#imgIn').val();

  if ( colorIn == 'NULL' || nameIn == '' || sizeIn == 'NULL' || imgIn == ''){
    if (colorIn == 'NULL')$('#errorColorIn').text('ERROR: missing item color');
    if (nameIn == '')$('#errorNameIn').text('ERROR: missing item name');
    if (sizeIn == 'NULL')$('#errorSizeIn').text('ERROR: missing item size');
    if (imgIn == '')$('#errorImgIn').text('ERROR: missing image url')
    return;
  }
  $('.searchResults').hide()

  addObject( colorIn, nameIn, sizeIn, imgIn );

  $('input').val('');
  $('select').val('NULL');

};// end userAdd()

var userSearch = function(){
  $('.errorMessage').text('');
  var colorIn = $('#colorOption').val();
  var sizeIn = $('#sizeOption').val();
  var nameIn = $('#nameOption').val();

  if ($('#searchItems').attr('data') === 'name'){
    console.log('searching by name');
    if (nameIn === ''){
      $('#errorNameOption').text('ERROR: missing item name');
      return;
    }
    findNamedObject( nameIn );
  }else{
    console.log('searching by type');
    if ( colorIn === 'NULL' || sizeIn === 'NULL'){
      if (colorIn == 'NULL')$('#errorColorOption').text('ERROR: missing item size');
      if (sizeIn == 'NULL')$('#errorSizeOption').text('ERROR: missing item size');
      return;
    }// end if
    findObject(colorIn, sizeIn);
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

var sortAs = function(){
  console.log('this is this', this);

  $('.errorMessage').text('');
  $('.sortBy').addClass('notSelectedOption');
  $( this ).removeClass('notSelectedOption');

  $.ajax({
    type: 'POST',
    url: '/sortBy',
    data: {sortBy:  $(this).attr( 'name' )},
    success: function(resonse){
      console.log('back from server:', resonse);

      getObjects();
    },
    error: function(err){
      console.log('error from server:', err);
    }
  });//end ajax
}; // end sortAs()

var picOptions = function() {
  console.log('in picOptions');
  $('.errorMessage').text('');
  var nameIn = $('#nameIn').val();
  if (nameIn == ''){
    $('#errorNameIn').text('ERROR: missing item name');
    return;
  }
  // bellow is a borrowed code that access an flickr api to find most recent posts under a certain tag
  $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
{
  tags: nameIn,
  tagmode: "any",
  format: "json"
},
function(data) {
  var outputText = '';
  $.each(data.items, function(i,item){
    outputText += '<img src="' + item.media.m + ' alt="' + nameIn + ' image option">';
    if ( i == 6 ) return false;
  }); // end each
  $('#picOptions').html(outputText);
  $('#picOptions').slideDown();
});// end ajax


  //
  // var outputText = '';
  //
  // for (var i = 0; i < 6; i++) {
  //   outputText += '<img src="http://3dprintingindustry.com/wp-content/uploads/2014/12/vault-boy-3d-printing.jpg" alt="good job">';
  // }
  //
  // $('#picOptions').html(outputText);
  // $('#picOptions').slideDown();
}; // end picOptions


//=============================================================//
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
  $('.sortBy').on('click', sortAs)
  $(document).on('click', '#getImages', picOptions)
}; // end eventlisteners()
