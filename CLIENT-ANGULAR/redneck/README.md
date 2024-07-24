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

<img alt="Logical Map" src="./public/documentation/images/logical_map.jpg" />

## Phisical high level structure

## Phisical low level connections

## Hardware peripherals

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

| Item                  | Quantity | Description                                 | Notes                           |
| :-------------------- | -------: | :------------------------------------------ | :------------------------------ |
| Raspberry Pi          |     1    |                                             | On field device                 |
| DS18B20               |     5    | Temperature sensor                          | 1 for each Pot, 1 for each Room |
|                       |     4    | pH sensor                                   | 1 for each Pot                  |
|                       |     4    | EC sensor                                   | 1 for each Pot                  |
|                       |     5    | Water level sensor                          | 1 for each Pot, 1 for each Room |
|                       |     5    | Peristaltic pump for  Water/Nutrient refill |                                 |



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

### GUI

## Flows

### Device start flow

### Run command flow

## Manual operations

## Scheduled operations

## Alerts

## Machine Learning

## Settings

### Operating modes

- Normal: fully operative;
- Silent: Actuators Off (exepted for Lights), Probes On;
- Off: Actuators Off, Probes Off;

## Conventions

### Spring/Fall cycles

- Spring cycle is 18h light, 6h dark;
- Spring cycle is 12h light, 12h dark;

### Nutrients

#### Doses

Nutrients, water and pH ideal levels based on the phase.

| Dose              | Water (L) | Grow (mL) | Micro (mL) | Bloom (mL) | Ripen (mL) | phDown (mL) |
| :---------------- | ----:     | --------: | ---------: | ---------: | ---------: | ----------: |
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
