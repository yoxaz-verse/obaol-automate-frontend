# OBAOL Mobile

Flutter WebView shell for the live OBAOL application. One codebase produces Android and iOS apps with application/bundle ID `com.obaol.app`.

## Prerequisites and first setup

Install the stable Flutter SDK, Android Studio/SDK, Xcode 16+, CocoaPods, and the relevant platform signing tools. Because this repository was initialized on a machine without Flutter, generate only the standard Gradle wrapper and Xcode project infrastructure once:

```sh
cd mobile
bash tool/bootstrap_platforms.sh
flutter pub get
```

The script generates infrastructure in a temporary Flutter app and copies only the standard files that cannot be authored without the SDK. It preserves the checked-in OBAOL manifests, entitlements, source, and build settings.

## Run and verify

```sh
flutter run \
  --dart-define=APP_URL=https://www.obaol.com/auth \
  --dart-define=API_BASE_URL=https://api.obaol.com/api/v1/web \
  --dart-define=GOOGLE_SERVER_CLIENT_ID=WEB_CLIENT_ID.apps.googleusercontent.com \
  --dart-define=GOOGLE_IOS_CLIENT_ID=IOS_CLIENT_ID.apps.googleusercontent.com \
  --dart-define=APPLE_SERVICE_ID=com.obaol.web \
  --dart-define=APPLE_REDIRECT_URI=https://www.obaol.com/auth/apple/callback

dart format --output=none --set-exit-if-changed lib test
flutter analyze
flutter test
flutter build appbundle --release
flutter build ipa --release
```

Debug builds can point `APP_URL` and `API_BASE_URL` to a reachable HTTPS development environment. Cleartext HTTP is deliberately disabled; use a trusted development certificate.

## Authentication configuration

Create separate Google OAuth clients for the website, Android package `com.obaol.app` with release SHA certificates, and iOS bundle `com.obaol.app`. Set `GOOGLE_IOS_CLIENT_ID` and `REVERSED_GOOGLE_IOS_CLIENT_ID` as Xcode build settings (or provide the corresponding `GoogleService-Info.plist`). Configure the backend with:

```text
GOOGLE_CLIENT_ID=<web client id>
GOOGLE_ANDROID_CLIENT_ID=<android client id>
GOOGLE_IOS_CLIENT_ID=<ios client id>
APPLE_SERVICE_ID=<web Services ID>
APPLE_IOS_BUNDLE_ID=com.obaol.app
```

Configure the frontend with `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_APPLE_SERVICE_ID`, and an HTTPS `NEXT_PUBLIC_APPLE_REDIRECT_URI`. Enable Sign in with Apple for the App ID and associate the Services ID with the website domain. Apple private keys are needed only if a future authorization-code exchange is added; this release verifies Apple identity tokens against Apple's public JWKS.

## Deep links

Set `APPLE_TEAM_ID` and `ANDROID_APP_LINK_SHA256` on the website deployment. The website then serves:

- `/.well-known/apple-app-site-association`
- `/.well-known/assetlinks.json`

Use comma-separated SHA-256 fingerprints during certificate rotation. Verify both files over HTTPS without redirects before store submission.

## Signing and releases

Android release signing reads `android/key.properties`; keep the keystore and properties out of Git. iOS uses automatic signing after selecting the Apple team in Xcode. Update `version` in `pubspec.yaml` for every release. CI intentionally uses debug Android signing and unsigned iOS output only to prove compilation; store artifacts must be produced with protected signing credentials.

The bootstrap uses the existing approved OBAOL PWA artwork for the iOS icon set and the checked-in OBAOL vector mark for Android. Before submission, confirm both exports against the current brand book, complete Google Play Data Safety and Apple Privacy Nutrition Label declarations, provide the existing privacy-policy URL, and test camera/gallery/document uploads on physical devices.

## Security and behavior

Only HTTPS OBAOL hosts render inside the WebView. Safe non-OBAOL HTTPS, email, and telephone links open externally; other schemes and invalid TLS challenges are rejected. Cookies and DOM storage persist through the platform WebView stores. Native Google/Apple flows return identity tokens to the existing backend, which installs the normal HTTP-only OBAOL session cookie before navigation continues.
