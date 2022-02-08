"use strict";
/**
 * Location Environment
 */
exports.__esModule = true;
var temperature_1 = require("../../probes/temperature/temperature");
// import PhProbe from '../../probes/ph/ph';
// import EcProbe from '../../probes/ec/ec';
// import WaterLevel from '../../probes/water-level/water-level';
// import WaterLoop from '../../actuators/water-loop/water-loop';
var water_refill_1 = require("../../actuators/water-refill/water-refill");
// import PhBalancer from '../../actuators/ph-balancer/ph-balancer';
// import EcBalancer from '../../actuators/ec-balancer/ec-balancer';
var Location = /** @class */ (function () {
    function Location(_a) {
        var locationID = _a.locationID, waterTemperatureProbeID = _a.waterTemperatureProbeID, phProbeID = _a.phProbeID, ecProbeID = _a.ecProbeID, waterLevelProbeID = _a.waterLevelProbeID, waterLevelProbeTriggerPin = _a.waterLevelProbeTriggerPin, waterLevelProbeEchoPin = _a.waterLevelProbeEchoPin, waterLoopID = _a.waterLoopID, waterRefillID = _a.waterRefillID, phBalancerID = _a.phBalancerID, ecBalancerID = _a.ecBalancerID;
        this.id = locationID;
        //// this.waterTemperature = new Temperature(waterTemperatureProbeID);
        // this.phProbe = new PhProbe(phProbeID);
        // this.ecProbe = new EcProbe(ecProbeID);
        // this.waterLevel = new WaterLevel(waterLevelProbeID, waterLevelProbeTriggerPin, waterLevelProbeEchoPin);
        // this.waterLoop = new WaterLoop(waterLoopID);
        //// this.waterRefill = new WaterRefill(waterRefillID);
        // this.phBalancer = new PhBalancer(phBalancerID);
        // this.ecBalancer = new EcBalancer(ecBalancerID);
        this.probes = {
            waterTemperatureProbeID: new temperature_1["default"](waterTemperatureProbeID),
            phProbeID: null,
            ecProbeID: null,
            waterLevelProbeID: null
        };
        this.actuators = {
            waterRefillID: new water_refill_1["default"](waterRefillID),
            waterLevelProbeTriggerPin: null,
            waterLevelProbeEchoPin: null
        };
    }
    return Location;
}());
exports["default"] = Location;
