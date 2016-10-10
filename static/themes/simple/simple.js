/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	var imgs = [].slice.call(document.querySelectorAll('.document img'));

	// create modal
	var modal = document.createElement('div');
	modal.innerHTML = '<div class="modalClose">&times;</div><div class="modalContent"><img id="modalImage"><div id="modalCaption" class="modalCaption"></div></div>';
	modal.classList.add('modal', 'is-hidden');
	document.body.append(modal);

	var displayImage = function displayImage(index) {
	  var idx = index;
	  if (idx >= imgs.length) {
	    idx = 0;
	  } else if (idx < 0) {
	    idx = imgs.length - 1;
	  }

	  var fullSrc = imgs[idx].dataset.fullSrc;
	  document.getElementById('modalImage').src = fullSrc;
	  var caption = imgs[idx].getAttribute('alt');
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
	document.body.addEventListener('keydown', function (event) {
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

	modal.childNodes[1].addEventListener('click', function (event) {
	  event.stopPropagation();
	  displayImage(parseInt(modal.dataset.imgIdx, 10) + 1);
	});
	modal.childNodes[1].addEventListener('touch', function (event) {
	  event.stopPropagation();
	  displayImage(parseInt(modal.dataset.imgIdx, 10) + 1);
	});
	modal.addEventListener('click', function () {
	  modal.classList.add('is-hidden');
	});
	modal.addEventListener('touch', function () {
	  modal.classList.add('is-hidden');
	});

	// set up image click handlers
	var handleClick = function handleClick(idx) {
	  return function () {
	    return displayImage(idx);
	  };
	};
	imgs.forEach(function (img, idx) {
	  img.addEventListener('click', handleClick(idx));
	});
	imgs.forEach(function (img, idx) {
	  img.addEventListener('touch', handleClick(idx));
	});

/***/ }
/******/ ]);