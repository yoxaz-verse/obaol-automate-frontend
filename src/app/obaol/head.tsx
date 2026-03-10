const URL = "https://obaol.com/obaol";

export default function ObaolHead() {
  return (
    <>
      <title>OBAOL Live Product Display | OBAOL Supreme</title>
      <meta
        name="description"
        content="View OBAOL live product display modules and commodity showcase feeds available on the public experience."
      />
      <link rel="canonical" href={URL} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content="OBAOL Live Product Display | OBAOL Supreme" />
      <meta
        property="og:description"
        content="Public product display experience for OBAOL commodity modules."
      />
      <meta property="og:url" content={URL} />
      <meta property="og:image" content="https://obaol.com/logo.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="OBAOL Live Product Display | OBAOL Supreme" />
      <meta
        name="twitter:description"
        content="Public product display experience for OBAOL commodity modules."
      />
      <meta name="twitter:image" content="https://obaol.com/logo.png" />
    </>
  );
}
