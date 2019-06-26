//path to the data
dataLocation = "static/data/Clean_Meteor_Class_Data.csv"

svgGroup = d3.select("#graph")
	.append("svg")
	.attr("width", 600)
	.attr("height", 375);

chartGroup = svgGroup.append("g")
	.attr("transform", "translate(0,0)");


function graph(error) {
	//extract the data from the CSV
	if (error) throw error;
	d3.csv(dataLocation, function(data) {
		console.log(data[0]);

		
	});

}

graph();