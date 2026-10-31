class AppConfig {
  static const appUrl = String.fromEnvironment(
    'APP_URL',
    defaultValue: 'https://www.obaol.com/auth',
  );
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.obaol.com/api/v1/web',
  );
  static const googleServerClientId = String.fromEnvironment(
    'GOOGLE_SERVER_CLIENT_ID',
  );

  static final Uri startUri = Uri.parse(appUrl);
  static final Uri apiUri = Uri.parse(apiBaseUrl);
  static const trustedHosts = {'obaol.com', 'www.obaol.com', 'api.obaol.com'};

  static bool isTrusted(Uri uri) =>
      uri.scheme == 'https' &&
      (trustedHosts.contains(uri.host) || uri.host.endsWith('.obaol.com'));
}
