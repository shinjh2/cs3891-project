

// Create circle element
// You should assume `circle_datum` is an object with the following properties:
// `cx`: the x-coordinate of the center of the circle
// `cy`: the y-coordinate of the center of the circle
// `r`: the radius of the circle
// `fill`: the fill color of the circle
function create_circle_element(circle_datum) {
	var circle_elem = create_dom_element("circle");
	circle_elem.setAttribute("cx", circle_datum.cx);
	circle_elem.setAttribute("cy", circle_datum.cy);
	circle_elem.setAttribute("r", 3);
	circle_elem.setAttribute("fill", "blue");
	return circle_elem;
  }


function plot_it()  {
	//Main svg element
	var svg_element = get_single_element_by_name("svg");

	//Scatterplot group
	var datereleased_group = create_dom_element("g");
	datereleased_group.setAttribute("transform", "translate(40,40)");
	//Scatterplot group
	// var scatter_group = create_dom_element("g");
	// scatter_group.setAttribute("transform", "translate(40,40)");

	// we then add the groups as children of the SVG element
	svg_element.appendChild(datereleased_group);
	
	//Load in movie data
	movie_data.forEach(d => {
		d.budget = +d.budget;
		d.id = +d.id;
		d.revenue = +d.revenue;
		d.vote_average = +d.vote_average;
	});

}
