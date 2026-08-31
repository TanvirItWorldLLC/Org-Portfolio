#!/usr/bin/env bash
# Verify a deployed Org Portfolio instance.
# Usage: DOMAIN=yourdomain.com ./verify.sh
set -uo pipefail

DOMAIN="${1:-${DOMAIN:-localhost}}"
SCHEME="${SCHEME:-https}"
BASE="${SCHEME}://${DOMAIN}"
PASS=0
FAIL=0

check() {
  local name="$1" url="$2" expect_code="${3:-200}"
  local code
  code=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 15 "$url" || echo "000")
  if [ "$code" = "$expect_code" ]; then
    echo "  ✓ $name ($code)"
    PASS=$((PASS+1))
  else
    echo "  ✗ $name (got $code, expected $expect_code)"
    FAIL=$((FAIL+1))
  fi
}

echo "Verifying https://$DOMAIN ..."

check "Home page"        "$BASE/"                200
check "Portfolio page"   "$BASE/portfolio"       200
check "About page"       "$BASE/about"           200
check "Contact page"     "$BASE/contact"         200
check "Login page"       "$BASE/login"           200
check "Register page"    "$BASE/register"        200
check "Health endpoint"  "$BASE/api/health"      200
check "Portfolio API"    "$BASE/api/portfolio"   200
check "Categories API"   "$BASE/api/portfolio/categories" 200

echo ""
echo "SSL check:"
if [ "$SCHEME" = "https" ]; then
  if curl -sk -o /dev/null -w "%{http_code}\n" --max-time 10 "https://$DOMAIN" >/dev/null 2>&1; then
    EXPIRY=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | sed 's/notAfter=//')
    if [ -n "$EXPIRY" ]; then
      echo "  ✓ Certificate valid until: $EXPIRY"
      PASS=$((PASS+1))
    else
      echo "  ✗ Could not read certificate"
      FAIL=$((FAIL+1))
    fi
  fi
fi

echo ""
echo "Security headers:"
HEADERS=$(curl -skI --max-time 10 "$BASE/")
for h in "Strict-Transport-Security" "X-Frame-Options" "X-Content-Type-Options"; do
  if echo "$HEADERS" | grep -qi "$h"; then
    echo "  ✓ $h present"
    PASS=$((PASS+1))
  else
    echo "  ✗ $h missing"
    FAIL=$((FAIL+1))
  fi
done

echo ""
echo "PM2 status:"
if command -v pm2 >/dev/null 2>&1; then
  pm2 jlist 2>/dev/null | grep -o '"name":"[^"]*"' | grep -q "org-portfolio" && echo "  ✓ PM2 app 'org-portfolio' running" && PASS=$((PASS+1)) || (echo "  ✗ PM2 app not found"; FAIL=$((FAIL+1)))
fi

echo ""
echo "Passed: $PASS   Failed: $FAIL"
[ "$FAIL" -eq 0 ] || exit 1