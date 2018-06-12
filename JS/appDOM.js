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
  var formHTML = '<form>';
  console.log(validWordstoAPI[0])
  console.log(validWordstoAPI[0].partOfSpeech)
  console.log(validWordstoAPI[0].origWord)
  
  for (i = 0; i < validWordstoAPI.length; i++) {
    if (validWordstoAPI[i]['partOfSpeech'] === null) {
      continue;
    } else {
      var currPartOfSpeech = validWordstoAPI[i]['partOfSpeech'];
      console.log(currPartOfSpeech);
      var currID = currPartOfSpeech + i;
      var currExamples = exampleParts[currPartOfSpeech];

      formHTML += '<div class="form-group"> <label for="';
      formHTML += currID;
      formHTML += '">"';
      formHTML += currPartOfSpeech;
      formHTML += '</label>';
      formHTML += ': ' + exampleParts[currPartOfSpeech];
      formHTML += '<input type="text" class="form-control" id="'
      formHTML += currID
      formHTML += '"placeholder="'
      formHTML += currExamples;
      formHTML += '">';
    }
  }
  formHTML += '</form>';
  console.log(formHTML)
}
//   var countParts = [];
//   for (i = 0; i < Object.keys(exampleParts).length ; i++) {
//     console.log(Object.keys(exampleParts).length);
//     console.log(Object.keys(exampleParts)[i]);
//     countParts.push(countPartsOfSpeech(validWordstoAPI, Object.keys(exampleParts)[i]));
//   }
//   console.log(countParts);
// }



//
//   }//end for loop
// }
