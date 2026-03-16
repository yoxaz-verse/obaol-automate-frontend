import NewsPageContent from "@/components/news/NewsPageContent";
import Title from "@/components/titles";

export default function DashboardNewsPage() {
  return (
    <section className="mx-2 md:mx-6 mb-6">
      <Title title="News" />
      <NewsPageContent />
    </section>
  );
}

