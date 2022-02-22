// sudo node --loader ts-node/esm --experimental-specifier-resolution=node ./index.ts

import http from 'http';
import url from 'url';
import { LocalStorage } from 'node-localstorage';
import moment from 'moment';
import schedule from 'node-schedule';

import { Owner, OperatingModes, ServerCommands, ServerPages } from './app/services/settings/enums';

import SettingsService from './app/services/settings/settings.service';
import DbService from './app/services/db/db.service';
import ApiService from './app/services/api/api.service';

import { RoomObject }  from './app/interfaces/room';
import RoomComponent from './app/hw-components/environment/room/room';
import { PotObject } from './app/interfaces/pot';
import { LocationInterface } from './app/interfaces/location';
import { CronJobInterface } from './app/interfaces/cron-job';

class Main {
  server: http.Server;
  webServerPort: number;
  serialNumber: { sn: string, found: boolean };
  
  clock: number;
  scheduledCrons: any[] = []; 
  settings = new SettingsService();
  api = new ApiService();
  db = new DbService(this.settings, this.api);
  localStorage = new LocalStorage('./data/scratch');

  room: RoomObject;
  rooms: RoomObject[] = [];
  pots: PotObject[] = [];

  constructor(){ this.appSetup(); }

  async appSetup(){
    const self = this;
    await self.db.load();
    self.clock = self.settings.getClockInterval();
    self.serialNumber = (await self.settings.getSerialNumber());
    self.server = http.createServer();
    self.webServerPort = 8084;
    self.webServerSetup();

    const endpoint = 'endpoint';
    const action = 'START';
    const lastUpdate = self.localStorage.getItem(self.settings.getAppName());

    const device: any = await self.api.get(endpoint, lastUpdate, action, self.serialNumber.sn);
    self.settings.setOperatingMode(device.operatingMode);

    console.log('[main] => initdb done');
    self.main();
  }

  async main(){
    const self = this;
    self.setMainSchedule();
    
    self.room = new RoomComponent(self.serialNumber.sn, self.db, self.api, self.settings) as unknown as RoomObject;
    await self.room.setup();
    self.pots = self.room.pots;
    self.rooms.push(self.room);
    
    console.log(`[main] => ready`);  
  }



