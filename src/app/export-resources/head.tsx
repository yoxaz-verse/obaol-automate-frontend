import { DEFAULT_KEYWORDS, GEO_KEYWORDS } from "@/utils/seo";

const URL = "https://obaol.com/export-resources";
const KEYWORDS = [...DEFAULT_KEYWORDS, ...GEO_KEYWORDS, "export resources", "trade compliance"].join(", ");

export default function ExportResourcesHead() {
  return (
    <>
      <title>Export Resource Center | OBAOL Supreme</title>
      <meta
        name="description"
        content="Starting in India, access verified official export resources, compliance links, and operational references for Indian commodity exporters as OBAOL expands globally."
      />
      <meta name="keywords" content={KEYWORDS} />
      <link rel="canonical" href={URL} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content="Export Resource Center | OBAOL Supreme" />
      <meta
        property="og:description"
        content="Starting in India, official export and compliance resource links curated for commodity trade operations as OBAOL expands globally."
      />
      <meta property="og:url" content={URL} />
      <meta property="og:image" content="https://obaol.com/logo.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Export Resource Center | OBAOL Supreme" />
      <meta
        name="twitter:description"
        content="Starting in India, official export and compliance resource links curated for commodity trade operations as OBAOL expands globally."
      />
      <meta name="twitter:image" content="https://obaol.com/logo.png" />
    </>
  );
}
