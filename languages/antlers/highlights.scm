;; Comments
(antlers_comment) @comment

;; Tag delimiters
["{{" "}}"] @punctuation.bracket

;; Control structure keywords
(if_keyword) @keyword
(unless_keyword) @keyword
["elseif" "else" "/if" "/unless"] @keyword
(switch_statement "switch" @keyword)
(switch_tag "switch" @keyword)

;; Loop keywords
(collection_keyword) @keyword
(nav_keyword) @keyword
(taxonomy_keyword) @keyword
(form_keyword) @keyword
(entries_keyword) @keyword

;; Special tag keywords
["partial" "yield" "section" "scope" "asset" "glide" "dump" "dd"
 "user" "cache" "no_cache" "redirect" "session" "markdown"
 "oauth" "locales" "svg" "template_content" "slot" "push"
 "prepend" "once" "noparse" "loop" "search" "route" "link"
 "obfuscate" "stack" "form" "errors"] @keyword

;; 404 tag
(not_found_tag "404" @keyword)

;; PHP integration
(php_raw) @embedded
(php_echo) @embedded

;; Ignore/escape
(ignore_symbol) @comment

;; Boolean literals
["true" "false"] @constant.builtin
"void" @constant.builtin

;; Null literal
(null_literal) @constant.builtin

;; Variables and identifiers
(variable) @variable
(prefixed_variable) @variable
(parameter_name) @property
(modifier_name) @function

;; Arrow function parameter
(arrow_function parameter: (simple_variable) @variable.parameter)
"=>" @operator

;; Modifiers
(applied_modifier) @function
(array_method_call) @function.method

;; Array method keywords
["orderby" "groupby" "where" "take" "skip" "merge" "pluck"] @function.builtin

;; Recursive pattern
"*recursive" @keyword
"children" @keyword

;; Strings and literals
(string) @string
(double_quoted_string) @string
(single_quoted_string) @string
(string_escape_sequence) @string.escape
(number) @number

;; Array literals
(array_literal "[" @punctuation.bracket)
(array_literal "]" @punctuation.bracket)

;; Comparison and logical operators
["==" "!=" "===" "!==" "<" ">" "<=" ">=" "<>" "<=>" "&&" "||"] @operator
["and" "or" "xor" "bwa" "bwo" "bxor"] @operator

;; Regex operator
"~" @operator

;; Arithmetic and assignment operators
["+" "-" "*" "/" "**" "%" "=" "+=" "-=" "*=" "/=" "%=" "?="] @operator

;; Null coalescing and ternary
"??" @operator
"?" @operator
"?:" @operator

;; Modifier pipe
"|" @operator

;; Unary
"!" @operator

;; Dollar sign for prefixed variables
"$" @punctuation.special

;; Punctuation
["(" ")" "[" "]"] @punctuation.bracket
["," ":" ";" "."] @punctuation.delimiter

;; Interpolation
(interpolated_parameter) @embedded

;; Error highlighting
(ERROR) @error
