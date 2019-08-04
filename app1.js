//leveraging: http://bl.ocks.org/mstanaland/6100713

const parseNA = string => (string == 'NA' ? undefined: string);

function type(d)
{
    return {
        year: +d.year,
        month: +d[' month'],
        carrier: parseNA(d.carrier),
        carrier_name: d.carrier_name,
        airport: d.airport,
        airport_name: d.airport_name,	
        arr_flights: +d.arr_flights,
        arr_delay: +d[' arr_delay'],
        arr_del15: +d.arr_del15,
        carrier_ct: +d.carrier_ct,
        weather_ct: +d[' weather_ct'],
        nas_ct: +d.nas_ct,
        security_ct: +d.security_ct,
        late_aircraft_ct: +d.late_aircraft_ct,
        arr_cancelled: +d.arr_cancelled,
        arr_diverted: +d.arr_diverted,
        carrier_delay: +d[' carrier_delay'],
        weather_delay: +d.weather_delay,
        nas_delay: +d.nas_delay,
        security_delay: +d.security_delay,
        late_aircraft_delay: +d.late_aircraft_delay,
        total_lateminutes: +d.arr_delay + +d.carrier_delay + +d.weather_delay + +d.nas_delay + +d.security_delay + +d.late_aircraft_delay,
        //total_lateminutes: 100,
        //count_ontime: +d.arr_flights - (+d.arr_del15 + +d.carrier_ct + +d.weather_ct + +d.nas_ct + +d.security_ct + +d.arr_cancelled + +d.late_aircraft_ct + +d.arr_delay + +d.arr_diverted )
        count_ontime: +d.arr_flights - (+d.carrier_ct  + +d.nas_ct + +d.security_ct + +d.arr_cancelled + +d.late_aircraft_ct + +d.arr_diverted )

    }
} 

const margin = {top: 20, right: 160,bottom: 40, left: 20};

var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function getCounts(data, metric)
{
    const rolledUpFlightsByCarrier = d3.rollup(
        data,
        v => ((d3.sum(v, leaf => leaf[metric])/d3.sum(v, leaf => leaf.arr_flights)) * 100),
        d => d.carrier
    );  

    const dataArray = Array.from(rolledUpFlightsByCarrier, d => ({ carrier_name: d[0], percent: d[1] }));
    dataArray.sort((a, b) => (a.carrier_name > b.carrier_name) ? 1 : -1)

    return dataArray;
}
function prepBarChart(data){
    carrier_ct_percent = getCounts(data, 'carrier_ct');
    weather_ct_percent = getCounts(data, 'weather_ct');
    nas_ct_percent = getCounts(data, 'nas_ct');
    security_ct_percent = getCounts(data, 'security_ct');
    late_aircraft_ct_percent = getCounts(data, 'late_aircraft_ct');

  var all_percents = [];

  for (var i = 0; i < carrier_ct_percent.length; i++) {
  
    let bike = {name: carrier_ct_percent[i].carrier_name, 
                late_aircraft_percent: late_aircraft_ct_percent[i].percent,
                carrier_pecent:   carrier_ct_percent[i].percent, 
                weather_percent:  weather_ct_percent[i].percent,
                nas_percent: nas_ct_percent[i].percent,
                security_percent: nas_ct_percent[i].percent,
                total: late_aircraft_ct_percent[i].percent + carrier_ct_percent[i].percent + weather_ct_percent[i].percent + nas_ct_percent[i].percent + nas_ct_percent[i].percent };
    all_percents[i] = bike;
  }
  all_percents.sort(function(a, b){return b.name - a.name});

    console.log(all_percents);
    return all_percents
}


//var data
d3.csv('/data/airline_delay_causes.csv', type).then(res => {
  console.log('Local csv:', res);
  ready(res)
});

//var parse = d3.time.format("%Y").parse;



