//path to the data
dataLocation = "static/data/Clean_Meteor_Class_Data.csv"

margin = {
	left: 100,
	right: 60,
	top: 60,
	bottom: 150
}

svgWidth = 600;
svgHeight = 500; // *** edit to be adjustable to screen size

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

		// scale the height and width of the graph
		var scaleHeight = d3.scaleSqrt()
			.domain([0, d3.max(data, function (d) {
				console.log(d.count_of_class);
				return d.count_of_class; // ******* this is going to need to be changed to fit wit the item info below
			})])
			.range([chartHeight, 0]);

		/* #region  count the number of items in the selected tier */
		var items = [];

		data.forEach(d => {
			items.push(d.class_tier_3);
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


		// create Axis
		var xAxis = d3.axisBottom(scaleWidth)
			.ticks(subValues.length)
			.tickFormat(function(d) {
				return subValues[d];
			});

		var yAxis = d3.axisLeft(scaleHeight)
			.tickSize(chartWidth);

		// draw axes
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
		
		//get the primary classes of meteorites
		var items2 = [];

		data.forEach(d => {
			items2.push(d.class_tier_1);
		});
		items2 = items2.sort();
		
		console.log(items2);

		current = null;
		primaryClasses = [];

		items2.forEach(item => {
			if (item != current) {
				current = item;
				primaryClasses.push(item);
			}
		});
		console.log(primaryClasses);

		//create colors for bars
		var myColors = d3.scaleOrdinal()
			.domain(primaryClasses)
			.range(["red", "blue", "purple"]);

		//draw graph
		barGroup = chartGroup.selectAll(".bar")
			.data(data)
			.enter()
			.append("rect")
			.attr("fill", function(d) {return myColors(d.class_tier_1)})
			.classed("bar", true)
			.attr("width", d => barWidth)
 		   	.attr("height", d => chartHeight - scaleHeight(d.count_of_class))
   			.attr("x", (d, i) => i * (barWidth + barSpacing))
			.attr("y", d => scaleHeight(d.count_of_class));


		// add lables
		chartGroup.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - margin.left/2)
			.attr("x", 0 - (chartWidth/2))
			.style("text-anchor", "middle")
			.text("Landings per Class");

		chartGroup.append("text")
			.attr("y",chartHeight + margin.bottom * .99)
			.attr("x",(chartWidth/2))
			.style("text-anchor", "middle")
			.text("Classifications");

		chartGroup.append("text")
			.attr("y", 0 - margin.top/2)
			.attr("x",(chartWidth/2))
			.style("text-anchor", "middle")
			.text("Meteorite Classifications");
	});

}

graph();