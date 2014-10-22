// Ugh no way to base64 encode in PebbleKit
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

var Transmission = (function () {
  function Transmission() {
    // this.url = localStorage.getItem('url');
    this.url = "http://homebox.local:8181/transmission/rpc";
    this.fields = [
      'id',
      'name',
      'totalSize',
      'isFinished',
      'rateDownload',
      'rateUpload',
      'percentDone'
    ];

    // this.username = localStorage.getItem('username');
    // this.password = localStorage.getItem('password');
    this.username = "admin";
    this.password = "admin";
    this.session_id = '';
  }

  Transmission.prototype.list = function (callback) {
    this.post('torrent-get', {fields: this.fields}, function (resp) {
      callback(resp['arguments']['torrents']);
    });
  };

  Transmission.prototype.post = function (endpoint, args, callback) {
    var post_data = {
      method: endpoint,
      arguments: args
    };

    var req = new XMLHttpRequest();
    var self = this;
    req.open('POST', this.url, true);
    req.onload = function (e) {
      console.log("Response received from Transmission", req.readyState);
      if (req.readyState === 4) {
        console.log("Response status:", req.status);
        if (req.status === 200) {
          response = JSON.parse(req.responseText);
          callback(response);  
        } else if (req.status === 409) {
          // Session ID needs to be set/updated. Set it and retry request.
          self.session_id = this.getResponseHeader('X-Transmission-Session-Id')
          console.log("Setting the session ID", self.session_id);
          self.post(endpoint, args, callback);
        }
      }
    };

    this.setHeaders(req);

    console.log('POST', this.url, endpoint);
    req.send(JSON.stringify(post_data));
  };

  Transmission.prototype.setHeaders = function (req) {
    if (this.username) {
      req.setRequestHeader('Authorization', 'Basic ' + Base64.encode(this.username + ':' + this.password));
    }

    req.setRequestHeader("X-Transmission-Session-Id", this.session_id);
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
      Pebble.sendAppMessage({action: 0, data: this.format_list(resp)});
    }.bind(this));
  };

  Messenger.prototype.format_list = function (data) {
    var result = [];
    data.forEach(function (item) {
      this.t.fields.forEach(function (field) {
        result.push(item[field]);
      }.bind(this));

      result.push("__ENDITEM__");
    }.bind(this));

    return result.join("\n");
  };

  return Messenger;
})();

var messenger = null;

Pebble.addEventListener("ready", function(e) {
  messenger = new Messenger();
  console.log("JS initialized");
});

Pebble.addEventListener("appmessage", function (e) {
  console.log("Message received!");
  console.log("Action: " + e.payload.action);
  messenger.handle(e.payload);
});
