import test from "node:test";
import assert from "node:assert/strict";

import {
  CONTACT_NUMBER_SPECIFICATION_ERROR,
  containsPhoneLikeNumber,
} from "../src/utils/enquirySpecificationValidation.ts";

test("allows empty, textual, and short numeric product specifications", () => {
  for (const value of [
    "",
    "Organic export quality",
    "6-7mm",
    "Grade 1",
    "10% moisture",
    "2 x 25 kg bags",
  ]) {
    assert.equal(containsPhoneLikeNumber(value), false, value);
  }
});

test("detects plain and commonly formatted contact numbers", () => {
  for (const value of [
    "Call me at 917028255569",
    "My number is +91 70282 55569",
    "Reach me on 702-825-5569",
    "Phone: 702.825.5569",
    "Phone: (702) 825 5569",
    "Full-width: ＋９１ ７０２８２５５５６９",
  ]) {
    assert.equal(containsPhoneLikeNumber(value), true, value);
  }
});

test("exports the API and form validation message", () => {
  assert.equal(
    CONTACT_NUMBER_SPECIFICATION_ERROR,
    "Contact numbers are not allowed in specifications.",
  );
});
