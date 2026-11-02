import Link from "next/link";
import type { ScenarioBlock } from "@/types/realLifeScenario";

export default function ScenarioBody({ blocks }: { blocks: ScenarioBlock[] }) {
  return <div className="space-y-6 text-base leading-8 text-foreground/75 md:text-lg">
    {blocks.map((block, index) => {
      const key = block._id || `${block.type}-${index}`;
      if (block.type === "heading") {
        const className = "pt-5 font-black tracking-tight text-foreground";
        if (block.level === 3) return <h3 key={key} className={`${className} text-2xl`}>{block.text}</h3>;
        if (block.level === 4) return <h4 key={key} className={`${className} text-xl`}>{block.text}</h4>;
        return <h2 key={key} className={`${className} text-3xl md:text-4xl`}>{block.text}</h2>;
      }
      if (block.type === "paragraph") return <p key={key}>{block.text}</p>;
      if (block.type === "ordered-list" || block.type === "workflow") return <ol key={key} className="space-y-3 pl-6 marker:font-bold marker:text-orange-500">{(block.items || []).map((item) => <li key={item} className="pl-2">{item}</li>)}</ol>;
      if (block.type === "unordered-list") return <ul key={key} className="list-disc space-y-3 pl-6 marker:text-orange-500">{(block.items || []).map((item) => <li key={item} className="pl-2">{item}</li>)}</ul>;
      if (block.type === "quote") return <blockquote key={key} className="border-l-4 border-orange-500 pl-6 text-xl font-semibold italic text-foreground/80">{block.text}</blockquote>;
      if (["callout", "result", "faq"].includes(block.type)) return <aside key={key} className="rounded-3xl border border-orange-500/20 bg-orange-500/[0.06] p-6"><strong className="block text-lg text-foreground">{block.title || (block.type === "result" ? "Practical outcome" : "Key point")}</strong><p className="mt-2">{block.text}</p></aside>;
      if (block.type === "image" && block.imageUrl && block.imageAlt) return <figure key={key} className="space-y-2">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={block.imageUrl} alt={block.imageAlt} className="aspect-[16/9] w-full rounded-3xl border border-default-200 object-cover" />{block.text && <figcaption className="text-sm text-foreground/55">{block.text}</figcaption>}</figure>;
      if (block.type === "cta" && block.href) return <div key={key} className="rounded-3xl bg-foreground p-7 text-background"><strong className="block text-2xl">{block.title || "Next step"}</strong>{block.text && <p className="mt-2 text-background/75">{block.text}</p>}<Link href={block.href} className="mt-5 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-bold text-white">Learn more</Link></div>;
      return null;
    })}
  </div>;
}
