import 'package:flutter_test/flutter_test.dart';
import 'package:obaol_mobile/native_update.dart';

void main() {
  test('parses strict semantic versions', () {
    expect(parseVersion('1.0.1'), [1, 0, 1]);
    expect(parseVersion('1.0'), isNull);
    expect(parseVersion('v1.0.1'), isNull);
  });

  test('compares versions component by component', () {
    expect(compareVersions('1.0.1', '1.0.0'), greaterThan(0));
    expect(compareVersions('1.2.0', '1.10.0'), lessThan(0));
    expect(compareVersions('2.0.0', '2.0.0'), 0);
  });
}
