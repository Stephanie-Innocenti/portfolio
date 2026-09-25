import { db } from "@/lib/db";
import NewCodeForm from "./new-code-form";

export default async function NewCodePage({
  searchParams,
}: {
  searchParams: Promise<{ ig?: string; eventId?: string }>;
}) {
  const { ig, eventId } = await searchParams;
  const events = await db.query.event.findMany({
    columns: { id: true, title: true, year: true },
    orderBy: (e, { desc }) => desc(e.year),
  });

  return <NewCodeForm events={events} defaultIgHandle={ig} defaultEventId={eventId} />;
}
