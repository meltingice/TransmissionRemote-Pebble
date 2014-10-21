var Transmission = (function () {
  function Transmission() {
    // this.url = localStorage.getItem('url');
    this.url = "http://homebox.local:8181";
    this.fields = [
      'id',
      'name',
      'totalSize',
      'isFinished',
      'rateDownload',
      'rateUpload',
      'percentDone'
    ];

    this.username = localStorage.getItem('username');
    this.password = localStorage.getItem('password');
    this.session_id = 'NOT-INITIALIZED';
  }

  Transmission.prototype.list = function (callback) {
    this.post('torrent-get', {fields: this.fields}, function (resp) {
      callback(resp['arguments']['torrents']);
    });
  };

  return Transmission;
})();

var Messenger = (function () {
  function Messenger() {
    this.t = new Transmission();
  }

  Messenger.prototype.handle = function (data) {
    this[data.action](data);
  };

  Messenger.prototype.list = function (data) {
    this.t.list(function (resp) {
      Pebble.sendAppMessage({action: 'list', data: resp});
    });
  }
})();

var messenger = new Messenger();

Pebble.addEventListener("ready", function(e) {
  console.log("JS initialized");
});

Pebble.addEventListener("appmessage", function (e) {
  console.log("Message received!");
  messenger.handle(e.payload);
});
