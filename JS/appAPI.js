const urlWordsStart = 'https://wordsapiv1.p.mashape.com/words/'
const urlWordsEnd = '/definitions';
const urlWikiSummaryStart = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles='
const urlWikiSummaryEnd = '&exintro=1';
const urlWikiRandom = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnlimit=10'
const encryptedAPI = "{\"iv\":\"kPhtqlQ7eRmTmzyPl+qgZQ==\",\"v\":1,\"iter\":10000,\"ks\":128,\"ts\":64,\"mode\":\"ccm\",\"adata\":\"\",\"cipher\":\"aes\",\"salt\":\"8rFXo7+KDiI=\",\"ct\":\"klP/yzcsi+y6SoL76bBdnjXXZ1bi7IwHcwz7vDJ2uc+GnXSZCEGTHoPt8bJNtv7jMiDx9txsKCRi6A==\"}";
var wordsAPIheader = {
  "X-Mashape-Key": "", //put your WordsAPI key here
  "X-Mashape-Host": "wordsapiv1.p.mashape.com"
};
var decrypted = false; //if inserting your own key, set this to true
let returnedDefs = 0;

///----------------API functions------------///

function decryptKey (encryptedAPI) {
  if (decrypted) {
    return true;
  } else {
    try {
      const passphrase = prompt("What is the passphrase?");
      const apiKey = sjcl.decrypt(passphrase, encryptedAPI);
      wordsAPIheader = {
        "X-Mashape-Key": apiKey,
        "X-Mashape-Host": "wordsapiv1.p.mashape.com"
      };
      decrypted = true;
      return true;
      }
    catch (error) {
      // alert('To get the passphrase, contact Ann through Github');
      return false;
    }
  }
};

function getWikiRandom () {
  $.ajax({
    url: urlWikiRandom,
    dataType: 'JSONP',
    headers: {
      'Api-User-Agent': 'McWikiBot/1.0',
    },
    success: function(data) {
      const randomTitles = [];
      for (let i = 0; i < data.query.random.length; i++) {
        randomTitles.push(data.query.random[i]['title'])
      }
      onWikiSuccess(randomTitles)
    } //end success
  }); //end ajax
} //end getWikiRandom, returns the name of five random wiki articles for filtering

function onWikiSuccess(randomTitles) {
  // fed into getWikiRandom
  const randTitlesFiltered = [];
  for (let i = 0; i < randomTitles.length; i++) {
    // could clean this up after I get all the bad search terms listed
    if (!(randomTitles[i].startsWith("User") ||
        randomTitles[i].startsWith("Talk") ||
        randomTitles[i].startsWith("Template") ||
        randomTitles[i].startsWith("Category") ||
        randomTitles[i].startsWith("Wikipedia") ||
        randomTitles[i].startsWith("Portal") ||
        randomTitles[i].startsWith("File") ||
        randomTitles[i].startsWith("File:") ||
        randomTitles[i].startsWith("Talk:"))) {
          randTitlesFiltered.push(randomTitles[i]);
      } //end if, definitely could be freshened up!
    } //end for loop
  //if there are no viable titles returned, try try again
  if (randTitlesFiltered.length == 0) {
    getWikiRandom();
  } else {
    getWikiSummary(randTitlesFiltered[0]);
  }
} //end onWikiSuccess, returns array of viable tiles to be sent to getWikiSummary


function getWikiSummary (wikiTitle) {
  const requestURL = urlWikiSummaryStart + encodeURI(wikiTitle) + urlWikiSummaryEnd;
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
  const $noTagSummary = $(originalSummary).text();
  const summaryArray = $noTagSummary.split(" ");
  if (summaryArray.length < 20 || summaryArray.length > 150) {
    // summary is too short or long, get wiki random
    getWikiRandom();
  } else {
    countWords(summaryArray);
  }
} // end parseSummary, strips HTML from summary and moves the summary into an summaryArray

function countWords(summaryArray) {
  const validWords = [];
  for (let i = 0; i <summaryArray.length; i ++) {
    if (summaryArray[i].length > 4  && allLCletters(summaryArray[i])) {
      const validWordsEntry = {};
      validWordsEntry['origLoc'] = i;
      validWordsEntry['origWord'] = summaryArray[i];
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
  const wordsToUse = Math.min(Math.round(summaryArray.length/10), validWords.length, 5)
  const validWordstoAPIObject = {};

  while (Object.keys(validWordstoAPIObject).length < wordsToUse) {
    const randPosition = getRandomNumber(validWords.length);
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
  let validWordstoAPI = Object.keys(validWordstoAPIObject).map(function(e) {
  return validWordstoAPIObject[e]
}); //converts back to array, updated since IE does not support Object.values
  appendPartOfSpeech(summaryArray,validWordstoAPI);
}//end chooseWords, selects the words in the article to send to wordsAPI

function appendPartOfSpeech(summaryArray, validWordstoAPI) {
  for (let counter = 0 ; counter < validWordstoAPI.length ; counter++) {
    iterateGetWord(counter, validWordstoAPI, summaryArray)
  }

} //end appendPartOfSpeech, calls 3 functions, starting with iterateGetWord, in a loop

function iterateGetWord (counter, validWordstoAPI, summaryArray) {
     const wikiWord = validWordstoAPI[counter]['origWord']
     getWordData(wikiWord, counter, summaryArray, validWordstoAPI)
} //end iterateGetWord, iterates through the words to send to the API, also calls getWordData>addToValidWords

function enhancedPartOfSpeech (wikiWord, partOfSpeech) {
  if (wikiWord.substr(wikiWord.length - 3) === 'ing') {
      partOfSpeech = '-ing word';
    } else if (wikiWord.substr(wikiWord.length - 2) === 'ed') {
      partOfSpeech = '-ed word';
    } else if (partOfSpeech === 'noun' && wikiWord.substr(wikiWord.length - 1) === 's') {
      partOfSpeech = 'plural noun';
    } else if (partOfSpeech === 'noun' && wikiWord.substr(wikiWord.length - 1) !== 's') {
      partOfSpeech = 'singular noun';
    } else if (partOfSpeech === 'verb' && wikiWord.substr(wikiWord.length - 1) === 's') {
      partOfSpeech = 'third-person verb';
    } else if (partOfSpeech === 'verb' && wikiWord.substr(wikiWord.length - 1) !== 's') {
      partOfSpeech = 'verb not ending in "s"';
  }
    return partOfSpeech;
}//end enhancedPartOfSpeech

function getWordData (wikiWord, counter, summaryArray, validWordstoAPI) {
   const requestURL = urlWordsStart + wikiWord + urlWordsEnd;
   $.ajax({
     url: requestURL,
     headers: wordsAPIheader,
     success: function(data) {
      // initial part of speech check
      if (data && data['definitions'] && data['definitions'].length>0 &&                  data['definitions'][0]['partOfSpeech']) {
        const partOfSpeech = data['definitions'][0]['partOfSpeech'];
           addToValidWords(enhancedPartOfSpeech(wikiWord, partOfSpeech), counter, summaryArray, validWordstoAPI);
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
      for(let i = validWordstoAPI.length - 1; i >= 0; i--) {
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
