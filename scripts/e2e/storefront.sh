#!/bin/bash
# Real-database end-to-end test of the public storefront, orders and seller order handling.
# Needs the app running and .env.local set. Usage:
#   BASE_URL=http://localhost:3000 bash scripts/e2e/storefront.sh
#   node --env-file=.env.local scripts/e2e/cleanup-test-data.mjs     (removes the test users and stores)
B=${BASE_URL:-http://localhost:3000}
O="origin: $B"; J="content-type: application/json"
D=$(cygpath -m "$(mktemp -d)" 2>/dev/null || mktemp -d); A=$D/a.txt; Bc=$D/b.txt
FAILS=0; PASSES=0
ok(){ if [ "$2" = "$3" ]; then PASSES=$((PASSES+1)); echo "  PASS  $1 ($3)"; else FAILS=$((FAILS+1)); echo "  FAIL  $1: expected $2 got $3"; fi; }
has(){ if echo "$3" | grep -qi -- "$2"; then PASSES=$((PASSES+1)); echo "  PASS  $1"; else FAILS=$((FAILS+1)); echo "  FAIL  $1 (missing: $2) got: $(echo "$3" | head -c 200)"; fi; }
hasnt(){ if echo "$3" | grep -qi -- "$2"; then FAILS=$((FAILS+1)); echo "  FAIL  $1 (should not contain: $2)"; else PASSES=$((PASSES+1)); echo "  PASS  $1"; fi; }
code(){ curl -s -o /dev/null -w '%{http_code}' "$@"; }
idof(){ echo "$1" | sed -E 's/.*"id":"([0-9a-f-]{36})".*/\1/'; }
# A different pretend address per request, so the rate limiter only fires where we test it.
# The counter lives in a file because ip() runs in a subshell.
ip(){ local n; n=$(cat "$D/ipn" 2>/dev/null || echo 0); n=$((n+1)); echo "$n" > "$D/ipn"; echo "x-forwarded-for: 10.9.$((n/250)).$((n%250+1))"; }

printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00' > $D/ok.jpg; head -c 3000 /dev/urandom >> $D/ok.jpg

echo "== setup: two sellers, products"
curl -s -c $A -o /dev/null -X POST -H "$J" -H "$O" -d '{"name":"Seller A","email":"lm-prod-a@example.com","password":"test-password-123"}' $B/api/auth/sign-up/email
curl -s -c $Bc -o /dev/null -X POST -H "$J" -H "$O" -d '{"name":"Seller B","email":"lm-prod-b@example.com","password":"test-password-123"}' $B/api/auth/sign-up/email
ok "A business" 201 $(code -b $A -X POST -H "$J" -d '{"name":"Store Test A","description":"Test shop A"}' $B/api/businesses)
ok "B business" 201 $(code -b $Bc -X POST -H "$J" -d '{"name":"Store Test B"}' $B/api/businesses)
SA=store-test-a; SB=store-test-b
mk(){ curl -s -b "$1" -X POST -H "$J" -d "$2" $B/api/products; }
P1=$(idof "$(mk $A '{"name":"Ankara dress","price":"15,000","quantity":5,"status":"published"}')")
P2=$(idof "$(mk $A '{"name":"Silk scarf","price":"2500.50","quantity":1,"status":"published"}')")
P3=$(idof "$(mk $A '{"name":"Secret draft","price":"1000","quantity":9}')")
P4=$(idof "$(mk $A '{"name":"Pattern pack","price":"500","productType":"digital","status":"published"}')")
P6=$(idof "$(mk $A '{"name":"Old archived","price":"700","quantity":3,"status":"published"}')")
curl -s -b $A -o /dev/null -X PATCH -H "$J" -d '{"status":"archived"}' $B/api/products/$P6
PB=$(idof "$(mk $Bc '{"name":"B only item","price":"900","quantity":4}')")
code -b $A -X POST -F "file=@$D/ok.jpg;type=image/jpeg" $B/api/products/$P1/images >/dev/null
code -b $A -X POST -F "file=@$D/ok.jpg;type=image/jpeg" $B/api/products/$P3/images >/dev/null
code -b $Bc -X POST -F "file=@$D/ok.jpg;type=image/jpeg" $B/api/products/$PB/images >/dev/null
IMG1=$(curl -s -b $A $B/api/products/$P1 | grep -o '"assets":\[{"id":"[0-9a-f-]*"' | grep -o '[0-9a-f-]\{36\}')
IMG3=$(curl -s -b $A $B/api/products/$P3 | grep -o '"assets":\[{"id":"[0-9a-f-]*"' | grep -o '[0-9a-f-]\{36\}')
IMGB=$(curl -s -b $Bc $B/api/products/$PB | grep -o '"assets":\[{"id":"[0-9a-f-]*"' | grep -o '[0-9a-f-]\{36\}')

echo "== a CLOSED store is invisible to the public"
has "closed page says not open" "isn.t open yet" "$(curl -s $B/s/$SA)"
hasnt "closed page leaks no product" "Ankara dress" "$(curl -s $B/s/$SA)"
ok "product page hidden" 200 $(code $B/s/$SA/p/$P1)
hasnt "product page leaks nothing when closed" "Ankara dress" "$(curl -s $B/s/$SA/p/$P1)"
ok "photo hidden" 404 $(code $B/api/s/$SA/images/$IMG1)
ok "cart api hidden" 404 $(code -X POST -H "$J" -d "{\"ids\":[\"$P1\"]}" $B/api/s/$SA/cart)
ok "orders refused" 404 $(code -X POST -H "$J" -H "$(ip)" -d "{\"customerName\":\"Ada\",\"customerPhone\":\"08031234567\",\"deliveryAddress\":\"12 Test Street\",\"items\":[{\"productId\":\"$P1\",\"quantity\":1}]}" $B/api/s/$SA/orders)
has "owner sees a preview" "Preview" "$(curl -s -b $A $B/s/$SA)"
has "owner preview shows products" "Ankara dress" "$(curl -s -b $A $B/s/$SA)"
ok "owner sees photo in preview" 200 $(code -b $A $B/api/s/$SA/images/$IMG1)
ok "unknown store" 404 $(code $B/s/no-such-store-xyz)

echo "== opening the store"
ok "B (only a draft product) cannot open" 400 $(code -b $Bc -X PATCH -H "$J" -d '{"status":"live"}' $B/api/store)
ok "B publishes its product" 200 $(code -b $Bc -X PATCH -H "$J" -d '{"status":"published"}' $B/api/products/$PB)
ok "no login cannot open" 401 $(code -X PATCH -H "$J" -d '{"status":"live"}' $B/api/store)
ok "A opens" 200 $(code -b $A -X PATCH -H "$J" -d '{"status":"live"}' $B/api/store)
ok "B opens too (has a published product)" 200 $(code -b $Bc -X PATCH -H "$J" -d '{"status":"live"}' $B/api/store)

echo "== the OPEN store shows only what it should"
H=$(curl -s $B/s/$SA)
has "home lists published product" "Ankara dress" "$H"
has "home lists second" "Silk scarf" "$H"
has "home lists digital" "Pattern pack" "$H"
hasnt "home hides the draft" "Secret draft" "$H"
hasnt "home hides the archived" "Old archived" "$H"
has "prices shown" "15,000" "$H"
ok "published product page" 200 $(code $B/s/$SA/p/$P1)
ok "draft product page is 404" 404 $(code $B/s/$SA/p/$P3)
ok "archived product page is 404" 404 $(code $B/s/$SA/p/$P6)
ok "B's product under A's address is 404" 404 $(code $B/s/$SA/p/$PB)
ok "public photo of published product" 200 $(code $B/api/s/$SA/images/$IMG1)
HD=$(curl -s -D - -o /dev/null $B/api/s/$SA/images/$IMG1 | tr -d '\r'); has "photo is cacheable and nosniff" "cache-control: public" "$HD"
ok "photo of a DRAFT product is 404" 404 $(code $B/api/s/$SA/images/$IMG3)
ok "B's photo under A's address is 404" 404 $(code $B/api/s/$SA/images/$IMGB)
CJ=$(curl -s -X POST -H "$J" -d "{\"ids\":[\"$P1\",\"$P3\",\"$PB\"]}" $B/api/s/$SA/cart)
has "cart returns the published one" "Ankara dress" "$CJ"; hasnt "cart never returns a draft" "Secret draft" "$CJ"; hasnt "cart never returns another store's item" "B only item" "$CJ"
ok "bad cart body refused" 400 $(code -X POST -H "$J" -d '{"ids":["nope"]}' $B/api/s/$SA/cart)

echo "== order requests (prices are recomputed on the server)"
ORD(){ curl -s -w ' [%{http_code}]' -X POST -H "$J" -H "$(ip)" -d "$1" $B/api/s/$SA/orders; }
R=$(ORD "{\"customerName\":\"Ada Okafor\",\"customerPhone\":\"0803 123 4567\",\"deliveryAddress\":\"12 Test Street, Yaba, Lagos\",\"note\":\"Size 12\",\"items\":[{\"productId\":\"$P1\",\"quantity\":2,\"priceMinor\":1},{\"productId\":\"$P2\",\"quantity\":1,\"priceMinor\":1}]}")
echo "$R" | grep -q '\[201\]' && { PASSES=$((PASSES+1)); echo "  PASS  valid order accepted"; } || { FAILS=$((FAILS+1)); echo "  FAIL  valid order: $R"; }
CODE1=$(echo "$R" | grep -o '"code":"[A-Z2-9]\{8\}"' | grep -o '[A-Z2-9]\{8\}')
echo "$R" | grep -q '"total":3250050' && { PASSES=$((PASSES+1)); echo "  PASS  total is 3250050 kobo, computed on the server (forged prices ignored)"; } || { FAILS=$((FAILS+1)); echo "  FAIL  total: $R"; }
has "bad phone refused" "valid phone" "$(ORD "{\"customerName\":\"Ada\",\"customerPhone\":\"123\",\"deliveryAddress\":\"12 Test Street\",\"items\":[{\"productId\":\"$P1\",\"quantity\":1}]}")"
has "short name refused" "name" "$(ORD "{\"customerName\":\"A\",\"customerPhone\":\"08031234567\",\"deliveryAddress\":\"12 Test Street\",\"items\":[{\"productId\":\"$P1\",\"quantity\":1}]}")"
has "unknown product refused" "409" "$(ORD "{\"customerName\":\"Ada\",\"customerPhone\":\"08031234567\",\"deliveryAddress\":\"12 Test Street\",\"items\":[{\"productId\":\"11111111-1111-4111-8111-111111111111\",\"quantity\":1}]}")"
has "draft product refused" "409" "$(ORD "{\"customerName\":\"Ada\",\"customerPhone\":\"08031234567\",\"deliveryAddress\":\"12 Test Street\",\"items\":[{\"productId\":\"$P3\",\"quantity\":1}]}")"
has "archived product refused" "409" "$(ORD "{\"customerName\":\"Ada\",\"customerPhone\":\"08031234567\",\"deliveryAddress\":\"12 Test Street\",\"items\":[{\"productId\":\"$P6\",\"quantity\":1}]}")"
has "other store's product refused" "409" "$(ORD "{\"customerName\":\"Ada\",\"customerPhone\":\"08031234567\",\"deliveryAddress\":\"12 Test Street\",\"items\":[{\"productId\":\"$PB\",\"quantity\":1}]}")"
has "more than stock refused" "Only 1" "$(ORD "{\"customerName\":\"Ada\",\"customerPhone\":\"08031234567\",\"deliveryAddress\":\"12 Test Street\",\"items\":[{\"productId\":\"$P2\",\"quantity\":2}]}")"
has "zero quantity refused" "400" "$(ORD "{\"customerName\":\"Ada\",\"customerPhone\":\"08031234567\",\"deliveryAddress\":\"12 Test Street\",\"items\":[{\"productId\":\"$P1\",\"quantity\":0}]}")"
has "empty cart refused" "400" "$(ORD "{\"customerName\":\"Ada\",\"customerPhone\":\"08031234567\",\"deliveryAddress\":\"12 Test Street\",\"items\":[]}")"
has "garbage body refused" "400" "$(ORD 'not json')"
echo "  stock untouched by a request: P1 now $(curl -s -b $A $B/api/products/$P1 | sed -E 's/.*"quantityOnHand":(-?[0-9]+).*/\1/') (expect 5)"
ok "confirmation page" 200 $(code $B/s/$SA/order/$CODE1)
has "confirmation shows the total" "32,500.50" "$(curl -s $B/s/$SA/order/$CODE1)"
hasnt "confirmation never shows the street address" "Yaba" "$(curl -s $B/s/$SA/order/$CODE1)"
ok "wrong code" 404 $(code $B/s/$SA/order/AAAAAAAA)
ok "code under another store" 404 $(code $B/s/$SB/order/$CODE1)
SAME="x-forwarded-for: 10.200.0.1"; LAST=""
for i in 1 2 3 4 5 6 7; do LAST=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H "$J" -H "$SAME" -d "{\"customerName\":\"Spam\",\"customerPhone\":\"08031234567\",\"deliveryAddress\":\"12 Test Street\",\"items\":[{\"productId\":\"$P4\",\"quantity\":1}]}" $B/api/s/$SA/orders); done
ok "7th rapid order from one person is rate limited" 429 $LAST

