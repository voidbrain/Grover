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

## Phisical high level structure

## Phisical low level connections

## BOM (Bill of Materials)

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

### Run command

## Manual operations

## Scheduled operations

## Alerts

## Machine Learning

## Settings

## conventions

### Fall/Autumn cycles

### Nutrients
