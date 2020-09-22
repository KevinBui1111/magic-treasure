"use strict";

const CARD_COLOR = [0, 'red', 'green', 'orange'];
const CARD_SHAPE = [0, 'circle', 'triangle', 'square'];
const CARD_FILL = [0, 'stripe', 'open', 'solid'];
class Card {
  constructor(n, c, s, f) {
    [this.number, this.color, this.shape, this.fill] = [n, c, s, f];
  }

  toString() {
    return `${this.number} - ${CARD_COLOR[this.color]} - ${CARD_SHAPE[this.shape]} - ${CARD_FILL[this.fill]}`;
  }
}

$(document).ready(function () {
  ['circle', 'square', 'triangle'].forEach(e => {
    ['', '-s'].forEach(s => {
      if (e != 'circle') {
        let symbol_circle = $(`#circle-stripe${s}`);
        let symbol = symbol_circle.clone();
        symbol.attr('id', `${e}-stripe${s}`);
        let rect = symbol.find('rect');
        let mask = rect.attr('mask');
        rect.attr('mask', mask.replace('circle', e));
        symbol.insertBefore(symbol_circle);
      }
    });

    ['stripe', 'open'].forEach(fill => {
      if (e === 'circle' && fill === 'stripe') return;

      for (let i = 1; i <= 3; ++i) {
        let tri = $(`#card-circle-stripe-${i}`).clone();

        tri.attr("id", `card-${e}-${fill}-${i}`);
        tri.find('use').each(function () {
          let href = $(this).attr('href');
          $(this).attr('href', href.replace('circle-stripe', `${e}-${fill}`));
        });

        tri.appendTo($('#svg_define'));
      }
    });
  });

  generate_card();

  //create_card(2, 'orange', 'circle', 'stripe');
  new_game();

  $(".container").on('click', 'div', function () {
    $(this).toggleClass('selected');
  });

});

function show_hint() {
  $('.container > div').removeClass('selected');

  i_hint = ((i_hint || 0) + 1) % list_match.length;
  if (i_hint >= 0)
    list_match[i_hint].forEach(m => m.div.addClass('selected'));
}

function new_game() {
  $('.container').html('');
  let quan = document.getElementById('quantity').value;
  let i_match = document.getElementById('max_match').value;

  let num_match, ntry = 0;
  while (num_match != i_match) {
    ++ntry;
    shuffleArray(list_card);
    current_set = list_card.slice(0, quan);
    list_match = find_match(current_set);
    num_match = list_match.length;

    if (i_match < 0) break;
  }

  console.log(`try time: ${ntry}`);
  current_set.forEach(c => {
    create_card(c);
    //console.log(`${c}`);
  });
}
function create_card(c) {
  let [color, shape, fill] = [CARD_COLOR[c.color], CARD_SHAPE[c.shape], CARD_FILL[c.fill]];
  let fill_color = fill === 'open' ? 'none' : color;
  if (fill === 'solid') fill = 'open';

  let card = $('<svg></svg>').attr({
    fill: fill_color,
    stroke: color
  }).append(`<use href="#card-${shape}-${fill}-${c.number}" />`);

  let dom = $('<div></div>')
    .appendTo('.container')
    .append(card)
    ;
  //refesh svg
  dom.html(dom.html());
  c.div = dom;
}

let combine = (list, n) =>
  n === 0 ?
    [[]] :
    list.flatMap((e, i) =>
      combine(
        list.slice(i + 1),
        n - 1
      ).map(c => [e].concat(c))
    );

let list_card = [];
let current_set;
let list_match, i_hint;

function generate_card() {
  let arr3 = [1, 2, 3];
  arr3.forEach(n =>
    arr3.forEach(c =>
      arr3.forEach(s =>
        arr3.forEach(f =>
          list_card.push(new Card(n, c, s, f))
        )
      )
    )
  );
  shuffleArray(list_card);
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function test() {
  shuffleArray(list_card);
  let set8 = list_card.slice(0, 8);

  console.log("---- set 8 -----");
  set8.forEach(c => console.log(`${c}`));
  console.log("---- find match -----");

  find_match(set8);
}
function find_match(set_card) {
  let list_match = [];
  let list_set = combine(set_card, 3);

  //console.log('====== Show matches ========');
  list_set.forEach(set => {
    let res = check_match(set);
    if (res.match) {
      list_match.push(set);
      //console.log(res.case_match);
      //console.log(set.join('\n'));
      //console.log('==============');
    }
  });
  return list_match;
}
function check_match(set_card) {
  // case:
  // 1: 4 diff
  // 2: 3 diff
  // 3: 2 diff
  // 4: 1 diff
  let res_prop = [
    set_card.map(c => c.number).distinct().length
    , set_card.map(c => c.color).distinct().length
    , set_card.map(c => c.shape).distinct().length
    , set_card.map(c => c.fill).distinct().length
  ];
  //0 1 2 3 4
  //3,3,3,3
  //1,3,3,3  3,1,3,3  3,3,3,1
  //1,1,3,3  3,1,3,1  1,3,3,1
  //3,1,1,1  1,3,1,1  1,1,3,1
  let diff = res_prop.filter(r => r === 3).length;
  let same = res_prop.filter(r => r === 1).length;

  if ((diff === 4) ||
    (diff === 3 && same === 1) ||
    (diff === 2 && same === 2) ||
    (diff === 1 && same === 3)
  )
    return { match: true, case_match: same };

  return { match: false, case_match: 0 };
}

const distinct = (value, index, self) => self.indexOf(value) === index;
Array.prototype.distinct = function () { return this.filter(distinct); }
