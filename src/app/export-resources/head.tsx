const URL = "https://obaol.com/export-resources";

export default function ExportResourcesHead() {
  return (
    <>
      <title>Export Resource Center | OBAOL Supreme</title>
      <meta
        name="description"
        content="Access verified official export resources, compliance links, and operational references for Indian commodity exporters."
      />
      <link rel="canonical" href={URL} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content="Export Resource Center | OBAOL Supreme" />
      <meta
        property="og:description"
        content="Official export and compliance resource links curated for commodity trade operations."
      />
      <meta property="og:url" content={URL} />
      <meta property="og:image" content="https://obaol.com/logo.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Export Resource Center | OBAOL Supreme" />
      <meta
        name="twitter:description"
        content="Official export and compliance resource links curated for commodity trade operations."
      />
      <meta name="twitter:image" content="https://obaol.com/logo.png" />
    </>
  );
}
