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

	/* globals ace, upload_path */
	var editor = void 0;
	var useImages = false;

	var previewFrame = document.getElementById('preview');
	var dropTarget = document.getElementById('dropTarget');

	var preview = function preview(force) {
	  var input = document.getElementById('rst');
	  var editorValue = editor.getValue();
	  if (force || input.value !== editorValue) {
	    document.getElementById('rst').value = editorValue;
	    document.getElementById('preview_form').submit();
	  }
	};

	var showDropTarget = function showDropTarget() {
	  dropTarget.style.display = 'flex';
	};

	var hideDropTarget = function hideDropTarget() {
	  dropTarget.style.display = 'none';
	};

	var updateProgress = function updateProgress(percentage) {
	  document.getElementById('progress').value = '' + percentage;
	};

	var fileQueue = [];
	var uploadNext = function uploadNext() {
	  if (fileQueue.length) {
	    document.getElementById('uploading').style.display = 'block';
	    var file = fileQueue.shift();
	    var statusText = document.getElementById('upload_text');
	    var status = file.name;
	    if (fileQueue.length) {
	      status = status + ' (' + fileQueue.length + ')';
	    }
	    statusText.innerHTML = status;
	    uploadFile(file);
	  } else {
	    document.getElementById('uploading').style.display = 'none';
	  }
	};

	var addImage = function addImage(data) {
	  var session = editor.session;
	  var text = void 0;
	  if (!useImages) {
	    text = '.. image:: ' + data.name + '\n';
	  } else {
	    text = '   ' + data.name + '\n';
	  }

	  session.insert({
	    row: session.getLength(),
	    column: 0
	  }, text);
	  preview();
	};

	var uploadFile = function uploadFile(file) {
	  var xhr = new XMLHttpRequest();

	  xhr.upload.addEventListener('progress', function (e) {
	    if (e.lengthComputable) {
	      var percentage = Math.round(e.loaded * 100 / e.total);
	      updateProgress(percentage);
	    }
	  }, false);

	  xhr.onreadystatechange = function () {
	    if (xhr.readyState === 4) {
	      if (xhr.status >= 200 && xhr.status <= 200 || xhr.status === 304) {
	        if (xhr.responseText !== '') {
	          var _data = JSON.parse(xhr.responseText);
	          // add image to rst
	          addImage(_data);
	          uploadNext();
	        }
	      }
	    }
	  };

	  var data = new FormData();
	  data.append('file', file);
	  xhr.open('POST', upload_path);
	  xhr.send(data);
	};

	var addFile = function addFile(file) {
	  fileQueue.push(file);
	};

	var run = function run() {
	  ace.config.loadModule('ace/keybinding/vim', function () {
	    var VimApi = ace.require('ace/keyboard/vim').CodeMirror.Vim;
	    VimApi.defineEx('write', 'w', function (cm) {
	      cm.ace.execCommand('save');
	      preview(true);
	    });
	  });
	  editor = ace.edit('ace_editor');
	  editor.setTheme('ace/theme/tomorrow');
	  editor.setOption('wrap', 80);
	  editor.getSession().setMode('ace/mode/rst');
	  editor.setKeyboardHandler('ace/keyboard/vim');

	  window.setInterval(function () {
	    return preview();
	  }, 5000);

	  previewFrame.addEventListener('load', function () {
	    var scale = (previewFrame.offsetWidth - 20) / window.theme_width;
	    if (scale < 1) {
	      previewFrame.contentDocument.body.style.transform = 'scale(' + scale + ')';
	      previewFrame.contentDocument.body.style.minWidth = window.theme_width + 'px';
	      previewFrame.contentDocument.body.style.transformOrigin = '0 0';
	      document.getElementById('last_saved').innerHTML = previewFrame.contentDocument.getElementById('last_saved').value;
	    }
	  });

	  var preventDefault = function preventDefault(e) {
	    e.preventDefault();
	    e.stopPropagation();
	  };

	  document.body.addEventListener('dragover', function (event) {
	    showDropTarget();
	    preventDefault(event);
	  });

	  document.body.addEventListener('dragleave', function (e) {
	    hideDropTarget();
	    preventDefault(e);
	  });

	  document.body.addEventListener('drag', preventDefault);
	  document.addEventListener('dragstart', preventDefault);
	  document.addEventListener('dragend', preventDefault);
	  document.addEventListener('dragenter', preventDefault);
	  document.body.addEventListener('drop', function (e) {
	    preventDefault(e);
	    hideDropTarget();
	    var files = e.dataTransfer.files;
	    useImages = false;
	    editor.session.insert({ row: editor.session.getLength(), column: 0 }, '\n\n');
	    if (files.length > 1) {
	      editor.session.insert({ row: editor.session.getLength(), column: 0 }, '.. images::\n');
	      useImages = true;
	    }
	    for (var i = 0; i < files.length; i++) {
	      var file = files[i];
	      addFile(file);
	    }
	    if (fileQueue.length === files.length) {
	      uploadNext();
	    }
	  });

	  // click handlers
	  var publishBtn = document.getElementById('publish');
	  publishBtn.addEventListener('click', function () {
	    publishBtn.classList.add('is-loading');
	    fetch('publish/', { credentials: 'same-origin' }).then(function (response) {
	      return response.json();
	    }).then(function (json) {
	      publishBtn.classList.remove('is-loading');
	      document.getElementById('published').innerHTML = json.published_date;
	    });
	  });

	  var publicBtn = document.getElementById('public');
	  var limitedBtn = document.getElementById('limited');
	  var privateBtn = document.getElementById('private');

	  var accessField = document.getElementById('access');
	  var accessHandler = function accessHandler(event) {
	    accessField.value = event.target.id;
	    publicBtn.classList.remove('is-primary');
	    privateBtn.classList.remove('is-primary');
	    limitedBtn.classList.remove('is-primary');
	    event.target.classList.add('is-primary');
	    document.getElementById('preview_form').submit();
	  };

	  publicBtn.addEventListener('click', accessHandler);
	  limitedBtn.addEventListener('click', accessHandler);
	  privateBtn.addEventListener('click', accessHandler);
	};

	run();

/***/ }
/******/ ]);