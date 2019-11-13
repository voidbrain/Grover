/**
 * Room Envoirement
 */

import Temperature from '../../probes/temperature/temperature';
import WaterLevel from '../../probes/water-level/water-level';
import LightSwitch from '../../actuators/light-switch/light-switch';
import FanMotor from '../../actuators/fan-motor/fan-motor';

class Room {
  constructor({roomID, waterTemperatureProbeID, envoirementTemperatureProbeId,
    lightSwitchID, fanMotorID, pots}) {
    this.id = roomID;
    this.pots = pots;
    this.probes = {
        waterTemperature: new Temperature(waterTemperatureProbeID),
        envoirementTemperature: new Temperature(envoirementTemperatureProbeId),
    };
    this.actuators = {
        lightSwitch: new LightSwitch(lightSwitchID),
        fanMotor: new FanMotor(fanMotorID),
    };
  }
}
export default Room;
