///--------------Utility functions-------------///
function allLCletters(word) {
  const letters = /^[a-z]+$/;
  if (word.match(letters)) {
    return true;
  } else {
    return false;
  }
}//end allLCletters

function getRandomNumber(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

///---------------On Click---------///
document.getElementById("start-btn").onclick = function () {
  $(".modal-title").hide();
  getWikiRandom()
};

///---------------Manipulate HTML-----------///
function buildForm(summaryArray, validWordstoAPI, exampleParts) {
  let formHTML = '';
  formHTML += '<form id="form-contents">';

  for (let i = 0; i < validWordstoAPI.length; i++) {
    const currPartOfSpeech = validWordstoAPI[i]['partOfSpeech'].toUpperCase();
    const currID = 'word' + i;
    const currExamples = exampleParts[currPartOfSpeech.toLowerCase()];

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
  $(".modal-title").show();
  $(".modal-loading").hide();

  $("#start-of-form").append(formHTML);

  document.getElementById("generator").onclick = function () {
    collectInput(summaryArray, validWordstoAPI)
  };
}

function collectInput(summaryArray, validWordstoAPI) {
    const input = document.querySelectorAll("input");
    for (let i = 0; i < input.length; i++){ // loop through each input on the page
        validWordstoAPI[i]['newWord'] = input[i].value.toLowerCase();
    }
    wiklibIsBorn(summaryArray, validWordstoAPI)
}

function wiklibIsBorn(summaryArray, validWordstoAPI) {
  if (document.getElementById('results')) {
    document.getElementById('results').remove();
  }
  const userSummaryArray = Array.from(summaryArray);
  for (let i = 0; i < userSummaryArray.length; i++) {
    for (let j = 0; j < validWordstoAPI.length; j++) {
      if (i === validWordstoAPI[j]['origLoc']) {
        let apiWord = '<span class="apiWord">';
        apiWord += validWordstoAPI[j]['newWord'];
        apiWord += '</span>'
        userSummaryArray[i] = apiWord;
      }
    }
  }

  const userSummaryContent = userSummaryArray.join(' ');
  let userSummaryDiv = '<div id="user-summary">'
  userSummaryDiv += '<h4 id="results-header" class="wiki-header">Your beautiful Wiklib</h4>'
  userSummaryDiv += userSummaryContent + '</div>';


  const origSummaryContent = summaryArray.join(' ');
  let origSummaryDiv = '<div id="original-summary">'
  origSummaryDiv += '<h4 id="results-header" class="wiki-header"> Original Wiki Summary </h4>'
  origSummaryDiv += origSummaryContent + '</div>';

  const resetButton = '<button class="btn btn-warning btn-lg" id="reset-btn">Another?</button>'

  const wiklibResults = '<div id="results">' + userSummaryDiv + "<br>" + origSummaryDiv + "<br>" + resetButton + '</div>';

  $("#jumbo-header, #start-btn").hide();
  $("#results-start").append(wiklibResults);
  $("#results").show();

  document.getElementById("reset-btn").onclick =  function () {
    resetWiklib(summaryArray, validWordstoAPI)
  };
} //end wiklibIsBorn

function resetWiklib (summaryArray, validWordstoAPI, wiklibResults) {
  if (document.getElementById('form-contents')) {
      document.getElementById('form-contents').remove();
  } //remove form if present

  $(".modal-loading").show();
  $("#results").hide();
  $("#jumbo-header").show();
  $( "#start-btn" ).trigger( "click" );
  returnedDefs = 0;
}
