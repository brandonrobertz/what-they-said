d3.json('fulltext.datetime.clusters.json', function(data) {
  var cluster_descriptions = [
    "Iran & Iraq",
    "Trade",
    "Lost American Jobs",
    "Winning",
    "Immigrants + Crime",
    "Political Conservatism",
    "Rallies & Supporters",
    "Establishment + Corruption",
    "Osama bin Laden",
    "Debates & Cheating",
    "'The Snake'",
    "Lyin' Ted",
    "Political Associates & Opponents",
    "Oil",
    "Cluster 14 - Catchall (Mostly Negative)",
    "Inner Cities + Crime",
    "'Blacks' + 'Color'",
    "Winning Places",
    "Wikileaks + Clinton Foundation",
    "Cluster-19 - Catchall Activities/Values",
    "Global Militarism & Policy",
    "Rigged System",
    "Cluster 22",
    "'Tender Snake'",
    "Clinton",
    "Cluster 25 - Catchall Conflict/Spanish",
    "Winning Places",
    "Positive Associates",
    "Education",
    "War Heroes"
  ];


  var total_clusters = 30;
  var formatted = [];
  var legend = [];
  var markers = [{
    date: new Date('September 26, 2016'), label: 'First Presidential Debate'
  }];

  console.info('Reformating data ...');

  for (var i = 0; i < total_clusters; i++) {
    var key = 'Cluster-' + i.toString();
    var clusterData = [];
    for (var timestamp in data[key]) {
      if(!data[key].hasOwnProperty(timestamp)) {
        continue;
      }
      clusterData.push({
        date: new Date(Number(timestamp)),
        value: data[key][timestamp]
      });
    }
    legend.push(key);
    formatted.push(clusterData);
  }

  console.info('Reformating complete.');

  for (var i = 0; i < total_clusters; i++) {
    if (cluster_descriptions[i].match(/Cluster/)){
      continue;
    }
    var title = legend[i];
    var clusterData = formatted[i];
    MG.data_graphic({
      title: cluster_descriptions[i],
      center_title_full_width: true,
      linked: true,
      //description: "Representation of cluster topics on the campaign trail.",
      data: clusterData, //.slice(0, 20),
      chart_type: 'point',
      //interpolate: d3.curveStep,
      height: 250,
      width: 650,
      yax_count: 3,
      //least_squares: true,
      //right: 40,
      target: '#' + title.toLowerCase(),
      //legend: ,
      //legend_target: '#legend',
      //missing_is_zero: true,
      //x_accessor: 'x',
      //y_accessor: 'y',
      x_extended_ticks: true,
      min_x: new Date("2015-02-01"),
      max_x: new Date("2017-01-30"),
      //max_y: 0.10,
      //min_y: 0,
      y_label: 'Mentions',
      left: 70,
      top:15,
      markers: markers,
    });
  }

});
