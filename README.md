# What Trump Said

[Live demo here](http://bxroberts.org/did_he_say_it_908329810928a/)

This is an interactive tool that allows you to search through hundreds of Donald Trump campaign speeches and locate specific instances, on video, where he said things. We're using YouTube transcripts to build our index, which are of variable quality, so your searches are limited to the accuracy of the transcription.

## How it works

This tool uses a series of steps to turn campaign speeches into a searchable database. Everything is orchestrated with [GNU Make](https://www.gnu.org/software/make/). It uses [youtube-dl](https://rg3.github.io/youtube-dl/) to fetch video transcripts from various Trump campaign speech playlists, [lunr.js](http://lunrjs.com/) to build the reverse index, and the YouTube wrapper for loading videos to a given point in time.

## Preprocessing

The pre-processing for the text analysis works like so:

    - Lowercase all text
    - Compute td-idf for corpus
    - All words appearing in less than 5% of the collection are removed
    - From each document, only the top n number of features based on tf-idf ranking are picked.
