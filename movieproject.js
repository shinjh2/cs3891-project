//GLOBALS
global_budget_intervals = []
global_genre_intervals = []
global_company_intervals = []
global_country_intervals = []
global_time_intervals = []
nonbudget_filtered_IDS = []
nongenre_filtered_IDS = []
noncompany_filtered_IDS = []
noncountry_filtered_IDS = []
nontime_filtered_IDS = []
top20_companies = []
top20_countries = []


function plot_it()  {
  
  var width = 2850, height = 2750, plot_dim = 200;
  d3.select('body').append('svg').attr('width', width).attr('height', height);
  var pad = 50;
  var actual_width = width-2*pad, actual_height = height-2*pad;


  var bar_x = 0, bar_width = actual_width/2, bar_height = actual_height/6;
  var bar1_y = 0;


    var budget_group = d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x)+','+(pad+bar1_y)+')').attr('id', 'budget').attr('width', plot_dim).attr('height', plot_dim)
    var genre_group = d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x + 250)+','+(pad+bar1_y)+')').attr('id', 'genre').attr('width', plot_dim).attr('height', plot_dim)
    var company_group = d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x + 500)+','+(pad+bar1_y)+')').attr('id', 'company').attr('width', plot_dim).attr('height', plot_dim)
    var country_group = d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x + 750)+','+ (pad+bar1_y)+')').attr('id', 'country').attr('width', plot_dim).attr('height', plot_dim)
    var scatter_group = d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x + 1025)+','+(pad+bar1_y+ 75)+')').attr('id', 'scatter').attr('width', plot_dim*2).attr('height', plot_dim*2)
    var rect_selection = scatter_group.append('rect')
    .attr('fill', 'None').attr('pointer-events', 'all').attr('width', plot_dim*2).attr('height', plot_dim*2)
    var time_group = d3.select('svg').append('g').attr('transform', 'translate('+(pad+bar_x)+','+(pad+bar1_y + 350)+')').attr('id', 'time').attr('width', plot_dim*4.7).attr('height', plot_dim)


/// select attributes we're interested in
  movie_data.forEach(d => {
    d.budget = +d.budget;
        d.date = d.release_date;
        d.vote_average = +d.vote_average;
        d.revenue = +d.revenue;
  });

//Filter movie data
  for(i = movie_data.length - 1; i >= 0; i -= 1){
    if(movie_data[i].budget == 0 || movie_data[i].revenue == 0 || movie_data[i].vote_average == 0 || movie_data[i].date == "" || movie_data[i].date == 0){
      movie_data.splice(i,1);
    }
  }
  console.log(movie_data)
nonbudget_filtered_IDS = movie_data.map(d => d.id);
nongenre_filtered_IDS = movie_data.map(d => d.id);
noncompany_filtered_IDS = movie_data.map(d => d.id);
noncountry_filtered_IDS = movie_data.map(d => d.id);
nontime_filtered_IDS = movie_data.map(d => d.id);
//-------------------------------------BUDGET-------------------------------------------------
//CREATE budget intervals
var num_of_bars = 20
var budget_intervals = []
max_val = 99000000
var slice = max_val / num_of_bars
for(let i = 0; i < num_of_bars; i++){
  let first = i*slice/1000000
  let second = (i+1)*slice/1000000
  let frounded =  Math.round(first * 10) / 10
  let srounded = Math.round(second * 10) / 10
  interval_string = frounded.toString() + " - " + srounded.toString()
  budget_intervals.push(interval_string)
}

//SCALE for budget
var budget_scale = d3.scaleQuantize()
.domain([0, 99000000])
.range(budget_intervals);

// NESTED budget array
var nested_budget = d3.nest()
.key(function(d){return budget_scale(d.budget);})
.rollup(function(leaves){return leaves.length;})
.entries(movie_data)

//MORE SCALES for budget
var budget_xscale = d3.scaleBand().domain(budget_intervals).range([0,plot_dim]).padding(.05);
var max_budget_count = d3.max(nested_budget, d => d['value']);
var budget_yscale = d3.scaleLinear().domain([0,max_budget_count]).range([plot_dim, 0]);

// AXIS for budget
var budget_y_axis = d3.axisLeft(budget_yscale)
d3.select('#budget').append('g').attr('id', 'budget_yaxis')

d3.select('#budget_yaxis').append("g")
  .call(budget_y_axis)

var budget_x_axis = d3.axisBottom(budget_xscale)
d3.select('#budget').append('g').attr('id', 'budget_xaxis')

d3.select('#budget_xaxis').append("g")
  .call(budget_x_axis)
  .attr("transform", "translate(0," + plot_dim + ")")
  .selectAll("text")
  .attr("y", 0)
  .attr("x", 9)
  .attr("transform", "rotate(90)")
  .style("text-anchor", "start");

