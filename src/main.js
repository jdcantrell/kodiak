const $ = (selector) => Array.prototype.slice.call(document.querySelectorAll(selector));

const on = (nodes, event, fn) => nodes.forEach((node) => node.addEventListener(event, fn));

const draggables = $('li[draggable]');

let id = 0;
draggables.forEach(el => { el.id = id; id += 1; });

let dragEl = null;

const dom = {
  next: (el) => {
    const n = el.nextSibling;
    if (n && n.nodeType !== 1) {
      return dom.next(n);
    }
    return n;
  },
  previous: (el) => {
    const n = el.previousSibling;
    if (n && n.nodeType !== 1) {
      return dom.previous(n);
    }
    return n;
  },
};


on(draggables, 'dragstart', (ev) => {
  ev.dataTransfer.setData('text/plain', ev.target.id);
  dragEl = ev.target;
});

let lastMoveEl = null;
on(draggables, 'dragover', (ev) => {
  if (ev.currentTarget !== dragEl && ev.currentTarget !== lastMoveEl) {
    const prevEl = dom.previous(ev.currentTarget);
    if (prevEl !== dragEl) {
      ev.currentTarget.parentNode.insertBefore(dragEl, ev.currentTarget);
    } else {
      const nextEl = dom.next(ev.currentTarget);
      if (nextEl) {
        ev.currentTarget.parentNode.insertBefore(dragEl, nextEl);
      } else {
        ev.currentTarget.parentNode.appendChild(dragEl);
      }
    }
    lastMoveEl = ev.currentTarget;
  }
  return 1;
});


on($('[contenteditable]'), 'click', (ev) => {
  const ce = ev.currentTarget.getAttribute('contentEditable');
  if (ce !== 'true') {
    ev.currentTarget.setAttribute('contentEditable', true);
  }
  return true;
});

