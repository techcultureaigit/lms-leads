import { Suspense } from "react";
import CalendarPageClient from "@/components/calendar/CalendarPageClient";

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="content">Loading calendar…</div>}>
      <CalendarPageClient />
    </Suspense>
  );
}
