#!/usr/bin/env bash
#
# cache-bust.sh — content-hash cache busting for the static site (no build step).
#
# Rewrites every LOCAL <link href="css/…"> and <script src="js/…"> in index.html
# to `?v=<8-char md5 of the file contents>`. Because the token is the content
# hash, it is:
#   · idempotent  — unchanged files keep their token (no noise in the diff),
#   · automatic   — any edited CSS/JS gets a fresh token → iOS Safari/Chrome
#                   (WebKit's sticky cache) is forced to re-fetch it.
#
# Run it right before committing whenever you touched CSS/JS:
#     ./scripts/cache-bust.sh && git add index.html
# External assets (Google Fonts, etc.) are left untouched.
#
set -euo pipefail
cd "$(dirname "$0")/.."          # -> web/
HTML="index.html"

hashfile() {
  if command -v md5 >/dev/null 2>&1; then md5 -q "$1" | cut -c1-8   # macOS
  else md5sum "$1" | cut -c1-8; fi                                   # Linux
}

# Unique local css/js paths referenced in the HTML (query string stripped).
paths=$(grep -oE '(href|src)="(css|js)/[^"?]+\.(css|js)' "$HTML" \
        | sed -E 's/^(href|src)="//' | sort -u)

changed=0
for p in $paths; do
  if [ ! -f "$p" ]; then
    echo "  ! missing on disk, skipped: $p" >&2
    continue
  fi
  h=$(hashfile "$p")
  # Replace only inside href="…"/src="…"; add or refresh the ?v= token.
  before=$(md5 -q "$HTML" 2>/dev/null || md5sum "$HTML")
  P="$p" H="$h" perl -0777 -pi -e '
    my $p = quotemeta $ENV{P}; my $h = $ENV{H};
    s{(href|src)="$p(?:\?v=[^"]*)?"}{qq{$1="$ENV{P}?v=$h"}}ge;
  ' "$HTML"
  after=$(md5 -q "$HTML" 2>/dev/null || md5sum "$HTML")
  if [ "$before" != "$after" ]; then
    echo "  ✓ $p?v=$h"
    changed=$((changed+1))
  fi
done

echo "cache-bust: $changed asset ref(s) updated in $HTML"
