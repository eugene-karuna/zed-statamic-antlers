;; Comments
(antlers_comment) @comment

;; Tag delimiters
["{{" "}}"] @punctuation.bracket

;; Control structure keywords
(if_keyword) @keyword
(unless_keyword) @keyword
["elseif" "else" "/if" "/unless"] @keyword
(switch_statement "switch" @keyword)

;; Loop keywords
(collection_keyword) @keyword
(nav_keyword) @keyword
(taxonomy_keyword) @keyword
(form_keyword) @keyword
(entries_keyword) @keyword

;; Special tag keywords
["partial" "yield" "section" "scope" "asset" "glide" "dump"
 "user" "cache" "no_cache" "redirect" "session" "markdown"
 "oauth" "locales" "svg" "template_content" "slot" "push"
 "prepend" "once"] @keyword

;; PHP integration
(php_raw) @embedded
(php_echo) @embedded

;; Ignore/escape
(ignore_symbol) @comment

;; Boolean literals
["true" "false"] @constant.builtin
"void" @constant.builtin

;; Variables and identifiers
(variable) @variable
(parameter_name) @property
(modifier_name) @function

;; Modifiers
(applied_modifier) @function
(array_method_call) @function.method

;; Array method keywords
["orderby" "groupby" "where" "take" "skip" "merge" "pluck"] @function.builtin

;; Strings and literals
(string) @string
(double_quoted_string) @string
(single_quoted_string) @string
(string_escape_sequence) @string.escape
(number) @number

;; Comparison and logical operators
["==" "!=" "===" "!==" "<" ">" "<=" ">=" "<>" "&&" "||"] @operator
["and" "or" "xor" "bwa" "bwo" "bxor"] @operator

;; Arithmetic and assignment operators
["+" "-" "*" "/" "**" "%" "=" "+=" "-=" "*=" "/=" "%=" "?="] @operator

;; Null coalescing and ternary
"??" @operator
"?" @operator

;; Modifier pipe
"|" @operator

;; Unary
"!" @operator

;; Punctuation
["(" ")" "[" "]"] @punctuation.bracket
["," ":" ";" "."] @punctuation.delimiter

;; Interpolation
(interpolated_parameter) @embedded

;; Error highlighting
(ERROR) @error
