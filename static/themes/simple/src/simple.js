const imgs = [].slice.call(document.querySelectorAll('.document img'));

// create modal
const modal = document.createElement('div');
modal.innerHTML = '<div class="modalClose">&times;</div><div class="modalContent"><img id="modalImage"><div id="modalCaption" class="modalCaption"></div></div>';
modal.classList.add('modal', 'is-hidden');
document.body.append(modal);

const displayImage = (index) => {
  let idx = index;
  if (idx >= imgs.length) {
    idx = 0;
  } else if (idx < 0) {
    idx = imgs.length - 1;
  }

  const fullSrc = imgs[idx].dataset.fullSrc;
  document.getElementById('modalImage').src = fullSrc;
  const caption = imgs[idx].getAttribute('alt');
  if (caption) {
    document.getElementById('modalCaption').innerHTML = caption;
    document.getElementById('modalCaption').classList.remove('is-hidden');
  } else {
    document.getElementById('modalCaption').classList.add('is-hidden');
  }
  modal.classList.remove('is-hidden');
  modal.dataset.imgIdx = idx;
};

// set up modal handlers
document.body.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    modal.classList.add('is-hidden');
  }
  if (event.key === 'ArrowRight') {
    displayImage(parseInt(modal.dataset.imgIdx, 10) + 1);
  }
  if (event.key === 'ArrowLeft') {
    displayImage(parseInt(modal.dataset.imgIdx, 10) - 1);
  }
});

modal.childNodes[1].addEventListener('click', (event) => {
  event.stopPropagation();
  displayImage(parseInt(modal.dataset.imgIdx, 10) + 1);
});
modal.childNodes[1].addEventListener('touch', (event) => {
  event.stopPropagation();
  displayImage(parseInt(modal.dataset.imgIdx, 10) + 1);
});
modal.addEventListener('click', () => { modal.classList.add('is-hidden'); });
modal.addEventListener('touch', () => { modal.classList.add('is-hidden'); });

// set up image click handlers
const handleClick = (idx) => () => displayImage(idx);
imgs.forEach((img, idx) => { img.addEventListener('click', handleClick(idx)); });
imgs.forEach((img, idx) => { img.addEventListener('touch', handleClick(idx)); });
