import Rx from 'rx';
import Cycle from '@cycle/core';
import { ul, li, makeDOMDriver } from '@cycle/dom';

const initialState = {
  items: [
    { id: 'one', text: 'one' },
    { id: 'two', text: 'two' },
    { id: 'three', text: 'three' },
    { id: 'four', text: 'four' },
  ]
};

function intents({ DOM }) {
  return {
    swapItems$: Rx.Observable.combineLatest(
      DOM.select('li').events('dragstart').map((ev) => {
        ev.dataTransfer.setData('text', ev.target.id);
        return ev.target.id;
      }),
      DOM.select('li').events('dragover').map((ev) => ev.target.id)
    )
  };
}

function model({ swapItems$ }) {
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
  return Rx.Observable.merge(swap$).scan((state, operation) => operation(state), initialState);
}

function view(state$) {
  return state$.startWith(initialState).map(
    ({ items }) => {
      return ul(
        items.map(item => li({ id: item.id, draggable: true }, item.text))
      );
    }
  );
}

function main({ DOM }) {
  return {
    DOM: view(model(intents({ DOM })))
  };
}

const drivers = {
  DOM: makeDOMDriver('#kodiak')
};

Cycle.run(main, drivers);
