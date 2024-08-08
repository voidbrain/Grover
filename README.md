# Grover/Redneck

Grover/Redneck is a complete automation solution for smart growing at home, composed by:

- A device operating on the field. Node.js App running on a Raspberry. Rpi + various sensors + various actuators;
- A server online. PHP + MySQL for public endpoint and data storage;
- A client on web/local for device remote management, data anagraphic management and graphs. Built in Angular 18;

## Software Build

Execute the instructions in the root directories of project components:

### Device

Node.js is required

```shell
# Install the dependencies from NPM:
npm install
# Build source code 
npm build
```

### Client

Node.js is required

```shell
# Install the dependencies from NPM:
npm install
# Build source code 
npm build
```

### Server

PHP/MySQL is required

```shell
# Install the dependencies from NPM:
npm install
# Build source code 
npm build
```

## Logical structure

![Logical](./documentation/img/logical map.png)

## Phisical high level structure

## Phisical low level connections

## Hardware

### Power lines

Right after Power line input jack (12V), a l298n is used to split voltage between:

- 12V
- 5V
- GND

Peristaltic pumps are connected to the 12V.
The 5V and Ground are used to connect the Raspberry Pi and other 5V peripherals ().
Raspberry Pi 3V Pin is connected to a line to power 3V peripherals ().

### I2C extender

Due the limited number of pins on the Raspberry Pi, 4 I2C extenders are used to cover all needed connections.

### Fluids flow

Nutrients and ph levels vary based on the actual phase and probes reads, for this reason the mixing and feeding is executed JIT.
This requires 4 pumps for the nutrients, 1 for water, 1 for pHdown + a temporary reservoir + 4 pumps for the pots.

Flow steps are:

- step 1) nutrients + pHdown + water to the temporary reservoir;
- step 2) from the temporary reservoir to the designated pot;

### Probes

Probes types

| Type              | um | minAcceptableValue | maxAcceptableValue |
| :---------------- | :- | -----------------: | -----------------: |
| Air_temperature   | °C | 0                  | 50                 |
| Water_temperature | °C | 0                  | 50                 |
| Water_level       | cm | 0                  | 100                |
| pH                | pH | 5                  | 7                  |
| EC                | EC | 0                  | 3                  |

Probes list

| Field         | Notes                                 |
| :------------ | :------------------------------------ |
| id            |                                       |
| locationId    |                                       |
| probeType     |                                       |
| enabled       |                                       |
| deleted       |                                       |
| lastUpdate    |                                       |
| address       | Used for probes types 1,2 (DS18B20)   |
| pin1          | Used for probes types 3 (Water_level) |
| pin2          | Used for probes types 3 (Water_level) |
| i2cAddress    | Used for probes types 3 (Water_level) |

### Actuators

| Type                  | Default duration (ms) |
| :-------------------- | :-------------------: |
| Pot_Water_loop        |                       |
| Pot_refill            |       1000            |
| Pot_Nutrient_refill   |       1000            |
| Pot_PHdown_refill     |       1000            |
| Room_Water_refill     |       1000            |
| Room_Nutrient_refill  |       1000            |
| Room_PhDown_refill    |       1000            |
| Room_Gro_refill       |       1000            |
| Room_Micro_refill     |       1000            |
| Room_Bloom_refill     |       1000            |
| Room_Ripen_refill     |       1000            |
| Room_Fan              |                       |
| Room_Light            |                       |

## BOM (Bill of Materials)

(1 room = 4 pots)

