# Hardware bring-up

Steps for F-003: the first run of the agent's real drivers on the Raspberry Pi. Every step runs **on the Pi**, with the hub and agent installed as in the README ("Deploying on a Raspberry Pi"). Keep the reservoir pumps' outlets in a measuring jug until step 5 is done.

## 1. Buses are visible

```bash
ls /sys/bus/w1/devices/        # one 28-xxxxxxxxxxxx folder per DS18B20
sudo i2cdetect -y 1            # ADS1115 at 0x48 (or as wired), MCP23017 at 0x20–0x27
pinctrl get 17                 # any GPIO you bound: prints its mode and level
```

Expected: every sensor and chip you wired shows up. A missing one is a wiring fault: fix it before going on.

## 2. Bindings in the hub

For each probe and actuator, `PUT /api/probes/<id>` / `PUT /api/actuators/<id>` with its real binding (shapes in `packages/contracts/src/domain.ts`), for example:

```bash
curl -X PUT localhost:8080/api/probes/water-temp -H 'content-type: application/json' \
  -d '{"roomId":"grow-1","potId":null,"kind":"water_temperature","name":"Reservoir temperature","enabled":true,"binding":{"driver":"ds18b20","address":"28-0123456789ab"}}'
```

Expected: `journalctl -u grover-agent -f` shows no `fault` lines after the config arrives.

## 3. Reads

```bash
curl -X POST localhost:8080/api/probes/water-temp/read
```

Expected: `{"ok":true,…,"value":<°C>}` close to a reference thermometer. Analog pH/EC probes return **volts** until F-004 adds calibration: record the volts in pH 4 / pH 7 and in the EC calibration solution.

## 4. Switches

```bash
curl -X POST localhost:8080/api/actuators/light/switch -H 'content-type: application/json' -d '{"on":true}'
curl -X POST localhost:8080/api/actuators/light/switch -H 'content-type: application/json' -d '{"on":false}'
```

Expected: the relay clicks on and off. If it is inverted, set `"activeLow": true` in its binding.

## 5. Pump calibration and caps

For each pump, run 10 s into a measuring jug:

```bash
curl -X POST localhost:8080/api/actuators/pump-grow/run -H 'content-type: application/json' -d '{"durationMs":10000}'
```

Then set `mlPerSecond` = measured mL ÷ 10 and a `maxRunMs` that cannot overdose the reservoir (for 20 L of nutrient, 30000 ms at ~1.5 mL/s is ~45 mL). Expected: a 5 mL run (`{"ml":5}`) delivers 5 mL ± 10 %.

## 6. Safety on the device

```bash
curl -X POST localhost:8080/api/actuators/pump-water/run -H 'content-type: application/json' -d '{"durationMs":60000}'
sudo systemctl stop grover-agent     # while it runs
```

Expected: the pump stops at once. Start the agent again; it must come up with every output off. Repeat with `sudo systemctl stop grover-hub`: the agent keeps running its schedules and the pump still stops at its cap.

Record the results (date, which steps passed, measured flows) in F-003.
