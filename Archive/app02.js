//Data Helper Utils
const parseNA = string => (string == 'NA' ? undefined: string);

//Type conversion
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

//Data prep
function filterData(data){
  return data.filter(d => {
      return (d.year > 2010 && d.year <= 2020);
  }); 
}

function getCounts(data, metric)
{
    const rolledUpFlightsByCarrier = d3.rollup(
        data,
        v => ((d3.sum(v, leaf => leaf[metric])/d3.sum(v, leaf => leaf.arr_flights)) * 100),
        d => d.carrier_name
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

    return all_percents
}

function ready(data){
  let metric = 'count_ontime'
  barChartData = prepBarChart(data)
  console.log(barChartData)

  var myColor = d3.scaleOrdinal()
  .domain(barChartData.name)
  .range(d3.schemePaired);
  //.interpolator(d3.interpolateRainbow);


  barChartData.sort(function(a, b) { return b.total - a.total; });
  x.domain(data.map(function(d) { return d.name; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();


  g.selectAll(".serie")
    .data(stack.keys(barChartData.columns.slice(1))(barChartData))
    .enter().append("g")
      .attr("class", "serie")
      .attr("fill", function(d, i) { console.log(d.key); return myColor(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.data.name); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth());

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks(10).pop()))
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .attr("fill", "#000")
      .text("Population");

  var legend = g.selectAll(".legend")
    .data(barChartData.columns.slice(1).reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
      .style("font", "10px sans-serif");

  legend.append("rect")
      .attr("x", width + 18)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", myColor);

  legend.append("text")
      .attr("x", width-44)
      .attr("y", 9)
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .text(function(d) { console.log(d) ;return d; });




}

////////////////////////////////////////////////////////
//Stacked Bar Chart
const margin = {top: 40, right:40, bottom: 40, left: 120};
//whole svg canvas
const width = 960 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;


//Draw svg  dimensions
const svg = d3.select('.svg-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

const g = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);


var x = d3.scaleBand()
    .rangeRound([0, width])
    .padding(0.3)
    .align(0.3);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var stack = d3.stack();

d3.csv('/data/airline_delay_causes.csv', type).then(res => {
  console.log('Local csv:', res);
  ready(res)
});