import test from "node:test";
import assert from "node:assert/strict";

import {
  ASSOCIATE_PASSWORD_REQUIREMENTS,
  getMissingAssociatePasswordRequirements,
  isRepeatedDigitPhone,
} from "../src/utils/associateOnboardingValidation.ts";

test("associate password requirements cover every displayed strength rule", () => {
  assert.deepEqual(
    ASSOCIATE_PASSWORD_REQUIREMENTS.map(({ label }) => label),
    ["At least 8 characters", "One uppercase letter", "One lowercase letter", "One number", "One special character"]
  );
  assert.deepEqual(getMissingAssociatePasswordRequirements("Strong!1"), []);
  assert.deepEqual(getMissingAssociatePasswordRequirements("PASSWORD1!"), ["One lowercase letter"]);
  assert.deepEqual(getMissingAssociatePasswordRequirements("Password!"), ["One number"]);
  assert.deepEqual(getMissingAssociatePasswordRequirements("Password1"), ["One special character"]);
  assert.deepEqual(getMissingAssociatePasswordRequirements("Password1 "), ["One special character"]);
});

test("associate phone validation rejects only all-repeated digit values", () => {
  assert.equal(isRepeatedDigitPhone("0000000000"), true);
  assert.equal(isRepeatedDigitPhone("1111111"), true);
  assert.equal(isRepeatedDigitPhone("7028255569"), false);
  assert.equal(isRepeatedDigitPhone(""), false);
});
