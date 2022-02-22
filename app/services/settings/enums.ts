export enum OperatingModes {
  On = 1,
  Off = 2,
  Silent = 3
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
};

export enum Actions {
  read = 'read',
  execute = 'execute'
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
  Water_refill = 3,
  Nutrient_refill = 4,
  PHdown_refill = 5,
  Light = 6,
  Room_Water_refill = 7,
}

export enum ServerPages {
  actuators = 'actuators',
  system = 'system',
}

export enum ServerCommands {
  RUN = 'RUN',
  READ = 'READ',
  ON = 'ON',
  OFF = 'OFF',

  SYS_LOG = 'SYS_LOG',
  SET_MODE = 'SET_MODE',
}