function ready(data){
var datasetprepped = prepBarChart(data)

// Transpose the data into layers
var dataset = d3.layout.stack()(["late_aircraft_percent", "carrier_pecent", "weather_percent", "nas_percent", "security_percent"].map(function(fruit) {
  return datasetprepped.map(function(d) {
    return {x: d.name, y: +d[fruit]};
  });
}));

console.log(dataset);

const colors = ["33D5FF", "F3FF33", "#288E23", "#A933FF", "#FF3355"];


//Setup the X and Y axis information
const x = d3.scale.ordinal()
  .domain(dataset[0].map(function(d) { console.log(d.x) ; return d.x; }))
  .rangeRoundBands([10, width-10], 0.02);

  const x2 = d3.scale.ordinal()
  .domain(dataset[0].map(function(d) { console.log(d.x) ; return d.x; }))
  .rangeRoundBands([10 + (x.rangeBand()/2), width-10 +  (x.rangeBand()/2)], 0.02);


const xlabels = d3.scaleBand()
              .domain(dataset[0].map(function(d) { console.log(d.x) ; return d.x; }))
              .range([10 + (x.rangeBand())  , width-10  ]);

const y = d3.scale.linear()
  .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
  .range([height, 0]);


const yAxisDraw = svg
        .append('g')
        .attr('class', 'y axis')
        .attr("transform", "translate(15," + "0" + ")")
    
//Draw axes
const yAxis = d3.axisLeft(y).tickSize(0);
    yAxisDraw.call(yAxis)

svg.append("g")
.attr("transform", "translate(0," + height + ")")
.call(d3.axisBottom(x2));

// text label for the x axis
svg.append("text")             
.attr("transform",
      "translate(" + (width/2) + " ," + 
                     (height + margin.top + 10) + ")")
.style("text-anchor", "middle")
.text("Carriers");

// text label for the y axis
const ylabel =  svg   
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 0 - margin.left)
     .attr("x",0 - (height / 2))
     .attr("dy", "1em")
     .style("text-anchor", "middle")
     .text("% Delay");   


// Create groups for each series, rects for each segment 
var groups = svg.selectAll("g.cost")
  .data(dataset)
  .enter().append("g")
  .attr("class", "cost")
  .style("fill", function(d, i) { return colors[i]; });

var rect = groups.selectAll("rect")
  .data(function(d) { return d; })
  .enter()
  .append("rect")
  .attr("x", function(d) { return x(d.x); })
  .attr("y", function(d) { return y(d.y0 + d.y); })
  .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
  .attr("width", x.rangeBand())
  .on("mouseover", function() { tooltip.style("display", null); })
  .on("mouseout", function() { tooltip.style("display", "none"); })
  .on("mousemove", function(d) {
    var xPosition = d3.mouse(this)[0] - 15;
    var yPosition = d3.mouse(this)[1] - 25;
    tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
    tooltip.select("text").text(d.y.toFixed(2));
  });


// Draw legend
var legend = svg.selectAll(".legend")
  .data(colors)
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });
 
legend.append("rect")
  .attr("x", width - 18)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", function(d, i) {return colors.slice().reverse()[i];});
 
legend.append("text")
  .attr("x", width + 5)
  .attr("y", 9)
  .attr("dy", ".35em")
  .style("text-anchor", "start")
  .text(function(d, i) { 
    switch (i) {
      case 0: return "Security Delay";
      case 1: return "NAS Delay";
      case 2: return "Weather delay";
      case 3: return "Carrier Delay";
      case 4: return "Late aircraft delay"
    }
  });


// Prep the tooltip bits, initial display is hidden
var tooltip = svg.append("g")
  .attr("class", "tooltip")
  .style("display", "none");
    
tooltip.append("rect")
  .attr("width", 30)
  .attr("height", 20)
  .attr("fill", "white")
  .style("opacity", 0.5);

tooltip.append("text")
  .attr("x", 15)
  .attr("dy", "1.2em")
  .style("text-anchor", "middle")
  .attr("font-size", "12px")
  .attr("font-weight", "bold");
};