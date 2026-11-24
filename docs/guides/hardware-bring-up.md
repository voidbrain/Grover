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
  -d '{"roomId":"grow-1","potId":"pot-1","kind":"water_temperature","name":"Pot 1 temperature","enabled":true,"binding":{"driver":"ds18b20","address":"28-0123456789ab"}}'
```

Expected: `journalctl -u grover-agent -f` shows no `fault` lines after the config arrives.

## 3. Reads

```bash
curl -X POST localhost:8080/api/probes/water-temp/read
```

Expected: `{"ok":true,…,"value":<°C>}` close to a reference thermometer.

## 3b. Calibrate pH and EC

Analog pH and EC probes read volts until calibrated, and feeds will not use them. In Setup → the tent → Probes → Edit the pH probe → Calibration: rinse the probe, put it in buffer pH 7, **Read now**, enter `7`, **Add point**; rinse, buffer pH 4, **Read now**, enter `4`, **Add point**; choose the water temperature probe; **Save**. For EC: the calibration solution (e.g. 1.413 mS/cm at 25 °C, the value on the bottle), **Read now**, enter its value, **Add point**, **Save**. pH needs both buffers; the editor says when points cannot be saved. After moving a probe to another channel, calibrate it again (the old calibration is dropped).

Expected: back in buffer pH 7 and pH 4, **Read** gives 7 ± 0.1 and 4 ± 0.1; EC in the solution gives its value ± 0.1 mS/cm.

## 4. Switches

```bash
curl -X POST localhost:8080/api/actuators/light/switch -H 'content-type: application/json' -d '{"on":true}'
curl -X POST localhost:8080/api/actuators/light/switch -H 'content-type: application/json' -d '{"on":false}'
```

Expected: the relay clicks on and off. If it is inverted, set `"activeLow": true` in its binding.

## 4b. Pumps on an L298N (F-018)

A pump driven by an L298N motor bridge gets the wiring **L298N motor driver (pumps)** in Setup: the MCP23017's address, the expander pins wired to the bridge's IN1 and IN2, and EN (empty when the jumper on the board keeps it enabled). With the owner's go-ahead for this run, start each pump for 2 s (`{"durationMs":2000}`, as in step 5). Expected: it pumps forward (into the mixing tank, or from it into the pot) and stops; Stop all stops it at once. If it pumps backwards, swap its IN1 and IN2 pins in Setup (never the motor wires while powered). Record each pump in backlog F-018.

## 5. Pump calibration and caps

For each pump, run 10 s into a measuring jug:

```bash
curl -X POST localhost:8080/api/actuators/pump-grow/run -H 'content-type: application/json' -d '{"durationMs":10000}'
```

Then set `mlPerSecond` = measured mL ÷ 10 and a `maxRunMs` that cannot overfill the mixing tank or overdose one batch (30000 ms at ~1.5 mL/s is ~45 mL of nutrient). Expected: a 5 mL run (`{"ml":5}`) delivers 5 mL ± 10 %. Supply pumps pump into the mixing tank: empty it (or run a pot's feed pump) before the first feed.

## 5b. Levels and a first feed

For each tank level probe set its role and a low alert in Setup; for each pot its level probe and litres per cm. Then from the dashboard: **Preview feed** on one pot, check the batch, **Feed now**, and watch the mixing tank fill and empty and the pot level rise.

## 6. Safety on the device

```bash
curl -X POST localhost:8080/api/actuators/pump-water/run -H 'content-type: application/json' -d '{"durationMs":60000}'
sudo systemctl stop grover-agent     # while it runs
```

Expected: the pump stops at once. Start the agent again; it must come up with every output off. Repeat with `sudo systemctl stop grover-hub`: the agent keeps running its schedules and the pump still stops at its cap.

Record the results (date, which steps passed, measured flows) in F-003.