generate_budget_plot(movie_data, plot_dim, {'xscale':budget_xscale,'yscale':budget_yscale}, {'xscale':genre_xscale,'yscale':genre_yscale}, {'xscale':company_xscale,'yscale':company_yscale}, {'xscale':country_xscale,'yscale':country_yscale}, {'xscale':time_xscale,'yscale':time_yscale}, {'xscale':scatter_xscale,'yscale':scatter_yscale}, "blue");
//-------------------------------------BUDGET END--------------------------------------------------
//-------------------------------------GENRE--------------------------------------------------
//UNROLLED array of genres
var genre_types = [];
for(var i = 0; i < movie_data.length; i++){
    var j = 5;
    while(movie_data[i]['genres'].split('"')[j] != null){
        genre_types.push(movie_data[i]['genres'].split('"')[j])
        j += 6;
    }
}

//NESTED array of genres with counts
var nested_genres = d3.nest()
    .key(function(d){return d;})
    .rollup(function(leaves){return leaves.length;})
    .entries(genre_types)
    .sort(function(a,b){return d3.descending(a.value,b.value);});
//SCALES for genre
var genre_names = [];
for(var i = 0; i < nested_genres.length; i++) {
    genre_names.push(nested_genres[i]['key']);
}
var genre_xscale = d3.scaleBand().domain(genre_names).range([plot_dim, 0]).padding(.05);
var max_genre_count = d3.max(nested_genres, d => d['value']);
var genre_yscale = d3.scaleLinear().domain([0,max_genre_count]).range([plot_dim, 0]);

//AXIS for genre
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

  generate_genre_plot(movie_data, plot_dim, {'xscale':budget_xscale,'yscale':budget_yscale}, {'xscale':genre_xscale,'yscale':genre_yscale}, {'xscale':company_xscale,'yscale':company_yscale}, {'xscale':country_xscale,'yscale':country_yscale}, {'xscale':time_xscale,'yscale':time_yscale}, {'xscale':scatter_xscale,'yscale':scatter_yscale}, "blue");
//-------------------------------------GENRE END--------------------------------------------------
//-------------------------------------COMPANY----------------------------------------------------
//UNROLLED array of production companies
var company_types = [];
for(var i = 0; i < movie_data.length; i++){
    var j = 3;
    while(movie_data[i]['production_companies'].split('"')[j] != null){
        company_types.push(movie_data[i]['production_companies'].split('"')[j])
        j += 6;
    }
}

//NESTED array of production companies
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
  //var top20_companies = []
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
  top20_moviebyCompany.unshift({key:'Others',value:others_counts/25});
  companies = top20_moviebyCompany.map(d=>d.key);

//SCALES for companies
var company_xscale = d3.scaleBand().domain(companies).range([plot_dim, 0]).padding(.05);
var max_company_count = d3.max(top20_moviebyCompany, d => d['value']); 
var company_yscale = d3.scaleLinear().domain([0,319]).range([plot_dim, 0]);

//AXIS for companies
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
generate_company_plot(movie_data, plot_dim, {'xscale':budget_xscale,'yscale':budget_yscale}, {'xscale':genre_xscale,'yscale':genre_yscale}, {'xscale':company_xscale,'yscale':company_yscale}, {'xscale':country_xscale,'yscale':country_yscale}, {'xscale':time_xscale,'yscale':time_yscale}, {'xscale':scatter_xscale,'yscale':scatter_yscale}, "blue");
//-------------------------------------COMPANY END----------------------------------------------------
//-------------------------------------COUNTRY----------------------------------------------------
//UNROLLED array of countries
var country_types = [];
for(var i = 0; i < movie_data.length; i++){
    var j = 7;
    while(movie_data[i]['production_countries'].split('"')[j] != null){
        country_types.push(movie_data[i]['production_countries'].split('"')[j])
        j += 8;
    }
}
//NESTED array of countries
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
//top20_moviebyCountry[0]['value'] = top20_moviebyCountry[0]['value']/14.5 ;

top20_moviebyCountry.sort(function(a,b){return d3.descending(a.value,b.value);});
var countries = top20_moviebyCountry.map(d=>d.key);

//SCALE for countries
var country_xscale = d3.scaleBand().domain(countries).range([plot_dim, 0]).padding(.05);
var max_country_count = d3.max(top20_moviebyCountry, d => d['value']);
var country_yscale = d3.scaleLinear().domain([0,636]).range([plot_dim, 0]);

//AXIS for countries
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

  generate_country_plot(movie_data, plot_dim, {'xscale':budget_xscale,'yscale':budget_yscale}, {'xscale':genre_xscale,'yscale':genre_yscale}, {'xscale':company_xscale,'yscale':company_yscale}, {'xscale':country_xscale,'yscale':country_yscale}, {'xscale':time_xscale,'yscale':time_yscale}, {'xscale':scatter_xscale,'yscale':scatter_yscale}, "blue");
