function create_dom_element(element_name)  {
	return document.createElementNS('http://www.w3.org/2000/svg', element_name);
}

function get_single_element_by_name(element_name)  {
	return document.getElementsByTagName(element_name)[0];
}

function plot_it()  {

	var width = 1700, height = 1500;
	var svg_element = get_single_element_by_name('svg');
	d3.select('body').append('svg').attr('width', width).attr('height', height);
	var pad = 50;
	var actual_width = width-2*pad, actual_height = height-2*pad;

	/// arrange layout for 5 filters's bar plot
	var bar_x = 0, bar_width = actual_width/2, bar_height = actual_height/6; // all the 5 bar plots on the left have the same height and width
	var bar1_y = 0; // country-count bar plot
	var bar2_y = bar_height+2*pad; // date-count bar plot
	var bar3_y = bar2_y+2*pad; // budget-count bar plot
	var bar4_y = bar3_y+2*pad; // revenue-count bar plot
	var bar5_y = bar4_y+2*pad; // company-count bar plot
	var scatter_x = bar_width + 3*pad, scatter_y = 0; //rate-genres scatter plot

	d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x)+','+(pad+bar1_y)+')').attr('id', 'country')
	d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x)+','+(pad+bar2_y)+')').attr('id', 'year')
	d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x)+','+(pad+bar3_y)+')').attr('id', 'budget')
	d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x)+','+(pad+bar4_y)+')').attr('id', 'revenue')
	d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x)+','+(pad+bar5_y)+')').attr('id', 'company')
	d3.select('svg').append('g').attr('transform', 'translate('+(pad+scatter_x)+','+(pad+scatter_y)+')').attr('id', 'rate-genres')


	var bar1_scale_x = d3.scaleBand().domain(country).range(0,bar_width) // 71 different countries; build a list of contry here
	var bar2_scale_x = d3.scaleBand().domain(year).range(0,bar_width) // 91 differenet years
	var bar3_scale_x = d3.scaleBand().domain(budget).range(0,bar_width) // 31 different budgest
	var bar4_scale_x = d3.scaleBand().domain(revenue).range(0,bar_width) // 111 different revenues
	var bar5_scale_x = d3.scaleBand().domain(company).range(0,bar_width) // need to figure out later
	var scatter_scale_x = d3.scaleBand().domain(genres).range(0,scatter_width) // need to figure out later
	var scatter_scale_y = d3.scaleLinear().domain(rate).range(0,scatter_height)

/// select attributes we're interested in
	movie_data.forEach(d => {
		d.id = +d.id,
		d.title = d.title,
		d.date = d.date,
		d.year = d.date.split('-')[0],
		d.genres = d.genres,
		d.budget = +Math.floor(d.budget/Math.pow(10,7)) // divide budget into different range
		d.revenue = +Math.floor(d.revenue/Math.pow(10,7))
		d.country = d.country.split(/[,:}]+/)[3], // a list of multiple country for the movie, don't know how to deal with it. here just take the first country.
		d.company = d.company, // a list of multiple company for the movie
		d.rate = +d.rate		
	});
	//console.log(movie_data)


/// data for the first 5 filters's plot
	var nest = d3.nest()
		.key(function(d){return d.country;})
		.key(function(d){return d.year;}).sortKeys(d3.ascending)
		.key(function(d){return d.budget;}).sortKeys(d3.ascending)
		.key(function(d){return d.revenue;}).sortKeys(d3.ascending)
		.key(function(d){return d.company;})
		.rollup(function(leaves){return leaves.length;}) 
		// the num of movie for each combination of keys(country,year,budget,revenue,company) are saved as value for each key.
		.entries(movie_data)

	console.log(nest)


// each file might have multiple country, I just take the 1st country. we should solve this problem later.
	var movieByCountry = d3.nest()
		.key(function(d){ return d.country;})
		.rollup(function(leaves){return leaves.length;})
		.entries(movie_data);
	console.log(movieByCountry); // 71 different countries in total. the num of movies in each country are saved as value for each key

	var countryByYear = d3.nest()
		.key(function(d){ return d.year;})
		.rollup(function(leaves){return leaves.length;})
		.entries(movie_data);
	console.log(countryByYear); // 91 different years in total

	var movieByBudget = d3.nest()
		.key(function(d){ return d.budget;})
		.rollup(function(leaves){return leaves.length;})
		.entries(movie_data);
	console.log(movieByBudget); // 31 different budgets (divided by 10^7, and take Math.floor())

	var movieByRevenue = d3.nest()
		.key(function(d){ return d.revenue;})
		.rollup(function(leaves){return leaves.length;})
		.entries(movie_data);
	console.log(movieByRevenue); // 111 different revenues (divided by 10^7, and take Math.floor())


// problem: each film might have multiple genres, don't know how to extract all different genres from dataset
	var movieByGenres = d3.nest()
		.key(function(d){ return d.genres;})
		.rollup(function(leaves){return leaves.length;})
		.entries(movie_data);
	console.log(movieByGenres); 

// problem: same as above, each film might have multiple companies, we need to count +1 for all of these companies
	var countryByCompany = d3.nest()
		.key(function(d){ return d.company;})
		.rollup(function(leaves){return leaves.length;})
		.entries(movie_data);
	console.log(countryByCompany);


//// the final visualization of rate-genres based on all the previous filters user choose
	var final_scatter = d3.nest()
		.key(function(d){ return d.rate;})
		.key(function(d){return d.genres;})
		.rollup(function(leaves){return leaves.length;})
		.entries(nest);

















}