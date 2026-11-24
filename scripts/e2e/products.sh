#!/bin/bash
# Real-database end-to-end test of the products API (two throwaway users). Needs the app running and .env.local set.
# Usage:  BASE_URL=http://localhost:3000 bash scripts/e2e/products.sh   then   node --env-file=.env.local scripts/e2e/cleanup-test-data.mjs
B=${BASE_URL:-http://localhost:3000}
O="origin: $B"; J="content-type: application/json"
D=$(cygpath -m "$(mktemp -d)"); A=$D/a.txt; Bc=$D/b.txt
ok(){ if [ "$2" = "$3" ]; then echo "  PASS  $1 ($3)"; else echo "  FAIL  $1: expected $2 got $3"; FAILS=$((FAILS+1)); fi; }
FAILS=0
code(){ curl -s -o /dev/null -w '%{http_code}' "$@"; }

# fake-but-valid-signature files
printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00' > $D/ok.jpg; head -c 4000 /dev/urandom >> $D/ok.jpg
printf '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>' > $D/evil.svg
printf 'not an image at all, just text pretending' > $D/fake.jpg
head -c 3000000 /dev/zero > $D/big.bin; printf '\xff\xd8\xff\xe0' | dd of=$D/big.bin conv=notrunc 2>/dev/null

echo "== setup: two users, one business each"
curl -s -c $A -o /dev/null -X POST -H "$J" -H "$O" -d '{"name":"User A","email":"lm-prod-a@example.com","password":"test-password-123"}' $B/api/auth/sign-up/email
curl -s -c $Bc -o /dev/null -X POST -H "$J" -H "$O" -d '{"name":"User B","email":"lm-prod-b@example.com","password":"test-password-123"}' $B/api/auth/sign-up/email
ok "A creates business" 201 $(code -b $A -X POST -H "$J" -d '{"name":"Prod Test A"}' $B/api/businesses)
ok "B creates business" 201 $(code -b $Bc -X POST -H "$J" -d '{"name":"Prod Test B"}' $B/api/businesses)

echo "== create + validation"
R=$(curl -s -b $A -X POST -H "$J" -d '{"name":"Ankara wrap dress","price":"18,500.50","quantity":10,"description":"Wrap dress"}' $B/api/products)
PID=$(echo "$R" | sed -E 's/.*"id":"([0-9a-f-]{36})".*/\1/')
echo "$R" | grep -q '"priceMinor":1850050' && echo "  PASS  price stored as 1850050 kobo" || { echo "  FAIL  price: $R"; FAILS=$((FAILS+1)); }
echo "$R" | grep -q '"quantityOnHand":10' && echo "  PASS  starting stock 10" || { echo "  FAIL  qty"; FAILS=$((FAILS+1)); }
ok "bad price refused" 400 $(code -b $A -X POST -H "$J" -d '{"name":"X Product","price":"abc"}' $B/api/products)
ok "float-trap price 19.99 accepted" 201 $(code -b $A -X POST -H "$J" -d '{"name":"Float Trap","price":"19.99"}' $B/api/products)
ok "publish without price refused" 400 $(code -b $A -X POST -H "$J" -d '{"name":"No Price","status":"published"}' $B/api/products)
ok "short name refused" 400 $(code -b $A -X POST -H "$J" -d '{"name":"x"}' $B/api/products)
ok "no login refused" 401 $(code -X POST -H "$J" -d '{"name":"Nope Nope"}' $B/api/products)
ok "list has products" 200 $(code -b $A "$B/api/products?q=ankara")
echo "$(curl -s -b $A "$B/api/products?q=ankara")" | grep -q "Ankara wrap dress" && echo "  PASS  search finds it" || { echo "  FAIL  search"; FAILS=$((FAILS+1)); }

echo "== stock"
ok "receive +5" 200 $(code -b $A -X POST -H "$J" -d '{"delta":5,"reason":"received"}' $B/api/products/$PID/stock)
ok "remove more than held refused" 400 $(code -b $A -X POST -H "$J" -d '{"delta":-100,"reason":"adjustment"}' $B/api/products/$PID/stock)
ok "zero delta refused" 400 $(code -b $A -X POST -H "$J" -d '{"delta":0,"reason":"adjustment"}' $B/api/products/$PID/stock)
curl -s -b $A -o /dev/null -X POST -H "$J" -d '{"delta":3,"reason":"received","idempotencyKey":"retry-key-0001"}' $B/api/products/$PID/stock
R2=$(curl -s -b $A -X POST -H "$J" -d '{"delta":3,"reason":"received","idempotencyKey":"retry-key-0001"}' $B/api/products/$PID/stock)
echo "$R2" | grep -q '"replay":true' && echo "  PASS  retry with same key not applied twice" || { echo "  FAIL  idempotency: $R2"; FAILS=$((FAILS+1)); }
# stock now 10+5+3 = 18. Race 15 parallel -2: at most 9 can succeed (18/2), never below zero.
for i in $(seq 1 15); do (code -b $A -X POST -H "$J" -d "{\"delta\":-2,\"reason\":\"adjustment\"}" $B/api/products/$PID/stock > $D/r$i.txt) & done; wait
SUCC=$(cat $D/r*.txt | grep -o 200 | wc -l | tr -d " ")
FINAL=$(curl -s -b $A $B/api/products/$PID | sed -E 's/.*"quantityOnHand":(-?[0-9]+).*/\1/')
[ "$SUCC" = "9" ] && [ "$FINAL" = "0" ] && echo "  PASS  15 parallel removals: exactly 9 succeeded, stock ended at $FINAL (never negative)" || { echo "  FAIL  race: $SUCC succeeded, final $FINAL"; FAILS=$((FAILS+1)); }

echo "== photos"
ok "valid photo" 201 $(code -b $A -X POST -F "file=@$D/ok.jpg;type=image/jpeg" $B/api/products/$PID/images)
ok "SVG claiming png refused" 415 $(code -b $A -X POST -F "file=@$D/evil.svg;type=image/png" $B/api/products/$PID/images)
ok "text claiming jpeg refused" 415 $(code -b $A -X POST -F "file=@$D/fake.jpg;type=image/jpeg" $B/api/products/$PID/images)
ok "3MB file refused" 413 $(code -b $A -X POST -F "file=@$D/big.bin;type=image/jpeg" $B/api/products/$PID/images)
for i in 2 3 4 5 6; do code -b $A -X POST -F "file=@$D/ok.jpg;type=image/jpeg" $B/api/products/$PID/images >/dev/null; done
ok "7th photo refused" 409 $(code -b $A -X POST -F "file=@$D/ok.jpg;type=image/jpeg" $B/api/products/$PID/images)
DET=$(curl -s -b $A $B/api/products/$PID); AID=$(echo "$DET" | grep -o '"assets":\[{"id":"[0-9a-f-]*"' | grep -o '[0-9a-f-]\{36\}')
H=$(curl -s -b $A -D - -o /dev/null $B/api/products/$PID/images/$AID | tr -d '\r')
echo "$H" | grep -qi "content-type: image/jpeg" && echo "$H" | grep -qi "x-content-type-options: nosniff" && echo "  PASS  photo served as image/jpeg with nosniff" || { echo "  FAIL  headers: $H"; FAILS=$((FAILS+1)); }

echo "== another user cannot touch it"
ok "B reads A's product" 404 $(code -b $Bc $B/api/products/$PID)
ok "B reads A's photo" 404 $(code -b $Bc $B/api/products/$PID/images/$AID)
ok "B edits A's product" 404 $(code -b $Bc -X PATCH -H "$J" -d '{"name":"Hacked"}' $B/api/products/$PID)
ok "B changes A's stock" 404 $(code -b $Bc -X POST -H "$J" -d '{"delta":99,"reason":"received"}' $B/api/products/$PID/stock)
ok "B uploads to A's product" 404 $(code -b $Bc -X POST -F "file=@$D/ok.jpg;type=image/jpeg" $B/api/products/$PID/images)
ok "B deletes A's photo" 404 $(code -b $Bc -X DELETE $B/api/products/$PID/images/$AID)
ok "B deletes A's product" 404 $(code -b $Bc -X DELETE $B/api/products/$PID)
ok "bad id is just not found" 404 $(code -b $A $B/api/products/not-a-uuid)
echo "$(curl -s -b $Bc $B/api/products)" | grep -q '"products":\[\]' && echo "  PASS  B's list is empty" || { echo "  FAIL  B sees A's data"; FAILS=$((FAILS+1)); }
echo "$(curl -s -b $A $B/api/products/$PID | grep -c 'Hacked')" | grep -q '^0$' && echo "  PASS  A's product unchanged" || { echo "  FAIL  A's product was changed"; FAILS=$((FAILS+1)); }

echo "== status + delete"
ok "publish with price" 200 $(code -b $A -X PATCH -H "$J" -d '{"status":"published"}' $B/api/products/$PID)
ok "archive" 200 $(code -b $A -X PATCH -H "$J" -d '{"status":"archived"}' $B/api/products/$PID)
ok "A deletes own product" 200 $(code -b $A -X DELETE $B/api/products/$PID)
ok "gone afterwards" 404 $(code -b $A $B/api/products/$PID)
echo; echo "FAILURES: $FAILS"
rm -rf $D
