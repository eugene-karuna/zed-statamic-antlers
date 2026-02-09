;; Increase indent after opening control structures
[
  (if_statement)
  (unless_statement)
  (collection_loop)
  (nav_loop)
  (taxonomy_loop)
  (form_loop)
  (entries_loop)
  (loop_tag)
  (search_tag)
  (section_tag)
  (scope_tag)
  (cache_tag)
  (no_cache_tag)
  (noparse_tag)
  (once_tag)
  (markdown_tag)
  (obfuscate_tag)
  (push_tag)
  (prepend_tag)
  (partial_tag)
  (slot_tag)
] @indent

;; Decrease indent at closing keywords
[
  "/if"
  "/unless"
  "else"
  "elseif"
] @outdent