//-------------------------------------COUNTRY END----------------------------------------------------
//-------------------------------------TIME-----------------------------------------------------------
var timeparser = d3.timeParse('%m/%d/%Y');
var timeformat = d3.timeFormat('%Y')

movie_data.forEach( d=> {d.date = timeparser(d.date);});

  //NESTED data
  var countryByYear = d3.nest()
        .key(function(d){ return timeformat(d.date);})
        .rollup(function(leaves){return leaves.length;})
        .entries(movie_data)
        .sort(function(a,b){return d3.descending(a.key,b.key);});
    

  //SCALES
  var years = [];
  for(var i = 0; i < countryByYear.length; i++) {
      years.push(countryByYear[i]['key']);
  }
  var time_xscale = d3.scaleBand().domain(years).range([plot_dim*4.7, 0]).padding(.05);
  var max_year_count = d3.max(countryByYear, d => d['value']);
  var time_yscale = d3.scaleLinear().domain([0,max_year_count]).range([plot_dim, 0]);

  //AXIS for time
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
      .attr('font-size', '9px')
      .attr("transform", "rotate(90)")
      .style("text-anchor", "start");

    generate_time_plot(movie_data, plot_dim, {'xscale':budget_xscale,'yscale':budget_yscale}, {'xscale':genre_xscale,'yscale':genre_yscale}, {'xscale':company_xscale,'yscale':company_yscale}, {'xscale':country_xscale,'yscale':country_yscale}, {'xscale':time_xscale,'yscale':time_yscale}, {'xscale':scatter_xscale,'yscale':scatter_yscale}, "blue");
//-------------------------------------TIME END--------------------------------------------------------
//-------------------------------------SCATTER---------------------------------------------------------
//SCALES for scatter
var min_circle_x = d3.min(movie_data,d => d.revenue);
var max_circle_x = d3.max(movie_data,d => d.revenue);
var min_circle_y = d3.min(movie_data, d => d.vote_average);
var max_circle_y = d3.max(movie_data, d => d.vote_average);
var scatter_xscale = d3.scaleLinear().domain([min_circle_x,max_circle_x]).range([0,plot_dim*2]).nice().clamp(true);
var scatter_yscale = d3.scaleLinear().domain([min_circle_y,max_circle_y]).range([plot_dim*2, 0]).nice().clamp(true);


//SCATTER AXIS
var scatter_y_axis = d3.axisLeft(scatter_yscale)
d3.select('#scatter').append('g').attr('id', 'scatter_yaxis')

d3.select('#scatter_yaxis').append("g")
  .call(scatter_y_axis)

var scatter_x_axis = d3.axisBottom(scatter_xscale)
d3.select('#scatter').append('g').attr('id', 'scatter_xaxis')
  
d3.select('#scatter_xaxis').append("g")
  .call(scatter_x_axis)
  .attr("transform", "translate(0," + plot_dim*2 + ")")
  .selectAll("text")
  .attr("y", 0)
  .attr("x", 9)
  .attr("transform", "rotate(90)")
  .style("text-anchor", "start");
generate_scatter_plot(movie_data, plot_dim, {'xscale':scatter_xscale,'yscale':scatter_yscale});
//-------------------------------------SCATTER END---------------------------------------------------------