| Item                  | Quantity | Description                                 | Notes                                 |
| :-------------------- | -------: | :------------------------------------------ | :------------------------------------ |
| Raspberry Pi          |     1    |                                             | On field device                       |
| DS18B20               |     5    | Temperature sensor                          | 1 for each Pot + 1 for each Room      |
|                       |     4    | pH sensor                                   | 1 for each Pot                        |
|                       |     4    | EC sensor                                   | 1 for each Pot                        |
|                       |     5    | Water level sensor                          | 1 for each Pot + 1 for each Room      |
|                       |    10    | Peristaltic pump for  Water/Nutrient refill | N1, N2, N3, N4, W, pH, P1, P2, P3, P4 |
| l298n                 |     5    | Motor driver for Peristaltic pump2          | 1 for every 2 pumps                   |
| MCP23017              |     3    | I2C extender                                | Every one                             |

## APIs section

### Server APIs

- Anagraph CRUD operations (Client as client);
- Status updates (Device as client);
- Run commands (Device as client);

### Device APIs

- Read probes (Server as relay from client)
- Run actuators (Server as relay from client)
- Get/Set status (Server as relay from client)

## Client details

### offline mode

- If Client goes offline it will show the last data that were synced.
Anagraphic can still be updated offline and will be synced when back online.
Action buttons are disabled,
- If Device goes offline it will operate based on last synced status and schedule.
Logs of reads/executions are stored offline and will be synced when back online.
- If Server goes offline Client and Device cannot communicate, they will operate as offline.

### GUI

## API Commands

### From Client

### Anagraph

<https://www.voidbrain.net/temp/grover/ajax/moduli/api/client/{table}?lastUpdate={lastUpdate}>
(
'calendars',
'doses',
'pots',
'growing_mediums',
'growing_scenarios',
'plants',
'companies',
'strains',
'settings',
'locations',
'rooms',
'operating_modes',
'probes_list',
'probes_log',
'probes_schedule',
'probes_type',
'workers_list',
'workers_log',
'workers_schedule',
'workers_type'
)

### Commands

From Client to Device (using stored ${ip}:${port})
remoteDeviceExecute(ip: string, port: string, page: string, action: string, id: number, type: string, duration: number)
http://${ip}:${port}/${page}?action=${action}&duration=${duration}&id=${id}&type=${type}

http://151.51.241.133:8084/actuators?action=READ&duration=undefined&id=1&type=probe

| Commands          |                                                                                      | Notes                           |
| :---------------- | :----------------------------------------------------------------------------------- | :------------------------------ |
| RUN_WATER         | http://${ip}:${port}/actuators?action=RUN_WATER&duration=1000&id=${id}&type=worker   |                                 |
| RUN_PHDOWN        | http://${ip}:${port}/actuators?action=RUN_PHDOWN&duration=1000&id=${id}&type=worker  |                                 |
| RUN_DOSE          | http://${ip}:${port}/actuators?action=RUN_DOSE&duration=1000&id=${id}&type=worker    |                                 |
| SHUFFLE_PHDOWN    |                                                                                      |                                 |
| SHUFFLE_DOSE      |                                                                                      |                                 |
| READ              | http://${ip}:${port}/actuators?action=READ&id=${id}&type=probe                       |                                 |
| ON                | http://${ip}:${port}/actuators?action=ON&id=${id}&type=worker                        |                                 |
| OFF               | http://${ip}:${port}/actuators?action=OFF&id=${id}&type=worker                       |                                 |
| SET_STATUS        |                                                                                      |                                 |
| LOG               |                                                                                      |                                 |
| START             |                                                                                      |                                 |
| SYS_LOG           |                                                                                      |                                 |
| SET_MODE          | http://${ip}:${port}/system?action=SET_MODE&mode=2                                   | Normal = 1, Silent = 2, Off = 3 |

### From Device

https://www.voidbrain.net/temp/grover/ajax/moduli/api/worker/workers_schedule?lastUpdate={lastUpdate}&action=read&serialNumber={serialNumber}

(table, lastUpdate, 'read', this.serialNumber)

## Flows

![Fluxes](./documentation/img/fluxes.png)

