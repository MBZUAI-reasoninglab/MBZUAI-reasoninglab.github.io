# Updating this website

This is a static GitHub Pages website. No build step is required.

## Meetings

Edit `data/schedule.csv`. Each meeting is one row. Keep the header row unchanged.

- Use `YYYY-MM-DD` for dates.
- Use `practice` or `theory` in the `group` column.
- Leave optional fields blank when they should not appear.
- Enclose text containing commas in double quotes.
- Past meetings move into the archive automatically.

The CSV can be edited with Excel, Google Sheets, LibreOffice Calc, or a text
editor. If using a spreadsheet, export it as a comma-separated CSV before
uploading it again.

## Organizers

Edit `data/organizers.csv`. Use `practice`, `theory`, `practice|theory`, or `all`
in the `groups` column.

## Participants

Edit `data/participants.csv`. Each participant is one row. Use `practice`,
`theory`, or `practice|theory` in the `groups` column. Add or delete a row to
update the participant lists; the Practice and Theory pages update automatically.

The Theory Reading Group meets Wednesdays from 2:00–3:00 PM, and the Practice
Group meets Fridays from 2:00–3:00 PM. All times are GST (UTC+4).

## Publishing

Upload all files in this folder—including `.nojekyll`—to the repository root.
Configure GitHub Pages to deploy from the default branch and `/ (root)`.
