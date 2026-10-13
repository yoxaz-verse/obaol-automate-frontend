import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outputDir = path.resolve("public/images/guidance/associate");

const screens = [
  { file: "onboarding", title: "Associate onboarding", nav: "SETUP", items: ["Company identity", "Business capabilities", "Review and submit"], callouts: ["Complete required details", "Choose accurate capabilities", "Submit for review"] },
  { file: "company", title: "My Company", nav: "ORGANIZATION", items: ["Company details", "Provided capabilities", "Sought capabilities"], callouts: ["Verify company identity", "Keep capabilities current", "Save changes"] },
  { file: "dashboard", title: "Associate dashboard", nav: "OVERVIEW", items: ["Action required", "Buying activity", "Selling activity"], callouts: ["Use navigation for all tools", "Start with priority actions", "Switch your activity view"] },
  { file: "marketplace", title: "Trade Listings", nav: "PRODUCTS", items: ["Search commodities", "Filter by market", "Open listing details"], callouts: ["Search by product", "Narrow the results", "Verify before enquiring"] },
  { file: "product-listing", title: "My Trade Listings", nav: "PRODUCTS", items: ["Live listings", "Draft listings", "Listing details"], callouts: ["Create a trade listing", "Check listing state", "Update stale availability"] },
  { file: "enquiry", title: "Enquiries", nav: "TRADE", items: ["Buying", "Selling", "Open enquiries"], callouts: ["Choose your role view", "Filter by status", "Open the record"] },
  { file: "orders", title: "Orders", nav: "TRADE", items: ["Active", "In transit", "Completed"], callouts: ["Select a status view", "Open the correct order", "Update real milestones"] },
  { file: "documents", title: "Documents", nav: "TRADE", items: ["Commercial", "Compliance", "Shipment"], callouts: ["Choose document type", "Link the transaction", "Verify after upload"] },
];

const escapeXml = (value) => value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char]));

function svg(screen) {
  const cards = screen.items.map((item, index) => {
    const x = 330 + index * 295;
    return `<rect x="${x}" y="250" width="255" height="170" rx="22" fill="#ffffff" stroke="#ded8cc"/>
      <circle cx="${x + 34}" cy="286" r="12" fill="#cf983c" fill-opacity=".2"/>
      <rect x="${x + 24}" y="326" width="150" height="12" rx="6" fill="#252525" fill-opacity=".82"/>
      <rect x="${x + 24}" y="354" width="205" height="8" rx="4" fill="#8a8378" fill-opacity=".35"/>
      <rect x="${x + 24}" y="376" width="170" height="8" rx="4" fill="#8a8378" fill-opacity=".2"/>
      <text x="${x + 24}" y="314" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#6b655c">${escapeXml(item)}</text>`;
  }).join("");
  const callouts = screen.callouts.map((item, index) => {
    const cx = 390 + index * 295;
    return `<line x1="${cx}" y1="465" x2="${cx}" y2="410" stroke="#cf983c" stroke-width="3"/>
      <circle cx="${cx}" cy="480" r="22" fill="#cf983c"/><text x="${cx}" y="487" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="#151515">${index + 1}</text>
      <text x="${cx + 32}" y="486" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#3e3a34">${escapeXml(item)}</text>`;
  }).join("");
  return `<svg width="1440" height="900" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
    <rect width="1440" height="900" fill="#f7f4ee"/>
    <rect x="58" y="52" width="1324" height="796" rx="32" fill="#fbfaf7" stroke="#d9d3c8"/>
    <rect x="58" y="52" width="220" height="796" rx="32" fill="#15191f"/>
    <circle cx="100" cy="98" r="17" fill="#cf983c"/><text x="130" y="105" font-family="Arial, sans-serif" font-size="20" font-weight="900" fill="#ffffff">OBAOL</text>
    <text x="90" y="166" font-family="Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="2" fill="#cf983c">${screen.nav}</text>
    ${["Dashboard", "Products", "Trade", "Services", "Settings"].map((item, index) => `<rect x="80" y="${190 + index * 58}" width="174" height="42" rx="11" fill="${index === 0 ? "#2b3038" : "transparent"}"/><text x="100" y="${216 + index * 58}" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${index === 0 ? "#ffffff" : "#9ea2aa"}">${item}</text>`).join("")}
    <text x="330" y="118" font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="2" fill="#9b7440">ASSOCIATE WORKSPACE</text>
    <text x="330" y="170" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="#1d1d1d">${escapeXml(screen.title)}</text>
    <rect x="330" y="196" width="760" height="12" rx="6" fill="#8a8378" fill-opacity=".18"/>
    ${cards}
    ${callouts}
    <rect x="330" y="570" width="845" height="190" rx="24" fill="#ffffff" stroke="#ded8cc"/>
    <rect x="360" y="606" width="220" height="14" rx="7" fill="#252525" fill-opacity=".75"/>
    ${[0,1,2,3].map((index) => `<rect x="360" y="${650 + index * 25}" width="${690 - index * 50}" height="9" rx="4.5" fill="#8a8378" fill-opacity="${.28 - index * .03}"/>`).join("")}
    <rect x="1208" y="80" width="120" height="38" rx="19" fill="#cf983c"/><text x="1268" y="104" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="#17130d">DEMO DATA</text>
  </svg>`;
}

await fs.mkdir(outputDir, { recursive: true });
for (const screen of screens) {
  await sharp(Buffer.from(svg(screen))).webp({ quality: 86 }).toFile(path.join(outputDir, `${screen.file}.webp`));
}
console.log(`Generated ${screens.length} associate guide images in ${outputDir}`);
