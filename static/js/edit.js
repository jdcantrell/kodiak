!function(e){function t(a){if(n[a])return n[a].exports;var d=n[a]={exports:{},id:a,loaded:!1};return e[a].call(d.exports,d,d.exports,t),d.loaded=!0,d.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t){"use strict";var n=void 0,a=document.getElementById("preview"),d=document.getElementById("dropTarget"),o=function(e){var t=document.getElementById("rst"),a=n.getValue();(e||t.value!==a)&&(document.getElementById("rst").value=a,document.getElementById("preview_form").submit())},r=function(){d.style.display="flex"},i=function(){d.style.display="none"},s=function(e){document.getElementById("progress").value=""+e},c=[],l=function(){if(c.length){document.getElementById("uploading").style.display="block";var e=c.shift(),t=document.getElementById("upload_text"),n=e.name;c.length&&(n=n+" ("+c.length+")"),t.innerHTML=n,m(e)}else document.getElementById("uploading").style.display="none"},u=function(e){var t=n.session,a="\n\n.. image:: "+e.name;t.insert({row:t.getLength(),column:0},a),o()},m=function(e){var t=new XMLHttpRequest;t.upload.addEventListener("progress",function(e){if(e.lengthComputable){var t=Math.round(100*e.loaded/e.total);s(t)}},!1),t.onreadystatechange=function(){if(4===t.readyState&&(t.status>=200&&t.status<=200||304===t.status)&&""!==t.responseText){var e=JSON.parse(t.responseText);u(e),l()}};var n=new FormData;n.append("file",e),t.open("POST",upload_path),t.send(n)},v=function(e){c.push(e),l()},g=function(){ace.config.loadModule("ace/keybinding/vim",function(){var e=ace.require("ace/keyboard/vim").CodeMirror.Vim;e.defineEx("write","w",function(e){e.ace.execCommand("save"),o(!0)})}),n=ace.edit("ace_editor"),n.setTheme("ace/theme/tomorrow"),n.setOption("wrap",80),n.getSession().setMode("ace/mode/rst"),n.setKeyboardHandler("ace/keyboard/vim"),window.setInterval(function(){return o()},5e3),a.addEventListener("load",function(){var e=(a.offsetWidth-10)/window.theme_width;e<1&&(a.contentDocument.body.style.transform="scale("+e+")",a.contentDocument.body.style.minWidth=window.theme_width+"px",a.contentDocument.body.style.transformOrigin="0 0",document.getElementById("last_saved").innerHTML=a.contentDocument.getElementById("last_saved").value)}),document.body.addEventListener("dragover",function(){r()});var e=function(e){e.preventDefault(),e.stopPropagation()};d.addEventListener("dragleave",function(t){e(t),i()}),d.addEventListener("drag",e),d.addEventListener("dragstart",e),d.addEventListener("dragend",e),d.addEventListener("dragover",e,!0),d.addEventListener("dragenter",e),d.addEventListener("drop",function(t){e(t),i();for(var n=t.dataTransfer.files,a=0;a<n.length;a++){var d=n[a];v(d)}});var t=document.getElementById("publish");t.addEventListener("click",function(){t.classList.add("is-loading"),fetch("publish/",{credentials:"same-origin"}).then(function(){t.classList.remove("is-loading")})});var s=document.getElementById("public"),c=document.getElementById("limited"),l=document.getElementById("private"),u=document.getElementById("access"),m=function(e){u.value=e.target.id,s.classList.remove("is-primary"),l.classList.remove("is-primary"),c.classList.remove("is-primary"),e.target.classList.add("is-primary"),document.getElementById("preview_form").submit()};s.addEventListener("click",m),c.addEventListener("click",m),l.addEventListener("click",m)};g()}]);