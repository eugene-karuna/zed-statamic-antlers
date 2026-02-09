# Statamic Antlers Toolbox — Project Summary

## What We Built

A **Zed editor extension** called "Statamic Antlers Toolbox" that provides syntax highlighting and language server support for [Statamic](https://statamic.com)'s [Antlers](https://statamic.dev/antlers) templating language.

We forked a broken existing extension and rewrote most of it from scratch.

---

## The Three Repositories

There are **3 GitHub repos** involved. Here's how they connect:

```
┌─────────────────────────────────────────────┐
│  zed-industries/extensions                  │
│  (Zed's official extension registry)        │
│                                             │
│  Has a submodule pointing to ↓              │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  eugene-karuna/zed-statamic-antlers         │
│  (YOUR extension repo)                      │
│                                             │
│  Contains:                                  │
│  - extension.toml (extension manifest)      │
│  - src/lib.rs (Rust code for lang server)   │
│  - languages/antlers/ (highlighting rules)  │
│  - Cargo.toml (Rust build config)           │
│                                             │
│  extension.toml points grammar to ↓         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  eugene-karuna/tree-sitter-antlers          │
│  (YOUR grammar repo)                        │
│                                             │
│  Contains:                                  │
│  - grammar.js (language rules definition)   │
│  - src/scanner.c (custom keyword scanner)   │
│  - src/parser.c (generated parser)          │
│  - src/tree_sitter/ (header files)          │
│                                             │
│  This is what Zed downloads & compiles      │
│  to understand Antlers syntax               │
└─────────────────────────────────────────────┘
```

### 1. `eugene-karuna/zed-statamic-antlers` — The Extension
**URL:** https://github.com/eugene-karuna/zed-statamic-antlers
**What it is:** The Zed extension itself. This is what users install.
**Key files:**
- `extension.toml` — Tells Zed the extension name, version, where to find the grammar, etc.
- `src/lib.rs` — Rust code that downloads and runs the Antlers language server (provides autocomplete, error checking)
- `languages/antlers/highlights.scm` — Maps grammar nodes to colors (e.g. "keywords are blue, strings are green")
- `languages/antlers/indents.scm` — Auto-indentation rules
- `languages/antlers/brackets.scm` — Bracket pair matching
- `languages/antlers/config.toml` — File associations (`.antlers.html`, `.antlers.php`)
- `languages/antlers/injections.scm` — Tells Zed that HTML lives inside Antlers templates

### 2. `eugene-karuna/tree-sitter-antlers` — The Grammar
**URL:** https://github.com/eugene-karuna/tree-sitter-antlers
**What it is:** A [tree-sitter](https://tree-sitter.github.io/) grammar that teaches Zed how to *parse* Antlers code into a syntax tree.
**Key files:**
- `grammar.js` — The grammar definition (what `{{ if }}`, `{{ collection:articles }}`, etc. look like)
- `src/scanner.c` — Custom C code for tricky keywords that can't be handled by grammar.js alone
- `src/parser.c` — Auto-generated C parser (generated from grammar.js by `tree-sitter generate`)

**How it works:** When you open an `.antlers.html` file in Zed, it downloads this repo, compiles `parser.c` + `scanner.c` into a parser, and uses it to understand the structure of your code. The `highlights.scm` file in the extension then maps that structure to colors.

### 3. `zed-industries/extensions` — The Marketplace Registry
**URL:** https://github.com/zed-industries/extensions
**What it is:** The official list of all Zed extensions. Every published extension is a git submodule in this repo.
**Your fork:** https://github.com/eugene-karuna/extensions
**What we did:** Added your extension as a submodule and entry in `extensions.toml`, then opened a PR.

---

## How Zed Extensions Work (The Flow)

```
User installs "Statamic Antlers Toolbox" in Zed
        │
        ▼
Zed reads extension.toml from zed-statamic-antlers
        │
        ├──► Compiles src/lib.rs → WASM plugin
        │    (this handles the language server)
        │
        ├──► Clones tree-sitter-antlers at the specified commit
        │    Compiles parser.c + scanner.c → grammar parser
        │
        └──► Loads languages/antlers/*.scm query files
             (highlights, indents, brackets, injections)
        │
        ▼
User opens a .antlers.html file
        │
        ├──► Grammar parser builds a syntax tree from the code
        ├──► highlights.scm maps tree nodes → colors
        ├──► Language server provides autocomplete + diagnostics
        └──► Everything just works ✨
```

---

## What Was Wrong With the Original

The original extension (`mynetx/zed-statamic-antlers`) was broken:

1. **Cargo.toml had `edition = "2024"`** — This doesn't exist in Rust, so it couldn't compile
2. **Grammar referenced a scaffolding-only commit** — The tree-sitter-antlers repo it pointed to had barely any grammar
3. **highlights.scm used invalid node types** — Referenced nodes like `"if"` and `"unless"` that didn't exist in the grammar
4. **Tree-sitter grammar had bugs** — The scanner.c used broken `TSLexer` copy/restore patterns; `if/elseif/else` chains didn't parse correctly

---

## What We Fixed / Built

### Extension fixes:
- Fixed `edition = "2021"` in Cargo.toml
- Rewrote `highlights.scm` using only valid node types
- Added `indents.scm` for auto-indentation
- Updated `brackets.scm`
- Added `.antlers.php` file support

### Grammar rewrites (tree-sitter-antlers):
- Rewrote `scanner.c` from scratch (removed broken TSLexer patterns)
- Added `word: $ => $.identifier` for keyword disambiguation
- Restructured `if_statement` to use recursive `_if_body` rule (fixed elseif chains)
- Added ~95% of Antlers syntax coverage:
  - `null` literal, array literals, arrow functions
  - `$variable` prefix, `unless` with `else`, short ternary `?:`
  - Spaceship `<=>`, regex `~` operators
  - `noparse`, `loop`, `search`, `route`, `link`, `obfuscate`, `dd`, `404`, `stack` tags
  - Tag pair forms for `partial`, `yield`, `slot`, `asset`, `glide`, `session`, `user`, `locales`
  - Array method call parameters
  - Default switch case `() => value`

### Marketplace preparation:
- Renamed to "Statamic Antlers Toolbox" (`statamic-antlers-toolbox`)
- Cleaned up repo (removed duplicate grammar files)
- Updated README, LICENSE, extension.toml
- Opened PR to `zed-industries/extensions`

---

## Key Concepts Glossary

| Term | What it means |
|------|--------------|
| **Tree-sitter** | A parser generator tool. You write a `grammar.js` that describes a language, and it generates a fast C parser. Zed uses tree-sitter for all syntax highlighting. |
| **grammar.js** | The file that defines the language rules (what valid Antlers syntax looks like). Written in JavaScript DSL. |
| **scanner.c** | Custom C code for things grammar.js can't handle (like context-sensitive keywords). Called an "external scanner". |
| **parser.c** | Auto-generated from grammar.js by running `tree-sitter generate`. Don't edit by hand. |
| **highlights.scm** | A query file that maps syntax tree nodes to highlight groups (keyword, string, variable, etc.). Written in S-expression syntax. |
| **extension.toml** | The manifest file for a Zed extension. Declares name, version, grammar source, language servers. |
| **WASM** | WebAssembly. Zed compiles extension Rust code to WASM so it runs sandboxed inside the editor. |
| **Language Server (LSP)** | A background process that provides autocomplete, error checking, go-to-definition. Our extension uses the Antlers language server from the VS Code extension. |
| **`zed-industries/extensions`** | The GitHub repo that acts as Zed's extension marketplace. Extensions are added via PR as git submodules. |

---

## Local Development

To make changes and test locally:

```bash
# Edit grammar
cd /Users/karuna/Workspace/Projects/Zed/tree-sitter-antlers
# Edit grammar.js, then:
npx tree-sitter generate
git add -A && git commit -m "description" && git push origin main

# Update extension to use new grammar commit
cd /Users/karuna/Workspace/Projects/Zed/zed-statamic-antlers
# Update commit hash in extension.toml to match new tree-sitter-antlers commit
# Edit highlights.scm / indents.scm if you added new node types
git add -A && git commit -m "description" && git push origin main

# Test in Zed
# Zed → Command Palette → "Install Dev Extension" → select zed-statamic-antlers folder
# Delete grammars/antlers/ if grammar doesn't update (cached)

# Publish update
# In your fork of zed-industries/extensions:
cd extensions/statamic-antlers-toolbox && git pull origin main && cd ../..
# Bump version in extensions.toml
# pnpm sort-extensions
# Commit, push, open PR
```
