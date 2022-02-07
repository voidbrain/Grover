/**
 * Room Environment
 */

import Temperature from '../../probes/temperature/temperature';
import Location from '../../environment/location/location';
import WaterLevel from '../../probes/water-level/water-level';
import LightSwitch from '../../actuators/light-switch/light-switch';
import FanMotor from '../../actuators/fan-motor/fan-motor';

class Room {
  id: any;
  locations: Location[];
  probes: { waterTemperature: any; environmentTemperature: any; };
  actuators: { lightSwitch: any; fanMotor: any; };
  constructor({roomID, waterTemperatureProbeID, environmentTemperatureProbeId,
    lightSwitchID, fanMotorID, locations}) {
    this.id = roomID;
    this.locations = locations;
    this.probes = {
        waterTemperature: new Temperature(waterTemperatureProbeID),
        environmentTemperature: new Temperature(environmentTemperatureProbeId),
    };
    this.actuators = {
        lightSwitch: new LightSwitch(lightSwitchID),
        fanMotor: new FanMotor(fanMotorID),
    };
  }
}
export default Room;
