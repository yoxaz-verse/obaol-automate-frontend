import { DEFAULT_KEYWORDS, GEO_KEYWORDS } from "@/utils/seo";

const URL = "https://obaol.com/obaol";
const KEYWORDS = [...DEFAULT_KEYWORDS, ...GEO_KEYWORDS, "commodity showcase", "live products"].join(", ");

export default function ObaolHead() {
  return (
    <>
      <title>OBAOL Live Product Display | OBAOL Supreme</title>
      <meta
        name="description"
        content="Starting in India, view OBAOL live product display modules and commodity showcase feeds as we expand globally."
      />
      <meta name="keywords" content={KEYWORDS} />
      <link rel="canonical" href={URL} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content="OBAOL Live Product Display | OBAOL Supreme" />
      <meta
        property="og:description"
        content="Starting in India, public product display experience for OBAOL commodity modules as we expand globally."
      />
      <meta property="og:url" content={URL} />
      <meta property="og:image" content="https://obaol.com/logo.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="OBAOL Live Product Display | OBAOL Supreme" />
      <meta
        name="twitter:description"
        content="Starting in India, public product display experience for OBAOL commodity modules as we expand globally."
      />
      <meta name="twitter:image" content="https://obaol.com/logo.png" />
    </>
  );
}
