#!/bin/bash
#
# Concurrency load test for inventory holds.
#
# Sets a single ticket type to capacity=5, fires N parallel order creations
# of quantity=1 from cold, and checks that exactly 5 succeed (HTTP 201) and
# the remaining N-5 fail with HTTP 400. Then forces the unsold orders to
# expiry and verifies the cron releases held inventory back to zero.
#
# Run against a local stack:
#   docker compose -f infra/docker-compose.yml up -d
#   pnpm db:generate && pnpm --filter @computicket/db exec prisma migrate deploy
#   pnpm db:seed
#   pnpm --filter @computicket/api run build
#   PGPASSWORD=computicket bash scripts/load-test-inventory.sh
#
set +e

CONCURRENCY="${CONCURRENCY:-50}"
CAPACITY="${CAPACITY:-5}"
EVENT_SLUG="${EVENT_SLUG:-davido-timeless-tour-lagos}"
DB_URL="${DATABASE_URL:-postgresql://computicket:computicket@localhost:5432/computicket?schema=public}"
PSQL_DB="${PSQL_DB:-computicket}"
PSQL_USER="${PSQL_USER:-computicket}"
PSQL_HOST="${PSQL_HOST:-localhost}"

cd "$(dirname "$0")/.."

# Reset state and re-seed
psql -U "$PSQL_USER" -h "$PSQL_HOST" -d "$PSQL_DB" -c "
  TRUNCATE TABLE \"Ticket\", \"OrderItem\", \"Order\", \"TicketType\", \"Event\", \"OrganizerMember\", \"Organizer\", \"User\" RESTART IDENTITY CASCADE;
" > /dev/null
DATABASE_URL="$DB_URL" pnpm db:seed > /dev/null

# Force capacity down on the target ticket type
psql -U "$PSQL_USER" -h "$PSQL_HOST" -d "$PSQL_DB" -c "
  UPDATE \"TicketType\" SET capacity=$CAPACITY, sold=0, held=0
  WHERE \"eventId\"=(SELECT id FROM \"Event\" WHERE slug='$EVENT_SLUG')
    AND name='Regular';
" > /dev/null

export DATABASE_URL="$DB_URL"
export PAYSTACK_SECRET_KEY=sk_test_replace_me
export JWT_SECRET=load_test_secret
export PORT=4000

node apps/api/dist/main.js > /tmp/api.log 2>&1 &
API_PID=$!
sleep 4
if ! curl -sf http://localhost:4000/v1/health > /dev/null; then
  echo "FAIL: API didn't start"
  tail -20 /tmp/api.log
  kill $API_PID 2>/dev/null
  exit 1
fi

TT_ID=$(curl -s "http://localhost:4000/v1/events/$EVENT_SLUG" \
  | python3 -c "import json,sys; print([t for t in json.load(sys.stdin)['ticketTypes'] if t['name']=='Regular'][0]['id'])")

echo "Inventory load test"
echo "  event: $EVENT_SLUG"
echo "  ticketTypeId: $TT_ID"
echo "  capacity: $CAPACITY"
echo "  concurrent requests: $CONCURRENCY"
echo

# Fire requests in parallel via xargs -P. Each call writes "HTTP <code>" to stdout.
RESULTS_FILE=$(mktemp)
START_NS=$(date +%s%N)
seq 1 "$CONCURRENCY" | xargs -P"$CONCURRENCY" -I{} sh -c "
  curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:4000/v1/orders \
    -H 'content-type: application/json' \
    -d '{\"eventSlug\":\"$EVENT_SLUG\",\"buyerEmail\":\"load{}@example.com\",\"items\":[{\"ticketTypeId\":\"$TT_ID\",\"quantity\":1}]}'
" > "$RESULTS_FILE"
END_NS=$(date +%s%N)
ELAPSED_MS=$(( (END_NS - START_NS) / 1000000 ))

SUCCESS=$(grep -c '^201$' "$RESULTS_FILE")
SOLD_OUT=$(grep -c '^400$' "$RESULTS_FILE")
OTHER=$(grep -vE '^(201|400)$' "$RESULTS_FILE" | wc -l)
EXPECTED_FAIL=$(( CONCURRENCY - CAPACITY ))