echo "== seller handles orders"
ok "A sees the order" 200 $(code -b $A $B/orders)
has "orders page lists the code" "$CODE1" "$(curl -s -b $A $B/orders)"
has "WhatsApp link present" "wa.me/2348031234567" "$(curl -s -b $A $B/orders)"
hasnt "B's orders page has no A order" "$CODE1" "$(curl -s -b $Bc $B/orders)"
OID=$(node --env-file=.env.local --input-type=module -e "import {Pool} from '@neondatabase/serverless'; const p=new Pool({connectionString:process.env.DATABASE_URL_UNPOOLED}); const r=await p.query('select id from orders where code=\$1',['$CODE1']); console.log(r.rows[0].id); await p.end();" 2>/dev/null)
ok "B cannot change A's order" 404 $(code -b $Bc -X PATCH -H "$J" -d '{"status":"fulfilled"}' $B/api/orders/$OID)
ok "no login cannot change an order" 401 $(code -X PATCH -H "$J" -d '{"status":"fulfilled"}' $B/api/orders/$OID)
ok "bad status refused" 400 $(code -b $A -X PATCH -H "$J" -d '{"status":"new"}' $B/api/orders/$OID)
ok "A marks contacted" 200 $(code -b $A -X PATCH -H "$J" -d '{"status":"contacted"}' $B/api/orders/$OID)
ok "A marks fulfilled" 200 $(code -b $A -X PATCH -H "$J" -d '{"status":"fulfilled"}' $B/api/orders/$OID)
echo "  stock after fulfil: P1 $(curl -s -b $A $B/api/products/$P1 | sed -E 's/.*"quantityOnHand":(-?[0-9]+).*/\1/') (expect 3), P2 $(curl -s -b $A $B/api/products/$P2 | sed -E 's/.*"quantityOnHand":(-?[0-9]+).*/\1/') (expect 0)"
[ "$(curl -s -b $A $B/api/products/$P1 | sed -E 's/.*"quantityOnHand":(-?[0-9]+).*/\1/')" = "3" ] && [ "$(curl -s -b $A $B/api/products/$P2 | sed -E 's/.*"quantityOnHand":(-?[0-9]+).*/\1/')" = "0" ] && { PASSES=$((PASSES+1)); echo "  PASS  fulfilling deducted stock exactly"; } || { FAILS=$((FAILS+1)); echo "  FAIL  stock deduction"; }
has "stock history says sold" "sold" "$(curl -s -b $A $B/api/products/$P1)"
ok "fulfilling twice is refused" 409 $(code -b $A -X PATCH -H "$J" -d '{"status":"fulfilled"}' $B/api/orders/$OID)
ok "cannot cancel a fulfilled order" 409 $(code -b $A -X PATCH -H "$J" -d '{"status":"cancelled"}' $B/api/orders/$OID)
echo "  stock not deducted twice: P1 $(curl -s -b $A $B/api/products/$P1 | sed -E 's/.*"quantityOnHand":(-?[0-9]+).*/\1/') (expect 3)"

