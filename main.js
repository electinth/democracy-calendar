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
const popup = d3.select('#popup');

d3.csv('events.csv', function (data) {
  let events_by_date = {};
  data
    .filter(d => d.color)
    .forEach(d => {
      let [current_date, current_month] = d.date_month.split('-');
      let event = {
        text: d.event,
        color: event_colors[+d.color],
        date_year: `${current_date} ${current_month} ${+d.year}`
      };
      if (events_by_date[d.date_month]) {
        events_by_date[d.date_month].push(event);
      } else {
        events_by_date[d.date_month] = [event];
      }
    });

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

    dates.push({
      date: current_date,
      events: events_by_date[current_date + '-' + current_month.substring(0, 3)],
      dummy: false
    });
  }

  calendar.selectAll('.date')
    .data(dates)
    .enter()
    .append('div')
    .text(d => d.date)
    .attr('class', d => (d.dummy ? (d.month ? 'month' : 'date-dummy') : 'date') + ((d.events && d.events.length > 0) ? ' clickable' : ''))
    .style('background-image', d => {
      if (d.dummy) {
        return 'unset';
      } else {
        //TODO only unique colors and sorted
        if (d.events && d.events.length >= 2) {
          let color0 = d.events[0].color;
          let color1 = d.events[1].color;
          return `linear-gradient(45deg, ${color0} 0%, ${color0} 50%, ${color1} 50%, ${color1} 100%`;
        } else {
          let color0 = (d.events && d.events.length > 0) ? d.events[0].color : '#4A4A4A';
          return `linear-gradient(45deg, ${color0} 0%, ${color0} 100%`;
        }
      }
    })
    .on('click', d => {
      if (d.events && d.events.length > 0) { // special date with events
        popup.classed('shown', true);
        popup.select('.events').selectAll('*').remove();
        popup.select('.events').selectAll('.event')
          .data(d.events)
          .enter()
          .append('div')
          .attr('class', 'event')
          .style('background-color', d => d.color)
          .style('color', d => (d.color === '#E1E1E2') ? 'black' : 'white')
          .html(d => `<h2>${d.date_year}</h2><h3>${d.text}</h3>`)
      }
    });

  popup.on('click', () => {
    if (popup.classed('shown')) { // popup already shown (to toggle out)
      popup.classed('shown', false);
    }
  });
  popup.select('.events').on('click', () => d3.event.stopPropagation());
});

// Legend
var legend = d3.select('svg#legend');
legend.append('g')
  .attr('class', 'legend-ordinal')
  .attr('transform', 'translate(20,20)');

let legend_ordinal = d3.legendColor()
  .shape('path', d3.symbol().type(d3.symbolCircle).size(50)())
  .shapePadding(52)
  .orient('horizontal')
  .scale(event_color_scale);

legend.select('.legend-ordinal')
  .call(legend_ordinal);
