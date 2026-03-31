export var DevicesStatus;
(function (DevicesStatus) {
    DevicesStatus["ON"] = "ON";
    DevicesStatus["OFF"] = "OFF";
})(DevicesStatus || (DevicesStatus = {}));
export var OperatingModes;
(function (OperatingModes) {
    // Off = 1,
    // Silent = 2,
    // On = 3,
    OperatingModes[OperatingModes["Normal"] = 1] = "Normal";
    OperatingModes[OperatingModes["Silent"] = 2] = "Silent";
    OperatingModes[OperatingModes["Off"] = 3] = "Off";
})(OperatingModes || (OperatingModes = {}));
export var Owner;
(function (Owner) {
    Owner["schedule"] = "schedule";
    Owner["user"] = "user";
    Owner["start"] = "start";
})(Owner || (Owner = {}));
export var EventEmitter;
(function (EventEmitter) {
    EventEmitter["schedule"] = "schedule";
    EventEmitter["user"] = "user";
    EventEmitter["start"] = "start";
})(EventEmitter || (EventEmitter = {}));
export var Peripherals;
(function (Peripherals) {
    Peripherals["Probe"] = "probe";
    Peripherals["Worker"] = "worker";
})(Peripherals || (Peripherals = {}));
export var Purposes;
(function (Purposes) {
    Purposes[Purposes["client"] = 1] = "client";
    Purposes[Purposes["worker"] = 2] = "worker";
})(Purposes || (Purposes = {}));
export var ProbesTypes;
(function (ProbesTypes) {
    ProbesTypes[ProbesTypes["Air_temperature"] = 1] = "Air_temperature";
    ProbesTypes[ProbesTypes["Water_temperature"] = 2] = "Water_temperature";
    ProbesTypes[ProbesTypes["Water_level"] = 3] = "Water_level";
    ProbesTypes[ProbesTypes["pH"] = 4] = "pH";
    ProbesTypes[ProbesTypes["EC"] = 5] = "EC";
})(ProbesTypes || (ProbesTypes = {}));
export var ScheduleTypes;
(function (ScheduleTypes) {
    ScheduleTypes[ScheduleTypes["From_To"] = 1] = "From_To";
    ScheduleTypes[ScheduleTypes["At"] = 2] = "At";
})(ScheduleTypes || (ScheduleTypes = {}));
export var ServerCommands;
(function (ServerCommands) {
    ServerCommands["RUN_WATER"] = "RUN_WATER";
    ServerCommands["RUN_PHDOWN"] = "RUN_PHDOWN";
    ServerCommands["RUN_DOSE"] = "RUN_DOSE";
    ServerCommands["SHUFFLE_PHDOWN"] = "SHUFFLE_PHDOWN";
    ServerCommands["SHUFFLE_DOSE"] = "SHUFFLE_DOSE";
    ServerCommands["READ"] = "READ";
    ServerCommands["ON"] = "ON";
    ServerCommands["OFF"] = "OFF";
    ServerCommands["SET_STATUS"] = "SET_STATUS";
    ServerCommands["LOG"] = "LOG";
    ServerCommands["START"] = "START";
    ServerCommands["SYS_LOG"] = "SYS_LOG";
    ServerCommands["SET_MODE"] = "SET_MODE";
    ServerCommands["AI_GET_DOSES"] = "AI_GET_DOSES";
    ServerCommands["AI_GET_EC_PH"] = "AI_GET_EC_PH";
    ServerCommands["AI_TRAIN_DOSES_MODEL"] = "AI_TRAIN_DOSES_MODEL";
    ServerCommands["AI_TRAIN_EC_PH"] = "AI_TRAIN_EC_PH";
})(ServerCommands || (ServerCommands = {}));
export var ServerPages;
(function (ServerPages) {
    ServerPages["actuators"] = "actuators";
    ServerPages["system"] = "system";
})(ServerPages || (ServerPages = {}));
export var WorkersTypes;
(function (WorkersTypes) {
    WorkersTypes[WorkersTypes["Pot_Water_loop"] = 1] = "Pot_Water_loop";
    WorkersTypes[WorkersTypes["Pot_refill"] = 2] = "Pot_refill";
    // Pot_Nutrient_refill = 3,
    // Pot_PHdown_refill = 4,
    WorkersTypes[WorkersTypes["Room_Water_refill"] = 3] = "Room_Water_refill";
    WorkersTypes[WorkersTypes["Room_PhDown_refill"] = 4] = "Room_PhDown_refill";
    // Room_Nutrient_refill = 7,
    WorkersTypes[WorkersTypes["Room_Gro_refill"] = 5] = "Room_Gro_refill";
    WorkersTypes[WorkersTypes["Room_Micro_refill"] = 6] = "Room_Micro_refill";
    WorkersTypes[WorkersTypes["Room_Bloom_refill"] = 7] = "Room_Bloom_refill";
    WorkersTypes[WorkersTypes["Room_Ripen_refill"] = 8] = "Room_Ripen_refill";
    WorkersTypes[WorkersTypes["Room_Fan"] = 9] = "Room_Fan";
    WorkersTypes[WorkersTypes["Room_Light"] = 10] = "Room_Light";
    WorkersTypes[WorkersTypes["Room_Nutrient_refill"] = 11] = "Room_Nutrient_refill";
})(WorkersTypes || (WorkersTypes = {}));
