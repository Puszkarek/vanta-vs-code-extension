# Vanta.js

**Vanta.js** (from Vantablack) is a TypeScript playground that lives inside your editor. It stares back at you with realtime execution results.

Unlike other playgrounds that require complex setup or external windows, Vanta runs right where you are. It supports your local environment, meaning your `node_modules` and `tsconfig.json` work out of the box.

## Features

- **Realtime Execution**: Code runs as you type (debounced).
- **Inline Logs**: `console.log` output appears directly next to your code.
- **Context Aware**: Uses your workspace's `node_modules` and `tsconfig.json` (if properly configured or detected).
- **Zero Config**: Just run it.

## Commands

- **Vanta: Absorb (Run in Current File)** (`vanta.runInCurrent`)
  - Absorbs the current file into the Vanta runtime.

- **Vanta: Singularity (Create New File)** (`vanta.createNew`)
  - Opens a new event horizon (`playground.ts`) for testing.


## Configuration

You can customize Vanta in your VS Code settings:

- `vanta.debounce`: Delay in milliseconds before running the playground after typing (default: `300`).
- `vanta.tsconfigPath`: Explicit path to your `tsconfig.json`. If left empty, Vanta tries to find it automatically.

## Requirements

- A workspace with a `package.json` and `node_modules` installed is recommended for full import support.
- Node.js installed in your environment.

## License

MIT
