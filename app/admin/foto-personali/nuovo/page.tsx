import { db } from "@/lib/db";
import PersonalPhotosForm from "@/app/admin/fotopersonali/form";

export default async function NewPersonalPhotosPage() {
  const events = await db.query.event.findMany({
    columns: { id: true, title: true, year: true },
    orderBy: (e, { desc }) => desc(e.year),
  });

  return <PersonalPhotosForm events={events} />;
}
