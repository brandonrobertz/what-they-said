#!/usr/bin/env python2
# http://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html
# workon voldemort
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.decomposition import TruncatedSVD
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.linear_model import LinearRegression
from matplotlib import offsetbox

from jinja2 import Template

import matplotlib.pyplot as plt
import numpy as np
import fileinput
import sys
import json


def const_from_file(filename, default=None):
    try:
        with open(filename) as f:
            return int(f.read())
    except Exception, e:
        print "Error reading constant file {}: {}".format(
            filename, e
        )
    return default


def log(msg):
    print msg


def vectorize_line(line):
    """ Take a line of fastText text-vectors file (.vec) and output a
    label(word) and the vector as (X, label)
    """
    vectors = line.split()
    label = vectors.pop(0)
    vectors = map( lambda x: float(x), vectors)
    # go through stdin reading fastText vectors and add them to array
    X = np.array(vectors)
    return X, label


def Xy(filename):
    """ Read from stdin, grabbing all vectors from our incoming stream of
    fastTex vector (text) file. Return matrices (X, labels)
    """
    fi = fileinput.input(files=filename)
    header = fi.readline()
    X = []
    labels = []
    for line in fi:
        x, label = vectorize_line(line)
        X.append(x)
        labels.append(label)
    return np.array(X), labels


def cluster(filename, seed=0, n_clusters=20):
    """ Get training data from stdin, perform k-means on it.
    return (X, labels, predicted clusters)
    """
    log("Clustering k-means with {} clusters".format(n_clusters))
    X, labels = Xy(filename)
    pred_clusters = KMeans(
        n_clusters=int(n_clusters), random_state=seed
    ).fit_predict(X)
    # Compute cluster centers and predict cluster index for each sample.
    #kmeans.cluster_centers_
    return X, pred_clusters, labels


def plot_cluster(cluster, X, labels, seed=0):

    model = TSNE(n_components=2, init='pca', random_state=seed)

    log("Fitting t-SNE model")
    tsne_X = model.fit_transform(X)

    x_min, x_max = np.min(tsne_X, 0), np.max(tsne_X, 0)

    # normalize
    if ((x_max - x_min) != np.array([0., 0.])).all():
        tsne_X = (tsne_X - x_min) / (x_max - x_min)

    mult = 2
    plt.figure(figsize=(8 * mult, 6 * mult), frameon=False)
    ax = plt.subplot()

    Xy = [[100, 7], [33, 8], [5, 10]]
    X = map(lambda x: [x[0]], Xy)
    y = map(lambda x: x[1], Xy)
    model = LinearRegression().fit(X, y)
    fontsize = np.round(model.intercept_ + model.coef_[0] * tsne_X.shape[0])
    fontsize = fontsize if fontsize > 6 else 6
    fontsize = fontsize if fontsize < 13 else 13
    print "Using font", fontsize, "for", tsne_X.shape[0], "words"

    log("Plotting embeddings")
    for i in range(tsne_X.shape[0]):
        plt.text(
            tsne_X[i, 0], tsne_X[i, 1],
            str(labels[i]),
            #color=plt.cm.gist_earth(cluster / TOTAL_CLUSTERS),
            fontdict={'weight': 'regular', 'size': fontsize})

	ax.axis('off')
    plt.title("Cluster {} - {} Items".format(cluster, tsne_X.shape[0]))

    log("Building figure")
    plt.savefig('clusters/{}.svg'.format(cluster), format='svg', dpi=1200)
    if cluster == 0:
		plt.show()

    plt.close()


def plot_embedding(clusters, title=None, seed=0, n_clusters=20):
    """ Scale and visualize the embedding vectors
    """
    log("Plotting each cluster")
    for c in clusters.keys():
        plot_cluster(c, clusters[c]['data'], clusters[c]['labels'], seed=seed)


def extract_clusters(X, pred_clusters, labels, n_clusters):
    """ Take our vectors, predicted cluster memberships, labels (words)
    and (as an optimization) the number of clusters, and create a dict
    of each cluster containing the vectors and labels.
    """
    clusters = {
        x: {'data': [], 'labels': []}
        for x in range(int(n_clusters))
    }
    log("Splitting data by cluster")
    for i in range(len(X)):
        data = X[i]
        pred_cluster = pred_clusters[i]
        label = labels[i]

        clusters[pred_cluster]['data'].append(data)
        clusters[pred_cluster]['labels'].append(label)

    return clusters


def write_clusters(clusters):
    with open('clusters/clusters.txt', 'w') as f:
        for c in clusters.keys():
            cluster = clusters[c]
            data = cluster['data']
            labels = cluster['labels']
            for i in range( len( data)):
                f.write("{} {}\n".format(c, labels[i])) #, data[i])


def render_index(n_clusters=20):
    with open('clusters/index.tpl.html') as f:
        index_template = f.read()
    tpl = Template(index_template)
    rendered = tpl.render(clusters=range(n_clusters))
    with open('clusters/index.html', 'w') as f:
        f.write(rendered)


def usage():
    print "USAGE: kmeans.py dataset.vec"
    print ""
    print "This program clusters fasttext text-word embedding vectors using"
    print "k-means. Number of clusters and initial seed are pulled from"
    print "files found in ./config/"
    print ""
    print "It also builds a visualization of the clusters based on matplotlib"
    print "reduced dimension representations of the clusters and outputs"
    print "them to ./clusters/"
    sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        usage()

    N_CLUSTERS = const_from_file("config/clusters")
    SEED = const_from_file("config/seed")

    filename = sys.argv[1]
    X, pred_clusters, labels = cluster(
        filename,
        seed=SEED,
        n_clusters=N_CLUSTERS
    )
    clusters = extract_clusters(X, pred_clusters, labels, N_CLUSTERS)
    plot_embedding(
        clusters,
        "t-SNE embedding of the clusters",
        n_clusters=N_CLUSTERS
    )
    render_index(n_clusters=N_CLUSTERS)
    write_clusters(clusters)
