var urlWordsStart = 'https://wordsapiv1.p.mashape.com/words/'
var urlWordsEnd = '/definitions';
var urlWikiSummaryStart = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles='
var urlWikiSummaryEnd = '&exintro=1'
var urlWikiRandom = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnlimit=10'
var randomResults; // I don't think I need this?


///----------------API functions------------///

function getWikiRandom () {
  $.ajax({
    url: urlWikiRandom,
    dataType: 'JSONP',
    headers: {
      'Api-User-Agent': 'McWikiBot/1.0',
    },
    success: function(data) {
      var randomTitles = [];
      for (i = 0; i < data.query.random.length; i++) {
        randomTitles.push(data.query.random[i]['title'])
      }
      onWikiSuccess(randomTitles)
    } //end success
  }); //end ajax
} //end getWikiRandom, returns the name of five random wiki articles for filtering

function onWikiSuccess(array) {
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
        array[i].startsWith("File") ||
        array[i].startsWith("File:") ||
        array[i].startsWith("Talk:"))) {
          randTitlesFiltered.push(array[i]);
        } //end if
  } //end for loop
  //if there are no viable titles returned, try try again
  if (randTitlesFiltered.length == 0) {
    getWikiRandom();
  }
  getWikiSummary(randTitlesFiltered[0]);
} //end onWikiSuccess, returns array of viable tiles to be sent to getWikiSummary


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
      parseSummary(data.query.pages[Object.keys(data.query.pages)[0]]['extract']); //totally hacky, consider an update
    }
  }); //end ajax
} //end getWikiSummary, returns the summary of the random wiki article

function parseSummary(originalSummary) {
  var $noTagSummary = $(originalSummary).text();
  var summaryArray = $noTagSummary.split(" ");
  if (summaryArray.length < 20 || summaryArray.length > 250) {
    getWikiRandom();
  }
  countWords(summaryArray);
} // end parseSummary, strips HTML from summary and moves the summary into an summaryArray

function countWords(summaryArray) {
  var count = 0;
  var validWords = [];
  for (i = 0; i <summaryArray.length; i ++) {
    if (summaryArray[i].length > 3  && allLCletters(summaryArray[i])) {
      validWordsEntry={};
      validWordsEntry['origLoc']= i;
      validWordsEntry['origWord']= summaryArray[i];
      validWords.push(validWordsEntry);
    }
  }//end for loop
  if (validWords.length < 3) {
    getWikiRandom();
  }
  chooseWords(summaryArray, validWords)
} //end countWords, creates array of words at least 4 letters in length with no special characters

function chooseWords(summaryArray, validWords) {
  var wordsToUse = Math.min(Math.round(summaryArray.length/10), validWords.length, 10)
  var validWordstoAPIObject = {};

  while (Object.keys(validWordstoAPIObject).length < wordsToUse) {
    randPosition = getRandomNumber(validWords.length);
    if (validWords[randPosition]['origWord'] in validWordstoAPIObject) {
      continue;
    }
    else {
      validWordstoAPIObject[validWords[randPosition]['origWord']] = {
        'origWord': validWords[randPosition]['origWord'],
        'origLoc': validWords[randPosition]['origLoc']
      }
    }
  }//end while loop, converts to a object to prevent duplicates
  var validWordstoAPI = Object.values(validWordstoAPIObject); //converts back to array
  console.log(summaryArray);
  console.log(validWordstoAPI);
  appendPartOfSpeech(summaryArray,validWordstoAPI);
}//end chooseWords, selects the words in the article to send to wordsAPI

function appendPartOfSpeech(summaryArray, validWordstoAPI) {
  for(i = 0 ; i < validWordstoAPI.length ; i++) {
    var counter = i;
    iterateGetWord(counter, validWordstoAPI, summaryArray)
  }
  setTimeout(buildForm(summaryArray, validWordstoAPI, exampleParts), 5000);
} //end appendPartOfSpeech, calls 3 functions, starting with iterateGetWord, in a loop

function iterateGetWord (counter, validWordstoAPI, summaryArray) {
     var wikiWord = validWordstoAPI[counter]['origWord']
     getWordData(wikiWord, counter, summaryArray, validWordstoAPI)
} //end iterateGetWord, iterates through the words to send to the API, also calls getWordData>addToValidWords

function getWordData (wikiWord, counter, summaryArray, validWordstoAPI) {
   var requestURL = urlWordsStart + wikiWord + urlWordsEnd;
   $.ajax({
     url: requestURL,
     headers: wordsAPIheader,
     success: function(data) {
       var partOfSpeech = data['definitions'][0]['partOfSpeech'];
       addToValidWords(partOfSpeech, counter, summaryArray, validWordstoAPI);
     } //end success function
   }); //end ajax
} //end getWordData, sends API request to wordsAPI, calls addToValidWords

function addToValidWords(partOfSpeech, counter, summaryArray, validWordstoAPI) {
    validWordstoAPI[counter].partOfSpeech = partOfSpeech;
} //end addToValidWords, adds returned part of speech to valid words array