//Zoom functionality on scatterplot
//SCALES for scatter
var min_circle_x = d3.min(movie_data,d => d.revenue);
var max_circle_x = d3.max(movie_data,d => d.revenue);
var min_circle_y = d3.min(movie_data, d => d.vote_average);
var max_circle_y = d3.max(movie_data, d => d.vote_average);
var scatter_scale_x = d3.scaleLinear().domain([min_circle_x,max_circle_x]).range([0,plot_dim*2]).nice().clamp(true);;
var scatter_scale_y = d3.scaleLinear().domain([min_circle_y,max_circle_y]).range([plot_dim*2, 0]).nice().clamp(true);;
mouse_interaction_axis(scatter_group.selectAll('circle'), {'xaxis':d3.select('#scatter_xaxis'),'yaxis':d3.select('#scatter_yaxis')}, {'x':scatter_scale_x,'y':scatter_scale_y}, rect_selection);
//Filter functionality on budget
click_interaction_budget(budget_group.selectAll('rect'), movie_data, {'xscale':budget_xscale,'yscale':budget_yscale}, {'xscale':genre_xscale,'yscale':genre_yscale}, {'xscale':company_xscale,'yscale':company_yscale}, {'xscale':country_xscale,'yscale':country_yscale}, {'xscale':time_xscale,'yscale':time_yscale}, {'xscale':scatter_xscale,'yscale':scatter_yscale}, plot_dim);
click_interaction_genre(genre_group.selectAll('rect'), movie_data, {'xscale':budget_xscale,'yscale':budget_yscale}, {'xscale':genre_xscale,'yscale':genre_yscale}, {'xscale':company_xscale,'yscale':company_yscale}, {'xscale':country_xscale,'yscale':country_yscale}, {'xscale':time_xscale,'yscale':time_yscale}, {'xscale':scatter_xscale,'yscale':scatter_yscale}, plot_dim);
click_interaction_company(company_group.selectAll('rect'), movie_data, {'xscale':budget_xscale,'yscale':budget_yscale}, {'xscale':genre_xscale,'yscale':genre_yscale}, {'xscale':company_xscale,'yscale':company_yscale}, {'xscale':country_xscale,'yscale':country_yscale}, {'xscale':time_xscale,'yscale':time_yscale}, {'xscale':scatter_xscale,'yscale':scatter_yscale}, plot_dim);
click_interaction_country(country_group.selectAll('rect'), movie_data, {'xscale':budget_xscale,'yscale':budget_yscale}, {'xscale':genre_xscale,'yscale':genre_yscale}, {'xscale':company_xscale,'yscale':company_yscale}, {'xscale':country_xscale,'yscale':country_yscale}, {'xscale':time_xscale,'yscale':time_yscale}, {'xscale':scatter_xscale,'yscale':scatter_yscale}, plot_dim);
click_interaction_time(time_group.selectAll('rect'), movie_data, {'xscale':budget_xscale,'yscale':budget_yscale}, {'xscale':genre_xscale,'yscale':genre_yscale}, {'xscale':company_xscale,'yscale':company_yscale}, {'xscale':country_xscale,'yscale':country_yscale}, {'xscale':time_xscale,'yscale':time_yscale}, {'xscale':scatter_xscale,'yscale':scatter_yscale}, plot_dim);
}

