<!-- Written by tools/coverage-table.mjs from the coverage summary: run the tests with coverage, then the script. -->

# Code coverage

How much of the code the unit tests run, per folder. It says what ran, not that the behaviour is checked; branches say the most. A table to find untested parts, never a number to hit: CI reports fresh coverage; optional enforcement fails regressions against the main-branch baseline.

| Folder | Files | Lines | Statements | Branches | Functions |
|---|---|---|---|---|---|
| `packages/contracts/src/` | 7 | 100.0 % | 100.0 % | 95.8 % | 100.0 % |
| `apps/hub/src/` | 12 | 91.8 % | 91.8 % | 75.0 % | 80.8 % |
| `apps/agent/src/` | 8 | 73.6 % | 73.6 % | 77.8 % | 82.8 % |
| **all** | 27 | 88.6 % | 88.6 % | 78.5 % | 83.4 % |

## Files no unit test runs

- `apps/hub/src/`: `main.ts`
- `apps/agent/src/`: `config.ts`, `main.ts`, `drivers/hardware.ts`, `drivers/types.ts`
