export enum OperatingModes {
  Off = 1,
  Silent = 2,
  On = 3,
}

export enum LogModes {
  true = 1,
  false = 0
}

export enum Purposes {
  client = 1,
  worker = 2
}

export enum Owner {
  schedule = 'schedule',
  user = 'user'
}

export enum Environments {
  room = 'room',
  location = 'location'
}

export enum Peripherals {
  Probe = 1,
  Worker = 2,
}

export enum ProbesTypes {
  Air_temperature = 1,
  Water_temperature = 2,
  Water_level = 3,
  pH = 4,
  EC = 5,
}

export enum WorkersTypes {
  Fan = 1,
  Water_loop = 2,
  Pot_refill = 3,
  Nutrient_refill = 4,
  PHdown_refill = 5,
  Light = 6,
  Room_Water_refill = 7,
  Room_PhDown_refill = 8,
  Room_Nutrient_refill = 9,
  Room_Gro_refill = 10,
  Room_Micro_refill = 11,
  Room_Bloom_refill = 12,
  Room_Ripen_refill = 13,
}

export enum ServerPages {
  actuators = 'actuators',
  system = 'system',
}

export enum ServerCommands {
  RUN_WATER = 'RUN_WATER',
  RUN_PHDOWN = 'RUN_PHDOWN',
  RUN_DOSE = 'RUN_DOSE',
  READ = 'READ',
  ON = 'ON',
  OFF = 'OFF',

  SYS_LOG = 'SYS_LOG',
  SET_MODE = 'SET_MODE',
  START = 'START',
  LOG = 'LOG',

  RUN_WATER_TEST = 'RUN_WATER_TEST',
  RUN_SINGLE_TEST = 'RUN_SINGLE_TEST',
}
