import { useState } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import format from "date-fns/format"
import parse from "date-fns/parse"
import startOfWeek from "date-fns/startOfWeek"
import getDay from "date-fns/getDay"
import enUS from "date-fns/locale/en-US"   // ✅ import instead of require
import "react-big-calendar/lib/css/react-big-calendar.css"

const locales = {
  "en-US": enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export default function EventCalendar() {
  const [events, setEvents] = useState([
    { title: "Parent–Teacher Meeting", start: new Date(2025, 8, 25), end: new Date(2025, 8, 25) },
    { title: "Sports Day", start: new Date(2025, 9, 10), end: new Date(2025, 9, 10) },
  ])

  const [newEvent, setNewEvent] = useState({ title: "", start: "", end: "" })

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) {
      alert("Fill all fields")
      return
    }
    setEvents([
      ...events,
      {
        title: newEvent.title,
        start: new Date(newEvent.start),
        end: new Date(newEvent.end),
      },
    ])
    setNewEvent({ title: "", start: "", end: "" })
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Event Calendar</h1>

      {/* Add Event Form */}
      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <input
          type="text"
          placeholder="Event Title"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        />
        <div className="flex gap-3">
          <input
            type="date"
            value={newEvent.start}
            onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
            className="border px-3 py-2 rounded w-1/2"
          />
          <input
            type="date"
            value={newEvent.end}
            onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
            className="border px-3 py-2 rounded w-1/2"
          />
        </div>
        <button
          onClick={handleAddEvent}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add Event
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        />
      </div>
    </div>
  )
}