//PLOT GENERATORS
function generate_budget_plot(movie_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, bar_color)  {
  //CREATE budget intervals
  var num_of_bars = 20
  var budget_intervals = []
  max_val = 99000000
  var slice = max_val / num_of_bars
  for(let i = 0; i < num_of_bars; i++){
    let first = i*slice/1000000
    let second = (i+1)*slice/1000000
    let frounded =  Math.round(first * 10) / 10
    let srounded = Math.round(second * 10) / 10
    interval_string = frounded.toString() + " - " + srounded.toString()
    budget_intervals.push(interval_string)
  }

  //SCALE for budget
  var budget_scale = d3.scaleQuantize()
  .domain([0, 99000000])
  .range(budget_intervals);

  // NESTED budget array
  var nested_budget = d3.nest()
  .key(function(d){return budget_scale(d.budget);})
  .rollup(function(leaves){return leaves.length;})
  .entries(movie_data)

  //RECTANGLES
  d3.select('#budget').selectAll('empty').data(nested_budget).enter().append('rect')
        .attr('x', d => budget_scales.xscale(d['key']))
        .attr('y', function(d) { return budget_scales.yscale(d['value']);})
        .attr('width', budget_scales.xscale.bandwidth())
        .attr('height', function(d) { return plot_dim - budget_scales.yscale(d['value']);})
        .attr('fill', bar_color)

  //LABELS
  d3.select('#budget').append('text').text('Movie Budget vs Frequency')
    .attr('transform', 'translate('+(plot_dim/2)+',-25)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '15px')
    
  d3.select('#budget').append('text').text('Number of Movies')
    .attr('transform', 'translate('+(-35)+','+(plot_dim/2)+') rotate(270)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '13px')
    
  d3.select('#budget').append('text').text('Budget in Millions')
    .attr('transform', 'translate('+(plot_dim/2)+','+(plot_dim+75)+')').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '13px')

    click_interaction_budget(d3.select('#budget').selectAll('rect'), movie_data, {'xscale':budget_scales.xscale,'yscale':budget_scales.yscale}, {'xscale':genre_scales.xscale,'yscale':genre_scales.yscale}, {'xscale':company_scales.xscale,'yscale':company_scales.yscale}, {'xscale':country_scales.xscale,'yscale':country_scales.yscale}, {'xscale':time_scales.xscale,'yscale':time_scales.yscale}, {'xscale':scatter_scales.xscale,'yscale':scatter_scales.yscale}, plot_dim);
}

function generate_genre_plot(movie_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, bar_color)  {
  //UNROLLED array of genres
  var genre_types = [];
  for(var i = 0; i < movie_data.length; i++){
      var j = 5;
      while(movie_data[i]['genres'].split('"')[j] != null){
          genre_types.push(movie_data[i]['genres'].split('"')[j])
          j += 6;
      }
  }

  //NESTED array of genres with counts
  var nested_genres = d3.nest()
      .key(function(d){return d;})
      .rollup(function(leaves){return leaves.length;})
      .entries(genre_types)
      .sort(function(a,b){return d3.descending(a.value,b.value);});


  //RECTANGLES
  d3.select('#genre').selectAll('empty').data(nested_genres).enter().append('rect')
      .attr('x', d => genre_scales.xscale(d['key']))
      .attr('y', d => genre_scales.yscale(d['value']))
      .attr('width', genre_scales.xscale.bandwidth())
      .attr('height', function(d) { return plot_dim - genre_scales.yscale(d['value']);})
      .attr('fill', bar_color)


  //PLOT labels
  d3.select('#genre').append('text').text('Movie Genre vs Frequency')
  .attr('transform', 'translate('+(plot_dim/2)+',-25)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '15px')
  
  d3.select('#genre').append('text').text('Number of Movies')
  .attr('transform', 'translate('+(-35)+','+(plot_dim/2)+') rotate(270)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '13px')
  
  d3.select('#genre').append('text').text('Genre')
  .attr('transform', 'translate('+(plot_dim/2)+','+(plot_dim+85)+')').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '13px')

  click_interaction_genre(d3.select('#genre').selectAll('rect'), movie_data, {'xscale':budget_scales.xscale,'yscale':budget_scales.yscale}, {'xscale':genre_scales.xscale,'yscale':genre_scales.yscale}, {'xscale':company_scales.xscale,'yscale':company_scales.yscale}, {'xscale':country_scales.xscale,'yscale':country_scales.yscale}, {'xscale':time_scales.xscale,'yscale':time_scales.yscale}, {'xscale':scatter_scales.xscale,'yscale':scatter_scales.yscale}, plot_dim);
}

function generate_company_plot(movie_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, bar_color)  {
  //UNROLLED array of production companies
  var company_types = [];
  for(var i = 0; i < movie_data.length; i++){
      var j = 3;
      while(movie_data[i]['production_companies'].split('"')[j] != null){
          company_types.push(movie_data[i]['production_companies'].split('"')[j])
          j += 6;
      }
  }

  //NESTED array of production companies
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
    top20_moviebyCompany.unshift({key:'Others',value:others_counts/25});
    companies = top20_moviebyCompany.map(d=>d.key);


  //RECTANGLES
  d3.select('#company').selectAll('empty').data(top20_moviebyCompany).enter().append('rect')
        .attr('x', d => company_scales.xscale(d['key']))
        .attr('y', function(d) { return company_scales.yscale(d['value']);})
        .attr('width', company_scales.xscale.bandwidth())
        .attr('height', function(d) { return plot_dim - company_scales.yscale(d['value']);})
        .attr('fill', bar_color)

  //PLOT labels
  d3.select('#company').append('text').text('Company vs Frequency')
    .attr('transform', 'translate('+(plot_dim/2)+',-25)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '15px')
    
  d3.select('#company').append('text').text('Number of Movies')
    .attr('transform', 'translate('+(-35)+','+(plot_dim/2)+') rotate(270)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '13px')
    
  d3.select('#company').append('text').text('Company')
    .attr('transform', 'translate('+(plot_dim/2)+','+(plot_dim+170)+')').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '13px')

  d3.select('#company').append('text').text('*"Others" includes 8k+ movies.')
    .attr('transform', 'translate('+(plot_dim - 145)+',8)').attr('fill', '#000').attr('font-size', '9px')

  d3.select('#company').append('text').text('It\'s not proportional to the other bars.')
    .attr('transform', 'translate('+(plot_dim - 145)+',15)').attr('fill', '#000').attr('font-size', '9px')

    click_interaction_company(d3.select('#company').selectAll('rect'), movie_data, {'xscale':budget_scales.xscale,'yscale':budget_scales.yscale}, {'xscale':genre_scales.xscale,'yscale':genre_scales.yscale}, {'xscale':company_scales.xscale,'yscale':company_scales.yscale}, {'xscale':country_scales.xscale,'yscale':country_scales.yscale}, {'xscale':time_scales.xscale,'yscale':time_scales.yscale}, {'xscale':scatter_scales.xscale,'yscale':scatter_scales.yscale}, plot_dim);

}

function generate_country_plot(movie_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, bar_color)  {
  //UNROLLED array of countries
  var country_types = [];
  for(var i = 0; i < movie_data.length; i++){
      var j = 7;
      while(movie_data[i]['production_countries'].split('"')[j] != null){
          country_types.push(movie_data[i]['production_countries'].split('"')[j])
          j += 8;
      }
  }
  //NESTED array of countries
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
  top20_moviebyCountry[0].value = (top20_moviebyCountry[0].value)/4.5;


  top20_moviebyCountry.sort(function(a,b){return d3.descending(a.value,b.value);});
  var countries = top20_moviebyCountry.map(d=>d.key);

  console.log(top20_moviebyCountry)


  //RECTANGLES for countries
  d3.select('#country').selectAll('empty').data(top20_moviebyCountry).enter().append('rect')
        .attr('x', d => country_scales.xscale(d['key']))
        .attr('y', function(d) { return country_scales.yscale(d['value']);})
        .attr('width', country_scales.xscale.bandwidth())
        .attr('height', function(d) { return plot_dim - country_scales.yscale(d['value']);})
        .attr('fill', bar_color)

  //PLOT labels
  d3.select('#country').append('text').text('Production Country vs Frequency')
    .attr('transform', 'translate('+(plot_dim/2)+',-25)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '15px')
    
  d3.select('#country').append('text').text('Number of Movies')
    .attr('transform', 'translate('+(-35)+','+(plot_dim/2)+') rotate(270)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '13px')
    
  d3.select('#country').append('text').text('Production Country')
    .attr('transform', 'translate('+(plot_dim/2)+','+(plot_dim+90)+')').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '13px')

  d3.select('#country').append('text').text('*"U.S." include 2.9k+ movies.').attr('transform', 'translate('+(plot_dim - 145)+', 8)').attr('fill', '#000').attr('font-size', '9px')

  d3.select('#country').append('text').text('It\'s not proportional to the other bars.')
    .attr('transform', 'translate('+(plot_dim - 145)+',15)').attr('fill', '#000').attr('font-size', '9px')

  click_interaction_country(d3.select('#country').selectAll('rect'), movie_data, {'xscale':budget_scales.xscale,'yscale':budget_scales.yscale}, {'xscale':genre_scales.xscale,'yscale':genre_scales.yscale}, {'xscale':company_scales.xscale,'yscale':company_scales.yscale}, {'xscale':country_scales.xscale,'yscale':country_scales.yscale}, {'xscale':time_scales.xscale,'yscale':time_scales.yscale}, {'xscale':scatter_scales.xscale,'yscale':scatter_scales.yscale}, plot_dim);

    
}

function generate_time_plot(movie_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, bar_color) {
  var timeformat = d3.timeFormat('%Y')
  //NESTED data
  var countryByYear = d3.nest()
        .key(function(d){ return timeformat(d.date);})
        .rollup(function(leaves){return leaves.length;})
        .entries(movie_data)
        .sort(function(a,b){return d3.descending(a.key,b.key);});
    

  //RECTANGLES
  d3.select('#time').selectAll('empty').data(countryByYear).enter().append('rect')
        .attr('x', d => time_scales.xscale(d['key']))
        .attr('y', d => time_scales.yscale(d['value']))
        .attr('width', time_scales.xscale.bandwidth())
        .attr('height', function(d) { return plot_dim - time_scales.yscale(d['value']);})
        .attr('fill', bar_color)


  //PLOT labels
  d3.select('#time').append('text').text('Year Produced vs Frequency')
    .attr('transform', 'translate('+(plot_dim*2.5/2 - 30)+',-15)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '15px')
    
  d3.select('#time').append('text').text('Number of Movies')
    .attr('transform', 'translate('+(-35)+','+(plot_dim/2)+') rotate(270)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '13px')
    
  d3.select('#time').append('text').text('Year Produced')
    .attr('transform', 'translate('+(plot_dim*4.7/2)+','+(plot_dim+60)+')').attr('text-anchor', 'middle').attr('fill', '#000')

    click_interaction_time(d3.select('#time').selectAll('rect'), movie_data, {'xscale':budget_scales.xscale,'yscale':budget_scales.yscale}, {'xscale':genre_scales.xscale,'yscale':genre_scales.yscale}, {'xscale':company_scales.xscale,'yscale':company_scales.yscale}, {'xscale':country_scales.xscale,'yscale':country_scales.yscale}, {'xscale':time_scales.xscale,'yscale':time_scales.yscale}, {'xscale':scatter_scales.xscale,'yscale':scatter_scales.yscale}, plot_dim);
}

function generate_scatter_plot(movie_data, plot_dim, scales){

  var element = document.getElementById("scatter_dots");
  if(element != null){
    element.parentNode.removeChild(element);
  }

  //DOTS for scatter
    d3.select('#scatter').append('g').attr('id', 'scatter_dots')

    d3.select('#scatter_dots').selectAll('empty').data(movie_data).enter().append('circle')
    .attr('cx', d => scales.xscale(d.revenue))
    .attr('cy', d => scales.yscale(d.vote_average))
    .attr('r', 1.5)
    .attr('fill','blue')
    .attr('opacity',0.8)


  //PLOT LABELS
  d3.select('#scatter').append('text').text('Revenue vs Rating')
  .attr('transform', 'translate('+(plot_dim)+',-25)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '15px')
  
  d3.select('#scatter').append('text').text('Rating')
  .attr('transform', 'translate('+(-35)+','+(plot_dim)+') rotate(270)').attr('text-anchor', 'middle').attr('fill', '#000')
  
  d3.select('#scatter').append('text').text('Revenue')
  .attr('transform', 'translate('+(plot_dim)+','+(plot_dim*2+90)+')').attr('text-anchor', 'middle').attr('fill', '#000')
}

//INTERACTIONS
function mouse_interaction_axis(all_circles, axis_group, scales, rect_elem)  {
  rect_elem.on('wheel', function(d)  {
    d3.event.preventDefault();
    var delta_y = d3.event.deltaY;
    var mouse_pos = d3.mouse(this);

    var start_data = {}, end_data = {};
    start_data.x = scales.x.invert(mouse_pos[0]);
    end_data.x = scales.x.invert(mouse_pos[0]-delta_y);
    start_data.y = scales.y.invert(mouse_pos[1]);
    end_data.y = scales.y.invert(mouse_pos[1]+delta_y);

    var previous_x_domain = scales.x.domain(), previous_y_domain = scales.y.domain();
    var mouse_alpha_x = (start_data.x-previous_x_domain[0])/(previous_x_domain[1]-previous_x_domain[0]);
    var mouse_alpha_y = (start_data.y-previous_y_domain[0])/(previous_y_domain[1]-previous_y_domain[0]);

    scales.x.domain([previous_x_domain[0], previous_x_domain[1] + (1-mouse_alpha_x)*(end_data.x-start_data.x)]);
    scales.y.domain([previous_y_domain[0] - mouse_alpha_y*(end_data.y-start_data.y), previous_y_domain[1] + (1-mouse_alpha_y)*(end_data.y-start_data.y)]);

    all_circles.attr('cx', d => scales.x(d.revenue))
    all_circles.attr('cy', d => scales.y(d.vote_average))
    axis_group.xaxis.call(d3.axisBottom(scales.x))
    axis_group.yaxis.call(d3.axisLeft(scales.y));
  });
}

function click_interaction_budget(all_rectangles, movie_data, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, plot_dim)  {
  all_rectangles.on('click', function(d)  {
    d3.select(this).attr('fill', 'orange')
    interval = d.key;
    var res = interval.split("-");
    var interval_obj = {low: res[0], high: res[1]};
    var found = false
    for(let int of global_budget_intervals){
      if(interval_obj.low == int.low && interval_obj.high == int.high) found = true;
    }
    if(!found){
      global_budget_intervals.push(interval_obj);
    }
    filtered_data = []
    for(let i = 0; i < global_budget_intervals.length; i++){
      bottom_interval = Number(global_budget_intervals[i].low) *1000000;
      top_interval = Number(global_budget_intervals[i].high) * 1000000;
      //Filter movie data
      for(let j = movie_data.length - 1; j >= 0; j--){
        if(movie_data[j].budget <= top_interval && movie_data[j].budget >= bottom_interval && nonbudget_filtered_IDS.includes(movie_data[j].id)){
          filtered_data.push(movie_data[j]);
        }
      }
    }

  nongenre_filtered_IDS = filtered_data.map(d => d.id);
  noncompany_filtered_IDS = filtered_data.map(d => d.id);
  noncountry_filtered_IDS = filtered_data.map(d => d.id);
  nontime_filtered_IDS = filtered_data.map(d => d.id);

  generate_genre_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "orange")
  generate_company_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "orange")
  generate_country_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "orange")
  generate_time_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "orange")
  generate_scatter_plot(filtered_data, plot_dim, scatter_scales)
  });
}

function click_interaction_genre(all_rectangles, movie_data, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, plot_dim)  {
  all_rectangles.on('click', function(d)  {
    d3.select(this).attr('fill', 'red')
    interval = d.key;
    var found = false
    for(let int of global_genre_intervals){
      if(interval == int) found = true;
    }
    if(!found){
      global_genre_intervals.push(interval);
    }
    filtered_data = []
    filtered_IDS = [];
    for(let i = 0; i < global_genre_intervals.length; i++){
      //Filter movie data
      for(let j = movie_data.length - 1; j >= 0; j--){
        var z = 5;
        genre_types = [];
        while(movie_data[j]['genres'].split('"')[z] != null){
            genre_types.push(movie_data[j]['genres'].split('"')[z])
            z += 6;
        }
        for(let genre of genre_types){
          if(genre == global_genre_intervals[i] && nongenre_filtered_IDS.includes(movie_data[j].id) && !filtered_IDS.includes(movie_data[j].id)){
            filtered_data.push(movie_data[j]);
            filtered_IDS.push(movie_data[j].id);
          }
        }
      }
    }
  nonbudget_filtered_IDS = filtered_data.map(d => d.id);
  noncompany_filtered_IDS = filtered_data.map(d => d.id);
  noncountry_filtered_IDS = filtered_data.map(d => d.id);
  nontime_filtered_IDS = filtered_data.map(d => d.id);

  generate_budget_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "red")
  generate_company_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "red")
  generate_country_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "red")
  generate_time_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "red")
  generate_scatter_plot(filtered_data, plot_dim, scatter_scales)
  });
}


