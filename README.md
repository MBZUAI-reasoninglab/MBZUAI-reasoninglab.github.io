# MBZUAI Reasoning Lab reading groups

This folder is a complete static GitHub Pages website. No build step or package
installation is required.

## Update the content

For normal updates, edit only `assets/site-data.js`:

- `site` contains the semester, meeting details, contact email, and links;
- `organizers` contains organizer names and contact details;
- `sessions` contains dates, speakers, topics, papers, slides, code, and videos.

Copyable organizer and session examples are included as comments in that file.
Sessions are sorted by date automatically, and completed sessions move into the
archive automatically.

## Publish

Upload all files in this folder to the root of the GitHub Pages repository,
including `.nojekyll`. In the repository settings, configure GitHub Pages to
deploy from the default branch and `/ (root)`.

## Local preview

Run this command from the directory containing these files:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.
