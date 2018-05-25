var urlWordsStart = 'https://wordsapiv1.p.mashape.com/words/'
var urlWordsEnd = '/definitions';
var urlWikiStart = 'https://simple.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles='
var urlWikiEnd = '&exintro=1'

// settings are in an object, key/value

function getWordData (wikiWord) {
  var requestURL = urlWordsStart + wikiWord + urlWordsEnd;
  $.ajax({
    url: requestURL,
    headers: wordsAPIheader,
    success: function(data) {
      console.log(data);
    }
  }); //end ajax
} //end function

function getWikiSummary (wikiTitle) {
  var requestURL = urlWikiStart + wikiTitle + urlWikiEnd;
  $.ajax({
    url: requestURL,
    headers: {
      'Api-User-Agent': 'McWikiBot/1.0',
      'Origin': 'https://www.mcwebsite.net'
    },
    success: function(data) {
      console.log(data);
    }
  }); //end ajax
} //end function

getWikiSummary('architecture');
