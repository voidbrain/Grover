# Pump wiring through the L298N

Owner check: write down how each pump is wired, so the `l298n` binding (to be built, F-018) can be set up. Nothing is switched on; look at the rig **with the Pi powered off**.

For each pump, follow the two input wires (IN1, IN2, and EN if it is wired rather than jumpered) of its L298N channel back to the MCP23017 and note the chip's address (the A0–A2 jumpers, 0x20–0x27) and the pin names (GPA0–GPA7, GPB0–GPB7).

Copy this table into the record (or a reply) and fill it in:

| Pump | MCP23017 address | IN1 pin | IN2 pin | EN pin or "jumper" |
|---|---|---|---|---|
| water | | | | |
| grow | | | | |
| micro | | | | |
| bloom | | | | |
| ripen | | | | |
| pH down | | | | |
| pot 1 feed | | | | |
| pot 1 loop | | | | |
| pot 2 feed | | | | |
| pot 2 loop | | | | |
| pot 3 feed | | | | |
| pot 3 loop | | | | |
| pot 4 feed | | | | |
| pot 4 loop | | | | |

Expected: one row per pump you have, every pin named once. A pin that appears twice, or a pump wired through a relay instead, is worth saying: it changes the binding.
