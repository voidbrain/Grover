<!-- Written by tools/coverage-table.mjs from the coverage summary: run the tests with coverage, then the script. -->

# Code coverage

How much of the code the unit tests run, per folder. It says what ran, not that the behaviour is checked; branches say the most. A table to find untested parts, never a number to hit: CI reports fresh coverage; optional enforcement fails regressions against the main-branch baseline.

| Folder | Files | Lines | Statements | Branches | Functions |
|---|---|---|---|---|---|
| `packages/contracts/src/` | 13 | 100.0 % | 100.0 % | 93.6 % | 99.1 % |
| `apps/hub/src/` | 19 | 96.4 % | 96.4 % | 86.3 % | 90.2 % |
| `apps/agent/src/` | 9 | 88.5 % | 88.5 % | 91.1 % | 85.2 % |
| **all** | 41 | 95.8 % | 95.8 % | 89.0 % | 90.7 % |

## Files no unit test runs

- `apps/agent/src/`: `config.ts`, `main.ts`, `drivers/types.ts`
