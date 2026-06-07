#!/usr/bin/env bash
#
# Post-`flutter create` patches that can't live in the tracked files.
# Runs from apps/mobile/ as CWD on Codemagic and in local dev.
#
# What it patches:
#   - iOS bundle identifier in Runner.xcodeproj/project.pbxproj
#     (flutter create writes ng.computicket.computicket_mobile,
#      we want ng.computicket.app)
#   - Wires Runner.entitlements into the Xcode project (CODE_SIGN_ENTITLEMENTS)
#   - Wires PrivacyInfo.xcprivacy into the iOS bundle resources
#   - Drops Firebase secrets out of env vars into the right paths
#   - Generates android/key.properties from Codemagic-injected vars

set -euo pipefail

IOS_BUNDLE_ID="ng.computicket.app"
PBX="ios/Runner.xcodeproj/project.pbxproj"

if [[ -f "$PBX" ]]; then
  echo "Patching iOS bundle id -> $IOS_BUNDLE_ID"
  sed -i.bak \
    "s/PRODUCT_BUNDLE_IDENTIFIER = ng\\.computicket\\.computicketMobile;/PRODUCT_BUNDLE_IDENTIFIER = $IOS_BUNDLE_ID;/g; \
     s/PRODUCT_BUNDLE_IDENTIFIER = ng\\.computicket\\.computicket_mobile;/PRODUCT_BUNDLE_IDENTIFIER = $IOS_BUNDLE_ID;/g" \
    "$PBX"
  rm -f "$PBX.bak"

  if ! grep -q "CODE_SIGN_ENTITLEMENTS = Runner/Runner.entitlements" "$PBX"; then
    echo "Wiring Runner.entitlements into project.pbxproj"
    # Insert under each build configuration's buildSettings block. The
    # sed pattern matches the line "PRODUCT_BUNDLE_IDENTIFIER = ..."
    # (just rewritten above) and inserts CODE_SIGN_ENTITLEMENTS above it.
    sed -i.bak \
      "/PRODUCT_BUNDLE_IDENTIFIER = $IOS_BUNDLE_ID;/i\\
				CODE_SIGN_ENTITLEMENTS = Runner/Runner.entitlements;" \
      "$PBX"
    rm -f "$PBX.bak"
  fi
else
  echo "WARN: $PBX not found — run flutter create first." >&2
fi

# ---- Firebase secrets ----

if [[ -n "${GOOGLE_SERVICES_JSON:-}" ]]; then
  echo "Writing android/app/google-services.json from env"
  printf '%s' "$GOOGLE_SERVICES_JSON" > android/app/google-services.json
elif [[ -n "${GOOGLE_SERVICES_JSON_B64:-}" ]]; then
  echo "Writing android/app/google-services.json (base64) from env"
  echo "$GOOGLE_SERVICES_JSON_B64" | base64 -d > android/app/google-services.json
fi

if [[ -n "${GOOGLE_SERVICE_INFO_PLIST:-}" ]]; then
  echo "Writing ios/Runner/GoogleService-Info.plist from env"
  printf '%s' "$GOOGLE_SERVICE_INFO_PLIST" > ios/Runner/GoogleService-Info.plist
elif [[ -n "${GOOGLE_SERVICE_INFO_PLIST_B64:-}" ]]; then
  echo "Writing ios/Runner/GoogleService-Info.plist (base64) from env"
  echo "$GOOGLE_SERVICE_INFO_PLIST_B64" | base64 -d > ios/Runner/GoogleService-Info.plist
fi

# Add GoogleService-Info.plist to the Xcode project resources so it
# ships inside the IPA. The Flutter template doesn't reference it
# automatically.
if [[ -f "ios/Runner/GoogleService-Info.plist" && -f "$PBX" ]]; then
  if ! grep -q "GoogleService-Info.plist" "$PBX"; then
    echo "Wiring GoogleService-Info.plist into Xcode resources"
    # The simplest cross-platform path is `ruby xcodeproj` but that's a
    # heavy dep. Codemagic ships with it preinstalled; skip the install
    # step locally.
    ruby -e '
      require "xcodeproj"
      project_path = "ios/Runner.xcodeproj"
      project = Xcodeproj::Project.open(project_path)
      target = project.native_targets.find { |t| t.name == "Runner" }
      group = project.main_group["Runner"]
      file = group.new_reference("GoogleService-Info.plist")
      target.resources_build_phase.add_file_reference(file)
      project.save
    ' || echo "WARN: Ruby xcodeproj not available; reference manually in Xcode."
  fi
fi

# ---- Android signing ----

if [[ -n "${CM_KEYSTORE_PATH:-}" ]]; then
  cat > android/key.properties <<EOF
storePassword=${CM_KEYSTORE_PASSWORD}
keyPassword=${CM_KEY_PASSWORD}
keyAlias=${CM_KEY_ALIAS}
storeFile=${CM_KEYSTORE_PATH}
EOF
  echo "Wrote android/key.properties for release signing"
fi

echo "codemagic_setup: done"
