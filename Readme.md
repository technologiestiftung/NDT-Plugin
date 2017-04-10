# NDT-Plugin
## An easy to use bundle of the Network Diagnostic Tool by the [NDT-Project](https://github.com/ndt-project/ndt)

## INTRODUCTION

The Network Diagnostic Tool is an open source web-based tool, which allows you to measure the current speed of you internet connection. It therefore connects to the closest server running the NDT-Software and measures up- and download speed. **Important note:** The performance is not only provided to the client, but also stored on the remote server for statistical purposes. Due to this fact, it is important to include a disclaimer on the page, warning the user about the storage of 'personal' information on the server-side.

The stored information is used to inform about speed issues and the distribution of high-speed internet connections. An example for an application making use of this and providing the data for further analysis is the Measurement Lab:

Visualization and Open Data: http://viz.measurementlab.net
Speed Test: https://speed.measurementlab.net

## USAGE

We have compiled and bundled the most important features into three files:

### ndt-browser-client-min.js
Contains the code required for creating and running the test.

### ndt-wrapper-ww-min.js
The test is making use of web-workers. In order to keep the data the web-worker needs to load, we have created a second file specifically for the web-workers.

### NDTPlugin-min.js
Contains an easy to use API to interact with the NDT test.

### Implementation

For running the test you need to perform four simple steps:

#### 1. Initiate Test

For the web-workers the tool needs to know where the web-worker code is located.

```
var ndt = new NDTPlugin('../lib/min');
```

#### 2. Check if test is supported

```
if(ndt.check()){
  //next step
}
```

#### 3. Acquire closest NDT server

The script talks to https://mlab-ns.appspot.com/ndt_ssl to get the closest server.

```
//For convenience we have bundled all status data into one json object




ndt.getServer(
  function(server){
    //next step
  },
  function(error){
    console.log('error', error);
  }
);
```
#### 4. Run the speed test

Using the server from the previous step, we can now start the test

```
//set server (you could also manually provide a server)
ndt.setServer(server);
ndt.run();
```

#### Displaying feedback after or while running the test

While the test is running you can display feedback, for example using an interval:

```
interval = setInterval(reportStatus, 1000);

function reportStatus(){
  var status = ndt.getStatus();
}
```

The plugin provides an easy interface to the test:

##### ndt.getStatus()
For convenience we have bundled all status data into one json object.
```
{
  status:status, //see get_status()
  error:error, //see get_errmsg()
  up:upload_speed,
  down:download_speed,
  round:round_trip, 
  jitter:jitter,
  limit:limit,
  loss:loss
}
```

##### ndt.get_status()
Returns a string:
- notStarted
- Inbound
- Outbound

##### ndt.get_diagnosis()

##### ndt.get_errmsg()
While you might think this only returns errors, it also tells us when the test is done, so need to listen to the complete flag:
- "Test completed"
- not run
- failed

##### ndt.get_host()

##### ndt.getNDTvar()

#### NDTPlugin Helper function

Helper function for nice speed unit output
```
ndt.getSpeedUnit = function (speedInKB) {
  var unit = ['kb/s', 'Mb/s', 'Gb/s', 'Tb/s', 'Pb/s', 'Eb/s'];
  var e = Math.floor(Math.log(speedInKB*1000) / Math.log(1000));
  return unit[e];
};
```

## Examples

If the above sounds complicated, its not, here is a simple implementation:

```
var ndt, interval;

document.getElementById("start").onclick = function () {

  ndt = new NDTPlugin('../lib/min');

  if(ndt.check()){
    ndt.getServer(
      function(success){
        ndt.setServer(success);
        ndt.run();
        interval = setInterval(reportStatus, 1000);
      },
      function(error){
        console.log('error', error);
      }
    );
  }else{
    console.log('sorry your browser does not support this')
  }

}

function reportStatus(){
  var status = ndt.getStatus();
  
  for(var key in status){
    document.getElementById(key).innerHTML = status[key];
  }

  if(status.error.match(/completed/)){
    clearInterval(interval);
  }
}
```

The example can be found in the examples folder. Two live examples can be found here:

technologiestiftung.github.io/NDT-Plugin/examples/simple.html
technologiestiftung.github.io/NDT-Plugin/examples/d3.html

## COPYRIGHT

Please note, that the original NDT software, which is bundled into ndt-browser-client-min.js and ndt-wrapper-ww-min.js is supplied under the license of the original creators, which can be found in the folder lib/ndt-project_ndt_HTML5-frontend/COPYRIGHT.

