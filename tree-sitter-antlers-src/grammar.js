/**
 * @file Antlers tree sitter grammar
 * @author Tree-sitter Antlers Contributors
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'antlers',

  externals: $ => [
    $.collection_keyword,
    $.nav_keyword,
    $.taxonomy_keyword,
    $.form_keyword,
    $.if_keyword,
    $.unless_keyword,
    $.entries_keyword
  ],

  word: $ => $.identifier,

  extras: $ => [
    /\s/,
    $.antlers_comment
  ],


  conflicts: $ => [
    [$.parameter_value, $.primary_expression],
    [$.expression_with_modifiers, $.primary_expression],
    [$._tag_content, $.expression_with_modifiers],
    [$.parameter, $.binary_expression],
    [$.variable, $.nested_variable]
    // Temporarily removed binary/unary conflicts to test automatic resolution
    // [$.binary_expression, $.unary_expression],
    // [$.ternary_expression, $.unary_expression]
  ],

  precedences: $ => [
    [
      'parentheses',
      'unary', 
      'exponentiation',
      'multiplicative',
      'additive',
      'comparison',
      'logical',
      'bitwise',
      'coalescing',
      'ternary',
      'assignment',
      'modifier'
    ]
  ],

  rules: {
    source: $ => repeat($._node),

    _node: $ => choice(
      $.antlers_comment,
      $.php_raw,
      $.php_echo,
      prec(2, $.if_statement),
      prec(2, $.unless_statement),
      prec(10, $.collection_loop),
      prec(2, $.nav_loop),
      prec(2, $.taxonomy_loop),
      prec(2, $.form_loop),
      prec(3, $.form_errors),
      prec(2, $.entries_loop),
      prec(2, $.recursive_pattern),
      prec(2, $.partial_tag),
      prec(2, $.yield_tag),
      prec(2, $.section_tag),
      prec(2, $.scope_tag),
      prec(2, $.asset_tag),
      prec(2, $.glide_tag),
      prec(2, $.dump_tag),
      prec(2, $.switch_statement),
      prec(2, $.user_tag),
      prec(2, $.cache_tag),
      prec(2, $.no_cache_tag),
      prec(2, $.redirect_tag),
      prec(2, $.session_tag),
      prec(2, $.markdown_tag),
      prec(2, $.oauth_tag),
      prec(2, $.locales_tag),
      prec(2, $.svg_tag),
      prec(2, $.template_content_tag),
      prec(2, $.slot_tag),
      prec(2, $.push_tag),
      prec(2, $.prepend_tag),
      prec(2, $.once_tag),
      prec(1, $.antlers_tag),
      $.text
    ),

    antlers_comment: $ => token(choice(
      seq('{{#', repeat(choice(/[^#]/, /#[^}]/, /#}[^}]/)), '#}}'),
      seq('{{!--', repeat(choice(/[^-]/, /-[^-]/, /--[^}]/)), '--}}')
    )),

    php_raw: $ => token(seq('{{?', /[\s\S]*?/, '?}}')),

    php_echo: $ => token(seq('{{$', /[\s\S]*?/, '$}}')),

    antlers_tag: $ => seq(
      '{{',
      $._tag_content,
      '}}'
    ),

    _tag_content: $ => choice(
      $.multi_statement,
      prec(3, $.directive_tag),
      $.expression_with_modifiers
    ),

    multi_statement: $ => prec(2, seq(
      choice($.expression_with_modifiers, $.directive_tag),
      repeat1(seq(';', optional(/\s*/), choice($.expression_with_modifiers, $.directive_tag)))
    )),

    directive_tag: $ => prec(3, choice(
      // Regular variable with parameters (for non-keyword directive tags) - try first
      prec.dynamic(15, seq($.variable, $.tag_parameters)),
      seq($.variable, ':', $.variable, optional($.tag_parameters)),
      seq('/', $.variable),
      seq('/', $.variable, ':', $.variable),
      // External keywords with parameters
      seq($.collection_keyword, $.tag_parameters),
      seq($.nav_keyword, $.tag_parameters),
      seq($.taxonomy_keyword, $.tag_parameters),
      seq($.form_keyword, $.tag_parameters),
      seq($.entries_keyword, $.tag_parameters)
    )),



    tag_parameters: $ => prec.dynamic(10, repeat1($.parameter)),

    parameter: $ => prec.dynamic(10, choice(
      seq($.parameter_name, '=', $.parameter_value),
      seq(':', $.parameter_name, '=', $.parameter_value)
    )),

    parameter_name: $ => alias($.identifier, $.parameter_name),

    parameter_value: $ => choice(
      $.string,
      $.number,
      $.variable,
      $.interpolated_parameter,
      'void'
    ),

    interpolated_parameter: $ => seq(
      '{',
      $.expression,
      '}'
    ),

    variable: $ => choice(
      $.simple_variable,
      $.nested_variable,
      $.array_access_variable
    ),

    simple_variable: $ => alias($.identifier, $.simple_variable),

    nested_variable: $ => prec.left(seq(
      $.simple_variable,
      repeat1(seq(
        choice(':', '.'),
        $.simple_variable
      ))
    )),

    array_access_variable: $ => seq(
      $.simple_variable,
      repeat1(seq(
        '[',
        choice($.simple_variable, $.number, $.string),
        ']'
      ))
    ),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,



    expression_with_modifiers: $ => seq(
      $.expression,
      repeat($.applied_modifier)
    ),

    applied_modifier: $ => seq(
      token(prec(10, '|')),
      $.modifier_name,
      optional($.modifier_parameters)
    ),

    expression: $ => choice(
      $.ternary_expression,
      $.binary_expression,
      $.parenthesized_expression,
      $.unary_expression,
      prec(-1, $.primary_expression)
    ),

    ternary_expression: $ => prec.right('ternary', seq(
      $.expression,
      '?',
      $.expression,
      ':',
      $.expression
    )),


    primary_expression: $ => choice(
      $.array_method_call,
      $.variable,
      $.string,
      $.number,
      $.boolean
    ),

    array_method_call: $ => seq(
      $.variable,
      '.',
      choice(
        seq('orderby', '(', ')'),
        seq('groupby', '(', ')'),
        seq('where', '(', ')'),
        seq('take', '(', ')'),
        seq('skip', '(', ')'),
        seq('merge', '(', ')'),
        seq('pluck', '(', ')')
      )
    ),

    array_access: $ => alias(seq(
      $.variable,
      '[',
      choice(
        $.number,
        $.string,
        $.variable
      ),
      ']'
    ), $.variable),

    binary_expression: $ => choice(
      prec.right('exponentiation', seq(
        field('left', $.expression),
        token(prec(1, '**')),
        field('right', $.expression)
      )),
      
      prec.left('multiplicative', seq(
        field('left', $.expression),
        choice(
          token(prec(1, '*')),
          token(prec(1, '/')),
          token(prec(1, '%'))
        ),
        field('right', $.expression)
      )),
      
      prec.left('additive', seq(
        field('left', $.expression),
        choice(
          token(prec(1, '+')),
          token(prec(1, '-'))
        ),
        field('right', $.expression)
      )),
      
      prec.left('comparison', seq(
        field('left', $.expression),
        choice(
          token(prec(1, '===')),
          token(prec(1, '!==')),
          token(prec(1, '==')),
          token(prec(1, '!=')),
          token(prec(1, '<>')),
          token(prec(1, '<')),
          token(prec(1, '>')),
          token(prec(1, '<=')),
          token(prec(1, '>='))
        ),
        field('right', $.expression)
      )),
      
      prec.left('logical', seq(
        field('left', $.expression),
        choice(
          token(prec(1, '&&')),
          token(prec(15, '||')),
          token(prec(1, 'and')),
          token(prec(1, 'or')),
          token(prec(1, 'xor'))
        ),
        field('right', $.expression)
      )),

      // Antlers-specific bitwise operators
      prec.left('bitwise', seq(
        field('left', $.expression),
        choice(
          token(prec(1, 'bwa')),
          token(prec(1, 'bwo')),
          token(prec(1, 'bxor'))
        ),
        field('right', $.expression)
      )),

      // Null coalescing operator
      prec.left('coalescing', seq(
        field('left', $.expression),
        token(prec(1, '??')),
        field('right', $.expression)
      )),

      // Assignment operators
      prec.right('assignment', seq(
        field('left', $.expression),
        choice(
          token(prec(-1, '=')), // Lower precedence for simple assignment
          token(prec(1, '+=')),
          token(prec(1, '-=')),
          token(prec(1, '*=')),
          token(prec(1, '/=')),
          token(prec(1, '%=')),
          token(prec(1, '?='))
        ),
        field('right', $.expression)
      ))
    ),

    unary_expression: $ => prec.right('unary', choice(
      seq('!', $.expression),
      seq(token(prec(2, '-')), $.expression),
      seq(token(prec(2, '+')), $.expression)
    )),

    parenthesized_expression: $ => prec('parentheses', seq(
      '(',
      $.expression,
      ')'
    )),

    modifier_name: $ => alias($.identifier, $.modifier_name),

    modifier_parameters: $ => choice(
      // Colon syntax: modifier:param  
      seq(
        token(prec(10, ':')),
        choice(
          alias($.identifier, $.variable),
          $.number
        )
      ),
      // Function syntax: modifier('param1', 'param2')
      seq(
        '(',
        optional(seq(
          choice($.string, $.number, $.boolean, $.variable),
          repeat(seq(
            ',',
            optional(/\s*/),  
            choice($.string, $.number, $.boolean, $.variable)
          ))
        )),
        ')'
      )
    ),



    string: $ => choice(
      $.double_quoted_string,
      $.single_quoted_string
    ),

    double_quoted_string: $ => seq(
      '"',
      repeat(choice(
        $.string_escape_sequence,
        /[^"\\]/
      )),
      '"'
    ),

    single_quoted_string: $ => seq(
      "'",
      repeat(choice(
        $.string_escape_sequence,
        /[^'\\]/
      )),
      "'"
    ),

    string_escape_sequence: $ => seq(
      '\\',
      choice(
        /[\\'"nrtbf]/,  // Common escape sequences
        /u[0-9a-fA-F]{4}/,  // Unicode escape
        /x[0-9a-fA-F]{2}/,  // Hex escape
        /[0-7]{1,3}/,       // Octal escape
        /./                 // Any other character
      )
    ),

    number: $ => token(prec(3, choice(
      // Scientific notation (must come first)
      /-?(?:[0-9](?:[0-9_]*[0-9])?(?:\.[0-9](?:[0-9_]*[0-9])?)?|\.[0-9](?:[0-9_]*[0-9])?)[eE][+-]?[0-9](?:[0-9_]*[0-9])?/,
      
      // Hexadecimal
      /-?0[xX][0-9a-fA-F](?:[0-9a-fA-F_]*[0-9a-fA-F])?/,
      
      // Octal
      /-?0[0-7](?:[0-7_]*[0-7])?/,
      
      // Float (with decimal point)
      /-?(?:[0-9](?:[0-9_]*[0-9])?)?\.?[0-9](?:[0-9_]*[0-9])?/,
      
      // Integer
      /-?[0-9](?:[0-9_]*[0-9])?/
    ))),

    boolean: $ => choice('true', 'false'),

    if_statement: $ => prec.right(seq(
      '{{', $.if_keyword, $.expression, '}}',
      $._if_body
    )),

    _if_body: $ => prec.right(choice(
      // End: {{ /if }}
      seq(repeat($._node), '{{', '/if', '}}'),
      // Elseif branch: {{ elseif expr }} ... (recurse)
      seq(repeat($._node), '{{', 'elseif', $.expression, '}}', $._if_body),
      // Else branch: {{ else }} ... {{ /if }}
      seq(repeat($._node), '{{', 'else', '}}', repeat($._node), '{{', '/if', '}}')
    )),

    unless_statement: $ => prec.right(seq(
      '{{', $.unless_keyword, $.expression, '}}',
      repeat($._node),
      '{{', '/unless', '}}'
    )),

    collection_loop: $ => choice(
      seq(
        '{{', $.collection_keyword, ':', $.variable, optional($.tag_parameters), '}}',
        repeat($._node),
        '{{', '/', $.collection_keyword, ':', $.variable, '}}'
      ),
      seq(
        '{{', $.collection_keyword, $.tag_parameters, '}}',
        repeat($._node),
        '{{', '/', $.collection_keyword, '}}'
      )
    ),

    nav_loop: $ => choice(
      seq(
        '{{', $.nav_keyword, ':', $.variable, optional($.tag_parameters), '}}',
        repeat($._node),
        '{{', '/', $.nav_keyword, ':', $.variable, '}}'
      ),
      seq(
        '{{', $.nav_keyword, $.tag_parameters, '}}',
        repeat($._node),
        '{{', '/', $.nav_keyword, '}}'
      ),
      seq(
        '{{', $.nav_keyword, ':', 'breadcrumbs', optional($.tag_parameters), '}}',
        repeat($._node),
        '{{', '/', $.nav_keyword, ':', 'breadcrumbs', '}}'
      )
    ),

    taxonomy_loop: $ => choice(
      seq(
        '{{', $.taxonomy_keyword, ':', $.variable, optional($.tag_parameters), '}}',
        repeat($._node),
        '{{', '/', $.taxonomy_keyword, ':', $.variable, '}}'
      ),
      seq(
        '{{', $.taxonomy_keyword, $.tag_parameters, '}}',
        repeat($._node),
        '{{', '/', $.taxonomy_keyword, '}}'
      )
    ),

    form_loop: $ => choice(
      seq(
        '{{', $.form_keyword, ':', $.variable, optional($.tag_parameters), '}}',
        repeat($._node),
        '{{', '/', $.form_keyword, ':', $.variable, '}}'
      ),
      seq(
        '{{', $.form_keyword, $.tag_parameters, '}}',
        repeat($._node),
        '{{', '/', $.form_keyword, '}}'
      )
    ),

    recursive_pattern: $ => choice(
      seq('{{', '*recursive', 'children', '*', '}}'),
      seq('{{', '*recursive', 'children', ':', $.variable, '*', '}}')
    ),

    form_errors: $ => seq(
      '{{', 'form', ':', 'errors', optional($.tag_parameters), '}}',
      repeat($._node),
      '{{', '/', 'form', ':', 'errors', '}}'
    ),

    entries_loop: $ => seq(
      '{{', $.entries_keyword, optional($.tag_parameters), '}}',
      repeat($._node),
      '{{', '/', $.entries_keyword, '}}'
    ),

    partial_tag: $ => choice(
      seq('{{', 'partial', ':', $.variable, optional($.tag_parameters), '}}'),
      seq('{{', 'partial', $.tag_parameters, '}}')
    ),

    yield_tag: $ => choice(
      seq('{{', 'yield', ':', $.variable, '}}'),
      seq('{{', 'yield', '}}')
    ),

    section_tag: $ => seq(
      '{{', 'section', ':', $.variable, '}}',
      repeat($._node),
      '{{', '/', 'section', ':', $.variable, '}}'
    ),

    scope_tag: $ => seq(
      '{{', 'scope', optional($.tag_parameters), '}}',
      repeat($._node),
      '{{', '/', 'scope', '}}'
    ),

    asset_tag: $ => choice(
      seq('{{', 'asset', ':', $.variable, optional($.tag_parameters), '}}'),
      seq('{{', 'asset', $.tag_parameters, '}}')
    ),

    glide_tag: $ => choice(
      seq('{{', 'glide', ':', $.variable, optional($.tag_parameters), '}}'),
      seq('{{', 'glide', $.tag_parameters, '}}')
    ),

    dump_tag: $ => choice(
      seq('{{', 'dump', ':', $.variable, '}}'),
      seq('{{', 'dump', '}}')
    ),

    switch_statement: $ => seq(
      '{{', 'switch', '(',
      optional(seq(
        $.switch_case,
        repeat(seq(',', $.switch_case))
      )),
      ')', '}}'
    ),

    switch_case: $ => seq(
      '(', $.expression, ')',
      '=>',
      choice($.string, $.number, $.boolean, $.variable)
    ),

    user_tag: $ => choice(
      seq('{{', 'user', ':', 'can', $.string, '}}'),
      seq('{{', 'user', ':', 'is', $.string, '}}'),
      seq('{{', 'user', ':', 'in', $.string, '}}'),
      seq('{{', 'user', ':', choice('can', 'is', 'in'), $.tag_parameters, '}}')
    ),

    cache_tag: $ => seq(
      '{{', 'cache', optional($.tag_parameters), '}}',
      repeat($._node),
      '{{', '/', 'cache', '}}'
    ),

    no_cache_tag: $ => seq(
      '{{', 'no_cache', '}}',
      repeat($._node),
      '{{', '/', 'no_cache', '}}'
    ),

    redirect_tag: $ => seq('{{', 'redirect', $.tag_parameters, '}}'),

    session_tag: $ => choice(
      seq('{{', 'session', ':', $.variable, '}}'),
      seq('{{', 'session', $.tag_parameters, '}}')
    ),

    markdown_tag: $ => seq(
      '{{', 'markdown', '}}',
      repeat($._node),
      '{{', '/', 'markdown', '}}'
    ),

    oauth_tag: $ => seq('{{', 'oauth', ':', $.variable, optional($.tag_parameters), '}}'),

    locales_tag: $ => choice(
      seq('{{', 'locales', '}}'),
      seq('{{', 'locales', $.tag_parameters, '}}')
    ),

    svg_tag: $ => seq('{{', 'svg', $.tag_parameters, '}}'),

    template_content_tag: $ => seq('{{', 'template_content', '}}'),

    slot_tag: $ => seq(
      '{{', 'slot', ':', $.variable, '}}',
      repeat($._node),
      '{{', '/', 'slot', ':', $.variable, '}}'
    ),

    push_tag: $ => seq(
      '{{', 'push', ':', $.variable, '}}',
      repeat($._node),
      '{{', '/', 'push', ':', $.variable, '}}'
    ),

    prepend_tag: $ => seq(
      '{{', 'prepend', ':', $.variable, '}}',
      repeat($._node),
      '{{', '/', 'prepend', ':', $.variable, '}}'
    ),

    once_tag: $ => seq(
      '{{', 'once', '}}',
      repeat($._node),
      '{{', '/', 'once', '}}'
    ),

    ignore_symbol: $ => token(seq('@', /[^{]*/)),

    text: $ => choice(
      $.ignore_symbol,
      /[^{@]+/
    )
  }
});

// Helper for comma-separated list (at least one)
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', optional(/\s*/), rule)));
}

// Helper for comma-separated list (zero or more)
function commaSep(rule) {
  return optional(commaSep1(rule));
}