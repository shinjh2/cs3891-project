
function plot_it()  {
  
	var width = 2850, height = 2750, plot_dim = 350;
	d3.select('body').append('svg').attr('width', width).attr('height', height);
	var pad = 50;
	var actual_width = width-2*pad, actual_height = height-2*pad;


	var bar_x = 0, bar_width = actual_width/2, bar_height = actual_height/6;
	var bar1_y = 0;


    d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x)+','+(pad+bar1_y)+')').attr('id', 'budget').attr('width', plot_dim).attr('height', plot_dim)
    d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x + 400)+','+(pad+bar1_y)+')').attr('id', 'genre').attr('width', plot_dim).attr('height', plot_dim)
    d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x + 900)+','+(pad+bar1_y)+')').attr('id', 'company').attr('width', plot_dim).attr('height', plot_dim)
    d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x + 1300)+','+(pad+bar1_y)+')').attr('id', 'country').attr('width', plot_dim).attr('height', plot_dim)
    d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x)+','+(pad+bar1_y + 500)+')').attr('id', 'scatter').attr('width', plot_dim*2).attr('height', plot_dim*2)
    d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x + 1700)+','+(pad+bar1_y)+')').attr('id', 'time').attr('width', plot_dim*2.5).attr('height', plot_dim)


/// select attributes we're interested in
	movie_data.forEach(d => {
		d.budget = +d.budget;
        d.date = d.release_date;
  });

  for(i = movie_data.length - 1; i >= 0; i -= 1){
    if(movie_data[i].budget == 0 || movie_data[i].revenue == 0 || movie_data[i].vote_average == 0){
      movie_data.splice(i,1);
    }
  }
  
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
        .sort(function(a,b){return d3.descending(a.value,b.value);});
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

    var nested_countries = d3.nest()
        .key(function(d){return d;})
        .rollup(function(leaves){return leaves.length;})
        .entries(country_types)
        .sort(function(a,b){return d3.descending(a.value,b.value);});
               


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

    top20_moviebyCountry.sort(function(a,b){return d3.descending(a.value,b.value);});
    var countries = top20_moviebyCountry.map(d=>d.key);
    console.log(top20_moviebyCountry)



    //unrolled array of production companies
    var company_types = [];
    for(var i = 0; i < movie_data.length; i++){
        var j = 3;
        while(movie_data[i]['production_companies'].split('"')[j] != null){
            company_types.push(movie_data[i]['production_companies'].split('"')[j])
            j += 6;
        }
    }


    var nested_companies = d3.nest()
        .key(function(d){return d;})
        .rollup(function(leaves){return leaves.length;})
        .entries(company_types)
        .sort(function(a,b){return d3.descending(a.value,b.value);});
  


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
    top20_moviebyCompany.unshift({key:'Others',value:others_counts});
    companies = top20_moviebyCompany.map(d=>d.key);
    console.log(top20_moviebyCompany);

    var timeparser = d3.timeParse('%m/%d/%Y');
    var timeformat = d3.timeFormat('%Y')

    movie_data.forEach( d=> {d.date = timeparser(d.date);});

    var countryByYear = d3.nest()
        .key(function(d){ return timeformat(d.date);})
        .rollup(function(leaves){return leaves.length;})
        .entries(movie_data)
        .sort(function(a,b){return d3.ascending(a.key,b.key);});
    console.log(countryByYear);

    //Time scale
    var years = [];
    for(var i = 0; i < countryByYear.length; i++) {
        years.push(countryByYear[i]['key']);
    }
    var time_xscale = d3.scaleBand().domain(years).range([plot_dim*2.5, 0]).padding(.05);

    var max_year_count = d3.max(countryByYear, d => d['value']);
    var time_yscale = d3.scaleLinear().domain([0,max_year_count]).range([plot_dim, 0]);

    


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

    var max_country_count = d3.max(top20_moviebyCountry, d => d['value']);
    var country_yscale = d3.scaleLinear().domain([0,636]).range([plot_dim, 0]);

    var company_xscale = d3.scaleBand().domain(companies).range([plot_dim, 0]).padding(.05);

    var max_company_count = d3.max(top20_moviebyCompany, d => d['value']);
    var company_yscale = d3.scaleLinear().domain([0,319]).range([plot_dim, 0]);


    var min_circle_x = d3.min(movie_data,d => d.revenue);
    var max_circle_x = d3.max(movie_data,d => d.revenue);
    console.log(max_circle_x);
    var min_circle_y = d3.min(movie_data, d => d.vote_average);
    var max_circle_y = d3.max(movie_data, d => d.vote_average);
    var scatter_scale_x = d3.scaleLinear().domain([min_circle_x,max_circle_x]).range([0,plot_dim*2]);
    var scatter_scale_y = d3.scaleLinear().domain([min_circle_y,max_circle_y]).range([plot_dim*2, 0]);

    d3.select('#budget').selectAll('empty').data(nested_budget).enter().append('rect')
        .attr('x', d => budget_xscale(d['key']))
        .attr('y', function(d) { return budget_yscale(d['value']);})
        .attr('width', budget_xscale.bandwidth())
        .attr('height', function(d) { return plot_dim - budget_yscale(d['value']);})
        .attr('fill', "blue")

    d3.select('#company').selectAll('empty').data(top20_moviebyCompany).enter().append('rect')
        .attr('x', d => company_xscale(d['key']))
        .attr('y', function(d) { return company_yscale(d['value']);})
        .attr('width', company_xscale.bandwidth())
        .attr('height', function(d) { return plot_dim - company_yscale(d['value']);})
        .attr('fill', "blue")

        d3.select('#country').selectAll('empty').data(top20_moviebyCountry).enter().append('rect')
        .attr('x', d => country_xscale(d['key']))
        .attr('y', function(d) { return country_yscale(d['value']);})
        .attr('width', country_xscale.bandwidth())
        .attr('height', function(d) { return plot_dim - country_yscale(d['value']);})
        .attr('fill', "blue")

    d3.select('#genre').selectAll('empty').data(nested_genres).enter().append('rect')
        .attr('x', d => genre_xscale(d['key']))
        .attr('y', d => genre_yscale(d['value']))
        .attr('width', genre_xscale.bandwidth())
	      .attr('height', function(d) { return plot_dim - genre_yscale(d['value']);})
        .attr('fill', "blue")

    d3.select('#time').selectAll('empty').data(countryByYear).enter().append('rect')
        .attr('x', d => time_xscale(d['key']))
        .attr('y', d => time_yscale(d['value']))
        .attr('width', time_xscale.bandwidth())
        .attr('height', function(d) { return plot_dim - time_yscale(d['value']);})
        .attr('fill', "blue")


    d3.select('#scatter').selectAll('empty').data(movie_data).enter().append('circle')
        .attr('cx', d => scatter_scale_x(d.revenue))
        .attr('cy', d => scatter_scale_y(d.vote_average))
        .attr('r', 1.5)
        .attr('fill','blue')
        .attr('opacity',0.8)

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
    //COMPANY AXIS
    var company_y_axis = d3.axisLeft(company_yscale)
    d3.select('#company').append('g').attr('id', 'company_yaxis')

    d3.select('#company_yaxis').append("g")
      .call(company_y_axis)

    var company_x_axis = d3.axisBottom(company_xscale)
    d3.select('#company').append('g').attr('id', 'company_xaxis')
    
    d3.select('#company_xaxis').append("g")
      .call(company_x_axis)
      .attr("transform", "translate(0," + plot_dim + ")")
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("transform", "rotate(90)")
      .style("text-anchor", "start");
    //COUNTRY AXIS
    var country_y_axis = d3.axisLeft(country_yscale)
    d3.select('#country').append('g').attr('id', 'country_yaxis')

    d3.select('#country_yaxis').append("g")
      .call(country_y_axis)

    var country_x_axis = d3.axisBottom(country_xscale)
    d3.select('#country').append('g').attr('id', 'country_xaxis')
    
    d3.select('#country_xaxis').append("g")
      .call(country_x_axis)
      .attr("transform", "translate(0," + plot_dim + ")")
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("transform", "rotate(90)")
      .style("text-anchor", "start");
    //SCATTER AXIS
    var scatter_y_axis = d3.axisLeft(scatter_scale_y)
    d3.select('#scatter').append('g').attr('id', 'scatter_yaxis')

    d3.select('#scatter_yaxis').append("g")
      .call(scatter_y_axis)
  
      var scatter_x_axis = d3.axisBottom(scatter_scale_x)
      d3.select('#scatter').append('g').attr('id', 'scatter_xaxis')
      
      d3.select('#scatter_xaxis').append("g")
        .call(scatter_x_axis)
        .attr("transform", "translate(0," + plot_dim*2 + ")")
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    //TIME AXIS

    var time_y_axis = d3.axisLeft(time_yscale)
    d3.select('#time').append('g').attr('id', 'time_yaxis')

    d3.select('#time_yaxis').append("g")
      .call(time_y_axis)
  
      var time_x_axis = d3.axisBottom(time_xscale)
      d3.select('#time').append('g').attr('id', 'time_xaxis')
      
      d3.select('#time_xaxis').append("g")
        .call(time_x_axis)
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

    d3.select('#company').append('text').text('Production Company vs Frequency')
    .attr('transform', 'translate('+(plot_dim/2)+',-15)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '20px')
    
    d3.select('#company').append('text').text('Number of Movies')
    .attr('transform', 'translate('+(-35)+','+(plot_dim/2)+') rotate(270)').attr('text-anchor', 'middle').attr('fill', '#000')
    
    d3.select('#company').append('text').text('Production Company')
    .attr('transform', 'translate('+(plot_dim/2)+','+(plot_dim+170)+')').attr('text-anchor', 'middle').attr('fill', '#000')

    d3.select('#company').append('text').text('*"Others" includes 8k+ movies')
    .attr('transform', 'translate('+(plot_dim)+',-8)').attr('fill', '#000').attr('font-size', '9px')

    d3.select('#country').append('text').text('Production Country vs Frequency')
    .attr('transform', 'translate('+(plot_dim/2)+',-15)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '20px')
    
    d3.select('#country').append('text').text('Number of Movies')
    .attr('transform', 'translate('+(-35)+','+(plot_dim/2)+') rotate(270)').attr('text-anchor', 'middle').attr('fill', '#000')
    
    d3.select('#country').append('text').text('Production Country')
    .attr('transform', 'translate('+(plot_dim/2)+','+(plot_dim+90)+')').attr('text-anchor', 'middle').attr('fill', '#000')

    d3.select('#country').append('text').text('*"U.S." include 2.9k+ movies')
    .attr('transform', 'translate('+(plot_dim)+',-8)').attr('fill', '#000').attr('font-size', '9px')

    d3.select('#scatter').append('text').text('Revenue vs Rating')
    .attr('transform', 'translate('+(plot_dim)+',-15)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '20px')
    
    d3.select('#scatter').append('text').text('Rating')
    .attr('transform', 'translate('+(-35)+','+(plot_dim)+') rotate(270)').attr('text-anchor', 'middle').attr('fill', '#000')
    
    d3.select('#scatter').append('text').text('Revenue')
    .attr('transform', 'translate('+(plot_dim)+','+(plot_dim*2+90)+')').attr('text-anchor', 'middle').attr('fill', '#000')

    d3.select('#time').append('text').text('Year Produced vs Frequency')
    .attr('transform', 'translate('+(plot_dim*2.5/2)+',-15)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '20px')
    
    d3.select('#time').append('text').text('Number of Movies')
    .attr('transform', 'translate('+(-35)+','+(plot_dim/2)+') rotate(270)').attr('text-anchor', 'middle').attr('fill', '#000')
    
    d3.select('#time').append('text').text('Year Produced')
    .attr('transform', 'translate('+(plot_dim*2.5/2)+','+(plot_dim+90)+')').attr('text-anchor', 'middle').attr('fill', '#000')
}