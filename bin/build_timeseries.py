#!/usr/bin/env python2
import sys
import re
import json
import time
import ciso8601
import pandas as pd


def log(msg, err=True):
    if err:
        sys.stderr.write(msg)
        sys.stderr.write('\n')


def read_clusters_txt(filename):
    with open(filename) as f:
        lines = f.readlines()

    cluster_words = {}
    for line in lines:
        sline = line.split()
        cluster = int(sline[0])
        word = sline[1]
        if cluster not in cluster_words:
            cluster_words[cluster] = [word]
        else:
            cluster_words[cluster].append(word)

    return cluster_words


def date_from_title(title):
    """ The SRT filenames are in the format of MM-DD-YYYY mostly with some variation.
    """
    # these are also in month, day, year format
    replacements = {
        "./srt/Donald Trump's Full Indiana Victory Speech-5oO4YqOGClY.en.vtt.srt":
        ('5', '3', '2015'),
        "./srt/Donald Trump's Full Indiana Primary Victory Speech-SORp0GmgLX0.en.vtt.srt":
        ('5', '4', '2015'),
        "./srt/Full Espeech - Donald Trump Rally in Wilmington, Ohio (September 1, 2016) Trump LiveSpeech-tUjsvBHmPj4.en.vtt.srt":
        ('9', '1', '2016'),
        "./srt/Full Speech - Donald Trump Rally in Akron, Ohio (August 22, 2016) Donald Trump Ohio Speech-9BvdJ3Q7GzQ.en.vtt.srt":
        ('8', '22', '2016'),
        "./srt/FULL Event HD - Donald Trump Rally in Knoxville, TN w_ Beada Corum Intro-gJuWzsnh_Xw.en.vtt.srt":
        ('11', '16', '2015'),
        "./srt/Full Speech - Donald Trump AMAZING Speech at Charter School in Cleveland, OH (September 8, 2016)-TR_1F3xd-Ng.en.vtt.srt":
        ('8', '2', '2016'),
        "./srt/Donald Trump - THE WHOLE SYSTEM IS RIGGED; RNC Should be Ashamed-UqByMThBpfs.en.vtt.srt":
        ('4', '12', '2016'),
        "./srt/Full Event - Donald Trump Town Hall in Hickory, NC at Lenoir-Rhyne University (3-14-1-_cOlpRxtIB4.en.vtt.srt":
        ('14', '3', '16'),
        "./srt/FULL Speech HD - Donald Trump Speaks to 10,000 Plus in Lowell, MA (1-4-16)-v6LYm17J7ec.en.vtt.srt":
        ('4', '1', '2016'),
    }

    title = title.strip()
    # print "TITLE", title
    found_date = re.findall(r'([0-9]+).([0-9]+).([0-9]+)', title)

    if replacements.get(title):
        found_date = [replacements[title]]

    if not found_date or len(found_date) < 1:
        log( "CAN'T CONVERT: {}".format( title))
        return ()

    date = found_date[0]

    year = date[2]
    if len(year) == 2:
        year = "20" + year

    if int(year) < 2014:
        log( "Bad year: {} for title: {}".format( date, title))
        return ()

    month = date[0]
    day = date[1]
    if int(month) > 12:
        log( "Bad month: {} for title: {}".format( month, title))
        month = date[1]
        day = date[0]

    ymd = "{}-{}-{}".format(year, month.zfill(2), day.zfill(2))

    ts = date_str_to_timestamp(ymd)
    if not ts:
        log("TS failure on title: {}".format(title))

    return ts


def date_str_to_timestamp(date):
    t = ciso8601.parse_datetime(date)
    if not t:
        log("FAILED PARSING TIME {}".format(date))
        return None
    return time.mktime(t.timetuple())

def extract_dates(titles_file):
    dates = []
    with open(titles_file) as f:
        lines = f.readlines()
        for title in lines:
            dates.append(date_from_title(title))
    return dates


def count_clusters_in_doc(cluster_words, document):
    """ Take a document and the cluster_words associative array, and
    output a count for each cluster and the number of occurrences in
    this document.

    { cluster_id_1: count_1, ..., cluster_id_N: count_N }
    """
    counts = {}
    total_words = len(document.split())
    log("total_words {}".format(total_words))
    for c in cluster_words:
        for word in set(cluster_words[c]):
            if word not in document:
                continue

            if not word.strip():
                continue

            reg = re.compile('\\b{}\\b'.format(re.escape(word)))
            n = len(re.findall(reg, document))
            if not n:
                continue

            if c not in counts:
                counts[c] = 0
            counts[c] += n

    # normalize
    for c in counts:
        raw = counts[c]
        log("C: {} Raw: {}".format(c, raw))
        counts[c] = float(raw) / total_words

    return counts


def usage():
    print "USAGE: build_timeseries.py clusters/clusters.txt fulltext.cleaned fulltext.titles"
    sys.exit(1)


# load clusters into memory
# go through each fulltext document doing:
#  - getting counts for each cluster
#  - get date of fulltext file
# output time series json
if __name__ == "__main__":
    CLUSTERS_TXT=sys.argv[1]
    FULLTEXT_FILE=sys.argv[2]
    TITLES_FILE=sys.argv[3]

    cluster_words = read_clusters_txt(CLUSTERS_TXT)
    dates = extract_dates(TITLES_FILE)

    clusters = []
    with open(FULLTEXT_FILE) as f:
        for document in f.readlines():
            cluster_counts = count_clusters_in_doc(cluster_words, document)
            clusters.append(cluster_counts)

    # now we have an array of lists of [ (year, month, day), {cluster: counts}]
    joint = zip(dates, clusters)

    # we need a list, one per cluster, of date and value
    timeseries = [ [] for _ in range(max(cluster_words.keys())+1)]
    for date, counts in joint:

        if not date:
            continue

        for cid in counts.keys():
            timeseries[cid].append({
                'date': date,
                'value': counts[cid]
            })

    for ix in range(len(timeseries)):
        timeseries[ix].sort(key=lambda x: x['date'])

    print json.dumps(timeseries, indent=4)
