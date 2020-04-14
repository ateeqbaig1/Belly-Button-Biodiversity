function buildMetadata(sample) {
  // Use `d3.json` to fetch the metadata for a sample
  const metadata = d3.select("#sample-metadata");
  const url = "/metadata/" + sample;
  // document.getElementById("#sample-metadata").innerHTML = "";
  d3.json(url).then(function(response) {
    console.log(response);
    $("#sample-metadata").empty();
    Object.entries(response).forEach(([key, value]) => metadata.append("p").text(`${key}: ${value}`));
  });
}

// BONUS: Build the Gauge Chart

function buildGauge(sample) {
  const url = "/metadata/" + sample;
  d3.json(url).then(function(response) {
    console.log(response.WFREQ);
    const wfreq = response.WFREQ;
    // Enter the washing frequency between 0 and 180
    const level = parseFloat(wfreq) * 20;
    // Trig to calc meter point
    const degrees = 180 - level;
    const radius = 0.5;
    const radians = (degrees * Math.PI) / 180;
    const x = radius * Math.cos(radians);
    const y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    const mainPath = "M -.0 -0.05 L .0 0.05 L ";
    const pathX = String(x);
    const space = " ";
    const pathY = String(y);
    const pathEnd = " Z";
    const path = mainPath.concat(pathX, space, pathY, pathEnd);

    const data = [
      {
        type: "scatter",
        x: [0],
        y: [0],
        marker: {size: 12, color: "850000"},
        showlegend: false,
        name: "Freq",
        text: level,
        hoverinfo: "text+name"
      },
      {
        values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
        rotation: 90,
        text: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
        textinfo: "text",
        textposition: "inside",
        marker: {
          colors: [
            "rgba(0, 105, 11, .5)",
            "rgba(10, 120, 22, .5)",
            "rgba(14, 127, 0, .5)",
            "rgba(110, 154, 22, .5)",
            "rgba(170, 202, 42, .5)",
            "rgba(202, 209, 95, .5)",
            "rgba(210, 206, 145, .5)",
            "rgba(232, 226, 202, .5)",
            "rgba(240, 230, 215, .5)",
            "rgba(255, 255, 255, 0)"
          ]
        },
        labels: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
        hoverinfo: "label",
        hole: 0.5,
        type: "pie",
        showlegend: false
      }
    ];

    const layout = {
      shapes: [
        {
          type: "path",
          path: path,
          fillcolor: "850000",
          line: {
            color: "850000"
          }
        }
      ],
      margin: {
        l: 10,
        r: 10,
        b: 10,
        t: 200,
        pad: 4
      },
      title: "<b>Gauge Chart</b> <br> Scrubs per Week",
      height: 600,
      width: 600,
      xaxis: {
        zeroline: false,
        showticklabels: false,
        showgrid: false,
        range: [-1, 1]
      },
      yaxis: {
        zeroline: false,
        showticklabels: false,
        showgrid: false,
        range: [-1, 1]
      }
    };
    const GAUGE = document.getElementById("gauge");
    Plotly.newPlot(GAUGE, data, layout);
  });
}

function buildCharts(sample) {
  const url = "/samples/" + sample;
  d3.json(url).then(function(response) {
    console.log(response);
    const filtered_values = [];
    const filtered_otu_ids = [];
    const filtered_otu_labels = [];
    const len = response.sample_values.length;
    const indices = new Array(len);
    for (var i = 0; i < len; i++) {
      indices[i] = i;
      indices.sort(function (a, b) { return response.sample_values[a] < response.sample_values[b] ? 1 : response.sample_values[a] > response.sample_values[b] ? -1 : 0; });
    }    
    for (var i =0; i<10; i++){
      const j = indices[i];
      filtered_values.push(response.sample_values[j]);
      filtered_otu_ids.push(response.otu_ids[j]);
      filtered_otu_labels.push(response.otu_labels[j]);
    }

    const layout1 = {
      annotations: [
        {
          font: {
            size: 15
          },
          showarrow: false,
          text: "Top 10 Samples",
          x: 1,
          y: 0.5
        }
      ],
      height: 500,
      width: 500
    };
    const trace1 = [{
      type: "pie",
      values: filtered_values,
      labels: filtered_otu_ids.map(String),
      text: filtered_otu_labels,
      hole: .5,
      textinfo: 'percent'
    }];
    console.log(trace1);
    const PIE = document.getElementById('pie');
    Plotly.newPlot(PIE, trace1, layout1);

   /* const trace1 = [{
      x: response.sample_values,
      y: response.otu_ids,
      // text: response.otu_labels,
      type: 'bar',
      orientation: 'h'
    }];*/
/*    const layout1 = {
      title: 'Bar Chart',
      height: 500,
      width: 500
      font:{
      family: 'Raleway, sans-serif'
      },
    showlegend: false,
    xaxis: {
      tickangle: -45
    },
    yaxis: {
      zeroline: false,
      gridwidth: 2
    },
    bargap :0.05
    };
    console.log(trace1);*/
  /*  Plotly.newPlot('bar', trace1, layout1);
  });
*/
    const trace2 = [{
      x: response.otu_ids,
      y: response.sample_values,
      text: response.otu_labels,
      mode: 'markers',
      marker: {
        color: response.otu_ids,
        size: response.sample_values
      }
    }];
    const layout2 = {
      title: 'Bubble chart - Each Sample',
      showlegend: false,
      height: 600,
      width: 1400
    };
    console.log(trace2);
    Plotly.newPlot('bubble', trace2, layout2);
  });
}


function init() {
  // Grab a reference to the dropdown select element
  const selector = d3.select("#selDataset");
  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
    buildGauge(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
  buildGauge(newSample);
}

$('select').on('change', function() {
  const Sample = d3.select("#selDataset").property('value');
  console.log( Sample );
  optionChanged(Sample);
});

// Initialize the dashboard
init();
