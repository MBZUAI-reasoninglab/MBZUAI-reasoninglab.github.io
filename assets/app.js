(function () {
  "use strict";

  const data = window.READING_GROUP_DATA;
  const page = document.body.dataset.page || "home";
  const root = document.getElementById("main-content");

  if (!data || !root) return;

  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const safeUrl = (value = "") => {
    if (!value) return "";
    try {
      const parsed = new URL(value, window.location.href);
      return ["http:", "https:", "mailto:"].includes(parsed.protocol)
        ? escapeHtml(parsed.href)
        : "";
    } catch {
      return "";
    }
  };

  const parseDate = (date) => new Date(`${date}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (date, long = false) =>
    new Intl.DateTimeFormat("en", {
      weekday: long ? "long" : "short",
      month: long ? "long" : "short",
      day: "numeric",
      year: "numeric",
    }).format(parseDate(date));

  const sortedSessions = [...data.sessions]
    .filter((session) => session.date && data.tracks[session.track])
    .sort((a, b) => parseDate(a.date) - parseDate(b.date));

  const upcomingSessions = sortedSessions.filter(
    (session) => parseDate(session.date) >= today,
  );
  const pastSessions = sortedSessions
    .filter((session) => parseDate(session.date) < today)
    .reverse();

  const metaItems = [
    data.site.semester,
    data.site.cadence,
    data.site.meetingTime,
    data.site.location,
  ].filter(Boolean);

  function navLink(href, label, key) {
    const active = page === key ? ' aria-current="page" class="active"' : "";
    return `<a href="${href}"${active}>${label}</a>`;
  }

  function renderHeader() {
    document.getElementById("site-header").innerHTML = `
      <div class="nav-shell">
        <a class="brand" href="index.html" aria-label="${escapeHtml(data.site.labName)} reading groups home">
          <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
          <span><strong>${escapeHtml(data.site.labName)}</strong><small>${escapeHtml(data.site.pageTitle)}</small></span>
        </a>
        <nav class="main-nav" aria-label="Main navigation">
          ${navLink("index.html", "Overview", "home")}
          ${navLink("practice.html", "Practice", "practice")}
          ${navLink("theory.html", "Theory", "theory")}
        </nav>
      </div>`;
  }

  function renderFooter() {
    const year = new Date().getFullYear();
    const labLink = safeUrl(data.site.labWebsiteUrl);
    document.getElementById("site-footer").innerHTML = `
      <div class="footer-shell">
        <div>
          <strong>${escapeHtml(data.site.labName)}</strong>
          <p>${escapeHtml(data.site.pageTitle)} · ${year}</p>
        </div>
        <div class="footer-links">
          <a href="index.html#schedule">Schedule</a>
          <a href="index.html#organizers">Organizers</a>
          ${labLink ? `<a href="${labLink}">Lab website</a>` : ""}
        </div>
      </div>`;
  }

  function arrowIcon() {
    return `<svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5" /></svg>`;
  }

  function groupGlyph(track) {
    if (track === "practice") {
      return `<svg viewBox="0 0 72 72" aria-hidden="true"><path d="M18 20h36v32H18z"/><path d="m25 37 7 7 15-17"/></svg>`;
    }
    return `<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="20"/><path d="M17 36h38M36 17c7 6 10 12 10 19S43 49 36 55c-7-6-10-12-10-19s3-13 10-19Z"/></svg>`;
  }

  function trackCard(key) {
    const track = data.tracks[key];
    return `
      <article class="track-card ${key}">
        <div class="track-card-top">
          <span class="track-icon">${groupGlyph(key)}</span>
          <span class="track-number">0${key === "practice" ? "1" : "2"}</span>
        </div>
        <p class="eyebrow">${escapeHtml(track.label)}</p>
        <h3>${escapeHtml(track.name)}</h3>
        <p>${escapeHtml(track.shortDescription)}</p>
        <a class="text-link" href="${key}.html">Explore this group ${arrowIcon()}</a>
      </article>`;
  }

  function sessionLinks(session) {
    const links = [
      ["Paper", session.paperUrl],
      ["Slides", session.slidesUrl],
      ["Code", session.codeUrl],
      ["Video", session.videoUrl],
    ]
      .filter(([, url]) => safeUrl(url))
      .map(
        ([label, url]) =>
          `<a href="${safeUrl(url)}" target="_blank" rel="noreferrer">${label}</a>`,
      );
    return links.length
      ? `<div class="session-links" aria-label="Session materials">${links.join("")}</div>`
      : `<span class="materials-pending">Materials forthcoming</span>`;
  }

  function sessionRow(session) {
    const track = data.tracks[session.track];
    const details = [session.time, session.venue].filter(Boolean).join(" · ");
    return `
      <article class="session-row" data-track="${escapeHtml(session.track)}">
        <div class="session-date">
          <time datetime="${escapeHtml(session.date)}">${formatDate(session.date)}</time>
          ${details ? `<small>${escapeHtml(details)}</small>` : ""}
        </div>
        <div class="session-main">
          <span class="track-pill ${escapeHtml(session.track)}">${escapeHtml(track.name)}</span>
          <h3>${escapeHtml(session.title || "Topic to be announced")}</h3>
          <p class="speaker">${escapeHtml(session.speaker || "Speaker to be announced")}${session.affiliation ? `<span> · ${escapeHtml(session.affiliation)}</span>` : ""}</p>
          ${session.summary ? `<p class="session-summary">${escapeHtml(session.summary)}</p>` : ""}
        </div>
        <div class="session-materials">${sessionLinks(session)}</div>
      </article>`;
  }

  function emptySchedule(trackKey = "") {
    const label = trackKey ? data.tracks[trackKey].name : "reading groups";
    return `
      <div class="empty-state">
        <span class="empty-mark" aria-hidden="true">↗</span>
        <div>
          <h3>The next ${escapeHtml(label)} sessions are being planned.</h3>
          <p>Add a meeting in <code>assets/site-data.js</code> and it will appear here automatically.</p>
        </div>
      </div>`;
  }

  function sessionsMarkup(sessions, trackKey = "") {
    return sessions.length
      ? `<div class="session-list">${sessions.map(sessionRow).join("")}</div>`
      : emptySchedule(trackKey);
  }

  function nextSessionMarkup() {
    const session = upcomingSessions[0];
    if (!session) {
      return `
        <div class="next-empty">
          <span class="status-dot" aria-hidden="true"></span>
          <p><strong>Next session</strong><br />The new schedule will be posted here.</p>
          <a class="text-link" href="#schedule">View schedule ${arrowIcon()}</a>
        </div>`;
    }
    const track = data.tracks[session.track];
    return `
      <div class="next-card ${escapeHtml(session.track)}">
        <div class="next-date">
          <span>${formatDate(session.date, true)}</span>
          <strong>${escapeHtml(session.time || "Time TBA")}</strong>
          ${session.venue ? `<small>${escapeHtml(session.venue)}</small>` : ""}
        </div>
        <div class="next-content">
          <span class="track-pill ${escapeHtml(session.track)}">Next · ${escapeHtml(track.name)}</span>
          <h2>${escapeHtml(session.title || "Topic to be announced")}</h2>
          <p class="speaker">${escapeHtml(session.speaker || "Speaker to be announced")}${session.affiliation ? `<span> · ${escapeHtml(session.affiliation)}</span>` : ""}</p>
          ${session.summary ? `<p>${escapeHtml(session.summary)}</p>` : ""}
        </div>
        <div class="next-links">${sessionLinks(session)}</div>
      </div>`;
  }

  function organizersMarkup(trackKey = "") {
    const people = trackKey
      ? data.organizers.filter(
          (person) => !person.tracks || person.tracks.includes(trackKey),
        )
      : data.organizers;

    if (!people.length) {
      return `
        <div class="organizer-empty">
          <p>Organizer details will be added here.</p>
          <span>Edit the <code>organizers</code> list in <code>assets/site-data.js</code>.</span>
        </div>`;
    }

    return `<div class="people-grid">${people
      .map((person) => {
        const initials = person.name
          .split(/\s+/)
          .map((part) => part[0])
          .slice(0, 2)
          .join("");
        const website = safeUrl(person.website);
        const email = person.email
          ? `mailto:${encodeURIComponent(person.email)}`
          : "";
        return `
          <article class="person-card">
            <div class="person-avatar" aria-hidden="true">${escapeHtml(initials)}</div>
            <div>
              <h3>${escapeHtml(person.name)}</h3>
              <p>${escapeHtml(person.role || "Organizer")}</p>
              ${person.affiliation ? `<small>${escapeHtml(person.affiliation)}</small>` : ""}
              <div class="person-links">
                ${email ? `<a href="${email}">Email</a>` : ""}
                ${website ? `<a href="${website}" target="_blank" rel="noreferrer">Website</a>` : ""}
              </div>
            </div>
          </article>`;
      })
      .join("")}</div>`;
  }

  function contactActions() {
    const actions = [];
    if (data.site.contactEmail) {
      actions.push(
        `<a class="button light" href="mailto:${encodeURIComponent(data.site.contactEmail)}">Email the organizers ${arrowIcon()}</a>`,
      );
    }
    if (safeUrl(data.site.joinUrl)) {
      actions.push(
        `<a class="button light" href="${safeUrl(data.site.joinUrl)}">Join the group ${arrowIcon()}</a>`,
      );
    }
    if (safeUrl(data.site.calendarUrl)) {
      actions.push(
        `<a class="button ghost-light" href="${safeUrl(data.site.calendarUrl)}">Add the calendar</a>`,
      );
    }
    return actions.length
      ? actions.join("")
      : `<span class="contact-pending">Contact and joining details will be posted soon.</span>`;
  }

  function renderHome() {
    root.innerHTML = `
      <section class="hero home-hero">
        <div class="hero-grid" aria-hidden="true"></div>
        <div class="shell hero-layout">
          <div class="hero-copy">
            <p class="eyebrow">${escapeHtml(data.site.labName)}</p>
            <h1>Ideas become clearer<br /><em>when we work through them together.</em></h1>
            <p class="hero-intro">${escapeHtml(data.site.intro)}</p>
            <div class="hero-actions">
              <a class="button primary" href="#schedule">View the schedule ${arrowIcon()}</a>
              <a class="button secondary" href="#groups">Meet the groups</a>
            </div>
          </div>
          <div class="hero-diagram" aria-label="Practice and theory are complementary reading groups">
            <div class="orbit orbit-one"><span>Practice</span></div>
            <div class="orbit orbit-two"><span>Theory</span></div>
            <div class="orbit-core"><span>Reasoning</span><strong>LAB</strong></div>
          </div>
        </div>
        ${
          metaItems.length
            ? `<div class="shell meta-strip">${metaItems
                .map((item) => `<span>${escapeHtml(item)}</span>`)
                .join("")}</div>`
            : ""
        }
      </section>

      <section class="next-section shell" aria-labelledby="next-heading">
        <div class="section-heading compact">
          <p class="eyebrow">On the board</p>
          <h2 id="next-heading">Coming up next</h2>
        </div>
        ${nextSessionMarkup()}
      </section>

      <section class="groups-section" id="groups" aria-labelledby="groups-heading">
        <div class="shell">
          <div class="section-heading split-heading">
            <div>
              <p class="eyebrow">Two ways in</p>
              <h2 id="groups-heading">One lab, two kinds of conversation.</h2>
            </div>
            <p>Move between implementation and foundations, or make one group your regular home. Both are designed for questions, careful reading, and shared learning.</p>
          </div>
          <div class="track-grid">
            ${trackCard("practice")}
            ${trackCard("theory")}
          </div>
        </div>
      </section>

      <section class="schedule-section shell" id="schedule" aria-labelledby="schedule-heading">
        <div class="section-heading schedule-heading">
          <div>
            <p class="eyebrow">Program</p>
            <h2 id="schedule-heading">Upcoming sessions</h2>
          </div>
          <div class="filter-group" role="group" aria-label="Filter sessions by group">
            <button class="filter active" data-filter="all" type="button">All</button>
            <button class="filter" data-filter="practice" type="button">Practice</button>
            <button class="filter" data-filter="theory" type="button">Theory</button>
          </div>
        </div>
        <div id="home-session-list" aria-live="polite">${sessionsMarkup(upcomingSessions)}</div>
      </section>

      ${
        pastSessions.length
          ? `<section class="archive-section shell" aria-labelledby="archive-heading">
              <details>
                <summary><span><small>Archive</small><strong id="archive-heading">Past sessions</strong></span><span class="summary-plus" aria-hidden="true">+</span></summary>
                ${sessionsMarkup(pastSessions)}
              </details>
            </section>`
          : ""
      }

      <section class="organizers-section" id="organizers" aria-labelledby="organizers-heading">
        <div class="shell organizers-layout">
          <div class="section-heading">
            <p class="eyebrow">People</p>
            <h2 id="organizers-heading">Organizers</h2>
            <p>Reach out to propose a paper, volunteer for a session, or ask about joining.</p>
          </div>
          ${organizersMarkup()}
        </div>
      </section>

      <section class="contact-section">
        <div class="shell contact-layout">
          <div>
            <p class="eyebrow">Join the discussion</p>
            <h2>Bring a question.<br />Leave with a sharper one.</h2>
          </div>
          <div class="contact-actions">${contactActions()}</div>
        </div>
      </section>`;

    const filterButtons = root.querySelectorAll(".filter");
    const list = root.querySelector("#home-session-list");
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        const filter = button.dataset.filter;
        const filtered =
          filter === "all"
            ? upcomingSessions
            : upcomingSessions.filter((session) => session.track === filter);
        list.innerHTML = sessionsMarkup(filtered, filter === "all" ? "" : filter);
      });
    });
  }

  function renderTrack(trackKey) {
    const track = data.tracks[trackKey];
    const trackUpcoming = upcomingSessions.filter(
      (session) => session.track === trackKey,
    );
    const trackPast = pastSessions.filter(
      (session) => session.track === trackKey,
    );

    root.innerHTML = `
      <section class="track-hero ${trackKey}">
        <div class="shell track-hero-layout">
          <div>
            <p class="eyebrow">${escapeHtml(track.label)}</p>
            <h1>${escapeHtml(track.name)}</h1>
            <p class="track-lede">${escapeHtml(track.shortDescription)}</p>
            <a class="button primary" href="#track-schedule">See the schedule ${arrowIcon()}</a>
          </div>
          <div class="track-hero-art">
            <span class="track-hero-icon">${groupGlyph(trackKey)}</span>
            <span class="track-hero-number">${trackKey === "practice" ? "01" : "02"}</span>
          </div>
        </div>
      </section>

      <section class="track-about shell">
        <div class="track-about-intro">
          <p class="eyebrow">About the group</p>
          <h2>${escapeHtml(track.description)}</h2>
          <p>${escapeHtml(track.audience)}</p>
        </div>
        <div class="detail-panels">
          <article>
            <span class="detail-index">A</span>
            <h3>What we explore</h3>
            <ul>${track.focus.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </article>
          <article>
            <span class="detail-index">B</span>
            <h3>How sessions work</h3>
            <ul>${track.format.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </article>
        </div>
      </section>

      <section class="schedule-section tinted" id="track-schedule" aria-labelledby="track-schedule-heading">
        <div class="shell">
          <div class="section-heading split-heading">
            <div>
              <p class="eyebrow">Program</p>
              <h2 id="track-schedule-heading">Upcoming sessions</h2>
            </div>
            <a class="text-link" href="index.html#schedule">See the combined schedule ${arrowIcon()}</a>
          </div>
          ${sessionsMarkup(trackUpcoming, trackKey)}
        </div>
      </section>

      ${
        trackPast.length
          ? `<section class="archive-section shell" aria-labelledby="track-archive-heading">
              <details>
                <summary><span><small>Archive</small><strong id="track-archive-heading">Past ${escapeHtml(track.name)} sessions</strong></span><span class="summary-plus" aria-hidden="true">+</span></summary>
                ${sessionsMarkup(trackPast, trackKey)}
              </details>
            </section>`
          : ""
      }

      <section class="organizers-section" aria-labelledby="track-organizers-heading">
        <div class="shell organizers-layout">
          <div class="section-heading">
            <p class="eyebrow">People</p>
            <h2 id="track-organizers-heading">Group organizers</h2>
            <p>Contact the organizers to propose a reading, lead a session, or take part.</p>
          </div>
          ${organizersMarkup(trackKey)}
        </div>
      </section>

      <section class="contact-section">
        <div class="shell contact-layout">
          <div>
            <p class="eyebrow">Take part</p>
            <h2>Questions are part<br />of the program.</h2>
          </div>
          <div class="contact-actions">${contactActions()}</div>
        </div>
      </section>`;
  }

  renderHeader();
  renderFooter();
  page === "practice" || page === "theory" ? renderTrack(page) : renderHome();
})();