function click_interaction_company(all_rectangles, movie_data, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, plot_dim)  {
  all_rectangles.on('click', function(d)  {
    d3.select(this).attr('fill', 'green')
    interval = d.key;
    var found = false
    for(let int of global_company_intervals){
      if(interval == int) found = true;
    }
    if(!found){
      global_company_intervals.push(interval);
    }
    filtered_data = []
    filtered_IDS = [];
    for(let i = 0; i < global_company_intervals.length; i++){
      //Filter movie data
      for(let j = movie_data.length - 1; j >= 0; j--){
        var z = 3;
        company_types = [];
        while(movie_data[j]['production_companies'].split('"')[z] != null){
          company_types.push(movie_data[j]['production_companies'].split('"')[z])
          z += 6;
          }
        for(let company of company_types){
          if(company == global_company_intervals[i] || (!top20_companies.includes(company) && global_company_intervals.includes('Others'))){
            if (noncompany_filtered_IDS.includes(movie_data[j].id) && !filtered_IDS.includes(movie_data[j].id)){
              filtered_data.push(movie_data[j]);
              filtered_IDS.push(movie_data[j].id);
            }
          }
        }
      }
    }
  nonbudget_filtered_IDS = filtered_data.map(d => d.id);
  nongenre_filtered_IDS = filtered_data.map(d => d.id);
  noncountry_filtered_IDS = filtered_data.map(d => d.id);
  nontime_filtered_IDS = filtered_data.map(d => d.id);

  generate_budget_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "green")
  generate_genre_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "green")
  generate_country_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "green")
  generate_time_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "green")
  generate_scatter_plot(filtered_data, plot_dim, scatter_scales)
  });
}