echo "Results after ${ELAPSED_MS}ms:"
echo "  HTTP 201 (held): $SUCCESS"
echo "  HTTP 400 (sold out): $SOLD_OUT"
echo "  other: $OTHER"

read SOLD HELD <<< $(psql -t -A -F' ' -U "$PSQL_USER" -h "$PSQL_HOST" -d "$PSQL_DB" \
  -c "SELECT sold, held FROM \"TicketType\" WHERE id='$TT_ID';")
echo "  DB state: sold=$SOLD held=$HELD"
echo

PASS=true
if [ "$SUCCESS" != "$CAPACITY" ]; then
  echo "FAIL: expected $CAPACITY successes, got $SUCCESS"; PASS=false
fi
if [ "$SOLD_OUT" != "$EXPECTED_FAIL" ]; then
  echo "FAIL: expected $EXPECTED_FAIL sold-out responses, got $SOLD_OUT"; PASS=false
fi
if [ "$OTHER" != "0" ]; then
  echo "FAIL: $OTHER non-201/400 responses"; PASS=false
fi
if [ "$SOLD" != "0" ] || [ "$HELD" != "$CAPACITY" ]; then
  echo "FAIL: expected sold=0 held=$CAPACITY, got sold=$SOLD held=$HELD"; PASS=false
fi

if [ "$PASS" = "true" ]; then
  echo "INVENTORY CHECK PASS — under $CONCURRENCY concurrent buyers, exactly"
  echo "$CAPACITY tickets were held and no over-sell occurred."
fi

# Now test expiry under load: force expiresAt into the past, wait for cron.
echo
echo "Expiry under load:"
psql -U "$PSQL_USER" -h "$PSQL_HOST" -d "$PSQL_DB" \
  -c "UPDATE \"Order\" SET \"expiresAt\"=NOW() - INTERVAL '1 minute' WHERE status='PENDING';" > /dev/null

WAIT_S=70
for i in $(seq 1 $WAIT_S); do
  HELD=$(psql -t -A -U "$PSQL_USER" -h "$PSQL_HOST" -d "$PSQL_DB" \
    -c "SELECT held FROM \"TicketType\" WHERE id='$TT_ID';")
  if [ "$HELD" = "0" ]; then
    EXPIRED=$(psql -t -A -U "$PSQL_USER" -h "$PSQL_HOST" -d "$PSQL_DB" \
      -c "SELECT COUNT(*) FROM \"Order\" WHERE status='EXPIRED';")
    echo "  expired $EXPIRED orders, released all holds after ${i}s"
    break
  fi
  sleep 1
done

HELD=$(psql -t -A -U "$PSQL_USER" -h "$PSQL_HOST" -d "$PSQL_DB" \
  -c "SELECT held FROM \"TicketType\" WHERE id='$TT_ID';")
PEND=$(psql -t -A -U "$PSQL_USER" -h "$PSQL_HOST" -d "$PSQL_DB" \
  -c "SELECT COUNT(*) FROM \"Order\" WHERE status='PENDING';")
if [ "$HELD" = "0" ] && [ "$PEND" = "0" ]; then
  echo "EXPIRY CHECK PASS — held back to 0, no lingering PENDING orders"
else
  echo "FAIL: held=$HELD pending=$PEND"
  PASS=false
fi

# Now N more buyers should be able to claim seats (since capacity is free again)
echo
echo "Re-sale after expiry:"
seq 1 "$CAPACITY" | xargs -n1 -P"$CAPACITY" -I{} sh -c "
  curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:4000/v1/orders \
    -H 'content-type: application/json' \
    -d '{\"eventSlug\":\"$EVENT_SLUG\",\"buyerEmail\":\"resale{}@example.com\",\"items\":[{\"ticketTypeId\":\"$TT_ID\",\"quantity\":1}]}'
" > "$RESULTS_FILE"
SUCCESS=$(grep -c '^201$' "$RESULTS_FILE")
echo "  $SUCCESS / $CAPACITY succeeded"
[ "$SUCCESS" = "$CAPACITY" ] || PASS=false

rm -f "$RESULTS_FILE"
kill $API_PID 2>/dev/null

echo
if [ "$PASS" = "true" ]; then
  echo "ALL CHECKS PASSED"
  exit 0
else
  echo "ONE OR MORE CHECKS FAILED"
  exit 1
fi
