/**
 * Room Envoirement
 */

import Temperature from '../../probes/temperature/temperature';
import WaterLevel from '../../probes/water-level/water-level';
import LightSwitch from '../../actuators/light-switch/light-switch';
import FanMotor from '../../actuators/fan-motor/fan-motor';

class Room {
  constructor({roomID, waterTemperatureProbeID, envoirementTemperatureProbeId,
    lightSwitchID, fanMotorID}) {
    this.id = roomID;
    this.waterTemperature = new Temperature(waterTemperatureProbeID);
    this.envoirementTemperature = new Temperature(waterTemperatureProbeID);
    this.lightSwitch = new LightSwitch(lightSwitchID);
    this.fanMotor = new FanMotor(fanMotorID);
  }
}
export default Room;