  async SYS_LOG({expectedTime, owner, operatingMode}) {
    const self = this;
    return new Promise(async (resolve) => {
      const systemOperatingMode = self.settings.getOperatingMode();
      if(operatingMode >= systemOperatingMode) {
        const job = {
          owner, 
          action: ServerCommands.SYS_LOG,
          expectedTime: (expectedTime ? new Date(expectedTime) : null),
          executedTime: new Date(),
          operatingMode: operatingMode,
          systemOperatingMode: systemOperatingMode,
          serialNumber: self.serialNumber.sn,
        };
        switch(owner){
          case Owner.user: // manual action
            console.log("[MAIN]: system log manual");
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('system_log', job);
              resolve(job);
            }
          break;
          case Owner.schedule: // scheduled action
            console.log("[MAIN]: system log scheduled");
            if (self.settings.getLogMode() === true) { 
              await self.db.logItem('system_log', job);
              resolve;
            }
          break;
        };
      } else {
        console.log(`[FAN-MOTOR]: operatingMode insufficient level (probe: ${operatingMode} system: ${systemOperatingMode})`);
      }
    });
  }

  async updateOperatingMode(mode: number) {
    const self = this;
    if (Object.values(OperatingModes)?.includes(mode)) {
      self.settings.setOperatingMode(mode);
      self.rooms.map(async room => {
        room.probes.map(async probe => { await probe.component?.setStatus(); });
        room.workers.map(async worker => { await worker.component?.setStatus(); })
        room.pots.map(async pot => {
          pot.probes.map(async probe => { await probe.component?.setStatus(); })
          pot.workers.map(async worker => { await worker.component?.setStatus(); })
        })
      })
      return mode;
    } else {
      return false;
    }
  }

  async setMainSchedule() {
    const self = this;
    self.scheduledCrons =  await self.db.getItems('system_schedule') as unknown as any[];
    const scheduleArr: CronJobInterface[] = [];
    self.scheduledCrons.map(systemScheduleRow => {
      const scheduleRow:CronJobInterface = { 
        action: systemScheduleRow.action, 
        cron: `${systemScheduleRow.atMinute} ${systemScheduleRow.atHour} * * ${systemScheduleRow.atDay}`,
        operatingMode: systemScheduleRow.operatingMode,
      };
      scheduleArr.push(scheduleRow);
    });
    
    scheduleArr.map(job => {
      schedule.scheduleJob(job.cron, async (expectedTime) => {
        const owner = Owner.schedule;
        const doJob = await eval(
          `this.${job.action}({
            expectedTime: '${expectedTime}', 
            owner: '${owner}', 
            operatingMode: ${job.operatingMode}
          })`);
      })
    });
  }

  hasMethod(subject, methodName) {
    return subject != null && typeof subject[methodName] == "function";
  }
  
  /**
   * Webserver
   */

  start(){
    const self = this;
    self.server.on('request', async (req, res) => {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      const q = url.parse(req.url, true);
      if (q.pathname === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        res.end();
        return;
      }
      const action: string = q.query.action as string;
      const page: string = q.pathname;
      const owner: string = Owner.user;
      const operatingMode: number = self.settings.getOperatingMode();
      const now = moment();
      switch(page){
        case `/${ServerPages.actuators}`:
          const id = q.query.id as string;
          const terminalType = q.query.type as string;
         
          if(action && id && terminalType) {
            const terminal: any = await self.db.getItem(terminalType+'s_list', +id, 'id') as any;
            const parentLocation: LocationInterface = await self.db.getItem('locations',  +terminal.locationId, 'id') as LocationInterface;
            const parent = await self.db.findParent(parentLocation.id) as any;
            const environments = (+parent.parent > 0 ? self.pots : self.rooms) as any;
            const environmentType = (+parent.parent > 0 ? 'pot' : 'room');
            const environment = environments.find(el => +el[environmentType].locationId === +parent[`${environmentType}LocationId`]);
            if(environment) {
              const el = environment[terminalType+'s'].find(el => +el[`locationId`] === +terminal.locationId);
              if(el){
                const hasMethod = self.hasMethod(el.component, action);
                if(hasMethod) {
                  const doJob = await el.component[action]({now, owner, operatingMode});
                  console.log(JSON.stringify(doJob));
                  res.write(JSON.stringify(doJob));
                } else {
                  console.log(`Action ${action} not found on ${JSON.stringify(el.component)}`);
                  res.write(`Action ${action} not found on ${JSON.stringify(el.component)}`);
                }
                
              } else {
                console.log(`[SERVER]: Error el.component not found`);
              }
             
            } else {
              const err = `[SERVER]: environment not found LIST: [${environments.map(el => { return el[environmentType].id })}], ? = ${parent.id}`;
              console.log(err);
              res.write(err);
            }
          } else {
            console.log(`[SERVER]: Error ${action}, ${id}, ${terminalType}`);
          }
        break;
        case `/${ServerPages.system}`:
          switch (action){
            case `${ServerCommands.SET_MODE}`:
              const mode = +q.query.mode as number;
              const doJob = await self.updateOperatingMode(mode);
              res.write(`System mode set to ${mode}`);
            break;
            default:
              res.write(`Action "${action}" not found for page "${page}"`);
            break;
          }
        break;
        default:
          res.write(`Page "${page}" not found`);
        break;
      }
      
      res.end();
    });
  }
  
  listen(){
    this.server.listen(this.webServerPort);
    return
  }
  
  webServerSetup(){
    this.start();
    this.listen();
  }
}

const app = new Main();
