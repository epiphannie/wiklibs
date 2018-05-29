var urlWordsStart = 'https://wordsapiv1.p.mashape.com/words/'
var urlWordsEnd = '/definitions';
var urlWikiSummaryStart = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles='
var urlWikiSummaryEnd = '&exintro=1'
var urlWikiRandom = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnlimit=10'
var randomResults;

function getWikiRandom () {
  $.ajax({
    url: urlWikiRandom,
    dataType: 'JSONP',
    headers: {
      'Api-User-Agent': 'McWikiBot/1.0',
    },
    success: function(data) {
      console.log(data.query.random);
      var randomTitles = [];
      for (i = 0; i < data.query.random.length; i++) {
        randomTitles.push(data.query.random[i]['title'])
      }
      onRandomSuccess(randomTitles)
    } //end success
  }); //end ajax
} //end getWikiRandom, returns the name of five random wiki articles for filtering

function onRandomSuccess(array) {
  // fed into getWikiRandom
  var randTitlesFiltered = [];
  for (i = 0; i < array.length; i++) {
    // could clean this up after I get all the bad search terms listed
    if (!(array[i].startsWith("User") ||
        array[i].startsWith("Talk") ||
        array[i].startsWith("Template") ||
        array[i].startsWith("Category") ||
        array[i].startsWith("Wikipedia") ||
        array[i].startsWith("Portal") ||
        array[i].startsWith("File"))) {
          randTitlesFiltered.push(array[i]);
        } //end if
  } //end for loop
  //if there are no viable titles returned, try try again
  if (randTitlesFiltered.length == 0) {
    getWikiRandom()
  }
  console.log(randTitlesFiltered);
  getWikiRandom(randTitlesFiltered[0];)
} //end onRandomSuccess, returns array of viable tiles to be sent to getWikiSummary


function getWikiSummary (wikiTitle) {
  var requestURL = urlWikiSummaryStart + encodeURI(wikiTitle) + urlWikiSummaryEnd;
  //replaces special characters with not special ones :(
  $.ajax({
    url: requestURL,
    dataType: 'JSONP',
    headers: {
      'Api-User-Agent': 'McWikiBot/1.0',
    },
    success: function(data) {
      console.log(data);
      //some sort of filtering so only the summary is kept in a variable
      parseSummary(name of variable);
    }
  }); //end ajax
} //end getWikiSummary, returns the summary of the random wiki article

function parseSummary(originalSummary) {
  var $noTagSummary = $(originalSummary).text();
  var summaryArray = $noTagSummary.split(" ");
  if (summaryArray.length < 20) {
    getWikiRandom()
  }
  console.log(summaryArray);
  chooseWords(summaryArray);
} // end parseSummary, strips HTML from summary and moves the summary into an summaryArray

function chooseWords(summaryArray) {
  var count = 0;
  for (i = 0; i <summaryArray.length; i ++) {
    if (summaryArray[i].length > 3){
      count +=1;
    }
  if (math.round(summaryArray.length/10) > math.round(summaryArray.length/count)) {
    //if there are more than enough 4-letter words to remove 1 in 10
    for (i = 0; )
  } else //if there are less than enough 4-letter words to remove 1 in 10

  }//end for loop
} //end chooseWords, selects words to be sent to wordsAPI for part of speech retrieval

function
function getWordData (wikiWord) {
  var requestURL = urlWordsStart + wikiWord + urlWordsEnd;
  $.ajax({
    url: requestURL,
    headers: wordsAPIheader,
    success: function(data) {
      console.log(data);
    }
  }); //end ajax
} //end getWordData, sends API request to wordsAPI

//

// var finalSummary = summaryArray.join(" ");
// console.log(finalSummary);
