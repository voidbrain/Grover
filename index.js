/**
 * Grover/RedNeck System
 * Author: Voidbrain.net
 */

const http = require('http');
const https = require('https');
const url = require('url');

import Pot from './app/envoirement/pot/pot';
import Room from './app/envoirement/room/room';

class Main {
  constructor(){
    this.webserver = http.createServer();
    this.remoteServer = 'https://www.voidbrain.net/grover/ajax/moduli/api/device/';

    this.mainClock = 5 * 1000; // ms
    this.appSetup();
  }
  appSetup(){
    this.pot1 = new Pot({
      potID: 'pot1',
      waterTemperatureProbeID: '28-0114502296aa',
      waterLevelProbeTriggerPin: 1,
      waterLevelProbeEchoPin: 2,
      phProbeID: 'pot1PhProbeID',
      ecProbeID: 'pot1ECProbeID',
      waterLevelProbeID: 'pot1WaterLevelProbeID',
      waterLoopID: 'pot1WaterLoopID',
      waterRefillID: 'pot1WaterRefillID',
      phBalancerID: 'pot1PhBalancerID',
      ecBalancerID: 'pot1EcBalancerID',
    });
    this.pot2 = new Pot({
      potID: 'pot2',
      waterTemperatureProbeID: '28-0114504ea1aa',
      waterLevelProbeTriggerPin: 3,
      waterLevelProbeEchoPin: 4,
      phProbeID: 'pot2PhProbeID',
      ecProbeID: 'pot2ECProbeID',
      waterLevelProbeID: 'pot2WaterLevelProbeID',
      waterLoopID: 'pot1WaterLoopID',
      waterRefillID: 'pot2WaterRefillID',
      phBalancerID: 'pot2PhBalancerID',
      ecBalancerID: 'pot2EcBalancerID',
    });
    this.pots = [this.pot1, this.pot2];

    this.room = new Room({
      roomID: 1,
      waterTemperatureProbeID: null,
      envoirementTemperatureProbeId: null,
      lightSwitchID: null,
      fanMotorID: null,
      pots: this.pots
    });

    this.serverStart();
    this.serverListen();
    this.serverCallRemote('ping', 'START');
    this.mainLoop();
  }
  mainLoop(){
    const self = this;
    setInterval(function(){
       self.room.pots.forEach((pot)=>{
            // pot.waterTemperature.getTemperature().then(res=>{
            //    console.log("Pot id: " + pot.id, " Value: " + res);
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
    self.webserver.on('request', async (req, res) => {
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

      if(queryData.environmentType==='pot'){
        el = self.room.pots.filter(function (el) { return el.id === queryData.environmentID; });
        el = el[0]
      } else {
        el = self.room;
      }
      let probeType;
      if(queryData.probeType==='probe'){ probeType = 'probes'; } else { probeType = 'actuators'; }
      let probe = queryData.probe;
      let action = queryData.action;
      const execute = await el[probeType][probe][action]();
      res.write(JSON.stringify({environmentType: queryData.environmentType, el: el.id, probe: probe, action: action, result: execute}));
      res.end();
    });
  }
  serverListen(){
    this.webserver.listen(8080);
    return
  }
}

const app = new Main();
