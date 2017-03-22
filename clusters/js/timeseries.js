d3.json('fulltext.datetime.clusters.json', function(data) {

  for (var i = 0; i < data.length; i++) {
    for (var n = 0; n < data[i].length; n++) {
      data[i][n]['date'] = new Date(data[i][n]['date'] * 1000);
    }
  }

  for(var i = 0; i < data.length; i++) {
    MG.data_graphic({
      title: 'Cluster-' + i.toString(),
      //description: "Representation of cluster topics on the campaign trail.",
      data: data[i], //.slice(0, 20),
      interpolate: d3.curveStep,
      full_width: true,
      height: 200,
      //right: 40,
      target: '#timeseries-' + i.toString(),
      //legend: ,
      //legend_target: '#legend',
      missing_is_zero: true,
      //x_accessor: 'x',
      //y_accessor: 'y',
      x_extended_ticks: true,
      min_x: new Date("2015-01-01"),
      max_x: new Date("2017-01-30"),
      max_y: 0.15,
      min_y: 0,
    });
  }
});
