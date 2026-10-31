#!/usr/bin/env bash
set -euo pipefail

mobile_root="$(cd "$(dirname "$0")/.." && pwd)"
temp_root="$(mktemp -d)"
trap 'rm -rf "$temp_root"' EXIT

flutter create --platforms=android,ios --org com.obaol --project-name obaol_mobile "$temp_root/obaol_mobile"

mkdir -p "$mobile_root/android/gradle/wrapper" "$mobile_root/ios/Flutter" "$mobile_root/ios/Runner"
cp "$temp_root/obaol_mobile/android/gradlew" "$mobile_root/android/gradlew"
cp "$temp_root/obaol_mobile/android/gradlew.bat" "$mobile_root/android/gradlew.bat"
cp "$temp_root/obaol_mobile/android/gradle/wrapper/gradle-wrapper.jar" "$mobile_root/android/gradle/wrapper/gradle-wrapper.jar"
cp "$temp_root/obaol_mobile/android/gradle/wrapper/gradle-wrapper.properties" "$mobile_root/android/gradle/wrapper/gradle-wrapper.properties"

rm -rf "$mobile_root/ios/Runner.xcodeproj" "$mobile_root/ios/Runner.xcworkspace"
cp -R "$temp_root/obaol_mobile/ios/Runner.xcodeproj" "$mobile_root/ios/Runner.xcodeproj"
cp -R "$temp_root/obaol_mobile/ios/Runner.xcworkspace" "$mobile_root/ios/Runner.xcworkspace"
cp "$temp_root/obaol_mobile/ios/Flutter/AppFrameworkInfo.plist" "$mobile_root/ios/Flutter/AppFrameworkInfo.plist"
cp "$temp_root/obaol_mobile/ios/Flutter/Debug.xcconfig" "$mobile_root/ios/Flutter/Debug.xcconfig"
cp "$temp_root/obaol_mobile/ios/Flutter/Release.xcconfig" "$mobile_root/ios/Flutter/Release.xcconfig"
cp -R "$temp_root/obaol_mobile/ios/Runner/Assets.xcassets" "$mobile_root/ios/Runner/Assets.xcassets"
cp -R "$temp_root/obaol_mobile/ios/Runner/Base.lproj" "$mobile_root/ios/Runner/Base.lproj"

brand_icon="$mobile_root/../public/pwa/icon-512.png"
if command -v sips >/dev/null 2>&1 && [[ -f "$brand_icon" ]]; then
  while IFS= read -r target; do
    width="$(sips -g pixelWidth "$target" | awk '/pixelWidth/ {print $2}')"
    height="$(sips -g pixelHeight "$target" | awk '/pixelHeight/ {print $2}')"
    sips -z "$height" "$width" "$brand_icon" --out "$target" >/dev/null
  done < <(find "$mobile_root/ios/Runner/Assets.xcassets/AppIcon.appiconset" -name '*.png' -type f)
fi

python3 - "$mobile_root/ios/Runner.xcodeproj/project.pbxproj" <<'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
text = path.read_text()
text = text.replace("com.obaol.obaolMobile", "com.obaol.app")
text = text.replace("com.obaol.obaol_mobile", "com.obaol.app")
text = text.replace("PRODUCT_BUNDLE_IDENTIFIER = com.obaol.app.RunnerTests;", "PRODUCT_BUNDLE_IDENTIFIER = com.obaol.app.RunnerTests;")
text = text.replace("CODE_SIGN_STYLE = Automatic;", "CODE_SIGN_ENTITLEMENTS = Runner/Runner.entitlements;\n\t\t\t\tCODE_SIGN_STYLE = Automatic;")
path.write_text(text)
PY

echo "Flutter Android/iOS infrastructure generated. Review git diff before committing generated files."
