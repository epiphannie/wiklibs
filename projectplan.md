1) Fetch random article ID from Wikipedia
  Find some way to strip out content that is not an article (user talk, images) #done
2) Fetch summary of that random article #done
3) Parse article content into an array of words #done
4) Select up to 10 words from the summary to be replaced #done
5) Place words in an object, keys -> place in master array, wiki_word, part of speech, user_word #done
5) Run  WordsAPI calls on each to find out the part of speech #done
6) Pull example parts of speech from example-part-of-speech object..that I have created at some point #done
7) Generate modal window with input boxes for each part of speech-- placeholder part of speech and example #done
8) Insert user_words back into the array, replacing the wiki_words. Color the words that were inserted. #done
9) Make it all look like an article again #done
10) Button to start and for new articles #done
11) Add instructions to README for how to sign up for one's own API key.
- wiki font stack #done
- git hub link #done
- is it responsive? #done
- loading message


Stuff to solve:
- avoiding parts of speech that no one knows...articles...
  Solution? longer word length. 4 characters +

- figuring out which definition's part of speech I should use...

- somehow avoid words at the start of end of a sentence (punctuation, capitalization) #done

- don't use up all my free API calls

Improvements:
- preceding and following word context
- limitations for more complex parts of speech
