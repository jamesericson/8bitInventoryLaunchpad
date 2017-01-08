// properties by which searches can be done
// add _ in place of a space inorder to retain information in the DB
// app uses function addSpaces to replace "_" with " " for DOM use
var sizes = [ 'small', 'medium', 'large', 'extra_large'];
var colors = [ 'black', 'red', 'orange', 'yellow', 'green', 'mermaid_treasure', 'blue', 'purple' ];

var nuPicOpt = 10; // number of img from flickr api displayed at a time **IMPORTANT-> can't go more than 10


$( document ).ready( function(){
  init();
}); // end doc ready

// Utile functions =========================================
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

// Logic/Ajax functions===========================================
var search = function(object){
  console.log('in search, with object: ', object);

  $.ajax({
    type: 'POST',
    url: '/search',
    data: object,
    success: function(response){
      console.log('back from server, data: ', response);
      displaySearchResults(response.matches, response.searchedBy);
    },
    error: function(err){
      console.log('back from server with error: ', err);
    }
  });// end ajax
};// end search()

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

var deleteObject = function( objectName ){
  console.log('in deleteObject: deleting = ', {name: objectName});
  $.ajax({
    type: 'DELETE',
    url: '/deleteItem/' + objectName,
    success: function(response){
      console.log(response);
      getObjects();
    },
    error: function (err) {
      console.log(err);
    }
  });//end ajax
}// end deleteObject()

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

// User Interaction functions==================================
var userSearch = function(){
  $('.errorMessage').text('');
  var colorIn = $('#colorOption').val();
  var sizeIn = $('#sizeOption').val();
  var nameIn = $('#nameOption').val();

  if ($('#searchItems').attr('data') === 'name' && nameIn === ''){
      $('#errorNameOption').text('ERROR: missing item name');
      return;
    }// end if
  if ($('#searchItems').attr('data') === 'type' && ( colorIn === 'NULL' && sizeIn === 'NULL') ){
      if (colorIn == 'NULL')$('#errorColorOption').text('ERROR: missing item size');
      if (sizeIn == 'NULL')$('#errorSizeOption').text('ERROR: missing item size');
      return;
    }// end if

  search( {
    color: colorIn,
    size: sizeIn,
    name: nameIn
  } );

  $('input').val('');
  $('select').val('NULL');

};// end userSearch()

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

var picOptions = function() {
  console.log('in picOptions');
  $('.errorMessage').text('');
  var nameIn = $('#nameIn').val();
  if (nameIn == ''){
    $('#errorNameIn').text('ERROR: missing item name');
    return;
  }// end if
  // bellow accesses a flickr api to find most recent posts under a certain tag
  $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
  {
    tags: nameIn,
    tagmode: "any",
    format: "json"
  },
  function(data) {
    console.log('Data from Flickr API: ', data.items);

    displayPicOptions(data.items)
  });// end ajax
}; // end picOptions

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

// Display to DOM functions=============================
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

var displayPicOptions = function(picArray){
  console.log('in displayPicOptions');

  var outputText = '<p>Click on an image or click to load more</p>';
  for( var i=0 ; i < nuPicOpt ; i++){
    outputText += '<img class="selectImg" index=' + i + ' src="' + picArray[i].media.m + '" alt="' + nameIn + ' image option">';
  }; // end for
  outputText += '<img class="selectImg" index=99 src="img/moreImg.png" alt="load more images?">';
  $('#picOptions').html(outputText);
  $('#picOptions').slideDown();

  $(document).one('click', '.selectImg' ,function(){
    if ( $(this).attr('index') == 99 ){
        var outputText = '<p>Click on an image or click on cancel</p>';
        for( var i=nuPicOpt ; i < (nuPicOpt*2) ; i++){
          outputText += '<img class="selectImg" index=' + i + ' src="' + picArray[i].media.m + '" alt="' + nameIn + ' image option">';
        }; // end for
        outputText += '<img class="selectImg" index=99 src="img/cancelImg.png" alt="load more images?">';
        $('#picOptions').html(outputText);
        $(document).one('click', '.selectImg' ,function(){
          if ( $(this).attr('index') == 99 ){
            $('#picOptions').slideUp( );
          } else {
            $('#picOptions').slideUp( );
            $('#imgIn').val( $(this).attr('src') );
          } // end if else
        });// end nested one click
      } else {
        $('#picOptions').slideUp();
        $('#imgIn').val( $(this).attr('src') );
      }
    }); //end one click

} // end displayPicOptions

var displaySearchResults = function(itemArray, searchedBy){
  $('.searchResults').slideUp( function(){
    var outputText = '<h2>Search Results</h2>'+
                     '<h3>Searched by ' + searchedBy;

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
}; // displaySearchResults()

var updateDeleteOptions = function(itemArray){
  var outputText = '<option value=NULL>--Select a Name--</option>';
  for (var i = 0; i < itemArray.length; i++) {
    outputText += '<option value=' + addUnderscore(itemArray[i].name) + '>' + itemArray[i].name + '</option>';
  }
  $('#deleteName').html(outputText);

}// end updateDeleteOptions()

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

//==============================================================
//==============================================================
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

  $(window).scroll(function(){
    $("#left-section").css("top", Math.max(-40, 92 - $(this).scrollTop()));
});
}; // end eventlisteners()
