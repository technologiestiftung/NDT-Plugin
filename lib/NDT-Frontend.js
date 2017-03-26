//The system uses webworkers, therefore the underlying script needs to know where to find the scriptworkers
function NDTPlugin(path) {
  this.path = path;
  this.server = 'ndt.iupui.mlab1.ham01.measurement-lab.org';
  this.websocket_client = false;
}

//The NDTPlugin only supports Websockets not java
NDTPlugin.prototype.check = function () {
  var hasWebsockets = false;
  try {
    var ndt_js = new NDTjs();
    if (ndt_js.checkBrowserSupport()) {
      hasWebsockets = true;
    }
  } catch(e) {
    hasWebsockets = false;
  }
  return hasWebsockets;
};

//Get the server info from the closest NDT server, provide a success(SERVER string) and error(ERROR object) function
NDTPlugin.prototype.getServer = function (success, error) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success) {
          success((JSON.parse(xhr.responseText)).fqdn);
        }
      } else {
        if (error) {
          error(xhr);
        }
      }
    }
  };
  xhr.open("GET", 'https://mlab-ns.appspot.com/ndt_ssl', true);
  xhr.send();
};

//Set the server requires string
NDTPlugin.prototype.setServer = function (server) {
  this.server = server;
};

//Starts the test
NDTPlugin.prototype.run = function () {
  this.websocket_client = new NDTWrapper(this.server, this.path);

  if (!this.websocket_client.get_status()) {
    throw 'websocket client is not running properly';
  }

  this.websocket_client.run_test(this.server, 7123);
};

//The following functions give access to the NDTWrappers status getters
NDTPlugin.prototype.get_status = function () {
    /*
      Possible return values:
      - notStarted
      - Inbound
      - Outbound
    */
    return this.websocket_client.get_status();
};

NDTPlugin.prototype.get_diagnosis = function () {
    return this.websocket_client.get_diagnosis();
};

NDTPlugin.prototype.get_errmsg = function () {
    /*
      For some reason the error message contains tells us when the test is complete:
      - "Test completed"
      Other values:
      - not run
      - failed
    */
    return this.websocket_client.get_errmsg();
};

NDTPlugin.prototype.get_host = function () {
    return this.websocket_client.get_host();
};

NDTPlugin.prototype.getNDTvar = function (variable) {
    return this.websocket_client.getNDTvar(variable);
};

//As it is not very comfortable querying all things separately, the following function combines the most useful things in an object
NDTPlugin.prototype.getStatus = function () {
  var upload_speed = parseFloat(this.getNDTvar('ClientToServerSpeed')),
    download_speed = parseFloat(this.getNDTvar('ServerToClientSpeed')),
    round_trip = parseFloat(this.getNDTvar('avgrtt')),
    jitter = parseFloat(this.getNDTvar('Jitter')),
    limit = parseFloat(this.websocket_client.get_PcBuffSpdLimit()),
    loss = parseFloat(this.getNDTvar('loss')),
    status = this.get_status(),
    error = this.get_errmsg();

  return {
    status:status,
    error:error,
    up:upload_speed,
    down:download_speed,
    round:round_trip,
    jitter:jitter,
    limit:limit,
    loss:loss
  };

};

//Helper function for nice speed unit output
NDTPlugin.prototype.getSpeedUnit = function (speedInKB) {
  var unit = ['kb/s', 'Mb/s', 'Gb/s', 'Tb/s', 'Pb/s', 'Eb/s'];
  var e = Math.floor(Math.log(speedInKB*1000) / Math.log(1000));
  return unit[e];
};