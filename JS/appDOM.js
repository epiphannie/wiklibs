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
  return Math.floor(Math.random() * Math.floor(max));
}

// function countPartsOfSpeech(array, partOfSpeech) {
//   var counter = 0;
//   var countPartsEntry = {};
//   for (i = 0; i < array.length; i++) {
//     if(array[i]['partOfSpeech'] === partOfSpeech){
//       counter += 1;
//     }
//   }
//   countPartsEntry['partOfSpeech'] = partOfSpeech;
//   countPartsEntry['count'] = counter;
//   return countPartsEntry;
// }
///---------------On Click---------///
document.getElementById("start-btn").onclick = function () {
  getWikiRandom()
};


// ///---------------Manipulate HTML-----------///
function buildForm(summaryArray, validWordstoAPI, exampleParts) {
  console.log('build form start')
  var formHTML = '<form>';

  for (i = 0; i < validWordstoAPI.length; i++) {
    var currPartOfSpeech = validWordstoAPI[i]['partOfSpeech'].toUpperCase();
    console.log(currPartOfSpeech);
    var currID = 'word' + i;
    var currExamples = exampleParts[currPartOfSpeech.toLowerCase()];

    formHTML += '<div class="form-group"> <label for="';
    formHTML += currID;
    formHTML += '">';
    formHTML += currPartOfSpeech;
    formHTML += '</label>';
    formHTML += '<input type="text" class="form-control" id="'
    formHTML += currID
    formHTML += '" placeholder="'
    formHTML += currExamples;
    formHTML += '"></div>';
  }

  formHTML += '</form>';
  $("#start-of-form").append(formHTML);
  console.log(formHTML)
  console.log(summaryArray);
  console.log(validWordstoAPI);

  document.getElementById("generator").onclick = function () {
    collectInput(summaryArray, validWordstoAPI)
  };

}

function collectInput(summaryArray, validWordstoAPI) {
    var input = document.querySelectorAll("input");
    for(i = 0; i < input.length; i++){ // loop through each input on the page
        validWordstoAPI[i]['newWord'] = input[i].value; // will alert the value of the input
    }
    wiklibIsBorn(summaryArray, validWordstoAPI)
}

function wiklibIsBorn(summaryArray, validWordstoAPI) {

  var userSummaryArray = Array.from(summaryArray);
  for (i = 0; i < userSummaryArray.length; i++) {
    for (j = 0; j < validWordstoAPI.length; j++) {
      if (i === validWordstoAPI[j]['origLoc']) {
        var apiWord = '<span class="apiWord">';
        apiWord += validWordstoAPI[j]['newWord'];
        apiWord += '</span>'
        userSummaryArray[i] = apiWord;
      }
    }
  }

  var userSummaryContent = userSummaryArray.join(' ');
  var userSummaryDiv = '<div id="user-summary">'
  userSummaryDiv += '<h4 id="results-header">Your Beautiful Wiklib</h4>'
  userSummaryDiv += userSummaryContent + '</div>';


  var origSummaryContent = summaryArray.join(' ');
  var origSummaryDiv = '<div id="original-summary">'
  origSummaryDiv += '<h4 id="results-header"> Original Wiki Summary </h4>'
  origSummaryDiv += origSummaryContent + '</div>';

  var wiklibResults = userSummaryDiv + "<br>" + origSummaryDiv + "<br>";

  $("#jumbo-header").hide();
  document.getElementById("start-btn").innerHTML = "Another?";
  $("#results-start").append(wiklibResults);
} //end wiklibIsBorn
