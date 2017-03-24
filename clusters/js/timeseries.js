d3.json('fulltext.datetime.clusters.json', function(data) {

  var total_clusters = 30;
  var formatted = [];
  var legend = [];

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
    var title = legend[i];
    var clusterData = formatted[i];
    MG.data_graphic({
      title: title,
      center_title_full_width: true,
      linked: true,
      //description: "Representation of cluster topics on the campaign trail.",
      data: clusterData, //.slice(0, 20),
      interpolate: d3.curveStep,
      full_width: true,
      height: 150,
      yax_count: 3,
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
      top:10,
    });
  }

});
