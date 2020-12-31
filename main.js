// To change for later years
const year = 2021;
const day_nums = 365; // 365 0r 366
const first_day_of_year = 5; // 0 for Sunday and so on

const event_colors = ['#005FFF', '#EB1937', '#F5A623', '#29A448', '#E1E1E2'];
const event_color_scale = {
  th: d3.scaleOrdinal().domain(['เลือกตั้ง ส.ส.', 'รัฐประหาร', 'ปฏิวัติ / กบฏ', 'ชุมนุม / ประท้วง', 'อื่น ๆ']).range(event_colors),
  en: d3.scaleOrdinal().domain(['Election', 'Coup d\'état', 'Rebellion', 'Demonstration', 'etc.']).range(event_colors)
};

let date = new Date('January 1, ' + year);
let dates = [];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const calendar = d3.select('#calendar');
for (let day = 0; day < first_day_of_year; day++) {
  calendar.append('div').attr('class', 'date-dummy');
}
const popup = d3.select('#popup');

let language = 'th'; //TODO from URL

d3.csv('events.csv', function (data) {
  let events_by_date = {};
  data
    .filter(d => d.color)
    .forEach(d => {
      let [current_date, current_month] = d.date_month.split('-');
      let event = {
        text: {
          th: d.event,
          en: d.event_en
        },
        color: event_colors[+d.color],
        date_year: `${current_date} ${current_month} ${+d.year - 543}`
      };
      if (events_by_date[d.date_month]) {
        events_by_date[d.date_month].push(event);
      } else {
        events_by_date[d.date_month] = [event];
      }
    });

  for (let day = 0; day < day_nums; day++) {
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
          .html(d => `<h2>${d.date_year}</h2><h3>${d.text[language]}</h3>`)
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
  .orient('horizontal');

change_languge(language);

function change_languge(lang) {
  language = lang;

  // change intro words
  popup.classed('shown', true);
  popup.select('.events').selectAll('*').remove();
  popup.select('.events').append('div')
    .attr('class', 'event')
    .style('background-color', '#EB1937')
    .style('color', 'white')
    .html(() => {
      switch (language) {
        case 'en': return '<h2>On this Day in Thailand\'s Democracy History</h2><h3>Thailand\'s Democracy Calendar<br>Click dates for details<br>or find download links below.</h3>';
        case 'th': default: return '<h2>วันนี้… มีอะไรเกิดขึ้นกับประชาธิปไตยไทยบ้าง</h2><h3>แจกปฏิทินประชาธิปไตยไทย<br>กดดูรายละเอียดตามวันได้</h3>'; //<br>หรือดาวน์โหลดไปใช้กันก็ได้</h3>';
      }
    });

  // change the legend
  legend_ordinal.scale(event_color_scale[language]);
  legend.select('.legend-ordinal')
    .call(legend_ordinal);

  // // change download text
  // d3.select(".download > .text").html(() => {
  //   switch (language) {
  //     case 'en': return 'Download <a target="_blank" href="images/month-all.png">2019 Democracy Calendar</a> or select monthly:';
  //     case 'th': default: return 'ดาวน์โหลดปฏิทินนี้<a target="_blank" href="images/month-all.png">ทั้งปี</a> หรือตามเดือน:';
  //   }
  // });

  return true;
}
