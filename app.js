var urlWordsStart = 'https://wordsapiv1.p.mashape.com/words/'
var urlWordsEnd = '/definitions';
var urlWikiSummaryStart = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles='
var urlWikiSummaryEnd = '&exintro=1'
var urlWikiRandom = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnlimit=10'
var randomResults; // I don't think I need this?

///--------------Utility functions-------------///
function allLCletters(word) {
  var letters = /^[a-z]+$/;
  if (word.match(letters)) {
    return true;
  } else {
    return false;
  }
}//end allLCletters

function getRandomNumber(max) {
  return Math.floor(Math.random() * (max-0 +1) + 0);
}


///----------------Wiklibs functions------------///

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
    setTimeout(getWikiRandom(), 60000);
  }
  setTimeout(getWikiSummary(randTitlesFiltered[0]), 60000);
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
      console.log(data);
      parseSummary(data.query.pages[Object.keys(data.query.pages)[0]]['extract']); //totally hacky, consider an update
    }
  }); //end ajax
} //end getWikiSummary, returns the summary of the random wiki article

function parseSummary(originalSummary) {
  var $noTagSummary = $(originalSummary).text();
  var summaryArray = $noTagSummary.split(" ");
  if (summaryArray.length < 20) {
    setTimeout(getWikiRandom(), 60000)
  }
  console.log(summaryArray);
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
  console.log(validWords);
  console.log('The length of valid words is ' + validWords.length)
  if (validWords.length < 3) {
    setTimeout(getWikiRandom(), 60000)
  }
  chooseWords(summaryArray, validWords)
} //end countWords, creates array of words at least 4 letters in length with no special characters

function chooseWords(summaryArray, validWords) {
  var wordsToUse = Math.min(Math.round(summaryArray.length)/10, validWords.length)
  var validWordstoAPI = [];
  for (i = 0; i < wordsToUse; i++) {
    randPosition = getRandomNumber(validWords.length);
    validWordstoAPI.push(validWords[randPosition]);
  } //this doesn't save the original index of the word. Need to fix.
  console.log(validWordstoAPI);
  console.log('The length of words to API is ' + validWordstoAPI.length)
  appendPartOfSpeech(summaryArray,validWordstoAPI);
}//end chooseWords, selects the words in the article to send to wordsAPI
//
// // function getWords(summaryArray,validWordstoAPI) {
// //   var wordsToLookup = [];
// //   for (i = 0 ; i < indexOfAPIWords.length; i++ ) {
// //     wordsToLookup.push(validWords[indexOfAPIWords[i]]);
// //   }
// //  console.log(wordsToLookup)
// //   console.log(summaryArray)
// // }//end getWords, selects the words from the summary array based on the random list of valid words
function appendPartOfSpeech(summaryArray, validWordstoAPI) {
  for(i = 0 ; i < validWordstoAPI.length ; i++) {
    var counter = i;
    iterateGetWord(counter, validWordstoAPI, summaryArray)
  }
  console.log(validWordstoAPI);
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
       console.log(data['definitions'][0]['partOfSpeech']);
       var partOfSpeech = data['definitions'][0]['partOfSpeech'];
       addToValidWords(partOfSpeech, counter, summaryArray, validWordstoAPI);
     } //end success function
   }); //end ajax
} //end getWordData, sends API request to wordsAPI, calls addToValidWords

function addToValidWords(partOfSpeech, counter, summaryArray, validWordstoAPI) {
    validWordstoAPI[counter].partOfSpeech = partOfSpeech;
} //end addToValidWords, adds returned part of speec to valid words array



// var finalSummary = summaryArray.join(" ");
// console.log(finalSummary);