The connection between Device and Server is granted by the Device SN, connected to a Room.
Every time that the Device calls a Server API, it passes the SN and the IP is stored/updated.
Every time that the Servers needs to call the Device, it uses the last IP to call the Device API.
A START command is executed everytime the device starts to ensure to update the IP address.
Device internal webserver port is. Internal network needs to forward port 8084:8084.

### Device start flow

### Run command flow

## Scheduler

There are two tipes of events:

- From_To = 1;
- At = 2;

Probes and actuators acts different:

- Probes reads = "At": at dateTime
- Actuators not connected to Probes (light, water loop, fan) = "From_To": from dateTime; to dateTime
- Actuators connected to Probes (waterRefill, phDown, nutrimentRefill) = just in case, triggered by a Probe read. Duration is calculated (Machine Learning section).

### Scheduled/Manual operations

System normally works based on the scheduled tasks.
User can manually set the working_mode, turn ON and OFF light and fan, execute probes reads, and run refill commands from the client app.

## Alerts

## Machine Learning

- pH is affected by nutrients (goes up) and change during time (goes up).
If pH is higher than ideal range, add pHdown, If pH is lower than ideal range, do nothing.

- EC is affected by nutrients (goes up) and change during time (goes down).
If EC is lower than ideal range, add nutrients. If EC is higher than ideal range, do nothing.

A simple ML model runs on the device to calculate every time the needed quantity of nutrients and pHdown.
Every new read and execution is logged and ML is retrained on the data to optimize the algorithm.

## Settings

### Operating modes

- Normal = 1: fully operative;
- Silent = 2: Actuators Off (exepted for Lights), Probes On;
- Off = 3: Actuators Off, Probes Off;

## Conventions

### Spring/Fall cycles

- Spring cycle is 18h light, 6h dark;
- Spring cycle is 12h light, 12h dark;

### Nutrients

#### Doses

Nutrients, water and pH ideal levels based on the phase.

| Dose (mL/10L)     | Water (L) | Grow (mL) | Micro (mL) | Bloom (mL) | Ripen (mL) | phDown (mL) |
| :---------------- | --------: | --------: | ---------: | ---------: | ---------: | ----------: |
| Seedling          |   10      | 5         | 5          | 5          | 0          | 1           |
| Veg Growth        |   10      | 18        | 12         | 6          | 0          | 1           |
| Early Bloom       |   10      | 20        | 20         | 15         | 0          | 1           |
| Late Bloom        |   10      | 8         | 16         | 24         | 0          | 1           |
| Ripen             |   10      | 0         | 0          | 0          | 50         | 1           |

#### Phases

Phases order and duration.
Min/max levels for EC, pH, Temp and WaterLevel based on the phase.

| Phase             | Duration (days) | Pos | isBlooming | isFlushing | minEC | maxEC | minPH | maxPH | minTemp (°C) | maxTemp (°C) | minWaterLevel (cm) | maxWaterLevel (cm) |
| :---------------- | --------------: | --: | :--------: | :--------: | ----: | ----: | ----: | ----: | -----------: | -----------: | -----------------: | -----------------: |
| Seedling          |   14            | 1   |  false     |  false     | 0.3   | 1.2   | 5.5   | 5.7   | 15           | 35           | 10                 | 90                 |
| Veg Growth        |   28            | 2   |  false     |  false     | 1.3   | 1.8   | 5.5   | 6.0   | 15           | 35           | 10                 | 90                 |
| Early Bloom       |   14            | 3   |  true      |  false     | 1.8   | 2.0   | 5.7   | 6.0   | 15           | 35           | 10                 | 90                 |
| Late Bloom        |   42            | 4   |  true      |  false     | 1.4   | 2.2   | 5.7   | 6.2   | 15           | 35           | 10                 | 90                 |
| Ripen             |   14            | 5   |  true      |  true      | 1.6   | 2.6   | 6.0   | 6.4   | 15           | 35           | 10                 | 90                 |

![Doses](./documentation/img/Doses Flux.png)
