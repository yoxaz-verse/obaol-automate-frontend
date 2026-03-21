import { DEFAULT_KEYWORDS, GEO_KEYWORDS } from "@/utils/seo";

const URL = "https://obaol.com/companies";
const KEYWORDS = [...DEFAULT_KEYWORDS, ...GEO_KEYWORDS, "partner companies", "supplier network"].join(", ");

export default function CompaniesHead() {
  return (
    <>
      <title>Partner Companies | OBAOL Supreme</title>
      <meta
        name="description"
        content="Starting in India, browse partner companies in the OBAOL network and discover verified organizations participating in structured commodity trade execution as we expand globally."
      />
      <meta name="keywords" content={KEYWORDS} />
      <link rel="canonical" href={URL} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content="Partner Companies | OBAOL Supreme" />
      <meta
        property="og:description"
        content="Starting in India, explore companies operating in the OBAOL commodity trade network as we expand globally."
      />
      <meta property="og:url" content={URL} />
      <meta property="og:image" content="https://obaol.com/logo.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Partner Companies | OBAOL Supreme" />
      <meta
        name="twitter:description"
        content="Starting in India, explore companies operating in the OBAOL commodity trade network as we expand globally."
      />
      <meta name="twitter:image" content="https://obaol.com/logo.png" />
    </>
  );
}
