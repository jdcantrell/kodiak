!function(e){function t(d){if(n[d])return n[d].exports;var a=n[d]={exports:{},id:d,loaded:!1};return e[d].call(a.exports,a,a.exports,t),a.loaded=!0,a.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t){"use strict";var n=void 0,d=document.getElementById("preview"),a=document.getElementById("dropTarget"),o=function(e){var t=document.getElementById("rst"),d=n.getValue();(e||t.value!==d)&&(document.getElementById("rst").value=d,document.getElementById("preview_form").submit())},i=function(){a.style.display="flex"},r=function(){a.style.display="none"},s=function(e){document.getElementById("progress").value=""+e},c=[],l=function(){if(c.length){document.getElementById("uploading").style.display="block";var e=c.shift(),t=document.getElementById("upload_text"),n=e.name;c.length&&(n=n+" ("+c.length+")"),t.innerHTML=n,m(e)}else document.getElementById("uploading").style.display="none"},u=function(e){var t=n.session,d="\n\n.. image:: "+e.name;t.insert({row:t.getLength(),column:0},d),o()},m=function(e){var t=new XMLHttpRequest;t.upload.addEventListener("progress",function(e){if(e.lengthComputable){var t=Math.round(100*e.loaded/e.total);s(t)}},!1),t.onreadystatechange=function(){if(4===t.readyState&&(t.status>=200&&t.status<=200||304===t.status)&&(l(),""!==t.responseText)){var e=JSON.parse(t.responseText);u(e)}};var n=new FormData;n.append("file",e),t.open("POST","/kodiak/upload/"),t.send(n)},v=function(e){c.push(e),l()},g=function(){ace.config.loadModule("ace/keybinding/vim",function(){var e=ace.require("ace/keyboard/vim").CodeMirror.Vim;e.defineEx("write","w",function(e){e.ace.execCommand("save"),o(!0)})}),n=ace.edit("ace_editor"),n.setTheme("ace/theme/tomorrow"),n.setOption("wrap",80),n.getSession().setMode("ace/mode/rst"),n.setKeyboardHandler("ace/keyboard/vim"),window.setInterval(function(){return o()},5e3),d.addEventListener("load",function(){var e=(d.offsetWidth-10)/window.theme_width;e<1&&(d.contentDocument.body.style.transform="scale("+e+")",d.contentDocument.body.style.minWidth=window.theme_width+"px",d.contentDocument.body.style.transformOrigin="0 0",document.getElementById("last_saved").innerHTML=d.contentDocument.getElementById("last_saved").value)}),document.body.addEventListener("dragover",function(){i()});var e=function(e){e.preventDefault(),e.stopPropagation()};a.addEventListener("dragleave",function(t){e(t),r()}),a.addEventListener("drag",e),a.addEventListener("dragstart",e),a.addEventListener("dragend",e),a.addEventListener("dragover",e,!0),a.addEventListener("dragenter",e),a.addEventListener("drop",function(t){e(t),r();for(var n=t.dataTransfer.files,d=0;d<n.length;d++){var a=n[d];v(a)}});var t=document.getElementById("publish");t.addEventListener("click",function(){t.classList.add("is-loading"),fetch("publish/",{credentials:"same-origin"}).then(function(){t.classList.remove("is-loading")})});var s=document.getElementById("public"),c=document.getElementById("limited"),l=document.getElementById("private"),u=document.getElementById("access"),m=function(e){u.value=e.target.id,s.classList.remove("is-primary"),l.classList.remove("is-primary"),c.classList.remove("is-primary"),e.target.classList.add("is-primary"),document.getElementById("preview_form").submit()};s.addEventListener("click",m),c.addEventListener("click",m),l.addEventListener("click",m)};g()}]);