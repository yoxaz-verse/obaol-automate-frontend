import 'package:obaol_mobile/config.dart';

enum NavigationAction { allow, external, reject }

NavigationAction classifyNavigation(Uri uri) {
  if (AppConfig.isTrusted(uri)) return NavigationAction.allow;
  if (const {'https', 'mailto', 'tel'}.contains(uri.scheme)) {
    return NavigationAction.external;
  }
  return NavigationAction.reject;
}

bool isApprovedDeepLink(Uri uri) =>
    AppConfig.isTrusted(uri) &&
    (uri.path == '/auth' ||
        uri.path == '/dashboard' ||
        uri.path.startsWith('/dashboard/') ||
        uri.path.startsWith('/product/') ||
        uri.path.startsWith('/company/'));
