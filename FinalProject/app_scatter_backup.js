//********************************************************** */
//Note to self the following are equivalent:
//
//var funcName = (params) => params + 2
//
//function funcName(params) {
//    return params + 2;
//}
//********************************************************** */


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
        total_lateminutes: +d[' arr_delay'] + +d[' carrier_delay'] + +d.weather_delay + +d.nas_delay + +d.security_delay + +d.late_aircraft_delay,
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

function prepScatterChart(data){
    //d3.rollup(data, reducer, key)
    //key : group by Carrier 
    //reducer: 
    const rolledUpFlightsByCarrier = d3.rollup(
        data,
        v => (d3.sum(v, leaf => leaf.total_lateminutes)),
        d => d.carrier_name
    );    
    const dataArray = Array.from(rolledUpFlightsByCarrier, d => ({ carrier_name: d[0], total_lateminutes: d[1] }));
    console.log('---------------------------------')
    console.log(dataArray)
    return dataArray;
}

//Main function - called after data is loaded
function ready(data){
    const dataclean = filterData(data);
    
    ///////////////////////////////////////////////////////////////////////////////////////////
    //  SCatter CHART
    //
    //Margin information
    //follows Mike Borrow's convention to subtract margins
    const margin = {top: 40, right:40, bottom: 40, left: 100};
    //whole svg canvas
    const width = 500 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    //use d3 function to get min and max for %
    //[min,max]
    const TotalLastMinuteseMinAndMax = d3.extent(data, d => d.total_lateminutes );
    const CountOnTimeMinAndMax = d3.extent(data, d => d.count_ontime)
    //debugger

    const xScale = d3
        .scaleLinear()
       .domain(TotalLastMinuteseMinAndMax)
        .range([0, width]);
    
    const yScale = d3
        .scaleLinear()
        .domain(CountOnTimeMinAndMax)
        .range([height, 0])


    //setting colors
    const color = d3.scaleOrdinal(d3.schemeSet3);
    const myColor = d3.scaleSequential().domain([1,18]).interpolator(d3.interpolateRainbow);
    const ordinalScale = d3.scaleOrdinal().range(d3.schemePaired);
    

    //Draw svg  dimensions
    const svg = d3.select('.svg-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

    //Draw a header
    const header = svg
        .append('g')
        .attr('class', 'scatter-header')
        .attr('transform', `translate(0 ${-margin.top/2})`)
        .append('text')
    
    header.append('tspan').text('Scatter Plot')

    //tooltip
    // add the tooltip area to the webpage
	const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    
    //Draw bars
    svg
    .append('g')
    .attr('class', 'scatter-points')
    .selectAll('.scatter')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'scatter')
    //.attr('cx', function(d, i){return i})
    .attr('cx', d => xScale(d.total_lateminutes))
    .attr('cy', d => yScale(d.count_ontime))
    .attr('r', 4)
    .attr("fill", function(d, i){return myColor(i) })
    .style('fill-opacity', 0.7)
    .on("mouseover", function(d) {
        tooltip.transition()
        .duration(300)
           .style("opacity", 1);
      tooltip.html(d["airport_name"] + "<br/> (" + d.total_lateminutes
        + ", " + d.count_ontime + ")")
           .style("left", (d3.event.pageX + 5) + "px")
           .style("top", (d3.event.pageY - 28) + "px");
  })
.on("mouseout", function() { tooltip.style("opacity", 0) });


    //Draw axes
    const yAxis = d3.axisLeft(yScale).tickSize(0);

    const yAxisDraw = svg
        .append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        //.call(addLabel, 'Revenue', 5);

  // Draw x axis.
  const xAxis = d3
    .axisBottom(xScale)
    .ticks(7)



  const xAxisDraw = svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis)

    const xlabel = svg
    .append('g')
    .attr('class', 'x axis label')
    .style('font-size','0.8em')
    .attr('transform', `translate(${width/8}, ${height + (margin.top * 0.75)})`)
    .append('text')

    xlabel.append('tspan').text('Total Late Minutes for Carrier for Airport')



}










//Load dataset
d3.csv('/data/airline_delay_causes.csv', type).then(res => {
    console.log('Local csv:', res);
    ready(res)
});
