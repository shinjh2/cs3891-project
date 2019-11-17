//Email I got from Berger about our vis:

//Hi Jason,
//
// Just to briefly follow up our discussion, as I was a bit crunched for time earlier:
//
// It is worth separating the independent attributes in the movies data from the dependent attributes.
// Independent attributes, here, means aspects of movies that are not measured, e.g. year, director, genre,
// etc.. whereas dependent attributes are movie gross, ratings, etc..
//
// By decoupling these attributes, you can select the independent attributes (through linked, multiple views
// as we discussed) to then trigger novel views for the dependent attributes (e.g. scatterplot). Now, another
// thing to consider is how you select: as we discussed brushes across attributes could correspond to intersections.
// But, you could also consider the union operator for a single attribute, which then highlights those points differently
// in the scatterplot. For instance, if a user clicks on two bars that correspond to two different genres, then in your
// scatterplot you could color points differently based on genre. This way, you can compare multiple values within an
// attribute (e.g. action and comedy), and still filter movies based on the other attribute selections (e.g. limit
// movies to years 1990-1999).
//
// Furthermore, if you'd like to show directors in your plots, one thing you could do is select a small amount of
// prominent directors (either automatically, or even manually, e.g. Stephen Spielberg, Martin Scorsese, those who have
// directed a lot of well-known movies), and visually encode movies directed by these people differently in your scatterplot.
// That way, you can compare movies directed by prominent directors with the rest of the movies.
//
// Good luck in putting together the prototype.
//


//function create_dom_element(element_name)  {
//    return document.createElementNS('http://www.w3.org/2000/svg', element_name);
//}

//function get_single_element_by_name(element_name)  {
//    return document.getElementsByTagName(element_name)[0];
//}



// I cant get anything to show up on my local host even when i leave the plot_it function blank
// and leave only a text group, so I cant test how to implement intervals in a rollup
// first step needs to be to make sure that the stuff even shows up in the first place on the server
// so we can test if it works as we go.


function plot_it()  {

	var width = 850, height = 750;
	d3.select('body').append('svg').attr('width', width).attr('height', height);
	var pad = 50;
	var actual_width = width-2*pad, actual_height = height-2*pad;


	var bar_x = 0, bar_width = actual_width/2, bar_height = actual_height/6;
	var bar1_y = 0;
                                                                   ]

    //here our independent bar plots are of budget, coutnry, genre, production companies,
    //release date. Our dependent scatter plots that are the outcome are of revenue and rating
    //see Berger's comment as to why this is so

    //challenges:
    // budget and release date need to be rolled up into intervals
    // country, genre and production companies are each in arrays that each need to be parsed through


    // only budget has been implemented so far

    d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x)+','+(pad+bar1_y)+')').attr('id', 'budget')



/// select attributes we're interested in
	movie_data.forEach(d => {
		d.budget = +d.budget;
	});


/// data for the first 5 filters's plot
	var nested_budget = d3.nest()
		.key(function(d){return d.budget;}).sortKeys(d3.ascending)
		.rollup(function(leaves){return leaves.length;})
		.entries(movie_data)


    var min_budget= d3.min(nested_budget, d => d['key']);
    var max_budget = d3.max(nested_budget, d => d['key']);
    var budget_xscale = d3.scaleLinear().domain([min_budget,max_budget]).range([0,bar_width]);


    var min_budget_count= d3.min(nested_budget, d => d['value']);
    var max_budget_count = d3.max(nested_budget, d => d['value']);
    var budget_yscale = d3.scaleLinear().domain([min_budget_count,max_budget_count]).range([0,bar_height]);


    d3.select('budget').selectAll('empty').data(nested_budget).enter().append('g').attr('id', 'budgetme')
    
    d3.selectAll('budgetme').selectAll('empty').data(d => d).enter().append('circle')
             .attr('cx', d => budget_xscale(d['key']))
             .attr('cy', d => budget_yscale(d['value']))


}