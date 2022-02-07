#!/usr/bin/env node

/**
 * Grover/RedNeck System
 * Author: Voidbrain.net
 */

import * as http from 'http';
import * as https from 'https';
import * as url from 'url';

import Location from './app/environment/location/location.js';
import Room from './app/environment/room/room.js';

class Main {
  localserver;
  remoteServer;
  mainClock;

  location1: Location;
  location2: Location;
  locations: Location[];
  room: Room;

  constructor(){
    this.localserver = http.createServer();
    this.remoteServer = 'https://www.voidbrain.net/grover/ajax/moduli/api/device/';

    this.mainClock = 5 * 1000; // ms
    this.appSetup();
  }
  appSetup(){
    this.location1 = new Location({
      locationID: 'location1',
      // probes
      waterTemperatureProbeID: '28-0114502296aa',
      phProbeID: 'location1PhProbeID',
      ecProbeID: 'location1ECProbeID',
      waterLevelProbeID: 'location1WaterLevelProbeID',
      // actuators
      waterLevelProbeTriggerPin: 1,
      waterLevelProbeEchoPin: 2,
      waterLoopID: 'location1WaterLoopID',
      waterRefillID: 'location1WaterRefillID',
      phBalancerID: 'location1PhBalancerID',
      ecBalancerID: 'location1EcBalancerID',
    });
    this.locations = [this.location1];

    this.room = new Room({
      roomID: 1,
      waterTemperatureProbeID: null,
      environmentTemperatureProbeId: null,
      lightSwitchID: null,
      fanMotorID: null,
      locations: this.locations
    });

    this.serverStart();
    this.serverListen();
    this.serverCallRemote('ping', 'START');
    this.mainLoop();
  }
  mainLoop(){
    const self = this;
    setInterval(function(){
      console.log('main loop')
      self.room.locations.forEach((location)=>{
        // location.waterTemperature.getTemperature().then(res=>{
        //    console.log("Location id: " + location.id, " Value: " + res);
        // })
      });
    },  self.mainClock);
  }

  /**
 * HTTP Server
 */

  serverCallRemote(page, action=null){
    const self = this;
    https.get(self.remoteServer+page + '?action=' + action, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });
      resp.on('end', () => {
        console.log(JSON.parse(data));
      });
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  }
  serverStart(){
    const self = this;
    self.localserver.on('request', async (req, res) => {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      const q = url.parse(req.url, true);
      if (q.pathname === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        res.end();
        return;
      }
      const path = q.pathname;
      const queryData = q.query;
      let el;

      if(queryData.environmentType==='location'){
        el = self.room.locations.filter(function (el) { return el.id === queryData.environmentID; });
        el = el[0]
      } else {
        el = self.room;
      }
      let probeType;
      if(queryData.probeType==='probe'){ probeType = 'probes'; } else { probeType = 'actuators'; }
      let probe = queryData.probe;
      let action = queryData.action;
      console.log(el);
      const execute = null; // await el[probeType][probe][action]();
      res.write(JSON.stringify({environmentType: queryData.environmentType, el: el.id, probe: probe, action: action, result: execute}));
      res.end();
    });
  }
  serverListen(){
    this.localserver.listen(8080);
    return
  }
}

const app = new Main();
