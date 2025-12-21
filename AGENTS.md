# AGENTS.md

TOC-Lang is a text-based notation tool for generating Theory of Constraints (TOC) diagrams including Goal Trees, Problem Trees (Current Reality Trees), and Evaporating Clouds (Conflict Resolution Diagrams).

## Project Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Code Style

- TypeScript/React with Vite
- ESLint for linting (`npm run lint`)
- Prettier for formatting (`npm run format`)

## Testing

### Running Tests

```bash
npm run test        # Run all tests once
npm run coverage    # Run tests with coverage
```

### Approval Testing

This project uses the [approvals](https://github.com/approvals/Approvals.NodeJS) library for snapshot-style testing. When tests that use `approvals.verifyAsJSON()` fail:

1. A `.received.txt` file is created alongside the `.approved.txt` file
2. Compare the `.received.txt` (actual output) with the `.approved.txt` (expected output)
3. If the new output is correct, rename `.received.txt` to `.approved.txt`
4. **Never commit `.received.txt` files** - they indicate test failures

Approval test files are located in `src/__tests__/` with the naming convention:
- `*.approved.txt` - Expected output (committed to repo)
- `*.received.txt` - Actual output from failing tests (not committed)

Example approval tests:
- `example problem tree.approved.txt`
- `parses ast for input with UDE and single cause.approved.txt`

## Grammar & Parsing

### PeggyJS Parser

The primary parser is defined using [PeggyJS](https://peggyjs.org/) in `src/assets/grammars/toc-lang.peggy`. This generates the AST used for diagram rendering.

Key grammar concepts:
- **Statements**: `nodeStatement`, `edgeStatement`, `commentLine`
- **Nodes**: `identifier: "label text" { params }`
- **Edges**: Support `<-`, `->`, and `--` (bidirectional) operators
- **AND relationships**: `a && b -> c` for multi-cause edges

Debug the grammar interactively at: https://peggyjs.org/online.html

The parser is loaded dynamically and generates AST with source location tracking (`labelRange` with `start`/`end` positions including `line`, `column`, and `offset`).

### Lezer Grammar (Syntax Highlighting)

A separate [Lezer](https://lezer.codemirror.net/) grammar (`src/assets/grammars/toc-lang.lezer`) powers CodeMirror syntax highlighting.

Regenerate the Lezer parser after grammar changes:
```bash
npm run gen
```

**Note**: The Lezer and PeggyJS grammars have minor differences. The Lezer grammar doesn't fully handle unquoted free-text labels.

## Architecture

### Key Files

- `src/interpreter.ts` - Parser and AST processing, semantic analysis
- `src/assets/grammars/toc-lang.peggy` - PeggyJS grammar definition
- `src/assets/grammars/toc-lang.lezer` - Lezer grammar for syntax highlighting
- `src/examples.ts` - Example diagram source code
- `src/__tests__/` - Test files including approval tests

### Diagram Types

Each diagram type (`type: problem`, `type: goal`, `type: conflict`) uses:
- Same PeggyJS grammar for parsing
- Different semantic interpretation functions:
  - `parseGoalTreeSemantics()` - Goal trees with CSF annotations
  - `parseProblemTreeSemantics()` - Problem trees with UDE/FOL/DE annotations
  - Cloud diagrams use the raw AST

### Node Annotations

- **Goal Tree**: `G` (Goal), `CSF` (Critical Success Factor)
- **Problem Tree**: `UDE` (Undesirable Effect), `FOL` (Fact of Life), `DE` (Desirable Effect)

## Common Tasks

### Adding a New Node Type

1. Update the semantic parser in `interpreter.ts`
2. Add corresponding rendering in `svgGen.tsx`
3. Add test cases in `__tests__/`

### Modifying the Grammar

1. Edit `toc-lang.peggy` for parsing changes
2. Edit `toc-lang.lezer` for highlighting changes
3. Run `npm run gen` to regenerate Lezer parser
4. Update tests and approval files

### Source Location Tracking

The parser tracks source locations for node labels via `labelRange`. This enables features like `updateLabel()` which can surgically update label text in the source while preserving other content.
