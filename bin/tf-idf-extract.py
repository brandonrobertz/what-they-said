#!/usr/bin/env python2
import math
import re
import sys
import argparse

from collections import OrderedDict


DEBUG=False
# DEBUG=True


def log(msg):
    if DEBUG:
        sys.stderr.write(msg)
        sys.stderr.write('\n')


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


def termfreqs(document):
    """ Term-frequency, the number of times a term appears in a document
    is calculated here.
    """
    tfs = {}
    for token in tokenize(document):
        update_count(tfs, token)
    return tfs


def documentfreqs(filename):
    """ The document-frequency is the number of documents for which
    a term appears. We calculate this statistic and also the total
    number of documents.
    """
    dfs = {}
    N = 0.0
    for line in lines(filename):
        for token in set(tokenize(line)):
            update_count(dfs, token)
        N += 1.0
    return dfs, N


def tf_idf(filename, take_top=0.05, max_kws=10, min_kws=2):
    """ Compute tf-idfs for each document/term and output only the top
    percent, specified by take_top, of highest ranked words limited by
    max_kws number of keywords per document.
    """
    dfs, N = documentfreqs(filename)

    # for normalized tf and idf
    max_df = max( map( lambda x: x[1], dfs.items()))

    log("Total documents: {} Max DF: {}".format(
        N, max_df))

    for document in lines(filename):

        log("Document: {}...".format( document[:50]))

        tfs = termfreqs(document)
        document_terms = []

        for token in tfs.keys():

            tf = tfs[token]
            df = dfs[token]

            # # inverse document frequency smooth
            idf = math.log( N / ( 1 + df))

            # # inverse document frequency max
            # idf = math.log( max_df / ( 1 + df))

            # # probabilistic inverse document frequency
            # idf = math.log( ( N - df) / df)

            # # double normalized (0.5) term frequency
            # norm_tf = 0.5 + ( 0.5 * ( tf / max_tf))

            tfidf = tf * idf

            # debug
            log( "{}{}\t{}\t{}\t{}".format(
                token, " " * (40 - len(token)),
                tf, idf, tfidf
            ))

            document_terms.append([token, tfidf])

        # most important kws first
        document_terms.sort(key=lambda x: x[1], reverse=True)

        log("Document terms: {}".format(document_terms))

        # rounded pct of terms
        cutoff = math.ceil(len(document_terms) * take_top)

        # we only need to use max if it's greater than cutoff
        if max_kws != 0 and cutoff > max_kws:
            cutoff = max_kws

        if cutoff < min_kws:
            cutoff = min_kws

        log("Cutoff: {}".format(cutoff))

        top_terms = document_terms[:int(cutoff)]
        log("Top Terms: {}".format( top_terms))

        joined_terms = " ".join(map(lambda x: x[0], top_terms))
        log("Output: {}".format(joined_terms))

        print joined_terms



def parse_args():
    desc = """Extract top n-percent of keywords from a set of documents in a
given input file. Input file must have one document per line. TF-IDF
rankings are used to
"""
    parser = argparse.ArgumentParser(description=desc)
    parser.add_argument('corpus', type=str,
                        help='Location of corpus file')
    parser.add_argument('--pct', type=float, default=0.05,
                        help='Percentage of top-ranked keywords to extract. ' \
                        'Default: 0.05.')
    parser.add_argument('--max', type=int, default=10,
                        help='Maximum number of keywords to extract. ' \
                        'Default: 10. If this is left blank, there is no max.')
    args = parser.parse_args()
    return args


if __name__ == "__main__":
    args = parse_args()
    log( "Taking top {} keywords from {}".format( args.pct, args.corpus))
    tf_idf(args.corpus, take_top=args.pct, max_kws=args.max)

