# Void

**Void** is a TypeScript playground that lives inside your editor. It stares back at you with realtime execution results.

Unlike other playgrounds that require complex setup or external windows, Void runs right where you are. It supports your local environment, meaning your `node_modules` and `tsconfig.json` work out of the box.

## Features

- **Realtime Execution**: Code runs as you type (debounced).
- **Inline Logs**: `console.log` output appears directly next to your code.
- **Context Aware**: Uses your workspace's `node_modules` and `tsconfig.json` (if properly configured or detected).
- **Zero Config**: Just run it.

## Commands

- **Void: Enter the Void (Current File)** (`void.runInCurrent`)
  - Attaches the playground to your currently active TypeScript/JavaScript file.
  - Useful for quick tests in an existing file.

- **Void: Summon Fresh Void (New File)** (`void.createNew`)
  - Creates a new `playground.ts` file in your workspace root and attaches the playground.
  - Perfect for scratchpad testing.

## Configuration

You can customize the Void in your VS Code settings:

- `void.debounce`: Delay in milliseconds before running the playground after typing (default: `300`).
- `void.tsconfigPath`: Explicit path to your `tsconfig.json`. If left empty, Void tries to find it automatically.

## Requirements

- A workspace with a `package.json` and `node_modules` installed is recommended for full import support.
- Node.js installed in your environment.

## License

MIT
