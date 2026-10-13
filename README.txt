HabitFlow Dashboard

Files:
- index.html: page layout
- style.css: responsive layout and light/dark themes
- script.js: habit tracking, calculations, and charts

Run:
1. Extract this folder.
2. Keep all three files together.
3. Open index.html in a browser.

Included:
- Dark mode toggle (preference saved)
- Habit and month selectors
- Monthly performance bar chart
- Completed vs not completed donut chart
- Daily trend line chart
- Habit leaderboard
- Yes/No calculations and overall completion rate
- Daily habit checklist and previous/next date controls
- Data saved in localStorage on this browser/device

Calculation note:
For the selected month, YES is the number of days the selected habit was checked; NO is the remaining days in that month. Overall completion = all completed habit checkmarks / (number of habits × days in selected month) × 100. Unchecked days in the current/future part of a month count as NO in this simple monthly report.
