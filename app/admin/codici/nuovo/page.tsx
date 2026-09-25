import { db } from "@/lib/db";

type Event = {
  id: string;
  title: string;
  year: number;
};

function NewCodeForm({ events }: { events: Event[] }) {
  return (
    <form method="post">
      <label>
        Codice
        <input name="code" required />
      </label>
      <label>
        Evento
        <select name="eventId" required>
          <option value="">Seleziona un evento</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} ({event.year})
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Crea codice</button>
    </form>
  );
}

export default async function NewCodePage() {
  const events = await db.query.event.findMany({
    columns: { id: true, title: true, year: true },
    orderBy: (e, { desc }) => desc(e.year),
  });

  return <NewCodeForm events={events} />;
}
