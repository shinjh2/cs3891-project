
function plot_it()  {
  
	var width = 850, height = 750, plot_dim = 350;
	d3.select('body').append('svg').attr('width', width).attr('height', height);
	var pad = 50;
	var actual_width = width-2*pad, actual_height = height-2*pad;


	var bar_x = 0, bar_width = actual_width/2, bar_height = actual_height/6;
	var bar1_y = 0;


    d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x)+','+(pad+bar1_y)+')').attr('id', 'budget').attr('width', plot_dim).attr('height', plot_dim)
    d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x + 400)+','+(pad+bar1_y)+')').attr('id', 'genre').attr('width', plot_dim).attr('height', plot_dim)


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

    //unrolled array of countries
    var country_types = [];
    for(var i = 0; i < movie_data.length; i++){
        var j = 7;
        while(movie_data[i]['production_countries'].split('"')[j] != null){
            country_types.push(movie_data[i]['production_countries'].split('"')[j])
            j += 8;
        }
    }
    console.log(country_types);

    var nested_countries = d3.nest()
        .key(function(d){return d;})
        .rollup(function(leaves){return leaves.length;})
        .entries(country_types)
        .sort(function(a,b){return d3.descending(a.value,b.value);});
    console.log(nested_countries);

    var countries = nested_countries.map(d=>d.key);
    var country_counts = nested_countries.map(d=>d.value);

    var top20_counts = []
    for (var i=0;i<19;i++){
        top20_counts.push(country_counts[i]);
    }
    var top20_countries = []
    for (var i=0;i<19;i++){
        top20_countries.push(countries[i]);
    }
    var other_counts = 0
    for (var i = 19;i<country_counts.length;i++){
        other_counts += country_counts[i];
    }
    var top20_moviebyCountry = []
    for (var i=0;i<19;i++){
        top20_moviebyCountry.push(nested_countries[i]);
    }
    top20_moviebyCountry.push({key:'Others',value:other_counts});
    console.log(top20_moviebyCountry);


    //unrolled array of production companies
    var company_types = [];
    for(var i = 0; i < movie_data.length; i++){
        var j = 3;
        while(movie_data[i]['production_companies'].split('"')[j] != null){
            company_types.push(movie_data[i]['production_companies'].split('"')[j])
            j += 6;
        }
    }
    console.log(company_types);

    var nested_companies = d3.nest()
        .key(function(d){return d;})
        .rollup(function(leaves){return leaves.length;})
        .entries(company_types)
        .sort(function(a,b){return d3.descending(a.value,b.value);});
    console.log(nested_companies);


    var companies = nested_companies.map(d=>d.key);
    var company_counts = nested_companies.map(d=>d.value);

    var top20_company_counts = []
    for (var i=0;i<19;i++){
        top20_company_counts.push(company_counts[i]);
    }
    var top20_companies = []
    for (var i=0;i<19;i++){
        top20_companies.push(companies[i]);
    }
    var others_counts = 0
    for (var i = 19;i<company_counts.length;i++){
        others_counts += company_counts[i];
    }
    var top20_moviebyCompany = []
    for (var i=0;i<19;i++){
        top20_moviebyCompany.push(nested_companies[i]);
    }
    top20_moviebyCompany.push({key:'Others',value:others_counts});
    console.log(top20_moviebyCompany);


    //scales for budget
    var budget_xscale = d3.scaleBand().domain(budget_intervals).range([0,plot_dim]).padding(.05);

    var max_budget_count = d3.max(nested_budget, d => d['value']);
    var budget_yscale = d3.scaleLinear().domain([0,max_budget_count]).range([plot_dim, 0]);


    //scales for genre
    //array of all genre names for band scale
    var genre_names = [];
    for(var i = 0; i < nested_genres.length; i++) {
        genre_names.push(nested_genres[i]['key']);
    }
    var genre_xscale = d3.scaleBand().domain(genre_names).range([plot_dim, 0]).padding(.05);

    var max_genre_count = d3.max(nested_genres, d => d['value']);
    var genre_yscale = d3.scaleLinear().domain([0,max_genre_count]).range([plot_dim, 0]);



    var country_xscale = d3.scaleBand().domain(countries).range([plot_dim, 0]).padding(.05);

    var max_country_count = d3.max(nested_countries, d => d['value']);
    var country_yscale = d3.scaleLinear().domain([0,max_country_count]).range([plot_dim, 0]);

    var company_xscale = d3.scaleBand().domain(companies).range([plot_dim, 0]).padding(.05);

    var max_company_count = d3.max(nested_companies, d => d['value']);
    var company_yscale = d3.scaleLinear().domain([0,max_company_count]).range([plot_dim, 0]);


    d3.select('#budget').selectAll('empty').data(nested_budget).enter().append('rect')
             .attr('x', d => budget_xscale(d['key']))
             .attr('y', function(d) { return budget_yscale(d['value']);})
             .attr('width', budget_xscale.bandwidth())
	           .attr('height', function(d) { return plot_dim - budget_yscale(d['value']);})
             .attr('fill', "blue")


    d3.select('#genre').selectAll('empty').data(nested_genres).enter().append('rect')
        .attr('x', d => genre_xscale(d['key']))
        .attr('y', d => genre_yscale(d['value']))
        .attr('width', genre_xscale.bandwidth())
	      .attr('height', function(d) { return plot_dim - genre_yscale(d['value']);})
        .attr('fill', "blue")

    // X AXIS Y AXIS
    var budget_y_axis = d3.axisLeft(budget_yscale)
    d3.select('#budget').append('g').attr('id', 'budget_yaxis')

    d3.select('#budget_yaxis').append("g")
      .call(budget_y_axis)

    var budget_x_axis = d3.axisBottom(budget_xscale)
    d3.select('#budget').append('g').attr('id', 'budget_xaxis')
    
    d3.select('#budget_xaxis').append("g")
      .call(budget_x_axis)
      .attr("transform", "translate(0," + plot_dim + ")")

    var genre_y_axis = d3.axisLeft(genre_yscale)
    d3.select('#genre').append('g').attr('id', 'genre_yaxis')

    d3.select('#genre_yaxis').append("g")
      .call(genre_y_axis)

    var genre_x_axis = d3.axisBottom(genre_xscale)
    d3.select('#genre').append('g').attr('id', 'genre_xaxis')
    
    d3.select('#genre_xaxis').append("g")
      .call(genre_x_axis)
      .attr("transform", "translate(0," + plot_dim + ")")
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("transform", "rotate(90)")
      .style("text-anchor", "start");

    //PLOT LABELS
    d3.select('#budget').append('text').text('Movie Budget vs Frequency')
    .attr('transform', 'translate('+(plot_dim/2)+',-15)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '20px')
    
    d3.select('#budget').append('text').text('Number of Movies')
    .attr('transform', 'translate('+(-35)+','+(plot_dim/2)+') rotate(270)').attr('text-anchor', 'middle').attr('fill', '#000')
    
    d3.select('#budget').append('text').text('Budget in Millions')
    .attr('transform', 'translate('+(plot_dim/2)+','+(plot_dim+30)+')').attr('text-anchor', 'middle').attr('fill', '#000')

    d3.select('#genre').append('text').text('Movie Genre vs Frequency')
    .attr('transform', 'translate('+(plot_dim/2)+',-15)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '20px')
    
    d3.select('#genre').append('text').text('Number of Movies')
    .attr('transform', 'translate('+(-35)+','+(plot_dim/2)+') rotate(270)').attr('text-anchor', 'middle').attr('fill', '#000')
    
    d3.select('#genre').append('text').text('Genre')
    .attr('transform', 'translate('+(plot_dim/2)+','+(plot_dim+60)+')').attr('text-anchor', 'middle').attr('fill', '#000')
}