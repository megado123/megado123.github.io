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

        count_ontime: +d.arr_flights - +d.arr_del15
        //count_ontime: +d.arr_flights - (+d.carrier_ct  + +d.nas_ct + +d.security_ct + +d.arr_cancelled + +d.late_aircraft_ct + +d.arr_diverted )
    }
} 

//Data prep
function filterData(data){
    return data.filter(d => {
        return (d.year > 2010 && d.year <= 2020);
    }); 
}

function prepBarChart(data, metric){
    //d3.rollup(data, reducer, key)
    //key : group by Carrier 
    //reducer: 
    console.log('metric:' + metric)
    const rolledUpFlightsByCarrier = d3.rollup(
        data,
        v => (d3.sum(v, leaf => leaf[metric])/d3.sum(v, leaf => leaf.arr_flights)),
        d => d.carrier_name
    );    
    const dataArray = Array.from(rolledUpFlightsByCarrier, d => ({ carrier_name: d[0], percent: d[1] }));
    dataArray.sort(function(a, b){return b.percent - a.percent});
    console.log('---------------------------------')
    console.log(dataArray)
    return dataArray;
}

function getNameColorIndexByCarrierName(data, carrier_name){

    var i = 0
    const airlinenames = d3.rollup(
        data,
        v => i,
        d => d.carrier_name
    );    
  
    const dataArray = Array.from(airlinenames, d => (d[0])).sort();
    
    console.log(dataArray)
    var a = dataArray.indexOf(carrier_name);
    console.log(a)
    return a
}

//Main function - called after data is loaded
function ready(data){
    let metric = 'count_ontime'
    //barChartData = prepBarChart(data, metric)
    

    function click() {
        metric = this.dataset.name;
        console.log(metric);
        //barChartData = prepBarChart(data, metric);
        update(prepBarChart(data, metric), metric);
    }
        //General Update function
        function update(data)
        {
            //use d3 function to get min and max for %
            //[min,max]
            const percentOnTimeMinAndMax = d3.extent(data, d => d.percent );
            xScale.domain([percentOnTimeMinAndMax[0]-.01, percentOnTimeMinAndMax[1]])
            yScale.domain(data.map(d => d.carrier_name))

            //Draw axes
            const yAxis = d3.axisLeft(yScale).tickSize(0);
            yAxisDraw.call(yAxis)

            const xAxis = d3
            .axisTop(xScale)
            .tickFormat(d3.format('.00%'))
            .tickSizeInner(-height)
            .tickSizeOuter(0);

            xAxisDraw.call(xAxis);

            switch
            (metric) {
            case
             "count_ontime":

                header.text("% ontime of total flights")
                break;
              
            case "arr_del15":
                header.text("% delayed due to aircraft arrival delay")
                break;    

            case "carrier_ct":
                header.text('% delayed due to carrier')
                break;

            case "weather_ct":
                    header.text('% delayed due to weather')
                    break;
            }

            //tooltip
            // add the tooltip area to the webpage
            const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
       
            const per= d3.format(".01%");

            bars
            .selectAll('.bar')
            .data(data)
            .join(
                enter => enter
                    .append('rect')
                    .attr('class', 'bar')
                    .attr('y', d => yScale(d.carrier_name))
                    .attr('width', d => xScale(d.percent) )
                    .attr('height',yScale.bandwidth() )
                    .attr("fill", d=> myColor(getNameColorIndexByCarrierName(data, d.carrier_name)))
                    .on("mouseover", function(d) {
                        tooltip.transition()
                        .duration(300)
                           .style("opacity", 1);
                      tooltip.html(per(d["percent"])) 
                           .style("left", (d3.event.pageX + 5) + "px")
                           .style("top", (d3.event.pageY - 28) + "px");
                  })
                .on("mouseout", function() { tooltip.style("opacity", 0) }),
                    
                update => update
                .transition().duration(1000).delay(100)
                .attr('y', d => yScale(d.carrier_name))
                .attr('width', d => xScale(d.percent) )
                .attr("fill", d=> myColor(getNameColorIndexByCarrierName(data, d.carrier_name))),
             
                exit => exit.remove()
            )
        }

    ///////////////////////////////////////////////////////////////////////////////////////////
    //  BAR CHART
    //
    //Margin information
    //follows Mike Borrow's convention to subtract margins
    const margin = {top: 40, right:40, bottom: 40, left: 120};
    //whole svg canvas
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    //debugger

    const xScale = d3
        .scaleLinear()
        .range([0, width]);
    
    const yScale = d3
        .scaleBand()
        .rangeRound([0, height])
        .paddingInner(0.125);

    //setting colors
    //const myColor = d3.scaleOrdinal(d3.schemePaired);
    const myColor = d3.scaleSequential().domain([1,18]).interpolator(d3.interpolateRainbow);
    //const myColor = d3.scaleSequential().domain([1,18]).interpolator(d3.schemeCategory20);
    //const myColor = d3.scaleOrdinal(d3.schemeCategory20);
    //var myColor = d3.scaleSequential().domain([1,4]).interpolator(d3.interpolateViridis);
    //var myColor = d3.scaleOrdinal()
    //.range(["Orange", "Coral", "OliveDrab", "Violet", "MediumAquamarine", "red", "dodgeblue", "gold", "blue", "green", "yellow", "black", "grey", "darkgreen", "pink", "brown", "slateblue", "grey1", "orange"])

    const ordinalScale = d3.scaleOrdinal().range(d3.schemePaired);
    //const  myColor =  d3.scale.category20b();

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
        .append('tspan')

    //Draw bars
    const bars = svg
        .append('g')
        .attr('class', 'bars')

    const yAxisDraw = svg
        .append('g')
        .attr('class', 'y axis')
    
    const xAxisDraw = svg
        .append('g')
        .attr('class', 'x axis')

    //List for click events - select al for all buttons
    d3.selectAll('button').on('click', click)

    //Initial Render.
    update(prepBarChart(data, metric), 'count_onetime');
}

//Load dataset
d3.csv('/data/airline_delay_causes.csv', type).then(res => {
    console.log('Local csv:', res);
    ready(res)
});
