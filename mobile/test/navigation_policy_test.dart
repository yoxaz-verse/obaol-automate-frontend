import 'package:flutter_test/flutter_test.dart';
import 'package:obaol_mobile/navigation_policy.dart';

void main() {
  test('allows only trusted OBAOL HTTPS pages in the WebView', () {
    expect(classifyNavigation(Uri.parse('https://www.obaol.com/dashboard')), NavigationAction.allow);
    expect(classifyNavigation(Uri.parse('http://www.obaol.com/dashboard')), NavigationAction.reject);
    expect(classifyNavigation(Uri.parse('javascript:alert(1)')), NavigationAction.reject);
  });

  test('opens safe external links outside the WebView', () {
    expect(classifyNavigation(Uri.parse('https://example.com')), NavigationAction.external);
    expect(classifyNavigation(Uri.parse('mailto:info@support.obaol.com')), NavigationAction.external);
  });

  test('limits accepted deep links to public and dashboard routes', () {
    expect(isApprovedDeepLink(Uri.parse('https://www.obaol.com/dashboard/orders')), isTrue);
    expect(isApprovedDeepLink(Uri.parse('https://www.obaol.com/admin/internal')), isFalse);
  });
}
