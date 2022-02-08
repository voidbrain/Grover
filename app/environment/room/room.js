"use strict";
/**
 * Room Environment
 */
exports.__esModule = true;
var temperature_1 = require("../../probes/temperature/temperature");
var light_switch_1 = require("../../actuators/light-switch/light-switch");
var fan_motor_1 = require("../../actuators/fan-motor/fan-motor");
var Room = /** @class */ (function () {
    function Room(_a) {
        var roomID = _a.roomID, waterTemperatureProbeID = _a.waterTemperatureProbeID, environmentTemperatureProbeId = _a.environmentTemperatureProbeId, lightSwitchID = _a.lightSwitchID, fanMotorID = _a.fanMotorID, locations = _a.locations;
        this.id = roomID;
        this.locations = locations;
        this.probes = {
            waterTemperature: new temperature_1["default"](waterTemperatureProbeID),
            environmentTemperature: new temperature_1["default"](environmentTemperatureProbeId)
        };
        this.actuators = {
            lightSwitch: new light_switch_1["default"](lightSwitchID),
            fanMotor: new fan_motor_1["default"](fanMotorID)
        };
    }
    return Room;
}());
exports["default"] = Room;
