let date = new Date('Janurary 1, 2019');
let dates = [];

d3.csv('events.csv', function (data) {
  // console.log(data);

  for (let day = 0; day < 365; day++) {
    dates.push(new Date(date.getTime() + (day * 24 * 60 * 60 * 1000)));
  }
  console.log(dates.length);

  d3.select('#calendar').selectAll('.date')
    .data(dates)
    .enter()
    .append('div')
    .attr('class', 'date')
    .text(d => d.getDate());
});
