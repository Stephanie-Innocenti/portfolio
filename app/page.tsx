import HomeContent from "@/app/components/home-content";
import { getNews } from "@/lib/news";

export default async function Home() {
  const news = await getNews();

  return <HomeContent news={news} />;
}
