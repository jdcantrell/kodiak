import Rx from 'rx';
import Cycle from '@cycle/core';
import { ul, li, makeDOMDriver } from '@cycle/dom';

const initialState = {
  ui: {
    selected: null,
  },
  items: [
    { id: 'one', text: 'one' },
    { id: 'two', text: 'two' },
    { id: 'three', text: 'three' },
    { id: 'four', text: 'four' },
  ]
};

const keymap = {
  move: {
    ArrowUp: -1,
    ArrowDown: 1,
  }
};

function intents({ DOM, Keypress }) {
  return {
    keypress$: Keypress.map(ev => {
      console.log(ev.key, ev);
      return ev.key;
    }),
    select$: DOM.select('li').events('click').map(ev => ev.target.id),
    swapItems$: Rx.Observable.combineLatest(
      DOM.select('li').events('dragstart').map((ev) => {
        ev.dataTransfer.setData('text', ev.target.id);
        return ev.target.id;
      }),
      DOM.select('li').events('dragover').map((ev) => ev.target.id)
    )
  };
}

function model({ select$, swapItems$, keypress$ }) {
  const swap$ = swapItems$.map((swapIds) => state => {
    const src = swapIds[0];
    const dest = swapIds[1];
    if (src !== dest) {
      const next = Object.assign({}, state);
      next.items = state.items.map((item) => {
        if (item.id === src) {
          return state.items.find((i) => i.id === dest);
        }
        if (item.id === dest) {
          return state.items.find((i) => i.id === src);
        }
        return item;
      });
      return next;
    }
    return state;
  });

  const $commandMode = keypress$.filter(key => key === 'Escape').map(() => state => Object.assign({}, state, { ui: { selected: null } }));
  const $moveItem = keypress$.map(key => keymap.move[key]).filter(moveDir => typeof moveDir !== 'undefined').map(moveDir => state => {
    if (state.ui.selected) {
      const idx = state.items.findIndex(item => item.id === state.ui.selected);
      const swapIdx = idx + moveDir;
      const next = Object.assign({}, state);
      if (typeof next.items[swapIdx] !== 'undefined') {
        const t = next.items[idx];
        next.items[idx] = next.items[swapIdx];
        next.items[swapIdx] = t;
        console.log(next.items);
        return next;
      }
    }
    return state;
  });

  const $s = select$.map(id => state => Object.assign({}, state, { ui: { selected: id } }));
  return Rx.Observable.merge(swap$, $s, $commandMode, $moveItem)
    .scan((state, operation) => operation(state), initialState);
}

function view(state$) {
  return state$.startWith(initialState).map(
    ({ items, ui }) => ul(
      items.map(item => {
        if (ui.selected === item.id) {
          return li('.selected', { id: item.id, draggable: true }, item.text);
        }
        return li({ id: item.id, draggable: true }, item.text);
      })
    )
  );
}

function main({ DOM, Keypress }) {
  return {
    DOM: view(model(intents({ DOM, Keypress })))
  };
}

const drivers = {
  DOM: makeDOMDriver('#kodiak'),
  Keypress: () => Rx.Observable.fromEvent(document, 'keypress')
};

Cycle.run(main, drivers);
