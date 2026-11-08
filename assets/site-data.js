/*
 * THIS IS THE ONLY FILE YOU NEED TO EDIT FOR ROUTINE UPDATES.
 *
 * Add meetings to `sessions` and people to `organizers` using the copyable
 * examples at the bottom of this file. Leave an optional field blank ("")
 * when you do not want it to appear on the website.
 */

window.READING_GROUP_DATA = {
  site: {
    labName: "MBZUAI Reasoning Lab",
    pageTitle: "Reading Groups",
    intro:
      "Two complementary forums for studying reasoning: one centered on building and evaluating systems, the other on understanding the ideas and theory that make them work.",
    semester: "",
    cadence: "",
    meetingTime: "",
    timeZone: "Gulf Standard Time (UTC+4)",
    location: "",
    contactEmail: "",
    joinUrl: "",
    calendarUrl: "",
    labWebsiteUrl: "",
    lastUpdated: "",
  },

  tracks: {
    practice: {
      name: "Practice Group",
      label: "Build · test · reproduce",
      shortDescription:
        "A hands-on forum for turning research ideas into working systems and reliable experiments.",
      description:
        "Sessions focus on the practical decisions that shape research: reproducing results, reading code, designing evaluations, comparing methods, and sharing lessons from implementation.",
      audience:
        "Researchers and students who want to learn through implementation, experimentation, and constructive technical discussion.",
      focus: [
        "Paper reproductions and implementation reports",
        "Code walkthroughs and experimental design",
        "Evaluation methods, ablations, and failure analysis",
        "Tools, datasets, and engineering lessons",
      ],
      format: [
        "A focused presentation or live walkthrough",
        "Questions throughout, followed by group discussion",
        "Code, notes, or results shared after the session when available",
      ],
    },

    theory: {
      name: "Theory Reading Group",
      label: "Read · derive · discuss",
      shortDescription:
        "A careful reading forum for the mathematical foundations and theoretical ideas behind reasoning.",
      description:
        "Sessions slow down around definitions, assumptions, proofs, and the connections between results. The goal is shared understanding rather than a rapid summary of a paper.",
      audience:
        "Researchers and students interested in theoretical foundations, mathematical clarity, and proof-oriented discussion.",
      focus: [
        "Foundational and recent theory papers",
        "Definitions, assumptions, and proof structure",
        "Connections between results and research areas",
        "Open questions and promising theoretical directions",
      ],
      format: [
        "A guided reading led by one or more presenters",
        "Key derivations worked through together",
        "Discussion of assumptions, limitations, and open problems",
      ],
    },
  },

  /*
   * Organizer example — copy this object into the array and change the text:
   * {
   *   name: "First Last",
   *   role: "Practice Group organizer",
   *   affiliation: "MBZUAI",
   *   email: "name@example.edu",
   *   website: "https://example.com",
   *   tracks: ["practice"]
   * }
   *
   * Use tracks: ["practice", "theory"] for a shared organizer.
   */
  organizers: [],

  /*
   * Session example — copy this object into the array and change the text:
   * {
   *   date: "2026-11-05",
   *   time: "15:00",
   *   track: "practice",
   *   speaker: "First Last",
   *   affiliation: "MBZUAI",
   *   title: "Session title",
   *   summary: "One or two sentences describing the session.",
   *   venue: "Room name or online",
   *   paperUrl: "https://arxiv.org/abs/...",
   *   slidesUrl: "",
   *   codeUrl: "",
   *   videoUrl: ""
   * }
   *
   * For the theory group, use track: "theory". Sessions are sorted by date
   * automatically, so their order in this file does not matter.
   */
  sessions: [],
};
