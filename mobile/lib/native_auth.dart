import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'package:obaol_mobile/config.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

class NativeAuthResult {
  const NativeAuthResult({required this.next});
  final String next;
}

class NativeAuthService {
  NativeAuthService({http.Client? client}) : _client = client ?? http.Client();
  final http.Client _client;

  Future<NativeAuthResult> signIn(
    String provider,
    Map<String, dynamic> request,
    InAppWebViewController controller,
  ) async {
    final role = _role(request['role']);
    final intent = request['intent'] == 'register' ? 'register' : 'login';
    final rememberMe = request['rememberMe'] == true;
    late Map<String, dynamic> body;

    if (provider == 'google') {
      final account = await GoogleSignIn(
        clientId: Platform.isIOS && AppConfig.googleIosClientId.isNotEmpty
            ? AppConfig.googleIosClientId
            : null,
        serverClientId: AppConfig.googleServerClientId.isEmpty
            ? null
            : AppConfig.googleServerClientId,
        scopes: const ['email', 'profile'],
      ).signIn();
      if (account == null) throw const NativeAuthCancelled();
      final auth = await account.authentication;
      if (auth.idToken == null) throw Exception('Google did not return an identity token.');
      body = {
        'idToken': auth.idToken,
        'role': role,
        'intent': intent,
        'rememberMe': rememberMe,
      };
    } else if (provider == 'apple') {
      final rawNonce = _nonce();
      if (Platform.isAndroid &&
          (AppConfig.appleServiceId.isEmpty || AppConfig.appleRedirectUri.isEmpty)) {
        throw Exception('Apple sign-in is not configured for Android.');
      }
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: const [AppleIDAuthorizationScopes.email, AppleIDAuthorizationScopes.fullName],
        nonce: sha256.convert(utf8.encode(rawNonce)).toString(),
        webAuthenticationOptions: Platform.isAndroid
            ? WebAuthenticationOptions(
                clientId: AppConfig.appleServiceId,
                redirectUri: Uri.parse(AppConfig.appleRedirectUri),
              )
            : null,
      );
      if (credential.identityToken == null) throw Exception('Apple did not return an identity token.');
      final name = [credential.givenName, credential.familyName]
          .whereType<String>()
          .where((value) => value.trim().isNotEmpty)
          .join(' ');
      body = {
        'identityToken': credential.identityToken,
        'rawNonce': rawNonce,
        'role': role,
        'intent': intent,
        'rememberMe': rememberMe,
        if (name.isNotEmpty) 'name': name,
      };
    } else {
      throw Exception('Unsupported identity provider.');
    }

    final endpoint = Uri.parse('${AppConfig.apiBaseUrl.replaceFirst(RegExp(r'/+$'), '')}/auth/$provider');
    final response = await _client.post(
      endpoint,
      headers: const {'content-type': 'application/json', 'accept': 'application/json'},
      body: jsonEncode(body),
    );
    final payload = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300 || payload['success'] != true) {
      throw Exception(payload['message'] is String ? payload['message'] : 'Authentication failed.');
    }
    await _installCookies(response.headers, controller);
    return NativeAuthResult(next: payload['next'] as String? ?? '/dashboard');
  }

  Future<void> _installCookies(
    Map<String, String> headers,
    InAppWebViewController controller,
  ) async {
    final setCookie = headers['set-cookie'];
    if (setCookie == null) throw Exception('The server did not return a session cookie.');
    final match = RegExp(r'(?:^|,\s*)auth_token=([^;]+)').firstMatch(setCookie);
    if (match == null) throw Exception('The server session cookie is invalid.');
    await CookieManager.instance().setCookie(
      url: WebUri('https://www.obaol.com'),
      name: 'auth_token',
      value: match.group(1)!,
      domain: '.obaol.com',
      path: '/',
      isSecure: true,
      isHttpOnly: true,
      sameSite: HTTPCookieSameSitePolicy.NONE,
    );
    await controller.evaluateJavascript(
      source: "window.dispatchEvent(new CustomEvent('obaol:native-authenticated'));",
    );
  }

  static String _role(Object? value) =>
      value == 'Operator' || value == 'team' || value == 'operator'
          ? 'Operator'
          : 'Associate';

  static String _nonce([int length = 32]) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    final random = Random.secure();
    return List.generate(length, (_) => chars[random.nextInt(chars.length)]).join();
  }
}

class NativeAuthCancelled implements Exception {
  const NativeAuthCancelled();
}

String safeAuthError(Object error) {
  if (error is NativeAuthCancelled) return 'Sign-in was cancelled.';
  final text = error.toString().replaceFirst('Exception: ', '').trim();
  if (kDebugMode && text.isNotEmpty) return text;
  const allowed = {
    'Account not found. Please sign up.',
    'Account exists under a different role.',
    'This email is linked to another Apple account.',
  };
  return allowed.contains(text) ? text : 'Sign-in could not be completed. Please try again.';
}
