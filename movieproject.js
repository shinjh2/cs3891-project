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
  
	var width = 850, height = 750, plot_dim = 350;
	d3.select('body').append('svg').attr('width', width).attr('height', height);
	var pad = 50;
	var actual_width = width-2*pad, actual_height = height-2*pad;


	var bar_x = 0, bar_width = actual_width/2, bar_height = actual_height/6;
	var bar1_y = 0;
                                                                   

    //here our independent bar plots are of budget, coutnry, genre, production companies,
    //release date. Our dependent scatter plots that are the outcome are of revenue and rating
    //see Berger's comment as to why this is so

    //challenges:
    // budget and release date need to be rolled up into intervals
    // country, genre and production companies are each in arrays that each need to be parsed through


    // only budget has been implemented so far

    d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x)+','+(pad+bar1_y)+')').attr('id', 'budget').attr('width', plot_dim).attr('height', plot_dim)
    d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x)+','+(pad+bar1_y)+')').attr('id', 'genre').attr('width', plot_dim).attr('height', plot_dim)


/// select attributes we're interested in
	movie_data.forEach(d => {
		d.budget = +d.budget;
  });
  
var budget_intervals = ["0-19.8M", "19.8-39.6M", "39.6M-59.4M", "59.4M-79.2M", "79.2M-99M"];

var budget_scale = d3.scaleQuantize()
  .domain([0, 99000000])
  .range(budget_intervals);
/// data for the first 5 filters's plot
	var nested_budget = d3.nest()
		.key(function(d){return budget_scale(d.budget);})
		.rollup(function(leaves){return leaves.length;})
		.entries(movie_data)

    //unrolled array of genres
    var genre_types = [];
    for(var i = 0; i < movie_data.length; i++){
        var j = 5;
        while(movie_data[i]['genres'].split('"')[j] != null){
            genre_types.push(movie_data[i]['genres'].split('"')[j])
            j += 6;
        }
    }
    console.log(genre_types);
    //rolled array of genres with counts
    var nested_genres = d3.nest()
        .key(function(d){return d;})
        .rollup(function(leaves){return leaves.length;})
        .entries(genre_types)
    console.log(nested_genres);

    //scales for budget
    var budget_xscale = d3.scaleBand().domain(budget_intervals).range([0,plot_dim]).padding(.05);

    var max_budget_count = d3.max(nested_budget, d => d['value']);
    var budget_yscale = d3.scaleLinear().domain([0,max_budget_count]).range([plot_dim, 0]);
    console.log(nested_budget);



    //scales for genre
    //array of all genre names for band scale
    var genre_names = [];
    for(var i = 0; i < nested_genres.length; i++) {
        genre_names.push(nested_genres[i]['key']);
    }

    var genre_xscale = d3.scaleBand().domain(genre_names).range([bar_height, 0]);

    var min_genre_count= d3.min(nested_genres, d => d['value']);
    var max_genre_count = d3.max(nested_genres, d => d['value']);
    var genre_yscale = d3.scaleLinear().domain([min_genre_count,max_genre_count]).range([0,bar_height]);
    console.log(nested_genres);

    d3.select('#budget').selectAll('empty').data(nested_budget).enter().append('rect')
             .attr('x', d => budget_xscale(d['key']))
             .attr('y', function(d) { return budget_yscale(d['value']);})
             .attr('width', budget_xscale.bandwidth())
	           .attr('height', function(d) { return plot_dim - budget_yscale(d['value']);})
             .attr('fill', "blue")


    d3.select('#genre').selectAll('empty').data(nested_genres).enter().append('circle')
        .attr('cx', d => genre_xscale(d['key']))
        .attr('cy', d => genre_yscale(d['value']))
        .attr('r', 5)
        .attr('fill', "blue")

    // X AXIS Y AXIS
    var y_axis = d3.axisLeft(budget_yscale)
    d3.select('#budget').append('g').attr('id', 'yaxis')

    d3.select('#yaxis').append("g")
      .call(y_axis)

    var x_axis = d3.axisBottom(budget_xscale)
    d3.select('#budget').append('g').attr('id', 'xaxis')
    
    d3.select('#xaxis').append("g")
      .call(x_axis)
      .attr("transform", "translate(0," + plot_dim + ")")

    //PLOT LABELS
    d3.select('#budget').append('text').text('Movie Budget vs Frequency')
    .attr('transform', 'translate('+(plot_dim/2)+',-15)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '20px')
    
    d3.select('#budget').append('text').text('Number of Movies')
    .attr('transform', 'translate('+(-35)+','+(plot_dim/2)+') rotate(270)').attr('text-anchor', 'middle').attr('fill', '#000')
    
    d3.select('#budget').append('text').text('Budget in Millions')
    .attr('transform', 'translate('+(plot_dim/2)+','+(plot_dim+30)+')').attr('text-anchor', 'middle').attr('fill', '#000')
}