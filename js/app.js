var MarkedWriter = window.MarkedWriter = global.MarkedWriter = {
  gui: require('nw.gui'),
  Window: require('nw.gui').Window.get(),
  openWindow: require('nw.gui').Window.open,

  IS_DEBUG: true,
  PLATFORM_WINDOWS: process.platform === 'win32',
  PLATFORM_MAC: process.platform === 'darwin',
  PLATFORM_LINUX: process.platform === 'linux'
};

// Devtools for developers
// Allow anyone to open dev tools for error reporting
window.addEventListener('keydown', function (e) {
  if (e.keyIdentifier === 'F12') {
    MarkedWriter.Window.showDevTools();
  }
});

// Fix for nasty node-webkit bug; https:// github.com/rogerwang/node-webkit/issues/1021
if (MarkedWriter.PLATFORM_WINDOWS && parseFloat(require('os').release(), 10) > 6.1) {
  MarkedWriter.Window.setMaximumSize(screen.availWidth + 15, screen.availHeight + 15);
}

// Prevent unhandeled drag drops
$(window).on('dragenter dragover drop', function (e) {
  e.preventDefault();
});

// Prevent unhandled middle clicks and ctrl+clicks
$(window).on('click', function (e) {
  if (e.which === 2 || e.ctrlKey) {
    e.preventDefault();
  }
});

if (MarkedWriter.PLATFORM_WINDOWS) {

  // Tray icon
  var trayOptions = {
    icon: 'img/markedwriter.png', // Relative to package.json file
    title: 'Marked Writer'
  };

  var tray_icon = new MarkedWriter.gui.Tray(trayOptions);

  // Tray Icon Right Click Menu
  var tray_menu = new MarkedWriter.gui.Menu();

  tray_menu.append(new MarkedWriter.gui.MenuItem({
    label: '显示',
    click: function () {
      MarkedWriter.Window.show();
      MarkedWriter.Window.focus();
    }
  }));

  tray_menu.append(new MarkedWriter.gui.MenuItem({
    label: '隐藏',
    click: function () {
      MarkedWriter.Window.hide();
    }
  }));

  tray_menu.append(new MarkedWriter.gui.MenuItem({
    label: '退出 MarkedWriter',
    click: function () {
      MarkedWriter.Window.close();
    }
  }));

  tray_icon.menu = tray_menu;
  tray_icon.on('click', function () {
    MarkedWriter.Window.show();
    MarkedWriter.Window.focus();
  });

  // Push tray icon to global window to tell garbage collector that tray icon is not garbage
  MarkedWriter._trayIcon = tray_icon;
}

// Save State Details on exit
MarkedWriter.Window.on('close', function () {
  localStorage.settings = JSON.stringify(viewModel.settings());
  MarkedWriter.gui.App.closeAllWindows();
  this.close(true);
});

if (MarkedWriter.IS_DEBUG) {

}

// Datetime format
Date.prototype.format = function(format)
{
  var o = {
    "M+" : this.getMonth()+1, //month
    "d+" : this.getDate(), //day
    "h+" : this.getHours(), //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth()+3)/3), //quarter
    "S" : this.getMilliseconds() //millisecond
  }
  if(/(y+)/.test(format)) 
    format=format.replace(RegExp.$1, (this.getFullYear()+"").substr(4- RegExp.$1.length));
  for(var k in o)
    if(new RegExp("("+ k +")").test(format))
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
  return format;
};

// Blog helper
String.prototype.asBlog = function() {
  var blog = {};
  var content = this.replace(/^-{3}/, '').split('---');
  var headInfo = content.shift().split('\n');
  for (var i = 0; i < headInfo.length; i++) {
    var head = headInfo[i];
    if (head.indexOf(':') != -1) {
      var keyValue = head.split(':');
      if (keyValue[0] == '标题') {
        blog.title = keyValue[1].trim();
      }
      if (keyValue[0] == '时间') {
        keyValue.shift();
        blog.create_at = keyValue.join(':').trim();
      }
    }
  };
  blog.is_delete = 0;
  blog.weblog_id = '';
  blog.content = content.join('---');
  blog.summary = $(md(blog.content)).text().substr(0, 120);
  return blog;
}