echo "== fulfilling cannot half-succeed"
R2=$(curl -s -X POST -H "$J" -H "$(ip)" -d "{\"customerName\":\"Chi Test\",\"customerPhone\":\"08051234567\",\"deliveryAddress\":\"5 Another Road, Lagos\",\"items\":[{\"productId\":\"$P4\",\"quantity\":1},{\"productId\":\"$P1\",\"quantity\":3}]}" $B/api/s/$SA/orders)
CODE2=$(echo "$R2" | grep -o '"code":"[A-Z2-9]\{8\}"' | grep -o '[A-Z2-9]\{8\}')
OID2=$(node --env-file=.env.local --input-type=module -e "import {Pool} from '@neondatabase/serverless'; const p=new Pool({connectionString:process.env.DATABASE_URL_UNPOOLED}); const r=await p.query('select id from orders where code=\$1',['$CODE2']); console.log(r.rows[0].id); await p.end();" 2>/dev/null)
curl -s -b $A -o /dev/null -X POST -H "$J" -d '{"delta":-2,"reason":"adjustment"}' $B/api/products/$P1/stock
R3=$(curl -s -w ' [%{http_code}]' -b $A -X PATCH -H "$J" -d '{"status":"fulfilled"}' $B/api/orders/$OID2)
has "not enough stock refuses the whole order" "Not enough stock for Ankara dress" "$R3"
echo "  stock unchanged by the failed attempt: P1 $(curl -s -b $A $B/api/products/$P1 | sed -E 's/.*"quantityOnHand":(-?[0-9]+).*/\1/') (expect 1)"
ok "order is still open after the failure" 200 $(code -b $A -X PATCH -H "$J" -d '{"status":"cancelled"}' $B/api/orders/$OID2)

echo "== closing the store"
ok "A closes" 200 $(code -b $A -X PATCH -H "$J" -d '{"status":"draft"}' $B/api/store)
has "public sees closed again" "isn.t open yet" "$(curl -s $B/s/$SA)"
ok "orders refused again" 404 $(code -X POST -H "$J" -H "$(ip)" -d "{\"customerName\":\"Ada\",\"customerPhone\":\"08031234567\",\"deliveryAddress\":\"12 Test Street\",\"items\":[{\"productId\":\"$P4\",\"quantity\":1}]}" $B/api/s/$SA/orders)

echo; echo "PASSED: $PASSES   FAILURES: $FAILS"
rm -rf $D
