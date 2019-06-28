//path to the data
dataLocation = "static/data/Clean_Meteor_Class_Data.csv"

margin = {
	left: 60,
	right: 60,
	top: 10,
	bottom: 150
}

svgWidth = 600;
svgHeight = 375; // *** edit to be adjustable to screen size

chartWidth = svgWidth - margin.left - margin.right;
chartHeight = svgHeight - margin.top - margin.bottom;

svgGroup = d3.select("#graph")
	.append("svg")
	.attr("width", svgWidth)
	.attr("height", svgHeight);

chartGroup = svgGroup.append("g")
	.attr("transform", `translate(${margin.left}, ${margin.top})`);


function graph(error) {
	//extract the data from the CSV
	if (error) throw error;
	d3.csv(dataLocation, function (data) {
		console.log(data);

		data.forEach( function(d) {
			d.count_of_class = +d.count_of_class;
		});

		// get the height and width of the graph
		var scaleHeight = d3.scaleSqrt()
			.domain([0, d3.max(data, function (d) {
				console.log(d.count_of_class);
				return d.count_of_class; // ******* this is going to need to be changed to fit wit the item info below
			})])
			.range([0, chartHeight]);

		/* #region  count the number of items in the selected tier */
		var items = [];

		data.forEach(d => {
			items.push(d.class_tier_3); // ****** this is going to need to be changed to accecpt variable class tiers
		});
		items = items.sort();
		
		console.log(items);

		current = null;
		subTotal = [];
		subValues = [];

		items.forEach(item => {
			if (item != current) {
				current = item;
				subValues.push(item);
			}
		});

		console.log(subValues);
		/* #endregion */

		var scaleWidth = d3.scaleLinear()
			.domain([0,subValues.length])
			.range([0, chartWidth]);

		var xAxis = d3.axisBottom(scaleWidth)
			.ticks(subValues.length)
			.tickFormat(function(d) {
				return subValues[d];
			});

		var yAxis = d3.axisLeft(scaleHeight)
			.tickSize(chartWidth);

		chartGroup.append("g")
			.attr("transform", `translate(0, ${chartHeight})`)
			.call(xAxis)
			.selectAll("text")
				.style("text-anchor", "end")
				.attr("transform", "rotate(-65)");

		chartGroup.append("g")
			.attr("transform", `translate(${chartWidth}, 0)`)
			.call(yAxis);
		
		//set bar width
		barSpacing = chartWidth / subValues.length * .05;

		barWidth = (chartWidth - (barSpacing * (subValues.length - 1))) / subValues.length;

		barGroup = chartGroup.selectAll(".bar")
			.data(data)
			.enter()
			.append("rect")
			.classed("bar", true)
			.attr("width", d => barWidth)
 		   	.attr("height", d => scaleHeight(d.count_of_class))
   			.attr("x", (d, i) => i * (barWidth + barSpacing))
			.attr("y", d => chartHeight - scaleHeight(d.count_of_class));

	});

}

graph();