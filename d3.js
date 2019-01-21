
// svg variable is placed using a div and class css selector
const svg = d3.select('.canvas')
	.append('svg')
	.attr('width', 400)
	.attr('height', 400)
	.attr('margin-left', 20);

// create margins on dimensions
const margin = { top: 20, right: 0, bottom: 50, left: 50 };
const graphWidth = 300 - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

// create group
const graph = svg.append('g')
	.attr('width', graphWidth)
	.attr('height', graphHeight)
	.attr('transform', `translate(${margin.left}, ${margin.top})`)

// axis
const xAxisGroup = graph.append('g')
	.attr('transform', `translate(0, ${graphHeight})`)

const yAxisGroup = graph.append('g')

// get json data from Rails API scopes on Voter model
function loadStats() {
	$.ajax({
		url: 'https://voter-preference-api.herokuapp.com/api/stats',
		method: 'get',
		dataType: 'json'
	}).done(response => {

		const data = [
			{
				name: "support",
				votes: response.support.length,
				color: "green"
			},
			{
				name: "oppose",
				votes: response.oppose.length,
				color: "red"
			},
			{
				name: "undecided",
				votes: response.undecided.length,
				color: "yellow"
			}
		]

		// sort data by votes attribute
		// data.sort((a, b) => a.votes < b.votes ? -1 : 1)
		console.log('stats loaded: ', data);

		// set y domain using min/max of data votes attribute
		// set y range using graphHeight(calculated above) and 0 
		const y = d3.scaleLinear()
			.domain([0, d3.max(data, d => d.votes)])
			.range([graphHeight, 0]);

		const x = d3.scaleBand()
			.domain(data.map(item => item.name)) // array of names for x domain
			.range([0, graphWidth]) // range within overall graph width
			.paddingInner(0.1)
			.paddingOuter(0.2);

		// find existing and append virtual rects to graph now, instead of svg, to incorporate graph grouping
		// const rects = svg.selectAll('rect')
		// add data to rects
		const rects = graph.selectAll('rect')
			.data(data)

		// bind existing rects to graph, instead of svg, to incorporate graph grouping
		rects.attr('width', x.bandwidth)
			.attr('height', d => graphHeight - y(d.votes))
			.attr('fill', d => d.color)
			.attr('stroke', 'black')
			.attr('x', d => x(d.name))
			.attr('y', d => y(d.votes));

		// create and append virtual rects to graph, instead of svg, to incorporate graph grouping
		rects.enter()
			.append('rect')
			.attr('width', x.bandwidth) // width determined by svg width diveded by numer of items in x.domain
			.attr('height', d => graphHeight - y(d.votes)) // height of bar only, does not place it up or down vertically
			.attr('fill', d => d.color)
			.attr('stroke', 'black')
			.attr('x', d => x(d.name))   // name attr is index on array derived in x BAND scale; returns a number
			.attr('y', d => y(d.votes)); // votes attr is index on array derived in y LINEAR; returns a numb


		// create and call the axes
		const xAxis = d3.axisBottom(x)
		const yAxis = d3.axisLeft(y)
			.ticks(6)
			.tickFormat(d => `${d} votes`);

		// apply these to:  
		// const xAxisGroup = graph.append('g')
		// const yAxisGroup = graph.append('g')
		xAxisGroup.call(xAxis)
		yAxisGroup.call(yAxis)

		xAxisGroup.selectAll('text')
			.attr('transform', 'rotate(-40)')
			.attr('text-anchor', 'end')
			.attr('fill', 'black');
	})
}
