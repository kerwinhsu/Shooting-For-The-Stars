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

		// get the height and width of the graph
		var scaleHeight = d3.scaleLinear()
			.domain([0, d3.max(data, function (d) {
				return d.count_of_class; // ******* this is going to need to be changed to fit wit the item info below
			})])
			.range([chartHeight, 0]);


		/* #region  count the number of items in the selected tier */
		var items = [];

		current = null;
		count = 0;
		subValues = [];

		data.forEach(d => {
			items.push(d.class_tier_3); // ****** this is going to need to be changed to accecpt variable class tiers
		});

		items = items.sort();

		items.forEach(item => {
			if (item != current) {
				count += 1;
				current = item;
				subValues.push(item);
			}
		});
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
				// .attr("dx", "-.8em")
	   			// .attr("dy", ".15em")
				.attr("transform", "rotate(-65)");

		chartGroup.append("g")
			.attr("transform", `translate(${chartWidth}, 0)`)
			.call(yAxis);
	});

}

graph();