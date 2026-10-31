import 'dart:async';
import 'dart:io';

import 'package:app_links/app_links.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:obaol_mobile/config.dart';
import 'package:obaol_mobile/native_auth.dart';
import 'package:obaol_mobile/navigation_policy.dart';
import 'package:url_launcher/url_launcher.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations(const [
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);
  if (!kReleaseMode && Platform.isAndroid) {
    await InAppWebViewController.setWebContentsDebuggingEnabled(true);
  }
  runApp(const ObaolApp());
}

class ObaolApp extends StatelessWidget {
  const ObaolApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'OBAOL',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xffcf983c)),
          scaffoldBackgroundColor: const Color(0xfffcfaf6),
          useMaterial3: true,
        ),
        home: const ObaolShell(),
      );
}

class ObaolShell extends StatefulWidget {
  const ObaolShell({super.key});

  @override
  State<ObaolShell> createState() => _ObaolShellState();
}

class _ObaolShellState extends State<ObaolShell> {
  final _auth = NativeAuthService();
  final _pullToRefresh = PullToRefreshController();
  InAppWebViewController? _controller;
  StreamSubscription<Uri>? _linkSubscription;
  int _progress = 0;
  String? _error;

  @override
  void initState() {
    super.initState();
    _linkSubscription = AppLinks().uriLinkStream.listen(_openDeepLink);
  }

  @override
  void dispose() {
    _linkSubscription?.cancel();
    super.dispose();
  }

  Future<void> _openDeepLink(Uri uri) async {
    if (isApprovedDeepLink(uri)) await _controller?.loadUrl(urlRequest: URLRequest(url: WebUri.uri(uri)));
  }

  @override
  Widget build(BuildContext context) => PopScope(
        canPop: false,
        onPopInvokedWithResult: (_, __) async {
          if (await _controller?.canGoBack() == true) {
            await _controller?.goBack();
          } else if (Platform.isAndroid) {
            SystemNavigator.pop();
          }
        },
        child: Scaffold(
          body: SafeArea(
            bottom: false,
            child: Stack(
              children: [
                InAppWebView(
                  initialUrlRequest: URLRequest(url: WebUri.uri(AppConfig.startUri)),
                  pullToRefreshController: _pullToRefresh,
                  initialSettings: InAppWebViewSettings(
                    javaScriptEnabled: true,
                    domStorageEnabled: true,
                    databaseEnabled: true,
                    thirdPartyCookiesEnabled: true,
                    sharedCookiesEnabled: true,
                    useShouldOverrideUrlLoading: true,
                    mediaPlaybackRequiresUserGesture: false,
                    allowsInlineMediaPlayback: true,
                    userAgent: 'OBAOL-Mobile/1.0',
                  ),
                  onWebViewCreated: (controller) {
                    _controller = controller;
                    controller.addJavaScriptHandler(
                      handlerName: 'obaolAuth',
                      callback: (arguments) async {
                        final request = arguments.isNotEmpty && arguments.first is Map
                            ? Map<String, dynamic>.from(arguments.first as Map)
                            : <String, dynamic>{};
                        try {
                          final result = await _auth.signIn(
                            request['provider'] as String? ?? '',
                            request,
                            controller,
                          );
                          await controller.loadUrl(
                            urlRequest: URLRequest(
                              url: WebUri.uri(AppConfig.startUri.resolve(result.next)),
                            ),
                          );
                          return {'ok': true, 'next': result.next};
                        } catch (error) {
                          return {'ok': false, 'error': safeAuthError(error)};
                        }
                      },
                    );
                  },
                  shouldOverrideUrlLoading: (controller, action) async {
                    final uri = action.request.url;
                    if (uri == null) return NavigationActionPolicy.CANCEL;
                    switch (classifyNavigation(uri)) {
                      case NavigationAction.allow:
                        return NavigationActionPolicy.ALLOW;
                      case NavigationAction.external:
                        await launchUrl(uri, mode: LaunchMode.externalApplication);
                        return NavigationActionPolicy.CANCEL;
                      case NavigationAction.reject:
                        return NavigationActionPolicy.CANCEL;
                    }
                  },
                  onReceivedServerTrustAuthRequest: (_, __) async =>
                      ServerTrustAuthResponse(action: ServerTrustAuthResponseAction.CANCEL),
                  onLoadStart: (_, __) => setState(() => _error = null),
                  onProgressChanged: (_, progress) {
                    setState(() => _progress = progress);
                    if (progress == 100) _pullToRefresh.endRefreshing();
                  },
                  onLoadStop: (_, __) {
                    _pullToRefresh.endRefreshing();
                    setState(() => _error = null);
                  },
                  onReceivedError: (_, request, error) {
                    if (request.isForMainFrame == true) setState(() => _error = error.description);
                    _pullToRefresh.endRefreshing();
                  },
                  onDownloadStartRequest: (_, request) async {
                    final uri = Uri.tryParse(request.url.toString());
                    if (uri != null && classifyNavigation(uri) != NavigationAction.reject) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    }
                  },
                ),
                if (_progress < 100)
                  LinearProgressIndicator(
                    value: _progress / 100,
                    color: const Color(0xffcf983c),
                    minHeight: 2,
                  ),
                if (_error != null) _ErrorView(message: _error!, onRetry: () => _controller?.reload()),
              ],
            ),
          ),
        ),
      );
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => ColoredBox(
        color: const Color(0xfffcfaf6),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.cloud_off_rounded, size: 52, color: Color(0xff9a6a22)),
                const SizedBox(height: 18),
                const Text('OBAOL is temporarily offline', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Text(message, textAlign: TextAlign.center, maxLines: 3, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 20),
                FilledButton.icon(onPressed: onRetry, icon: const Icon(Icons.refresh), label: const Text('Try again')),
              ],
            ),
          ),
        ),
      );
