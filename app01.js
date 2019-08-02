
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

d3.csv('/data/segments_table2.csv', type).then(res => {
  console.log('Local csv:', res);
  ready(res)
});


function ready(data){

  var myColor = d3.scaleOrdinal()
  .domain(data.columns.slice(1))
  .range(d3.schemePaired);
  //.interpolator(d3.interpolateRainbow);





  data.sort(function(a, b) { return b.total - a.total; });
  x.domain(data.map(function(d) { return d.ethnicity; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();

  console.log(data.columns.slice(1));
  debugger
  //z.domain(data.columns.slice(1));

  g.selectAll(".serie")
    .data(stack.keys(data.columns.slice(1))(data))
    .enter().append("g")
      .attr("class", "serie")
      .attr("fill", function(d, i) { console.log(d.key); return myColor(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.data.ethnicity); })
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
    .data(data.columns.slice(1).reverse())
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
      .attr("x", width + 44)
      .attr("y", 9)
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .text(function(d) { return d; });
};

function type(d, i, columns) {
  for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
  d.total = t;
  return d;
}