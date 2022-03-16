export enum DevicesStatus {
  ON = 'ON',
  OFF = 'OFF',
}

export enum LogModes {
  true = 1,
  false = 0
}

export enum OperatingModes {
  Off = 1,
  Silent = 2,
  On = 3,
}

export enum Owner {
  schedule = 'schedule',
  user = 'user'
}

export enum Peripherals {
  Probe = 'PROBE',
  Worker = 'WORKER',
}

export enum Purposes {
  client = 1,
  worker = 2
}

export enum ProbesTypes {
  Air_temperature = 1,
  Water_temperature = 2,
  Water_level = 3,
  pH = 4,
  EC = 5,
}

export enum ServerPages {
  actuators = 'actuators',
  system = 'system',
}

export enum ServerCommands {
  RUN_WATER = 'RUN_WATER',
  RUN_PHDOWN = 'RUN_PHDOWN',
  RUN_DOSE = 'RUN_DOSE',
  SHUFFLE_PHDOWN = 'SHUFFLE_PHDOWN',
  SHUFFLE_DOSE = 'SHUFFLE_DOSE',

  READ = 'READ',
  ON = 'ON',
  OFF = 'OFF',
  LOG = 'LOG',

  START = 'START',
  SYS_LOG = 'SYS_LOG',
  SET_MODE = 'SET_MODE',
}


export enum WorkersTypes {
  Pot_Water_loop = 1,
  Pot_refill = 2,
  // Pot_Nutrient_refill = 3,
  // Pot_PHdown_refill = 4,

  Room_Water_refill = 3,
  Room_PhDown_refill = 4,
  // Room_Nutrient_refill = 7,
  Room_Gro_refill = 5,
  Room_Micro_refill = 6,
  Room_Bloom_refill = 7,
  Room_Ripen_refill = 8,
  Room_Fan = 9,
  Room_Light = 10,
}
