# Statamic Antlers Toolbox for Zed

Enhanced syntax highlighting and language server support for [Statamic](https://statamic.com)'s [Antlers](https://statamic.dev/antlers) templating language in [Zed](https://zed.dev).

Fork of [statamic-antlers](https://github.com/mynetx/zed-statamic-antlers) by Joachim Rütter.

## Features

- ~95% Antlers syntax coverage via custom [tree-sitter grammar](https://github.com/eugene-karuna/tree-sitter-antlers)
- Language server support via [antlers-language-server](https://github.com/Stillat/vscode-antlers-language-server)
- Control structures: `if`/`elseif`/`else`, `unless` (with `else`), `switch`
- Loops: `collection`, `nav`, `taxonomy`, `form`, `entries`, `loop`, `search`
- Tags: `partial`, `yield`, `section`, `scope`, `slot`, `push`, `prepend`, `stack`, `cache`, `noparse`, `once`, and more
- Expressions: ternary, short ternary (`?:`), null coalescing (`??`), arrow functions, array literals, regex matching
- Modifiers with pipe syntax and function-call syntax
- `$variable` prefix disambiguation
- PHP integration (`{{? ?}}` and `{{$ $}}`)
- Antlers comments (`{{# #}}` and `{{!-- --}}`)
- Bracket matching, auto-indentation, HTML injection

## Get Emmet to work

Edit your `~/Library/Application\ Support/Zed/extensions/installed/emmet/extension.toml` accordingly:

```toml
[language_servers.emmet-language-server]
language = "HTML"
languages = ["HTML", "PHP", "ERB", "JavaScript", "TSX", "CSS", "Statamic Antlers"]

[language_servers.emmet-language-server.language_ids]
TSX = "typescriptreact"
HTML = "html"
PHP = "php"
JavaScript = "javascriptreact"
CSS = "css"
ERB = "eruby"
"Statamic Antlers" = "antlers"
```

## Credits

This extension uses:

- [eugene-karuna/tree-sitter-antlers](https://github.com/eugene-karuna/tree-sitter-antlers) for syntax highlighting (fork of [Robertsson/tree-sitter-antlers](https://github.com/Robertsson/tree-sitter-antlers))
- [Stillat/vscode-antlers-language-server](https://github.com/Stillat/vscode-antlers-language-server) for the language server
- Based on [mynetx/zed-statamic-antlers](https://github.com/mynetx/zed-statamic-antlers) by Joachim Rütter

Contributions are welcome!
