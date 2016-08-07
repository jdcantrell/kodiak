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
  document.getElementById('upload_progress').innerHTML = `${percentage}%`;
};

const fileQueue = [];
const uploadNext = () => {
  if (fileQueue.length) {
    const file = fileQueue.shift();
    const statusText = document.getElementById('upload_text');
    document.getElementById('upload_file').innerHTML = file.name;
    if (fileQueue.length) {
      statusText.innerHTML = `(${fileQueue.length} remaining)`;
    } else {
      statusText.innerHTML = '';
    }
    uploadFile(file);
  }
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
          const session = editor.session;
          session.insert({
            row: session.getLength(),
            column: 0
          }, `\n\n.. image:: ${data.name}`);
          preview();
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
    const scale = (previewFrame.offsetWidth - 10) / 820;
    if (scale < 1) {
      previewFrame.contentDocument.body.style.transform = `scale(${scale})`;
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

};

run();
