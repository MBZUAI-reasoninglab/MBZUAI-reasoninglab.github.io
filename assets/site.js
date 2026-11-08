(function () {
  "use strict";

  const scheduleRoots = [...document.querySelectorAll("[data-schedule-root]")];
  const organizerRoots = [...document.querySelectorAll("[data-organizers-root]")];
  const participantRoots = [...document.querySelectorAll("[data-participants-root]")];
  const parseCsv = window.RDM_CSV.parse;

  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  function safeUrl(value = "") {
    if (!value) return "";
    try {
      const url = new URL(value, window.location.href);
      return ["http:", "https:", "mailto:"].includes(url.protocol)
        ? escapeHtml(url.href)
        : "";
    } catch {
      return "";
    }
  }

  async function loadCsv(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${path}`);
    return parseCsv(await response.text());
  }

  function groupName(group) {
    return group === "practice" ? "Practice Group" : "Theory Reading Group";
  }

  function normalizedGroup(group = "") {
    const value = group.trim().toLowerCase();
    if (value === "practice") return "practice";
    if (value === "theory") return "theory";
    return "";
  }

  function dateValue(date = "") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const parsed = new Date(`${date}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function formatDate(date = "") {
    const parsed = dateValue(date);
    if (!parsed) return date || "Date to be announced";
    return new Intl.DateTimeFormat("en", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed);
  }

  function sortMeetings(meetings, descending = false) {
    return [...meetings].sort((a, b) => {
      const first = dateValue(a.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const second = dateValue(b.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return descending ? second - first : first - second;
    });
  }

  function materialLinks(meeting) {
    const options = [
      ["Paper", meeting.paper_url],
      ["Slides", meeting.slides_url],
      ["Code", meeting.code_url],
      ["Video", meeting.video_url],
    ];
    const links = options
      .filter(([, url]) => safeUrl(url))
      .map(
        ([label, url]) =>
          `<a href="${safeUrl(url)}" target="_blank" rel="noreferrer">${label} ↗</a>`,
      );
    return links.length
      ? `<div class="meeting-links" aria-label="Session materials">${links.join("")}</div>`
      : "";
  }

  function meetingMarkup(meeting) {
    const group = normalizedGroup(meeting.group);
    const details = [meeting.time, meeting.timezone, meeting.venue]
      .filter(Boolean)
      .join(" · ");
    const speaker = meeting.speaker || "Speaker to be announced";
    const title = meeting.title || "Topic to be announced";
    const datetime = dateValue(meeting.date)
      ? ` datetime="${escapeHtml(meeting.date)}"`
      : "";

    return `
      <article class="meeting-row ${group}">
        <div class="meeting-when">
          <time${datetime}>${escapeHtml(formatDate(meeting.date))}</time>
          ${details ? `<span>${escapeHtml(details)}</span>` : ""}
        </div>
        <div class="meeting-content">
          <span class="group-tag ${group}">${escapeHtml(groupName(group))}</span>
          <h3>${escapeHtml(title)}</h3>
          <p class="meeting-speaker">
            ${escapeHtml(speaker)}${meeting.affiliation ? `<span> · ${escapeHtml(meeting.affiliation)}</span>` : ""}
          </p>
          ${meeting.summary ? `<p class="meeting-summary">${escapeHtml(meeting.summary)}</p>` : ""}
        </div>
        <div class="meeting-materials">${materialLinks(meeting)}</div>
      </article>`;
  }

  function emptySchedule(track) {
    const subject =
      track === "practice"
        ? "Practice Group"
        : track === "theory"
          ? "Theory Reading Group"
          : "reading-group";
    return `
      <div class="empty-data">
        <span aria-hidden="true">Schedule</span>
        <div>
          <h3>The next ${subject} sessions are being prepared.</h3>
          <p>Dates, speakers, and topics will appear here as they are confirmed.</p>
        </div>
      </div>`;
  }

  function scheduleMarkup(meetings, track) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validMeetings = meetings.filter((meeting) => {
      const group = normalizedGroup(meeting.group);
      return group && (track === "all" || group === track);
    });
    const upcoming = sortMeetings(
      validMeetings.filter((meeting) => {
        const date = dateValue(meeting.date);
        return !date || date >= today;
      }),
    );
    const past = sortMeetings(
      validMeetings.filter((meeting) => {
        const date = dateValue(meeting.date);
        return date && date < today;
      }),
      true,
    );

    const upcomingMarkup = upcoming.length
      ? `<div class="meeting-list">${upcoming.map(meetingMarkup).join("")}</div>`
      : emptySchedule(track);

    const pastMarkup = past.length
      ? `<details class="past-meetings">
          <summary><span>Past sessions</span><span aria-hidden="true">+</span></summary>
          <div class="meeting-list">${past.map(meetingMarkup).join("")}</div>
        </details>`
      : "";

    return upcomingMarkup + pastMarkup;
  }

  function scheduleError() {
    return `
      <div class="empty-data error-state">
        <span aria-hidden="true">Notice</span>
        <div>
          <h3>The schedule could not be loaded.</h3>
          <p>Serve the folder through GitHub Pages or a local web server; browsers cannot load CSV data directly from a file URL.</p>
        </div>
      </div>`;
  }

  async function initializeSchedule() {
    if (!scheduleRoots.length) return;
    try {
      const meetings = await loadCsv("data/schedule.csv");
      scheduleRoots.forEach((root) => {
        root._meetings = meetings;
        root.innerHTML = scheduleMarkup(meetings, root.dataset.track || "all");
      });

      document.querySelectorAll("[data-schedule-filter]").forEach((button) => {
        button.addEventListener("click", () => {
          const filter = button.dataset.scheduleFilter || "all";
          document.querySelectorAll("[data-schedule-filter]").forEach((item) =>
            item.classList.toggle("is-active", item === button),
          );
          scheduleRoots.forEach((root) => {
            root.dataset.track = filter;
            root.innerHTML = scheduleMarkup(root._meetings, filter);
          });
        });
      });
    } catch {
      scheduleRoots.forEach((root) => {
        root.innerHTML = scheduleError();
      });
    }
  }

  function personMatches(person, track) {
    if (track === "all") return true;
    const groups = (person.groups || "")
      .toLowerCase()
      .split(/[|;]/)
      .map((item) => item.trim());
    return groups.includes("all") || groups.includes(track);
  }

  function organizerMarkup(person) {
    const name = person.name || "Organizer name to be announced";
    const email = person.email
      ? `mailto:${encodeURIComponent(person.email)}`
      : "";
    const website = safeUrl(person.website);
    const initials = name
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return `
      <article class="organizer-card">
        <div class="organizer-initials" aria-hidden="true">${escapeHtml(initials)}</div>
        <div>
          <h3>${escapeHtml(name)}</h3>
          ${person.role ? `<p>${escapeHtml(person.role)}</p>` : ""}
          ${person.affiliation ? `<span>${escapeHtml(person.affiliation)}</span>` : ""}
          <div class="organizer-links">
            ${email ? `<a href="${email}">Email</a>` : ""}
            ${website ? `<a href="${website}" target="_blank" rel="noreferrer">Website ↗</a>` : ""}
          </div>
        </div>
      </article>`;
  }

  function organizerEmpty() {
    return `
      <div class="empty-data organizer-empty">
        <span aria-hidden="true">People</span>
        <div>
          <h3>Organizer information will be added before the first session.</h3>
          <p>Please check back for contact details.</p>
        </div>
      </div>`;
  }

  async function initializeOrganizers() {
    if (!organizerRoots.length) return;
    try {
      const organizers = await loadCsv("data/organizers.csv");
      organizerRoots.forEach((root) => {
        const track = root.dataset.track || "all";
        const people = organizers.filter(
          (person) => person.name && personMatches(person, track),
        );
        root.innerHTML = people.length
          ? `<div class="organizer-grid">${people.map(organizerMarkup).join("")}</div>`
          : organizerEmpty();
      });
    } catch {
      organizerRoots.forEach((root) => {
        root.innerHTML = organizerEmpty();
      });
    }
  }

  function participantMarkup(person) {
    const name = person.name || "Participant name to be announced";
    const initials = name
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return `
      <article class="organizer-card participant-card">
        <div class="organizer-initials" aria-hidden="true">${escapeHtml(initials)}</div>
        <div>
          <h3>${escapeHtml(name)}</h3>
          ${person.role ? `<p>${escapeHtml(person.role)}</p>` : ""}
          ${person.affiliation ? `<span>${escapeHtml(person.affiliation)}</span>` : ""}
        </div>
      </article>`;
  }

  function participantEmpty() {
    return `
      <div class="empty-data organizer-empty">
        <span aria-hidden="true">Participants</span>
        <div>
          <h3>The current participant list is being updated.</h3>
          <p>Please check back shortly.</p>
        </div>
      </div>`;
  }

  async function initializeParticipants() {
    if (!participantRoots.length) return;
    try {
      const participants = await loadCsv("data/participants.csv");
      participantRoots.forEach((root) => {
        const track = root.dataset.track || "all";
        const people = participants.filter(
          (person) => person.name && personMatches(person, track),
        );
        root.innerHTML = people.length
          ? `<div class="organizer-grid participant-grid">${people.map(participantMarkup).join("")}</div>`
          : participantEmpty();
      });
    } catch {
      participantRoots.forEach((root) => {
        root.innerHTML = participantEmpty();
      });
    }
  }

  initializeSchedule();
  initializeOrganizers();
  initializeParticipants();
})();
