/* globals ace */
let editor;

const previewFrame = document.getElementById('preview');
const dropTarget = document.getElementById('dropTarget');

const preview = (force) => {
  const input = document.getElementById('rst');
  const editorValue = editor.getValue();
  if (force || input.value !== editorValue) {
    document.getElementById('rst').value = editorValue;
    document.getElementById('preview_form').submit();
  }
};

const showDropTarget = () => {
  dropTarget.style.display = 'flex';
};
const hideDropTarget = () => {
  dropTarget.style.display = 'none';
};

const updateProgress = (percentage) => {
  document.getElementById('progress').value = `${percentage}`;
};

const fileQueue = [];
const uploadNext = () => {
  if (fileQueue.length) {
    document.getElementById('uploading').style.display = 'block';
    const file = fileQueue.shift();
    const statusText = document.getElementById('upload_text');
    let status = file.name;
    if (fileQueue.length) {
      status = `${status} (${fileQueue.length})`;
    }
    statusText.innerHTML = status;
    uploadFile(file);
  } else {
    document.getElementById('uploading').style.display = 'none';
  }
};


const addImage = (data) => {
  const session = editor.session;
  const text = `\n\n.. image:: ${data.name}`;

  session.insert({
    row: session.getLength(),
    column: 0
  }, text);
  preview();
};

const uploadFile = (file) => {
  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percentage = Math.round((e.loaded * 100) / e.total);
      updateProgress(percentage);
    }
  }, false);

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if ((xhr.status >= 200 && xhr.status <= 200) || xhr.status === 304) {
        uploadNext();
        if (xhr.responseText !== '') {
          const data = JSON.parse(xhr.responseText);
          // add image to rst
          addImage(data);
        }
      }
    }
  };

  const data = new FormData();
  data.append('file', file);
  xhr.open('POST', '/kodiak/upload/');
  xhr.send(data);
};


const addFile = (file) => {
  fileQueue.push(file);
  uploadNext();
};

const run = () => {
  ace.config.loadModule('ace/keybinding/vim', () => {
    const VimApi = ace.require('ace/keyboard/vim').CodeMirror.Vim;
    VimApi.defineEx('write', 'w', (cm) => {
      cm.ace.execCommand('save');
      preview(true);
    });
  });
  editor = ace.edit('ace_editor');
  editor.setTheme('ace/theme/tomorrow');
  editor.setOption('wrap', 80);
  editor.getSession().setMode('ace/mode/rst');
  editor.setKeyboardHandler('ace/keyboard/vim');

  window.setInterval(() => preview(), 5000);

  previewFrame.addEventListener('load', () => {
    const scale = (previewFrame.offsetWidth - 10) / window.theme_width;
    if (scale < 1) {
      previewFrame.contentDocument.body.style.transform = `scale(${scale})`;
      previewFrame.contentDocument.body.style.minWidth = `${window.theme_width}px`;
      previewFrame.contentDocument.body.style.transformOrigin = '0 0';
      document.getElementById('last_saved').innerHTML = previewFrame.contentDocument.getElementById('last_saved').value;
    }
  });

  document.body.addEventListener('dragover', () => {
    showDropTarget();
  });

  const preventDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  dropTarget.addEventListener('dragleave', (e) => {
    preventDefault(e);
    hideDropTarget();
  });

  dropTarget.addEventListener('drag', preventDefault);
  dropTarget.addEventListener('dragstart', preventDefault);
  dropTarget.addEventListener('dragend', preventDefault);
  dropTarget.addEventListener('dragover', preventDefault, true);
  dropTarget.addEventListener('dragenter', preventDefault);
  dropTarget.addEventListener('drop', (e) => {
    preventDefault(e);
    hideDropTarget();
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      addFile(file);
    }
  });

  // click handlers
  const publishBtn = document.getElementById('publish');
  publishBtn.addEventListener('click', () => {
    publishBtn.classList.add('is-loading');
    fetch('publish/', { credentials: 'same-origin' }).then(
      () => { publishBtn.classList.remove('is-loading'); }
    );
  });

  const publicBtn = document.getElementById('public');
  const limitedBtn = document.getElementById('limited');
  const privateBtn = document.getElementById('private');

  const accessField = document.getElementById('access');
  const accessHandler = (event) => {
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
