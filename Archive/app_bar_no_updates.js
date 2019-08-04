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

function prepBarChart(data){
    //d3.rollup(data, reducer, key)
    //key : group by Carrier 
    //reducer: 
    const rolledUpFlightsByCarrier = d3.rollup(
        data,
        v => (d3.sum(v, leaf => leaf.count_ontime)/d3.sum(v, leaf => leaf.arr_flights)),
        d => d.carrier_name
    );    
    const dataArray = Array.from(rolledUpFlightsByCarrier, d => ({ carrier_name: d[0], percentOnTime: d[1] }));
    console.log('---------------------------------')
    console.log(dataArray)
    return dataArray;
}

//Main function - called after data is loaded
function ready(data){
    const dataclean = filterData(data);
    const barChartData = prepBarChart(dataclean)
            .sort(function(a, b){return b.percentOnTime - a.percentOnTime});

    ///////////////////////////////////////////////////////////////////////////////////////////
    //  BAR CHART
    //
    //Margin information
    //follows Mike Borrow's convention to subtract margins
    const margin = {top: 40, right:40, bottom: 40, left: 120};
    //whole svg canvas
    const width = 1500 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    //use d3 function to get min and max for %
    //[min,max]
    const percentOnTimeMinAndMax = d3.extent(barChartData, d => d.percentOnTime );
    //debugger

    const xScale = d3
        .scaleLinear()
        .domain([percentOnTimeMinAndMax[0]-.01, percentOnTimeMinAndMax[1]])
        .range([0, width]);
    
    const yScale = d3
        .scaleBand()
        .domain(barChartData.map(d => d.carrier_name))
        .rangeRound([0, height])
        .paddingInner(0.125);

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
        .attr('class', 'bar-header')
        .attr('transform', `translate(0 ${-margin.top/2})`)
        .append('text')
    
    header.append('tspan').text('Total Values 2')

    
    //Draw bars
    const bars = svg
        .selectAll('.bar')
        .data(barChartData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', d => yScale(d.carrier_name))
        .attr('width', d => xScale(d.percentOnTime) )
        .attr('height',yScale.bandwidth() )
        .attr("fill", function(d, i){return myColor(i) })
        //.attr("fill", d =>  color(d.carrier_name))


    //Draw axes
    const yAxis = d3.axisLeft(yScale).tickSize(0);

    const yAxisDraw = svg
        .append('g')
        .attr('class', 'y axis')
        .call(yAxis)

    const xAxis = d3
            .axisTop(xScale)
            .tickFormat(d3.format('.00%'))
            .tickSizeInner(-height)
            .tickSizeOuter(0);

    const xAxisDraw = svg
        .append('g')
        .attr('class', 'x axis')
        .call(xAxis);
    


}










//Load dataset
d3.csv('/data/airline_delay_causes.csv', type).then(res => {
    console.log('Local csv:', res);
    ready(res)
});
