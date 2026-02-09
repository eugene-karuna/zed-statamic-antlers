#include "tree_sitter/parser.h"
#include <wctype.h>
#include <string.h>
#include <stdlib.h>

enum TokenType {
  COLLECTION_KEYWORD,
  NAV_KEYWORD,
  TAXONOMY_KEYWORD,
  FORM_KEYWORD,
  IF_KEYWORD,
  UNLESS_KEYWORD,
  ENTRIES_KEYWORD
};

void *tree_sitter_antlers_external_scanner_create() {
  return NULL;
}

void tree_sitter_antlers_external_scanner_destroy(void *payload) {
}

unsigned tree_sitter_antlers_external_scanner_serialize(void *payload, char *buffer) {
  return 0;
}

void tree_sitter_antlers_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
}

static bool is_identifier_char(int32_t c) {
  return iswalnum(c) || c == '_';
}

static bool scan_keyword(TSLexer *lexer, const char *keyword) {
  for (const char *c = keyword; *c; c++) {
    if (lexer->eof(lexer) || lexer->lookahead != *c) return false;
    lexer->advance(lexer, false);
  }
  return true;
}

bool tree_sitter_antlers_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  // Skip whitespace
  while (!lexer->eof(lexer) && iswspace(lexer->lookahead)) {
    lexer->advance(lexer, true);
  }

  if (lexer->eof(lexer)) return false;

  int32_t first = lexer->lookahead;

  // Try "if" keyword - must be followed by whitespace
  if (first == 'i' && valid_symbols[IF_KEYWORD]) {
    lexer->advance(lexer, false);
    if (!lexer->eof(lexer) && lexer->lookahead == 'f') {
      lexer->advance(lexer, false);
      if (lexer->eof(lexer) || !is_identifier_char(lexer->lookahead)) {
        if (!lexer->eof(lexer) && iswspace(lexer->lookahead)) {
          lexer->mark_end(lexer);
          lexer->result_symbol = IF_KEYWORD;
          return true;
        }
      }
    }
    return false;
  }

  // Try "unless" keyword - must be followed by whitespace
  if (first == 'u' && valid_symbols[UNLESS_KEYWORD]) {
    lexer->advance(lexer, false);
    if (scan_keyword(lexer, "nless")) {
      if (lexer->eof(lexer) || !is_identifier_char(lexer->lookahead)) {
        if (!lexer->eof(lexer) && iswspace(lexer->lookahead)) {
          lexer->mark_end(lexer);
          lexer->result_symbol = UNLESS_KEYWORD;
          return true;
        }
      }
    }
    return false;
  }

  // Try "collection" keyword - must be followed by ':'
  if (first == 'c' && valid_symbols[COLLECTION_KEYWORD]) {
    lexer->advance(lexer, false);
    if (scan_keyword(lexer, "ollection")) {
      if (!lexer->eof(lexer) && lexer->lookahead == ':') {
        lexer->mark_end(lexer);
        lexer->result_symbol = COLLECTION_KEYWORD;
        return true;
      }
    }
    return false;
  }

  // Try "nav" keyword - must be followed by ':'
  if (first == 'n' && valid_symbols[NAV_KEYWORD]) {
    lexer->advance(lexer, false);
    if (scan_keyword(lexer, "av")) {
      if (!lexer->eof(lexer) && lexer->lookahead == ':') {
        lexer->mark_end(lexer);
        lexer->result_symbol = NAV_KEYWORD;
        return true;
      }
    }
    return false;
  }

  // Try "taxonomy" keyword - must be followed by ':'
  if (first == 't' && valid_symbols[TAXONOMY_KEYWORD]) {
    lexer->advance(lexer, false);
    if (scan_keyword(lexer, "axonomy")) {
      if (!lexer->eof(lexer) && lexer->lookahead == ':') {
        lexer->mark_end(lexer);
        lexer->result_symbol = TAXONOMY_KEYWORD;
        return true;
      }
    }
    return false;
  }

  // Try "form" keyword - must be followed by ':'
  // But NOT "form:errors" which is handled by form_errors rule
  if (first == 'f' && valid_symbols[FORM_KEYWORD]) {
    lexer->advance(lexer, false);
    if (scan_keyword(lexer, "orm")) {
      if (!lexer->eof(lexer) && lexer->lookahead == ':') {
        lexer->mark_end(lexer);
        lexer->result_symbol = FORM_KEYWORD;
        return true;
      }
    }
    return false;
  }

  // Try "entries" keyword - must be followed by whitespace or ':'
  if (first == 'e' && valid_symbols[ENTRIES_KEYWORD]) {
    lexer->advance(lexer, false);
    if (scan_keyword(lexer, "ntries")) {
      if (lexer->eof(lexer) || !is_identifier_char(lexer->lookahead)) {
        lexer->mark_end(lexer);
        lexer->result_symbol = ENTRIES_KEYWORD;
        return true;
      }
    }
    return false;
  }

  return false;
}
