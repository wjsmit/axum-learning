/* =====================================================================
   Axum Learning — get-to-know-you questionnaire
   Static, no backend. Answers autosave to localStorage; the finished
   profile is saved to the user's drive as Markdown (+ optional JSON).
   Mirrors intake-onboarding-v3.md (onboarding) and intake-topup.md.
   ===================================================================== */
(function () {
  "use strict";

  // option helper: strings or {v,l,branch}
  const O = (...a) => a.map((x) => (typeof x === "string" ? { v: x, l: x } : x));

  // ---- field/value constants reused for branching ----
  const PROG_IGCSE = "Cambridge IGCSE (Years 10–11)";
  const HELPER = "With a parent or tutor helping";
  const NEEDS_NONE = "Nothing applies / prefer not to say";

  // ===================================================================
  //  ONBOARDING — the full once-off profile
  // ===================================================================
  const ONBOARDING = [
    // ---------- PART 1 — KID'S BIT ----------
    {
      part: "Part 1 · The Kid's Bit",
      title: "Hi! This bit is for you 🙂",
      intro:
        "It helps us make kits you'll actually like. Pick what feels true — there are no right answers. (Grown-ups: let your child answer these.)",
      fields: [
        {
          id: "K1",
          type: "multi",
          max: 3,
          label: "What are you into?",
          help: "Tick up to 3 — we build questions around these.",
          options: O(
            "Football & sport",
            "Gaming & esports (Minecraft, Fortnite, Roblox)",
            "Anime & manga",
            "YouTube & content creation",
            "TikTok & social trends",
            "Music & K-pop",
            "Art, drawing & design",
            "Animals & nature",
            "Space & science",
            "Coding, tech & robotics",
            "Cars, planes & vehicles",
            "Dance",
            "Reading & stories",
            "Movies, TV & superheroes",
            "Fashion & beauty",
            "Cooking & baking",
            "Building & making (Lego, DIY)",
            "Skating, BMX & outdoors",
          ),
        },
        { id: "K1_other", type: "text", optional: true, label: "Into something that's not on the list?", placeholder: "Tell us…" },
        { id: "K2", type: "text", optional: true, label: "What's the one thing you could talk about all day?", help: "Your obsession — a game, a team, an animal, a show, a hobby. The more specific, the better.", placeholder: "e.g. the Springboks, Genshin Impact, sharks, sneakers…" },
      ],
    },
    {
      part: "Part 1 · The Kid's Bit",
      title: "What makes work a drag for you?",
      intro: "Be honest — telling us what you hate helps us leave it out.",
      fields: [
        { id: "K3", type: "multi", optional: true, label: "When does schoolwork make you want to give up?", help: "Tick any that ring true.", options: O("When there's tons to read before I get to do anything","When it's the same kind of question over and over","When it feels babyish or cringe","When I can't see the point of it","When I'm rushed or there's a timer","When I get stuck and there's no way to get unstuck","When it's just dull — nothing interesting in it") },
        { id: "K4", type: "multi", max: 2, label: "What kind of questions do you actually like doing?", help: "Pick up to 2.", options: O("Quick multiple-choice (just pick the answer)","Short written answers","Real-life problems about something that matters","Puzzles and brain-teasers","Open questions where you say what you think","Hands-on — make, draw or build something") },
      ],
    },
    {
      part: "Part 1 · The Kid's Bit",
      title: "You and this subject",
      fields: [
        { id: "K5", type: "single", label: "Be honest — how do you feel about this subject?", options: O("Love it — one of my favourites","It's alright","It makes me a bit nervous","I dread it — I'd rather do almost anything else") },
        { id: "K6", type: "single", label: "When you don't get something, which is more like you?", help: "There's no wrong answer here.", options: O("“I can crack this if I keep at it”","“Maybe I'm just not a maths/science person”","A bit of both, depending on the day") },
      ],
    },
    {
      part: "Part 1 · The Kid's Bit",
      title: "A few quick ones",
      intro: "How often does each of these happen to you? No one sees this but us.",
      fields: [
        { id: "K7a", type: "scale", label: "A hard question makes my brain freeze or my stomach drop.", options: O("Often","Sometimes","Rarely") },
        { id: "K7b", type: "scale", label: "I worry about getting things wrong.", options: O("Often","Sometimes","Rarely") },
        { id: "K7c", type: "scale", label: "A test or a timer makes me panic.", options: O("Often","Sometimes","Rarely") },
      ],
    },
    {
      part: "Part 1 · The Kid's Bit",
      title: "When the going gets tough",
      fields: [
        { id: "K8", type: "single", label: "You hit a question you can't do straight away. What do you ACTUALLY do?", help: "The real answer, not the “good” one.", options: O("Try different things until something works","Hunt for an example or a hint","Ask someone","Take a guess and move on","Kind of shut down and want to stop") },
        {
          id: "K9", type: "single",
          label: "When someone teaches you something new, what makes it finally click?",
          help: "This shapes how your whole kit is built — so go with your gut.",
          options: O(
            "Seeing the big picture first, then zooming into the details",
            "Building up from little bits to the big idea at the end",
            "A real story or example I can follow start to finish",
            "Being shown exactly how, step by step, then trying it myself",
            "Honestly not sure",
          ),
        },
      ],
    },
    {
      part: "Part 1 · The Kid's Bit",
      title: "How you like it to feel",
      fields: [
        { id: "K10", type: "single", label: "How do you feel about hard challenges?", options: O("Bring it on — I love a proper challenge","A bit of challenge is good","I'd rather feel sure before it gets hard") },
        { id: "K11", type: "single", label: "How would you want a kit to “talk” to you?", options: O("Warm and encouraging","Fun and a bit playful","Straight up — just tell me, no fuss","Like a dare — “bet you can't”") },
        { id: "K12", type: "single", label: "What actually makes you want to keep going?", options: O("Getting it right","Beating my own best / levelling up","Finally understanding WHY something works","Earning points or rewards","Making someone proud") },
        { id: "K13", type: "text", optional: true, label: "Finish this sentence: “Schoolwork is best when…”", placeholder: "…" },
        { id: "K14", type: "textarea", optional: true, label: "Anything else that would make a kit feel like it's actually YOURS?", help: "A way you think, something you're into, how you like a challenge framed — anything.", placeholder: "Totally optional — but this is the good stuff." },
      ],
    },

    // ---------- PART 2 — GROWN-UP'S BIT ----------
    {
      part: "Part 2 · The Grown-up's Bit",
      title: "The basics",
      intro: "This part is for you. It captures history, level and logistics.",
      fields: [
        { id: "P1_name", type: "text", label: "Student's first name", placeholder: "First name" },
        { id: "P1_rel", type: "text", optional: true, label: "Your relationship to them", placeholder: "e.g. parent, tutor" },
        { id: "P2", type: "single", label: "School year (age)", options: O("Year 7 (11–12)","Year 8 (12–13)","Year 9 (13–14)","Year 10 (14–15)","Year 11 (15–16)") },
        { id: "P3_country", type: "text", optional: true, label: "Country / time zone (optional)", placeholder: "e.g. South Africa, SAST" },
        { id: "P3_eal", type: "single", label: "Language at home", options: O("English is their first language","English is an additional language") },
      ],
    },
    {
      part: "Part 2 · The Grown-up's Bit",
      title: "Curriculum & level",
      fields: [
        { id: "P4", type: "single", label: "Which Cambridge programme?", options: O("Cambridge Lower Secondary (Stages 7–9)", PROG_IGCSE, "Not sure") },
        { id: "P5_tier", type: "single", optional: true, label: "Tier (IGCSE)", help: "Only if they're on IGCSE.", showIf: (a) => a.P4 === PROG_IGCSE, options: O("Core","Extended","Not sure yet") },
        { id: "P5_target", type: "text", optional: true, label: "Target grade they're aiming for", help: "e.g. a 5, a 7, an A*.", showIf: (a) => a.P4 === PROG_IGCSE, placeholder: "Target grade" },
        { id: "P6", type: "single", label: "Which subject is this profile for?", help: "One profile per subject.", options: O("Mathematics","English","Science (Lower Secondary)","Physics (IGCSE & above)") },
        { id: "P7", type: "single", optional: true, label: "Which textbook / resource do you use?", options: O("Cambridge University Press","Hodder","Collins","Oxford","None / not sure","Other") },
      ],
    },
    {
      part: "Part 2 · The Grown-up's Bit",
      title: "Learning & focus",
      intro: "Optional, and never used to label your child. It only changes layout and pacing. Skip if nothing applies.",
      fields: [
        {
          id: "P8", type: "multi", optional: true,
          label: "Anything about how they read, focus, or process we should design around?",
          options: O("Dyslexia or finds reading effortful","Dyscalculia or finds number work effortful","ADHD / finds it hard to sustain attention","Autistic / prefers very clear, literal instructions","Processes carefully and needs more time","Needs larger spaces to write in", NEEDS_NONE),
        },
        { id: "P8_other", type: "text", optional: true, label: "Something else we should design around?", placeholder: "Optional" },
      ],
    },
    {
      part: "Part 2 · The Grown-up's Bit",
      title: "How they're doing",
      fields: [
        { id: "P9", type: "single", label: "Recent level in this subject", options: O("Top of the class","Above average","About average","Finding it hard","Just starting / not sure") },
        { id: "P9_detail", type: "text", optional: true, label: "More precise (optional)", help: "Most recent score/grade or a teacher's comment.", placeholder: "Optional" },
        { id: "P10", type: "single", label: "Faced with a new question, they usually…", options: O("Dive straight in, confidently","Have a go","Hesitate — need a nudge","Freeze or panic") },
        {
          id: "P11", type: "single",
          label: "The main goal right now",
          help: "This sets the shape of the kits — pick the closest.",
          options: [
            { v: "Catch up — there are gaps to close", l: "Catch up — there are gaps to close", branch: "A" },
            { v: "Just get through it / pass and feel okay", l: "Just get through it / pass and feel okay", branch: "A" },
            { v: "Build confidence — they can do more than they believe", l: "Build confidence — they can do more than they believe", branch: "A" },
            { v: "Keep up with the class / stay on track", l: "Keep up with the class / stay on track", branch: "C" },
            { v: "Prepare for a test or exam coming up", l: "Prepare for a test or exam coming up", branch: "C" },
            { v: "Get ahead / stretch beyond the class", l: "Get ahead / stretch beyond the class", branch: "B" },
            { v: "Aim for top grades (7 / A / A*)", l: "Aim for top grades (7 / A / A*)", branch: "B" },
          ],
        },
      ],
    },
    {
      part: "Part 2 · The Grown-up's Bit",
      title: "Support & working style",
      fields: [
        { id: "P12", type: "single", label: "Is a test or exam coming up?", options: O("Yes — very soon (a few weeks)","Yes — this term","Not soon","Not sure") },
        { id: "P13", type: "single", label: "They prefer to work…", options: O("Completely on their own","Alone, but with someone nearby", HELPER) },
        { id: "P14", type: "single", label: "Who will usually check the answers?", options: O("The student themselves","A parent","A tutor","A teacher") },
        { id: "P15", type: "single", optional: true, label: "How confident is that helper in this subject?", help: "No judgement — if the helper is rusty, we lean harder on answers the child can check alone.", showIf: (a) => a.P13 === HELPER, options: O("Very confident","Okay","Not very — it's been a while / not my subject") },
      ],
    },
    {
      part: "Part 2 · The Grown-up's Bit",
      title: "How they like to learn",
      fields: [
        { id: "P16", type: "single", label: "Hints and help", options: O("Lots of hints","Some, when stuck","Little — they like to figure it out") },
        { id: "P17", type: "single", label: "Seeing it done first (worked examples)", options: O("Lots of examples","A few","They'd rather dive in") },
        { id: "P18", type: "single", label: "How much reading on a page?", options: O("Keep it short","Medium is fine","They don't mind lots") },
        { id: "P19", type: "single", label: "Pace", options: O("Likes to take their time","Likes to move quickly","Depends on the day") },
        { id: "P20", type: "single", label: "How much reassurance do they like?", options: O("Lots","Some","Not much") },
        { id: "P21", type: "single", label: "Do tests or timed tasks make them anxious?", options: O("Very","A little","Not really") },
        { id: "P22", type: "single", label: "How long can they usually focus in one sitting?", help: "Sets where we place “good place to stop” breaks.", options: O("About 10–15 minutes","About 20–30 minutes","30+ minutes") },
        { id: "P23", type: "single", label: "When work gets hard, they tend to…", options: O("Keep trying / treat it as a puzzle","Get frustrated and stop","Avoid starting it","Ask for help quickly") },
      ],
    },
    {
      part: "Part 2 · The Grown-up's Bit",
      title: "Practical",
      fields: [
        { id: "P24", type: "single", label: "How often will they use kits?", options: O("Most days","A few times a week","About weekly","Now and then") },
        { id: "P25", type: "single", label: "You'll print in:", help: "We build B&W-safe either way.", options: O("Colour","Black & white") },
      ],
    },

    // ---------- DEEP BRANCHES ----------
    {
      part: "Closing gaps & building confidence",
      branch: "A",
      title: "A little more — so we pitch it right",
      intro: "Because the goal is catching up or confidence, these help us scaffold well.",
      fields: [
        { id: "A1", type: "multi", max: 2, label: "What's the hardest part for them?", help: "Tick up to 2.", options: O("Reading / understanding what the question asks","Knowing which method to use","Remembering the steps of a method","Getting started at all","Careless slips when they do know it","Losing confidence partway through") },
        { id: "A2", type: "single", label: "When did it start to feel hard?", options: O("They've always found it tricky","After a specific topic they missed","After a change of school / teacher / move","Not sure") },
        { id: "A3", type: "single", label: "How small do the steps need to be?", options: O("One tiny step at a time","Medium-sized steps","They can take a few steps at once") },
        { id: "A4", type: "multi", optional: true, label: "What helps them feel safe to try?", help: "Tick any.", options: O("Knowing the answer is there to check","Lots of worked examples to copy first","No timer / no pressure","Starting with easy wins to warm up") },
      ],
    },
    {
      part: "Stretch & top grades",
      branch: "B",
      title: "A little more — so we keep it interesting",
      intro: "Because the goal is stretch or top grades, these help us avoid boredom and sharpen exam-craft.",
      fields: [
        { id: "B1", type: "single", label: "Appetite for a peek above their current level?", options: O("Yes — they enjoy seeing what's coming next","A little","Keep it on-level for now") },
        { id: "B2", type: "multi", optional: true, label: "What bores them fastest?", help: "Tick any.", options: O("Repeating the same kind of question","Questions that are too easy","Too many words / slow build-up","Being walked through steps they already know") },
        { id: "B3", type: "single", label: "Exam-craft focus (command words, mark schemes, timing)", options: O("Yes — they want to maximise marks","Somewhat","Not the priority yet") },
        { id: "B4", type: "single", label: "What kind of hard do they enjoy most?", options: O("The deep “why” / more abstract thinking","Applying it to real, messy situations","A mix") },
      ],
    },
    {
      part: "Keeping up & exam-ready",
      branch: "C",
      title: "A little more — so we focus revision",
      intro: "Because the goal is keeping up or an exam, these help us target practice.",
      fields: [
        { id: "C1", type: "text", optional: true, label: "If there's an exam, when is it?", placeholder: "Date or rough timing" },
        { id: "C2_strong", type: "text", optional: true, label: "Topics they feel strong on", placeholder: "A few words" },
        { id: "C2_shaky", type: "text", optional: true, label: "Topics they feel shaky on", placeholder: "A few words" },
        { id: "C3", type: "single", label: "What helps most right now?", options: O("Lots of mixed practice across topics","Re-teaching the weak spots first","Past-paper-style drilling","A calm, steady recap") },
      ],
    },

    // ---------- SECTION N — accommodations ----------
    {
      part: "Designing around a learning need",
      title: "Designing around a learning need",
      intro: "You mentioned something to design around — these adjustments apply to every kit.",
      showIf: (a) => Array.isArray(a.P8) && a.P8.some((v) => v !== NEEDS_NONE),
      fields: [
        { id: "N1", type: "multi", optional: true, label: "Which adjustments would help most?", help: "Tick any.", options: O("Larger spaces to write in","Shorter chunks with more breaks","No timed elements at all","Simpler, shorter sentences","Extra support with new vocabulary (also for EAL)","One idea per page where possible","Read-aloud-friendly wording") },
        { id: "N2", type: "textarea", optional: true, label: "Anything else that helps them work well?", placeholder: "A sentence is plenty…" },
      ],
    },
  ];

  // ===================================================================
  //  TOP-UP — the 2-minute per-kit form
  // ===================================================================
  const TOPUP = [
    {
      part: "Quick top-up",
      title: "Quick top-up for the next kit",
      intro: "We already know your child from the full profile. This is just about this one topic.",
      fields: [
        { id: "T_name", type: "text", optional: true, label: "Student's first name", placeholder: "First name" },
        { id: "T1", type: "text", label: "Which topic is this kit for?", help: "The chapter / topic being studied now.", placeholder: "e.g. Chapter 21 — Human Influences on Ecosystems" },
        { id: "T2", type: "single", label: "How comfortable is your child with THIS topic right now?", help: "The single biggest thing that sets how much help the kit gives.", options: O("Haven't started it yet","Just started — still new","Getting there — some of it makes sense","Pretty solid — this is mostly revision") },
        { id: "T3", type: "multi", max: 2, optional: true, label: "For this topic, what's the hardest part?", help: "Tick up to 2, or skip.", options: O("Reading / understanding the question","Knowing which method or idea to use","Remembering the steps","Getting started","Careless slips","Confidence","Nothing in particular yet") },
        { id: "T4", type: "single", label: "Is this kit for a test or exam soon?", options: O("Yes — within a few weeks","This term","No / just learning it") },
        { id: "T4_date", type: "text", optional: true, label: "Exam date (if known)", placeholder: "Optional" },
        { id: "T5", type: "single", label: "For this kit, is the goal any different from usual?", options: O("Same as usual","Just get through this one","Really master this one","Stretch / go beyond on this one") },
        { id: "T6", type: "textarea", optional: true, label: "Anything changed since last time?", help: "Confidence up or down, a new interest, a new need. A sentence is plenty.", placeholder: "Optional" },
      ],
    },
  ];

  // ===================================================================
  //  ENGINE
  // ===================================================================
  const LS_KEY = "axum_questionnaire_v3";
  const mount = document.getElementById("wizard");
  let state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { mode: null, answers: {}, idx: 0 };
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function reset() {
    state = { mode: null, answers: {}, idx: 0 };
    save();
    render();
  }

  function branchOf(a) {
    const opt = (a.P11 || "");
    const found = (ONBOARDING.find((s) => s.fields && s.fields.some((f) => f.id === "P11")) || {})
      .fields.find((f) => f.id === "P11").options.find((o) => o.v === opt);
    return found ? found.branch : null;
  }

  function stepsFor(mode) {
    return mode === "topup" ? TOPUP : ONBOARDING;
  }

  // visible steps given current answers (branch + showIf)
  function visibleSteps() {
    const a = state.answers;
    const br = branchOf(a);
    return stepsFor(state.mode).filter((s) => {
      if (s.branch && s.branch !== br) return false;
      if (s.showIf && !s.showIf(a)) return false;
      return true;
    });
  }
  function visibleFields(step) {
    return step.fields.filter((f) => !f.showIf || f.showIf(state.answers));
  }

  // ---- rendering ----
  function render() {
    if (!state.mode) return renderModeSelect();
    const steps = visibleSteps();
    if (state.idx >= steps.length) state.idx = steps.length - 1;
    if (state.idx < 0) state.idx = 0;
    if (state.idx === steps.length) return renderReview(); // safety
    // review is a synthetic final screen
    if (state.reviewing) return renderReview();
    renderStep(steps[state.idx], state.idx, steps.length);
  }

  function renderModeSelect() {
    mount.innerHTML = `
      <p class="step-eyebrow">Get-to-know-you</p>
      <h2 class="step-title">Which one are you doing?</h2>
      <p class="step-intro">Pick the full profile for a new student, or the quick top-up for the next kit of a student we already know.</p>
      <div class="mode-grid">
        <button class="mode-card" data-mode="onboarding" type="button">
          <span class="tag">First kit · ~8 min</span>
          <h3>Full profile</h3>
          <p>For a new student. Builds the lasting profile — interests, how they learn, their needs, the shape of their kits.</p>
        </button>
        <button class="mode-card" data-mode="topup" type="button">
          <span class="tag">Next kit · ~2 min</span>
          <h3>Quick top-up</h3>
          <p>For a student we already know. Just this topic, how ready they are, and anything that's changed.</p>
        </button>
      </div>`;
    mount.querySelectorAll(".mode-card").forEach((b) =>
      b.addEventListener("click", () => {
        state.mode = b.dataset.mode;
        state.idx = 0;
        state.reviewing = false;
        save();
        render();
      })
    );
  }

  function renderStep(step, idx, total) {
    const pct = Math.round(((idx) / (total)) * 100);
    const fieldsHTML = visibleFields(step).map(fieldHTML).join("");
    mount.innerHTML = `
      <div class="wizard-progress">
        <div class="progress-track"><div class="progress-fill" style="width:${Math.max(6, pct)}%"></div></div>
        <div class="progress-meta"><span>${escapeHTML(step.part || "")}</span><span>Step ${idx + 1} of ${total}</span></div>
      </div>
      <p class="step-eyebrow">${escapeHTML(step.part || "")}</p>
      <h2 class="step-title">${escapeHTML(step.title)}</h2>
      ${step.intro ? `<p class="step-intro">${escapeHTML(step.intro)}</p>` : ""}
      <div class="q-list">${fieldsHTML}</div>
      <p class="wizard-error" id="werr" hidden></p>
      <div class="wizard-actions">
        <button class="button-secondary" id="back" type="button">${idx === 0 ? "Start over" : "Back"}</button>
        <span class="spacer"></span>
        <button class="button" id="next" type="button">${idx === total - 1 ? "Review & save" : "Next"}</button>
      </div>`;
    wireFields(step);
    mount.querySelector("#back").addEventListener("click", () => {
      if (idx === 0) { reset(); return; }
      state.idx--; save(); render();
    });
    mount.querySelector("#next").addEventListener("click", () => {
      const miss = firstMissing(step);
      if (miss) {
        const err = mount.querySelector("#werr");
        err.textContent = "Please answer: " + miss;
        err.hidden = false;
        return;
      }
      if (idx === total - 1) { state.reviewing = true; save(); renderReview(); }
      else { state.idx++; save(); render(); }
    });
  }

  function fieldHTML(f) {
    const a = state.answers;
    if (f.type === "text") {
      return block(f, `<input type="text" data-id="${f.id}" value="${escapeAttr(a[f.id] || "")}" placeholder="${escapeAttr(f.placeholder || "")}" />`);
    }
    if (f.type === "textarea") {
      return block(f, `<textarea data-id="${f.id}" placeholder="${escapeAttr(f.placeholder || "")}">${escapeHTML(a[f.id] || "")}</textarea>`);
    }
    const multi = f.type === "multi";
    const cls = f.type === "scale" ? "options scale" : "options" + (f.options.length > 5 ? " cols-2" : "");
    const sel = multi ? (Array.isArray(a[f.id]) ? a[f.id] : []) : a[f.id];
    const atMax = multi && f.max && sel.length >= f.max;
    const opts = f.options.map((o) => {
      const checked = multi ? sel.includes(o.v) : sel === o.v;
      const disabled = multi && !checked && atMax;
      return `<label class="option${checked ? " is-checked" : ""}${disabled ? " is-disabled" : ""}">
        <input type="${multi ? "checkbox" : "radio"}" name="${f.id}" data-id="${f.id}" value="${escapeAttr(o.v)}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}/>
        <span class="opt-text">${escapeHTML(o.l)}</span></label>`;
    }).join("");
    const maxBadge = f.max ? `<span class="q-max">pick up to ${f.max}</span>` : "";
    return `<div class="q-block">
      <div class="q-label">${escapeHTML(f.label)}${maxBadge}</div>
      ${f.help ? `<div class="q-help">${escapeHTML(f.help)}</div>` : ""}
      <div class="${cls}">${opts}</div></div>`;
  }
  function block(f, inner) {
    return `<div class="q-block"><div class="q-label">${escapeHTML(f.label)}</div>${f.help ? `<div class="q-help">${escapeHTML(f.help)}</div>` : ""}${inner}</div>`;
  }

  function wireFields(step) {
    mount.querySelectorAll("input[data-id], textarea[data-id]").forEach((el) => {
      const id = el.dataset.id;
      const f = visibleFields(step).find((x) => x.id === id);
      if (el.type === "radio") {
        el.addEventListener("change", () => { state.answers[id] = el.value; save(); render(); });
      } else if (el.type === "checkbox") {
        el.addEventListener("change", () => {
          let arr = Array.isArray(state.answers[id]) ? state.answers[id].slice() : [];
          if (el.checked) { if (!arr.includes(el.value)) arr.push(el.value); }
          else { arr = arr.filter((v) => v !== el.value); }
          state.answers[id] = arr;
          save(); render(); // re-render to enforce max / checked styles
        });
      } else {
        el.addEventListener("input", () => { state.answers[id] = el.value; save(); });
      }
    });
  }

  function firstMissing(step) {
    for (const f of visibleFields(step)) {
      if (f.optional) continue;
      const v = state.answers[f.id];
      if (f.type === "multi") { if (!Array.isArray(v) || v.length === 0) return f.label; }
      else if (!v || (typeof v === "string" && !v.trim())) return f.label;
    }
    return null;
  }

  // ---- review & save ----
  function renderReview() {
    const md = buildMarkdown();
    const fname = suggestedName();
    mount.innerHTML = `
      <p class="step-eyebrow">Almost done</p>
      <h2 class="step-title">Review & save</h2>
      <p class="step-intro">This is exactly what we'll build the ${state.mode === "topup" ? "kit" : "profile"} from. Save it to your drive — it stays on your computer.</p>
      <pre class="review-pre">${escapeHTML(md)}</pre>
      <div id="savedBanner"></div>
      <div class="wizard-actions">
        <button class="button-secondary" id="edit" type="button">Back to answers</button>
        <span class="spacer"></span>
        <button class="button-secondary" id="dljson" type="button">Save JSON</button>
        <button class="button" id="dlmd" type="button">Save to my drive (.md)</button>
      </div>
      <div class="wizard-actions" style="margin-top:0.6rem">
        <button class="button-link" id="startover" type="button">Start over</button>
      </div>`;
    mount.querySelector("#edit").addEventListener("click", () => { state.reviewing = false; save(); render(); });
    mount.querySelector("#startover").addEventListener("click", reset);
    mount.querySelector("#dlmd").addEventListener("click", async () => {
      const ok = await saveFile(fname + ".md", md, "text/markdown");
      if (ok) banner(`Saved <strong>${escapeHTML(fname)}.md</strong>. Hand this to the kit pipeline as the ${state.mode === "topup" ? "top-up" : "profile"}.`);
    });
    mount.querySelector("#dljson").addEventListener("click", async () => {
      const json = JSON.stringify({ meta: meta(), answers: state.answers }, null, 2);
      const ok = await saveFile(fname + ".json", json, "application/json");
      if (ok) banner(`Saved <strong>${escapeHTML(fname)}.json</strong>.`);
    });
  }
  function banner(html) {
    const el = mount.querySelector("#savedBanner");
    if (el) el.innerHTML = `<div class="saved-banner">✓ ${html}</div>`;
  }

  function meta() {
    const a = state.answers;
    return {
      type: state.mode === "topup" ? "intake-topup" : "intake-onboarding-v3",
      generated: new Date().toISOString(),
      student: a.P1_name || a.T_name || "",
      subject: a.P6 || "",
      programme: a.P4 || "",
      branch: state.mode === "topup" ? "" : (branchOf(a) || ""),
    };
  }

  function buildMarkdown() {
    const m = meta();
    const lines = [];
    lines.push(`# Completed Intake — ${state.mode === "topup" ? "Per-kit Top-up" : "Onboarding Profile"}`);
    lines.push("");
    lines.push(`- Generated: ${m.generated}`);
    if (m.student) lines.push(`- Student: ${m.student}`);
    if (m.subject) lines.push(`- Subject: ${m.subject}`);
    if (m.programme) lines.push(`- Programme: ${m.programme}`);
    if (m.branch) lines.push(`- Computed branch: ${m.branch}`);
    lines.push("");
    lines.push("---");
    let lastPart = null;
    visibleSteps().forEach((step) => {
      if (step.part !== lastPart) { lines.push(""); lines.push(`## ${step.part}`); lastPart = step.part; }
      visibleFields(step).forEach((f) => {
        const v = state.answers[f.id];
        if (v == null || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && !v.length)) return;
        const val = Array.isArray(v) ? v.join("; ") : v;
        lines.push(`- **${f.id}** — ${f.label}: ${val}`);
      });
    });
    lines.push("");
    return lines.join("\n");
  }

  function suggestedName() {
    const a = state.answers;
    if (state.mode === "topup") {
      return `topup-${slug(a.T_name || "student")}-${slug(a.T1 || "topic")}`;
    }
    return `profile-${slug(a.P1_name || "student")}-${slug(a.P6 || "subject")}`;
  }

  async function saveFile(filename, text, mime) {
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: filename.split(".").pop().toUpperCase(), accept: { [mime]: ["." + filename.split(".").pop()] } }],
        });
        const w = await handle.createWritable();
        await w.write(text); await w.close();
        return true;
      } catch (e) { if (e && e.name === "AbortError") return false; }
    }
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    return true;
  }

  // ---- utils ----
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "x"; }
  function escapeHTML(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function escapeAttr(s) { return escapeHTML(s); }

  render();
})();
