/* globals ace, upload_path */
let editor;
let useImages = false;

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
    if (fileQueue.length > 1) {
      status = `${status} (${fileQueue.length + 1})`;
    }
    statusText.innerHTML = status;
    uploadFile(file);
  } else {
    document.getElementById('uploading').style.display = 'none';
  }
};


const addImage = (data) => {
  const session = editor.session;
  let text;
  if (!useImages) {
    text = `.. image:: ${data.name}\n`;
  } else {
    text = `   ${data.name}\n`;
  }

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
        if (xhr.responseText !== '') {
          const data = JSON.parse(xhr.responseText);
          // add image to rst
          addImage(data);
          uploadNext();
        }
      }
    }
  };

  const data = new FormData();
  data.append('file', file);
  xhr.open('POST', upload_path);
  xhr.send(data);
};


const addFile = (file) => {
  fileQueue.push(file);
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
    const scale = (previewFrame.offsetWidth - 20) / window.theme_width;
    if (scale < 1) {
      previewFrame.contentDocument.body.style.transform = `scale(${scale})`;
      previewFrame.contentDocument.body.style.minWidth = `${window.theme_width}px`;
      previewFrame.contentDocument.body.style.transformOrigin = '0 0';
      document.getElementById('last_saved').innerHTML = previewFrame.contentDocument.getElementById('last_saved').value;
    }
  });

  const preventDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  document.body.addEventListener('dragover', (event) => {
    showDropTarget();
    preventDefault(event);
  });


  document.body.addEventListener('dragleave', (e) => {
    hideDropTarget();
    preventDefault(e);
  });

  document.body.addEventListener('drag', preventDefault);
  document.addEventListener('dragstart', preventDefault);
  document.addEventListener('dragend', preventDefault);
  document.addEventListener('dragenter', preventDefault);
  document.body.addEventListener('drop', (e) => {
    preventDefault(e);
    hideDropTarget();
    const files = e.dataTransfer.files;
    useImages = false;
    editor.session.insert({ row: editor.session.getLength(), column: 0 }, '\n\n');
    if (files.length > 1) {
      editor.session.insert({ row: editor.session.getLength(), column: 0 }, '.. images::\n');
      useImages = true;
    }
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      addFile(file);
    }
    if (fileQueue.length === files.length) {
      uploadNext();
    }
  });

  // click handlers
  const publishBtn = document.getElementById('publish');
  publishBtn.addEventListener('click', () => {
    publishBtn.classList.add('is-loading');
    fetch('publish/', { credentials: 'same-origin' })
      .then((response) => response.json())
      .then((json) => {
        publishBtn.classList.remove('is-loading');
        document.getElementById('published').innerHTML = json.published_date;
      }
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
