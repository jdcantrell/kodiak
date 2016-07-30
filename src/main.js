/* globals ace */
let editor;

const previewFrame = document.getElementById('preview');

const preview = (force) => {
  const input = document.getElementById('rst');
  const editorValue = editor.getValue();
  if (force || input.value !== editorValue) {
    document.getElementById('rst').value = editorValue;
    document.getElementById('preview_form').submit();
  }
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
};

run();
