# Which water-level sensor replaces the HC-SR04

Decision for the owner. The old build timed two-pin ultrasonic sensors (HC-SR04 style); Node on the Pi cannot time their echo reliably, so the agent needs a level sensor it can read another way. The rig has up to 11 levels to read: six supply tanks, the mixing tank and four pots.

## Options

1. **Analog sensor through the ADS1115** (for example a submersible pressure sensor or a resistive strip with a 0–3.3 V output). The `ads1115` binding exists; volts become centimetres with a two-point calibration like the pH and EC probes. One ADS1115 reads four channels and up to four share the I²C bus (16 channels), shared with the pH and EC probes. Each sensor sits in the liquid.
2. **I²C distance sensor** (for example a time-of-flight module) looking down at the surface, like the HC-SR04 did. Needs a new driver and usually an address per sensor or an I²C multiplexer. Nothing touches the liquid; foam and condensation can disturb it.
3. **Float switches on GPIO or the MCP23017** (low and high marks only, no centimetres). Simplest wiring; the feed planner then knows only "enough / low / full", which is too coarse for dosing water by level.

Mixing them is possible (for example 1 for the mixing tank and pots, 3 for the supply tanks' low mark).

## What happens next

The agent builds the driver for the chosen option (option 1 needs only the calibration of volts to centimetres) and adds it to the hardware bring-up. Answer in the backlog record F-003 (step F-003-T01) with the option (or mix) and the part you plan to buy.
