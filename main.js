const event_colors = ['#005FFF', '#EB1937', '#F5A623', '#29A448', '#E1E1E2'];
const event_color_scale = d3.scaleOrdinal()
  .domain(['เลือกตั้ง ส.ส.', 'รัฐประหาร', 'ปฏิวัติ / กบฏ', 'ชุมนุม / ประท้วง', 'อื่น ๆ'])
  .range(event_colors);

let date = new Date('Janurary 1, 2019');
let dates = [];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const calendar = d3.select('#calendar');
const first_day_of_year = 2;
for (let day = 0; day < first_day_of_year; day++) {
  calendar.append('div').attr('class', 'date-dummy');
}

d3.csv('events.csv', function (data) {
  let events_by_date = {};
  data
    .filter(d => d.color)
    .forEach(d => {
      if (events_by_date[d.date_month]) {
        events_by_date[d.date_month].texts.push(d.event);
        events_by_date[d.date_month].colors.push(+d.color);
        events_by_date[d.date_month].years.push(+d.year);
      } else {
        events_by_date[d.date_month] = {
          texts: [d.event],
          colors: [+d.color],
          years: [+d.year]
        }
      }
    });
  console.log(events_by_date);

  for (let day = 0; day < 365; day++) {
    let new_date = new Date(date.getTime() + (day * 24 * 60 * 60 * 1000));
    let current_date = new_date.getDate();
    let current_month = months[new_date.getMonth()];

    if (current_date === 1) {
      for (let day = 0; day < 14; day++) {
        dates.push({
          date: '',
          dummy: true,
          month: false
        });
      }
      dates.push({
        date: current_month,
        dummy: true,
        month: true
      });
    }

    let event = events_by_date[current_date + '-' + current_month.substring(0, 3)];
    dates.push({
      date: current_date,
      colors: event ? event.colors.map(c => event_colors[c]) : ['#4A4A4A'], //neutral color unless there's an event
      texts: [],
      dummy: false
    });
  }

  calendar.selectAll('.date')
    .data(dates)
    .enter()
    .append('div')
    .attr('class', d => d.dummy ? (d.month ? 'month' : 'date-dummy') : 'date')
    .style('background-image', d => {
      if (d.dummy) {
        return 'unset';
      } else {
        let color0 = d.colors[0];
        let color1 = d.colors[(d.colors.length > 1) ? 1 : 0];
        return `linear-gradient(45deg, ${color0} 0%, ${color0} 50%, ${color1} 50%, ${color1} 100%`;
      }
    })
    .text(d => d.date);
});

// Legend
var legend = d3.select('svg#legend');
legend.append('g')
  .attr('class', 'legend-ordinal')
  .attr('transform', 'translate(20,20)');

let legend_ordinal = d3.legendColor()
  .shape('path', d3.symbol().type(d3.symbolCircle).size(50)())
  .shapePadding(5)
  .scale(event_color_scale);

legend.select('.legend-ordinal')
  .call(legend_ordinal);
