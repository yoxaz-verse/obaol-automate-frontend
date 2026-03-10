const URL = "https://obaol.com/companies";

export default function CompaniesHead() {
  return (
    <>
      <title>Partner Companies | OBAOL Supreme</title>
      <meta
        name="description"
        content="Browse partner companies in the OBAOL network. Discover verified organizations participating in structured commodity trade execution."
      />
      <link rel="canonical" href={URL} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content="Partner Companies | OBAOL Supreme" />
      <meta
        property="og:description"
        content="Explore companies operating in the OBAOL commodity trade network."
      />
      <meta property="og:url" content={URL} />
      <meta property="og:image" content="https://obaol.com/logo.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Partner Companies | OBAOL Supreme" />
      <meta
        name="twitter:description"
        content="Explore companies operating in the OBAOL commodity trade network."
      />
      <meta name="twitter:image" content="https://obaol.com/logo.png" />
    </>
  );
}
