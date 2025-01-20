# TOC-lang grammars

The syntax is based on [D2](https://d2lang.com), a tool for structral diagrams.

There are currently two grammars here, a PeggyJS parser is used to create the AST the drives diagramming. A Lezer grammar drives Syntax highlighting. Ther could be merged.

## Updating grammars

When updating the Lezer grammar, regenerate the parser code.

```sh
npm run gen
```

## Known differences

The Lezer grammar is not aware that labels can contain free text,
not just a quoted string.
