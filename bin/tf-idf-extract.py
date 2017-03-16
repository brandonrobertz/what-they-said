#!/usr/bin/env python2
import math
import re
import sys
import argparse

from collections import OrderedDict

DEBUG=False


def log(msg):
    if DEBUG:
        sys.stderr.write(msg)


def lines(filename):
    with open(filename) as f:
        for line in f.readlines():
            yield line


def tokenize(line):
    """ From a line, yield a series of tokens.
    TODO: n-gram tokens
    """
    for token in re.split(r'\s', line):
        yield token


def update_count(tokens_dict, token):
    if tokens_dict.get(token):
        tokens_dict[token] += 1.0
    else:
        tokens_dict[token] = 1.0


def termfreqs(filename):
    """ Go through the input file and calculate term-frequency counts
    and number of documents.
    """
    tfs = {}
    N = 0.0
    for line in lines(filename):
        for token in tokenize(line):
            update_count(tfs, token)
        N += 1.0
    return tfs, N


def documentfreqs(filename):
    """ For each term, find the number of documents which contain said
    term. Return a dict of token -> n_documents mapping.
    """
    dfs = {}
    for line in lines(filename):
        for token in set(tokenize(line)):
            update_count(dfs, token)
    return dfs


def tf_idf(filename, take_top=0.05):
    """ Compute tf-idfs for each document/term and output only the top
    percent, specified by take_top, of highest ranked words.
    """
    tfs, N = termfreqs(filename)
    dfs = documentfreqs(filename)

    # for normalized tf and idf
    max_tf = max( map( lambda x: x[1], tfs.items()))
    max_df = max( map( lambda x: x[1], dfs.items()))

    for line in lines(filename):
        document_terms = []
        for token in set(tokenize(line)):
            tf = tfs[token]
            df = dfs[token]

            # # inverse document frequency smooth
            # idf = math.log( N / ( 1 + df))

            # # inverse document frequency max
            idf = math.log( max_df / ( 1 + df))

            # # probabilistic inverse document frequency
            # idf = math.log( ( N - df) / df)

            # double normalized (0.5) term frequency
            norm_tf = 0.5 + ( 0.5 * ( tf / max_tf))

            # debug
            log( "{}{}\t{}\t\t{}\t\t{}".format(
                token, " " * (40 - len(token)), norm_tf, df, idf, norm_tf * idf
            ))

            tf_idf = norm_tf * idf
            document_terms.append([token, norm_tf * idf])
        document_terms.sort(key=lambda x: x[1], reverse=True)
        top_n = int(len(document_terms) * take_top)
        tops = document_terms[0:top_n]
        print " ".join(map(lambda x: x[0], tops))


def parse_args():
    desc = """Extract top n-percent of keywords from a set of documents in a
given input file. Input file must have one document per line. TF-IDF
rankings are used to
"""
    parser = argparse.ArgumentParser(description=desc)
    parser.add_argument('corpus', type=str,
                        help='Location of corpus file')
    parser.add_argument('--pct', type=float, default=0.05,
                        help='Percentage of top-ranked keywords to extract.')
    args = parser.parse_args()
    return args


if __name__ == "__main__":
    args = parse_args()
    print "Taking top {} keywords from {}".format( args.pct, args.corpus)
    tf_idf(args.corpus, take_top=args.pct)

