import 'dart:async';
import 'dart:io';

import 'package:app_links/app_links.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:obaol_mobile/config.dart';
import 'package:obaol_mobile/native_auth.dart';
import 'package:obaol_mobile/navigation_policy.dart' as policy;
import 'package:obaol_mobile/native_update.dart';
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
  final _updates = NativeUpdateService();
  late final PullToRefreshController _pullToRefresh;
  InAppWebViewController? _controller;
  StreamSubscription<Uri>? _linkSubscription;
  Uri? _pendingDeepLink;
  int _progress = 0;
  String? _error;
  NativeUpdateInfo? _update;

  @override
  void initState() {
    super.initState();
    _pullToRefresh = PullToRefreshController(
      settings: PullToRefreshSettings(color: const Color(0xffcf983c)),
      onRefresh: () async => _controller?.reload(),
    );
    AppLinks().getInitialLink().then((uri) {
      if (uri != null) {
        _pendingDeepLink = uri;
        _openDeepLink(uri);
      }
    });
    _linkSubscription = AppLinks().uriLinkStream.listen(_openDeepLink);
    if (Platform.isIOS) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _checkForUpdate());
    }
  }

  @override
  void dispose() {
    _linkSubscription?.cancel();
    super.dispose();
  }

  Future<void> _openDeepLink(Uri uri) async {
    if (policy.isApprovedDeepLink(uri)) {
      await _controller?.loadUrl(urlRequest: URLRequest(url: WebUri.uri(uri)));
    }
  }

  Future<void> _checkForUpdate() async {
    final update = await _updates.check();
    if (mounted && update != null) setState(() => _update = update);
  }

  Future<void> _openUpdate() async {
    final update = _update;
    if (update == null) return;
    await launchUrl(update.storeUri, mode: LaunchMode.externalApplication);
  }

  Future<void> _dismissUpdate() async {
    final update = _update;
    if (update == null || update.required) return;
    await _updates.dismiss(update.version);
    if (mounted) setState(() => _update = null);
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
                  initialUrlRequest: URLRequest(
                    url: WebUri.uri(AppConfig.startUri),
                  ),
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
                    applicationNameForUserAgent: 'OBAOL-Mobile/1.0',
                  ),
                  onWebViewCreated: (controller) {
                    _controller = controller;
                    final pending = _pendingDeepLink;
                    if (pending != null && policy.isApprovedDeepLink(pending)) {
                      controller.loadUrl(
                        urlRequest: URLRequest(url: WebUri.uri(pending)),
                      );
                      _pendingDeepLink = null;
                    }
                    controller.addJavaScriptHandler(
                      handlerName: 'obaolAuth',
                      callback: (arguments) async {
                        final request = arguments.isNotEmpty &&
                                arguments.first is Map
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
                              url: WebUri.uri(
                                AppConfig.startUri.resolve(result.next),
                              ),
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
                    switch (policy.classifyNavigation(uri)) {
                      case policy.NavigationAction.allow:
                        return NavigationActionPolicy.ALLOW;
                      case policy.NavigationAction.external:
                        await launchUrl(uri,
                            mode: LaunchMode.externalApplication);
                        return NavigationActionPolicy.CANCEL;
                      case policy.NavigationAction.reject:
                        return NavigationActionPolicy.CANCEL;
                    }
                  },
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
                    if (request.isForMainFrame == true) {
                      setState(() => _error = error.description);
                    }
                    _pullToRefresh.endRefreshing();
                  },
                  onDownloadStartRequest: (_, request) async {
                    final uri = Uri.tryParse(request.url.toString());
                    if (uri != null &&
                        policy.classifyNavigation(uri) !=
                            policy.NavigationAction.reject) {
                      await launchUrl(uri,
                          mode: LaunchMode.externalApplication);
                    }
                  },
                ),
                if (_progress < 100)
                  LinearProgressIndicator(
                    value: _progress / 100,
                    color: const Color(0xffcf983c),
                    minHeight: 2,
                  ),
                if (_error != null)
                  _ErrorView(
                    message: _error!,
                    onRetry: () => _controller?.reload(),
                  ),
                if (_update != null && _update!.required)
                  Positioned.fill(
                    child: _RequiredUpdateView(
                      version: _update!.version,
                      onUpdate: _openUpdate,
                    ),
                  )
                else if (_update != null)
                  Positioned(
                    top: 10,
                    left: 12,
                    right: 12,
                    child: _UpdateBanner(
                      version: _update!.version,
                      onUpdate: _openUpdate,
                      onLater: _dismissUpdate,
                    ),
                  ),
              ],
            ),
          ),
        ),
      );
}

class _UpdateBanner extends StatelessWidget {
  const _UpdateBanner({
    required this.version,
    required this.onUpdate,
    required this.onLater,
  });
  final String version;
  final VoidCallback onUpdate;
  final VoidCallback onLater;

  @override
  Widget build(BuildContext context) => Material(
        elevation: 10,
        color: const Color(0xff17130d),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 10, 12),
          child: Row(
            children: [
              const Icon(Icons.system_update_rounded, color: Color(0xffe0a340)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'OBAOL $version is available',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              TextButton(onPressed: onLater, child: const Text('Later')),
              FilledButton(onPressed: onUpdate, child: const Text('Update')),
            ],
          ),
        ),
      );
}

class _RequiredUpdateView extends StatelessWidget {
  const _RequiredUpdateView({required this.version, required this.onUpdate});
  final String version;
  final VoidCallback onUpdate;

  @override
  Widget build(BuildContext context) => ColoredBox(
        color: const Color(0xff0c0a07),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.security_update_good_rounded,
                  size: 56,
                  color: Color(0xffe0a340),
                ),
                const SizedBox(height: 18),
                Text(
                  'Update to OBAOL $version',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'This update is required to continue securely.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 22),
                FilledButton.icon(
                  onPressed: onUpdate,
                  icon: const Icon(Icons.open_in_new),
                  label: const Text('Open App Store'),
                ),
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
                const Icon(
                  Icons.cloud_off_rounded,
                  size: 52,
                  color: Color(0xff9a6a22),
                ),
                const SizedBox(height: 18),
                const Text(
                  'OBAOL is temporarily offline',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 8),
                Text(
                  message,
                  textAlign: TextAlign.center,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 20),
                FilledButton.icon(
                  onPressed: onRetry,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Try again'),
                ),
              ],
            ),
          ),
        ),
      );
}
