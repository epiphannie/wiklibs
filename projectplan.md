1) Fetch random article ID from Wikipedia
2) Fetch summary of that random article
3) Parse article content into an array of words
4) Select up to 10 words from the summary to be replaced
5) Place words in an object, keys -> place in master array, wiki_word, part of speech, user_word
5) Run  WordsAPI calls on each to find out the part of speech
6) Pull example parts of speech from example-part-of-speech object..that I have created at some point
7) Generate modal window with input boxes for each part of speech-- placeholder part of speech and example
8) Insert user_words back into the array, replacing the wiki_words
9) Make it all look like an article again
10) Button to start and for new articles


Stuff to solve:
- avoiding parts of speech that no one knows...articles...
  Solution? longer word length. 4 characters +

- somehow avoid words at the start of end of a sentence (punctuation, capitalization)

- don't use up all my free API calls
