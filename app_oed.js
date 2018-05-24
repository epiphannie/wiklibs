var urlOedStart = 'https://od-api.oxforddictionaries.com/api/v1/entries/en/';
var urlOedEnd = '/lexicalCategory';
var word = 'cup';

// settings are in an object, key/value

function getWordData () {
  var requestURL = urlOedStart + word_id + urlOedEnd;
  $.ajax({
    "url": reuestURL,
    "headers": {
      "app_id": appIdOed,
      "app_key": appKeyOed
    },
    "success": function(data) {
      console.log(data);
    }
  }); //end ajax
} //end function