function click_interaction_country(all_rectangles, movie_data, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, plot_dim)  {
  all_rectangles.on('click', function(d)  {
    d3.select(this).attr('fill', 'purple')
    interval = d.key;
    var found = false
    for(let int of global_country_intervals){
      if(interval == int) found = true;
    }
    if(!found){
      global_country_intervals.push(interval);
    }
    filtered_data = []
    filtered_IDS = [];
    for(let i = 0; i < global_country_intervals.length; i++){
      //Filter movie data
      for(let j = movie_data.length - 1; j >= 0; j--){
        var z = 7;
        country_types = [];
        while(movie_data[j]['production_countries'].split('"')[z] != null){
          country_types.push(movie_data[j]['production_countries'].split('"')[z])
          z += 8;
        }
        for(let country of country_types){
          if(country == global_country_intervals[i] || (!top20_countries.includes(country) && global_country_intervals.includes('Others'))){
            if(noncountry_filtered_IDS.includes(movie_data[j].id) && !filtered_IDS.includes(movie_data[j].id)){
              filtered_data.push(movie_data[j]);
              filtered_IDS.push(movie_data[j].id);
            }
          }
        }
      }
    }
    console.log(filtered_data);
  nonbudget_filtered_IDS = filtered_data.map(d => d.id);
  nongenre_filtered_IDS = filtered_data.map(d => d.id);
  noncompany_filtered_IDS = filtered_data.map(d => d.id);
  nontime_filtered_IDS = filtered_data.map(d => d.id);

  generate_budget_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "purple")
  generate_genre_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "purple")
  generate_company_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "purple")
  generate_time_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "purple")
  generate_scatter_plot(filtered_data, plot_dim, scatter_scales)
  });
}
function click_interaction_time(all_rectangles, movie_data, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, plot_dim)  {
  all_rectangles.on('click', function(d)  {
    d3.select(this).attr('fill', 'yellow')
    interval = d.key;
    var found = false
    for(let int of global_time_intervals){
      if(interval == int) found = true;
    }
    if(!found){
      global_time_intervals.push(interval);
    }
    console.log(global_time_intervals);
    filtered_data = []
    var timeformat = d3.timeFormat('%Y');
    for(let i = 0; i < global_time_intervals.length; i++){
      //Filter movie data
      for(let j = movie_data.length - 1; j >= 0; j--){
          if(timeformat(movie_data[j].date) == global_time_intervals[i] && nontime_filtered_IDS.includes(movie_data[j].id)){
            filtered_data.push(movie_data[j]);
          }
      }
    }
    console.log(filtered_data);
  nonbudget_filtered_IDS = filtered_data.map(d => d.id);
  nongenre_filtered_IDS = filtered_data.map(d => d.id);
  noncompany_filtered_IDS = filtered_data.map(d => d.id);
  noncountry_filtered_IDS = filtered_data.map(d => d.id);

  generate_budget_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "yellow")
  generate_genre_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "yellow")
  generate_company_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "yellow")
  generate_country_plot(filtered_data, plot_dim, budget_scales, genre_scales, company_scales, country_scales, time_scales, scatter_scales, "yellow")
  generate_scatter_plot(filtered_data, plot_dim, scatter_scales)
  });
}