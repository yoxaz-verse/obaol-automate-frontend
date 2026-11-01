import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:obaol_mobile/config.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

const updateCheckInterval = Duration(hours: 12);
const _lastCheckKey = 'obaol_update_last_check';
const _dismissedVersionKey = 'obaol_update_dismissed_version';

class NativeUpdateInfo {
  const NativeUpdateInfo({
    required this.version,
    required this.storeUri,
    required this.required,
  });

  final String version;
  final Uri storeUri;
  final bool required;
}

List<int>? parseVersion(String value) {
  final match = RegExp(r'^(\d+)\.(\d+)\.(\d+)$').firstMatch(value.trim());
  if (match == null) return null;
  return [for (var index = 1; index <= 3; index++) int.parse(match.group(index)!)];
}

int compareVersions(String left, String right) {
  final a = parseVersion(left);
  final b = parseVersion(right);
  if (a == null || b == null) throw const FormatException('Invalid application version.');
  for (var index = 0; index < 3; index++) {
    if (a[index] != b[index]) return a[index].compareTo(b[index]);
  }
  return 0;
}

class NativeUpdateService {
  NativeUpdateService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Future<NativeUpdateInfo?> check({bool force = false}) async {
    final preferences = await SharedPreferences.getInstance();
    final now = DateTime.now();
    final lastCheck = DateTime.tryParse(preferences.getString(_lastCheckKey) ?? '');
    if (!force && lastCheck != null && now.difference(lastCheck) < updateCheckInterval) return null;
    await preferences.setString(_lastCheckKey, now.toUtc().toIso8601String());

    try {
      final response = await _client.get(
        AppConfig.versionManifestUri,
        headers: const {'accept': 'application/json'},
      ).timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) return null;
      final payload = jsonDecode(response.body) as Map<String, dynamic>;
      final ios = payload['ios'];
      if (ios is! Map || ios['enabled'] != true) return null;
      final latest = String(ios['latestVersion'] ?? '');
      final minimum = String(ios['minimumVersion'] ?? '');
      final storeUri = Uri.tryParse(String(ios['storeUrl'] ?? ''));
      if (parseVersion(latest) == null || parseVersion(minimum) == null || storeUri == null || storeUri.scheme != 'https' || storeUri.host != 'apps.apple.com') return null;

      final installed = (await PackageInfo.fromPlatform()).version;
      if (compareVersions(latest, installed) <= 0) return null;
      final required = compareVersions(installed, minimum) < 0;
      if (!required && preferences.getString(_dismissedVersionKey) == latest) return null;
      return NativeUpdateInfo(version: latest, storeUri: storeUri, required: required);
    } catch (_) {
      return null;
    }
  }

  Future<void> dismiss(String version) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_dismissedVersionKey, version);
  }
}
