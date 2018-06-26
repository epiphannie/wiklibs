var urlWordsStart = 'https://wordsapiv1.p.mashape.com/words/'
var urlWordsEnd = '/definitions';
var urlWikiSummaryStart = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles='
var urlWikiSummaryEnd = '&exintro=1'
var urlWikiRandom = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnlimit=10'
var returnedDefs = 0

///----------------API functions------------///

function getWikiRandom () {
  returnedDefs = 0;
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
  } else {
    getWikiSummary(randTitlesFiltered[0]);
  }
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
  if (summaryArray.length < 20 || summaryArray.length > 150) {
    // summary is too short or long, get wiki random
    getWikiRandom();
  } else {
    countWords(summaryArray);
  }
} // end parseSummary, strips HTML from summary and moves the summary into an summaryArray

function countWords(summaryArray) {
  var count = 0;
  var validWords = [];
  for (i = 0; i <summaryArray.length; i ++) {
    if (summaryArray[i].length > 4  && allLCletters(summaryArray[i])) {
      validWordsEntry={};
      validWordsEntry['origLoc']= i;
      validWordsEntry['origWord']= summaryArray[i];
      validWords.push(validWordsEntry);
    }
  }//end for loop
  if (validWords.length < 3) {
    //not enough valid words, get wiki random
    getWikiRandom();
  } else {
    chooseWords(summaryArray, validWords)
  }
} //end countWords, creates array of words at least 5 letters in length with no special characters

function chooseWords(summaryArray, validWords) {
  var wordsToUse = Math.min(Math.round(summaryArray.length/10), validWords.length, 5)
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
  appendPartOfSpeech(summaryArray,validWordstoAPI);
}//end chooseWords, selects the words in the article to send to wordsAPI

function appendPartOfSpeech(summaryArray, validWordstoAPI) {
  for(i = 0 ; i < validWordstoAPI.length ; i++) {
    var counter = i;
    iterateGetWord(counter, validWordstoAPI, summaryArray)
  }

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
       // console.log(data);

      // initial part of speech check
      if (data && data['definitions'] && data['definitions'].length>0 && data['definitions'][0]['partOfSpeech']) {
        var partOfSpeech = data['definitions'][0]['partOfSpeech'];

        if (wikiWord.substr(wikiWord.length - 3) === 'ing') {
          partOfSpeech = '-ing word';
        } else if (wikiWord.substr(wikiWord.length - 2) === 'ed') {
          partOfSpeech = '-ed word';
        }
        if (partOfSpeech === 'noun' && wikiWord.substr(wikiWord.length - 1) === 's') {
          partOfSpeech = 'plural noun';
        } else if (partOfSpeech === 'noun' && wikiWord.substr(wikiWord.length - 1) !== 's') {
          partOfSpeech = 'singular noun';
        }
        if (partOfSpeech === 'verb' && wikiWord.substr(wikiWord.length - 1) === 's') {
          partOfSpeech = 'third-person verb';
        } else if (partOfSpeech === 'verb' && wikiWord.substr(wikiWord.length - 1) !== 's') {
          partOfSpeech = 'verb not ending in "s"';
        }
         addToValidWords(partOfSpeech, counter, summaryArray, validWordstoAPI);
       } else {
         //part of speech is undefined
         addToValidWords('NA', counter, summaryArray, validWordstoAPI);
       } //end if/else
     }, //end success function
     error: function(jqXHR, exception) {
       addToValidWords('NA', counter, summaryArray, validWordstoAPI);
     }//end error function
   }); //end ajax
} //end getWordData, sends API request to wordsAPI, calls addToValidWords

function addToValidWords(partOfSpeech, counter, summaryArray, validWordstoAPI) {
    validWordstoAPI[counter].partOfSpeech = partOfSpeech;
    returnedDefs += 1;

    if (returnedDefs === validWordstoAPI.length) {
      for(var i = validWordstoAPI.length - 1; i >= 0; i--) {
        if(validWordstoAPI[i]['partOfSpeech'] === 'NA') {
          validWordstoAPI.splice(i, 1);
        }
      }//end for loop removing NA elements
      if (validWordstoAPI.length < 2) {
        // not enough returned definitions. get wiki random
        getWikiRandom()
      } else {
        buildForm(summaryArray, validWordstoAPI, exampleParts);
      }
    }//end if when all API calls are returned
} //end addToValidWords, adds returned part of speech to valid words array
