import React from "react";
import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";

const CalendarView = ({ dailyData }) => {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const days = eachDayOfInterval({ start, end });

  // 🔁 Group by date and sum values with UTC alignment
  const groupedData = dailyData.reduce((acc, entry) => {
    const zonedDate = toZonedTime(entry.date, "UTC");
    const key = formatTz(zonedDate, "yyyy-MM-dd");

    if (!acc[key]) {
      acc[key] = { steps: 0, distance: 0, caloriesExpended: 0 };
    }

    acc[key].steps += entry.steps || 0;
    acc[key].distance += entry.distance || 0;
    acc[key].caloriesExpended += entry.caloriesExpended || 0;

    return acc;
  }, {});

  return (
    <div className="calendar-container">
      <h3>Daily Activity Calendar</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "5px",
          textAlign: "center",
        }}
      >
        {days.map((day) => {
          const formattedDate = format(day, "yyyy-MM-dd");
          const dailyRecord = groupedData[formattedDate];

          return (
            <div
              key={formattedDate}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                backgroundColor: dailyRecord ? "#e3f2fd" : "#fff",
              }}
            >
              <strong>{format(day, "d")}</strong>
              <div>
                {dailyRecord ? (
                  <>
                    <div>Steps: {dailyRecord.steps}</div>
                    <div>Dist: {dailyRecord.distance.toFixed(2)} m</div>
                    <div>Cals: {dailyRecord.caloriesExpended.toFixed(1)}</div>
                  </>
                ) : (
                  <div>No Data</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
