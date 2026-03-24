const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAjqYjDaf7XvvfSGGMtYX_M9vZAew0-vKs",
  authDomain: "dev-hub-cb39a.firebaseapp.com",
  projectId: "dev-hub-cb39a",
  storageBucket: "dev-hub-cb39a.firebasestorage.app",
  messagingSenderId: "759664187136",
  appId: "1:759664187136:web:3032b17277e60c818545e5",
  measurementId: "G-F2F03BEX3L"
};

const CHANNELS = ["all", "general", "game-engine-help", "3d-graphics", "programming"];
const THEME_STORAGE_KEY = "devhub-theme";

const state = {
  session: null,
  filters: {
    channel: "all"
  },
  datasets: {
    jobs: [],
    community: [],
    code: [],
    videos: []
  }
};

const STORAGE_KEYS = {
  users: "devhub.users",
  session: "devhub.session",
  jobs: "devhub.jobs",
  community: "devhub.community",
  code: "devhub.code",
  videos: "devhub.videos"
};

function initFirebaseApp() {
  if (!window.firebase || typeof window.firebase.initializeApp !== "function") {
    return null;
  }

  try {
    if (Array.isArray(window.firebase.apps) && window.firebase.apps.length) {
      return window.firebase.app();
    }

    return window.firebase.initializeApp(FIREBASE_CONFIG);
  } catch (error) {
    return null;
  }
}

const firebaseApp = initFirebaseApp();
const firebaseAuth = firebaseApp && typeof window.firebase.auth === "function"
  ? window.firebase.auth()
  : null;
const firestoreDb = firebaseApp && typeof window.firebase.firestore === "function"
  ? window.firebase.firestore()
  : null;
const firebaseFieldValue = window.firebase?.firestore?.FieldValue || null;

function getStoredTheme() {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : "";
  } catch (error) {
    return "";
  }
}

function getPreferredTheme() {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }

  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function updateThemeToggle(theme) {
  const isDark = theme === "dark";
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.textContent = isDark ? "Light mode" : "Dark mode";
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  });
}

function applyTheme(theme) {
  const resolvedTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = resolvedTheme;
  updateThemeToggle(resolvedTheme);
}

function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    return;
  }
}

function initTheme() {
  applyTheme(getPreferredTheme());

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      saveTheme(nextTheme);
    });
  });

  if (!window.matchMedia) {
    return;
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const syncWithSystemTheme = (event) => {
    if (!getStoredTheme()) {
      applyTheme(event.matches ? "dark" : "light");
    }
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", syncWithSystemTheme);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(syncWithSystemTheme);
  }
}

function hoursAgo(value) {
  return new Date(Date.now() - value * 60 * 60 * 1000).toISOString();
}

const seedData = {
  jobs: [
    {
      id: "seed-job-1",
      title: "Senior Unreal Technical Artist",
      summary: "Help ship a stylized co-op adventure and own materials, shader polish, and performance budgets with the art team.",
      contract_type: "Contract",
      location: "Remote / EU overlap",
      skills: ["Unreal Engine", "Shaders", "Optimization"],
      contact_url: "mailto:hiring@devhub.example",
      author_name: "Northstar Studio",
      created_at: hoursAgo(6)
    },
    {
      id: "seed-job-2",
      title: "Gameplay Programmer for Systems Prototype",
      summary: "Prototype traversal, combat loops, and enemy encounters in Unity for a small but fast-moving gameplay team.",
      contract_type: "Full-time",
      location: "Hybrid / Bangalore",
      skills: ["Unity", "C#", "Gameplay Systems"],
      contact_url: "mailto:jobs@devhub.example",
      author_name: "Cloud Forge",
      created_at: hoursAgo(18)
    },
    {
      id: "seed-job-3",
      title: "Pixel Artist for Narrative Platformer",
      summary: "Create character sheets, environment tiles, and cinematic key art for a 2D story-heavy platformer.",
      contract_type: "Freelance",
      location: "Remote",
      skills: ["Pixel Art", "Animation", "Tilesets"],
      contact_url: "mailto:art@devhub.example",
      author_name: "Sunline Games",
      created_at: hoursAgo(42)
    }
  ],
  community: [
    {
      id: "seed-post-1",
      channel: "general",
      body: "Welcome to DevHub. Introduce yourself, post what you are building, and jump into the specialist channels when you need focused help.",
      author_name: "Community Team",
      created_at: hoursAgo(2)
    },
    {
      id: "seed-post-2",
      channel: "game-engine-help",
      body: "If your frame time spikes only during combat, profile animation blueprints and post-process passes first. Those are the usual culprits for our newer members.",
      author_name: "Rhea",
      created_at: hoursAgo(11)
    },
    {
      id: "seed-post-3",
      channel: "3d-graphics",
      body: "A fast win for more believable surfaces is separating roughness breakup from albedo detail. It keeps the material grounded without overtexturing.",
      author_name: "Marso",
      created_at: hoursAgo(27)
    },
    {
      id: "seed-post-4",
      channel: "programming",
      body: "Share your best debugging trick for weird state bugs. Mine is adding one small event timeline logger before touching the architecture.",
      author_name: "Saran",
      created_at: hoursAgo(33)
    }
  ],
  code: [
    {
      id: "seed-code-1",
      title: "Inventory Sync Manager",
      summary: "A tiny store abstraction for syncing UI inventory state without pulling in a full state library.",
      language: "JavaScript",
      repo_url: "https://example.com/devhub/inventory-sync-manager",
      snippet: "export function createInventoryStore(initialState = {}) {\n  let state = { ...initialState };\n\n  return {\n    getState: () => state,\n    setItem: (key, value) => {\n      state = { ...state, [key]: value };\n      return state;\n    }\n  };\n}",
      author_name: "Mina",
      created_at: hoursAgo(12)
    },
    {
      id: "seed-code-2",
      title: "Combat Cooldown Component",
      summary: "Reusable timer component for abilities, with pause and resume hooks for cutscenes and menus.",
      language: "C#",
      repo_url: "https://example.com/devhub/combat-cooldown",
      snippet: "public bool IsReady => remaining <= 0f;\n\npublic void Tick(float deltaTime) {\n    if (remaining > 0f) {\n        remaining -= deltaTime;\n    }\n}",
      author_name: "Haruto",
      created_at: hoursAgo(28)
    }
  ],
  videos: [
    {
      id: "seed-video-1",
      title: "Blockout to final lighting in Unreal",
      description: "A practical walkthrough for taking a graybox environment to a moody final shot without losing performance budget.",
      category: "Tutorial",
      video_url: "https://example.com/devhub/videos/blockout-lighting",
      thumbnail_url: "",
      views: 1400,
      author_name: "Ari",
      created_at: hoursAgo(26)
    },
    {
      id: "seed-video-2",
      title: "Narrative systems postmortem",
      description: "Lessons learned from designing branching dialogue that still stays maintainable for small teams.",
      category: "Talk",
      video_url: "https://example.com/devhub/videos/narrative-systems",
      thumbnail_url: "",
      views: 870,
      author_name: "Leena",
      created_at: hoursAgo(45)
    }
  ]
};

function canUseLocalStorage() {
  try {
    const probeKey = "__devhub_probe__";
    window.localStorage.setItem(probeKey, "1");
    window.localStorage.removeItem(probeKey);
    return true;
  } catch (error) {
    return false;
  }
}

const hasLocalStorage = typeof window !== "undefined" && canUseLocalStorage();

function readStorage(key, fallbackValue) {
  if (!hasLocalStorage) {
    return fallbackValue;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

function writeStorage(key, value) {
  if (!hasLocalStorage) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function removeStorage(key) {
  if (!hasLocalStorage) {
    return;
  }

  window.localStorage.removeItem(key);
}

function createLocalId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeUrl(value) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value, window.location.href);
    if (["http:", "https:", "mailto:"].includes(url.protocol)) {
      return url.href;
    }
  } catch (error) {
    return "";
  }

  return "";
}

function normalizeDateValue(value) {
  if (!value) {
    return new Date().toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (typeof value.seconds === "number") {
    return new Date(value.seconds * 1000).toISOString();
  }

  return new Date().toISOString();
}

function formatRelativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  const diffInSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffInSeconds < 60) {
    return "Just now";
  }

  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60]
  ];

  for (const [label, size] of units) {
    if (diffInSeconds >= size) {
      const amount = Math.floor(diffInSeconds / size);
      return `${amount} ${label}${amount === 1 ? "" : "s"} ago`;
    }
  }

  return "Just now";
}

function formatViews(value) {
  return new Intl.NumberFormat("en-US", {
    notation: Number(value || 0) >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(Number(value || 0));
}

function initialsFromName(value) {
  const parts = String(value || "DevHub")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "DH";
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeChannel(value) {
  return CHANNELS.includes(value) ? value : "general";
}

function createFirebaseSession(user) {
  if (!user) {
    return null;
  }

  return {
    backend: "firebase",
    access_token: user.uid,
    user: {
      id: user.uid,
      email: user.email || "",
      user_metadata: {
        username: user.displayName || user.email?.split("@")[0] || "DevHub member",
        full_name: user.displayName || user.email?.split("@")[0] || "DevHub member"
      }
    }
  };
}

function getDisplayName(session) {
  if (!session || !session.user) {
    return "Guest mode";
  }

  return session.user.user_metadata?.username
    || session.user.user_metadata?.full_name
    || session.user.email
    || "Signed in member";
}

function getAuthorName(session, fallbackValue) {
  return String(fallbackValue || "").trim()
    || session?.user?.user_metadata?.username
    || session?.user?.user_metadata?.full_name
    || session?.user?.email?.split("@")[0]
    || "DevHub member";
}

function setMessage(element, text, kind) {
  if (!element) {
    return;
  }

  element.textContent = text || "";
  if (kind) {
    element.dataset.kind = kind;
  } else {
    delete element.dataset.kind;
  }
}

function setLiveBadge(kind, isLive, text) {
  const target = document.querySelector(`[data-source="${kind}"]`);
  if (!target) {
    return;
  }

  target.dataset.live = String(Boolean(isLive));
  target.textContent = text;
}

function getLocalUsers() {
  return readStorage(STORAGE_KEYS.users, []);
}

function saveLocalUsers(users) {
  writeStorage(STORAGE_KEYS.users, users);
}

function createSessionFromUser(user) {
  return {
    backend: "local",
    access_token: "local-session",
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata || {}
    }
  };
}

function getLocalSession() {
  return readStorage(STORAGE_KEYS.session, null);
}

function saveLocalSession(session) {
  writeStorage(STORAGE_KEYS.session, session);
}

function getLocalCollection(kind) {
  const existing = readStorage(STORAGE_KEYS[kind], null);
  if (Array.isArray(existing)) {
    return existing;
  }

  const seededItems = collectionConfig[kind].seed.map((item) => ({ ...item }));
  writeStorage(STORAGE_KEYS[kind], seededItems);
  return seededItems;
}

function saveLocalCollection(kind, items) {
  writeStorage(STORAGE_KEYS[kind], items);
}

async function signUpLocal(email, password) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const users = getLocalUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("An account with this email already exists in the local backend.");
  }

  const user = {
    id: createLocalId("user"),
    email: normalizedEmail,
    password,
    user_metadata: {
      username: normalizedEmail.split("@")[0]
    }
  };

  users.push(user);
  saveLocalUsers(users);

  const session = createSessionFromUser(user);
  saveLocalSession(session);
  return { session, mode: "local" };
}

async function signInLocal(email, password) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = getLocalUsers().find((item) => item.email === normalizedEmail);

  if (!user || user.password !== password) {
    throw new Error("Invalid email or password for the local backend.");
  }

  const session = createSessionFromUser(user);
  saveLocalSession(session);
  return { session, mode: "local" };
}

async function signOutLocal() {
  removeStorage(STORAGE_KEYS.session);
}

function clearLocalFallbackSession() {
  removeStorage(STORAGE_KEYS.session);
}

function shouldFallbackToLocal(error) {
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return (
    !firebaseAuth
    || !firestoreDb
    || code === "permission-denied"
    || code === "failed-precondition"
    || code === "unavailable"
    || code === "unimplemented"
    || code === "not-found"
    || code === "auth/app-not-authorized"
    || code === "auth/configuration-not-found"
    || code === "auth/operation-not-allowed"
    || code === "auth/network-request-failed"
    || code === "auth/invalid-api-key"
    || code === "auth/unauthorized-domain"
    || code === "auth/web-storage-unsupported"
    || message.includes("offline")
    || message.includes("network")
    || message.includes("failed to fetch")
    || message.includes("missing or insufficient permissions")
    || message.includes("firestore")
    || message.includes("not available")
    || message.includes("app has not been created")
  );
}

async function ensureFirebaseProfile(user, isNewUser) {
  if (!firestoreDb || !user) {
    return;
  }

  const username = user.displayName || user.email?.split("@")[0] || "DevHub member";
  const profilePayload = {
    email: user.email || "",
    username,
    updated_at: firebaseFieldValue?.serverTimestamp ? firebaseFieldValue.serverTimestamp() : new Date().toISOString()
  };

  if (isNewUser) {
    profilePayload.created_at = firebaseFieldValue?.serverTimestamp ? firebaseFieldValue.serverTimestamp() : new Date().toISOString();
  }

  await firestoreDb.collection("profiles").doc(user.uid).set(profilePayload, { merge: true });
}

function buildCollectionStatus(kind, mode) {
  const labels = {
    jobs: {
      firebase: "Live Firebase job data",
      local: "Local job fallback is active"
    },
    community: {
      firebase: "Live Firebase community feed",
      local: "Local community fallback is active"
    },
    code: {
      firebase: "Live Firebase code shares",
      local: "Local code fallback is active"
    },
    videos: {
      firebase: "Live Firebase videos",
      local: "Local video fallback is active"
    }
  };

  return labels[kind]?.[mode] || "Backend status updated";
}

function normalizeJob(record) {
  return {
    id: record.id,
    title: record.title || "Untitled role",
    summary: record.summary || "No summary added yet.",
    contract_type: record.contract_type || "Contract",
    location: record.location || "Remote",
    skills: normalizeTags(record.skills),
    contact_url: record.contact_url || "",
    author_name: record.author_name || "DevHub member",
    created_at: normalizeDateValue(record.created_at)
  };
}

function normalizeCommunity(record) {
  return {
    id: record.id,
    channel: sanitizeChannel(record.channel),
    body: record.body || "",
    author_name: record.author_name || "DevHub member",
    created_at: normalizeDateValue(record.created_at)
  };
}

function normalizeCode(record) {
  return {
    id: record.id,
    title: record.title || "Untitled share",
    summary: record.summary || "No summary added yet.",
    language: record.language || "General",
    repo_url: record.repo_url || "",
    snippet: record.snippet || "",
    author_name: record.author_name || "DevHub member",
    created_at: normalizeDateValue(record.created_at)
  };
}

function normalizeVideo(record) {
  return {
    id: record.id,
    title: record.title || "Untitled video",
    description: record.description || "No description added yet.",
    category: record.category || "Tutorial",
    video_url: record.video_url || "",
    thumbnail_url: record.thumbnail_url || "",
    views: record.views || 0,
    author_name: record.author_name || "DevHub member",
    created_at: normalizeDateValue(record.created_at)
  };
}

const collectionConfig = {
  jobs: {
    collection: "job_posts",
    seed: seedData.jobs,
    normalize: normalizeJob
  },
  community: {
    collection: "community_posts",
    seed: seedData.community,
    normalize: normalizeCommunity
  },
  code: {
    collection: "code_posts",
    seed: seedData.code,
    normalize: normalizeCode
  },
  videos: {
    collection: "video_posts",
    seed: seedData.videos,
    normalize: normalizeVideo
  }
};

async function getFirebaseSession() {
  if (!firebaseAuth) {
    return null;
  }

  if (firebaseAuth.currentUser) {
    return createFirebaseSession(firebaseAuth.currentUser);
  }

  return new Promise((resolve) => {
    let settled = false;
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      if (settled) {
        return;
      }

      settled = true;
      unsubscribe();
      resolve(user ? createFirebaseSession(user) : null);
    }, () => {
      if (settled) {
        return;
      }

      settled = true;
      resolve(null);
    });

    window.setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      unsubscribe();
      resolve(null);
    }, 1500);
  });
}

async function getSession() {
  try {
    const firebaseSession = await getFirebaseSession();
    if (firebaseSession) {
      clearLocalFallbackSession();
      return firebaseSession;
    }
  } catch (error) {
    if (!shouldFallbackToLocal(error)) {
      return null;
    }
  }

  return getLocalSession();
}

function updateAuthUi() {
  const summary = getDisplayName(state.session);
  document.querySelectorAll("[data-auth-summary]").forEach((element) => {
    element.textContent = summary;
  });

  document.querySelectorAll("[data-auth-link]").forEach((element) => {
    element.textContent = state.session ? "Account" : "Sign in";
  });

  document.querySelectorAll("[data-signout]").forEach((element) => {
    element.hidden = !state.session;
  });

  const authEmail = document.querySelector("[data-auth-email]");
  if (authEmail) {
    authEmail.textContent = state.session?.user?.email || "No active session";
  }

  const authForm = document.querySelector("#auth-form");
  const signedInPanel = document.querySelector("[data-auth-landing]");
  if (authForm && signedInPanel) {
    authForm.hidden = Boolean(state.session);
    signedInPanel.hidden = !state.session;
  }
}

function initNav() {
  const nav = document.querySelector("#site-nav");
  const toggle = document.querySelector("[data-nav-toggle]");
  const page = document.body.dataset.page;

  document.querySelectorAll("[data-nav]").forEach((link) => {
    const isActive = link.dataset.nav === page;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    }
  });

  if (!nav || !toggle) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = nav.dataset.open === "true";
    nav.dataset.open = isOpen ? "false" : "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.dataset.open = "false";
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function bindGlobalActions() {
  document.querySelectorAll("[data-signout]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        if (state.session?.backend === "local" || !firebaseAuth) {
          await signOutLocal();
          state.session = null;
          updateAuthUi();
        } else {
          clearLocalFallbackSession();
          await firebaseAuth.signOut();
        }

        if (document.body.dataset.page === "signin") {
          setMessage(document.querySelector("[data-auth-message]"), "Signed out successfully.", "success");
        }
      } catch (error) {
        if (document.body.dataset.page === "signin") {
          setMessage(document.querySelector("[data-auth-message]"), error?.message || "Unable to sign out right now.", "error");
        }
      }
    });
  });
}

async function insertRecord(kind, payload) {
  const config = collectionConfig[kind];

  if (firestoreDb && state.session?.backend !== "local") {
    try {
      const collectionRef = firestoreDb.collection(config.collection);
      const documentPayload = {
        ...payload,
        created_at: firebaseFieldValue?.serverTimestamp ? firebaseFieldValue.serverTimestamp() : new Date().toISOString()
      };
      const docRef = await collectionRef.add(documentPayload);
      const snapshot = await docRef.get();
      return {
        record: config.normalize({
          id: snapshot.id,
          ...snapshot.data()
        }),
        mode: "firebase"
      };
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        throw error;
      }
    }
  }

  const items = getLocalCollection(kind);
  const record = config.normalize({
    id: createLocalId(kind),
    ...payload,
    created_at: new Date().toISOString()
  });
  items.unshift(record);
  saveLocalCollection(kind, items);
  return { record, mode: "local" };
}

async function fetchCollection(kind) {
  const config = collectionConfig[kind];
  if (!config) {
    return { items: [], mode: "local", error: "Unknown collection." };
  }

  if (firestoreDb) {
    try {
      const snapshot = await firestoreDb
        .collection(config.collection)
        .orderBy("created_at", "desc")
        .get();

      return {
        items: snapshot.docs.map((doc) => config.normalize({
          id: doc.id,
          ...doc.data()
        })),
        mode: "firebase",
        error: ""
      };
    } catch (error) {
      if (!shouldFallbackToLocal(error)) {
        return {
          items: [],
          mode: "firebase",
          error: error?.message || "Unable to load live data."
        };
      }
    }
  }

  return {
    items: getLocalCollection(kind).map(config.normalize),
    mode: "local",
    error: ""
  };
}

function renderEmptyState(title, message) {
  return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><p class="helper-text">${escapeHtml(message)}</p></div>`;
}

function renderJobs() {
  const container = document.querySelector("#jobs-list");
  if (!container) {
    return;
  }

  const query = String(document.querySelector("#job-search")?.value || "").trim().toLowerCase();
  const items = state.datasets.jobs.filter((item) => {
    const text = [item.title, item.summary, item.location, item.contract_type, item.skills.join(" ")]
      .join(" ")
      .toLowerCase();
    return text.includes(query);
  });

  if (!items.length) {
    container.innerHTML = renderEmptyState("No jobs match that search yet.", "Try a broader keyword or publish the first role from the form above.");
    return;
  }

  container.innerHTML = items.map((item) => {
    const contactUrl = safeUrl(item.contact_url);
    const tags = item.skills.length
      ? `<div class="tag-list">${item.skills.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>`
      : "";

    return `
      <article class="job-card">
        <div class="card-topline">
          <span>${escapeHtml(item.contract_type)}</span>
          <span>${escapeHtml(item.location)}</span>
        </div>
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-text">${escapeHtml(item.summary)}</p>
        ${tags}
        <div class="card-actions">
          ${contactUrl ? `<a class="btn btn-secondary" href="${contactUrl}" target="_blank" rel="noreferrer">Contact</a>` : ""}
          <span class="inline-note">${escapeHtml(item.author_name)} | ${escapeHtml(formatRelativeTime(item.created_at))}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderCommunity() {
  const container = document.querySelector("#community-feed");
  if (!container) {
    return;
  }

  const items = state.datasets.community.filter((item) => {
    return state.filters.channel === "all" ? true : item.channel === state.filters.channel;
  });

  if (!items.length) {
    container.innerHTML = renderEmptyState("No posts in this channel yet.", "Be the first to kick off the conversation.");
    return;
  }

  container.innerHTML = items.map((item) => `
    <article class="feed-card">
      <div class="feed-header">
        <span class="avatar-pill">${escapeHtml(initialsFromName(item.author_name))}</span>
        <div>
          <div class="feed-meta">
            <strong>${escapeHtml(item.author_name)}</strong>
            <span>#${escapeHtml(item.channel)} | ${escapeHtml(formatRelativeTime(item.created_at))}</span>
          </div>
          <p class="feed-body">${escapeHtml(item.body)}</p>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCode() {
  const container = document.querySelector("#code-list");
  if (!container) {
    return;
  }

  const query = String(document.querySelector("#code-search")?.value || "").trim().toLowerCase();
  const language = document.querySelector("#code-language-filter")?.value || "All";

  const items = state.datasets.code.filter((item) => {
    const matchesLanguage = language === "All" ? true : item.language === language;
    const text = [item.title, item.summary, item.language, item.snippet].join(" ").toLowerCase();
    return matchesLanguage && text.includes(query);
  });

  if (!items.length) {
    container.innerHTML = renderEmptyState("No code shares match these filters.", "Clear a filter or publish a new snippet from the form above.");
    return;
  }

  container.innerHTML = items.map((item) => {
    const repoUrl = safeUrl(item.repo_url);
    return `
      <article class="code-card">
        <div class="card-topline">
          <span>${escapeHtml(item.language)}</span>
          <span>${escapeHtml(formatRelativeTime(item.created_at))}</span>
        </div>
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-text">${escapeHtml(item.summary)}</p>
        ${item.snippet ? `<pre class="code-block">${escapeHtml(item.snippet)}</pre>` : ""}
        <div class="card-actions">
          ${repoUrl ? `<a class="btn btn-secondary" href="${repoUrl}" target="_blank" rel="noreferrer">Open link</a>` : ""}
          <span class="inline-note">${escapeHtml(item.author_name)}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderVideos() {
  const container = document.querySelector("#video-list");
  if (!container) {
    return;
  }

  const query = String(document.querySelector("#video-search")?.value || "").trim().toLowerCase();
  const category = document.querySelector("#video-category-filter")?.value || "All";

  const items = state.datasets.videos.filter((item) => {
    const matchesCategory = category === "All" ? true : item.category === category;
    const text = [item.title, item.description, item.category].join(" ").toLowerCase();
    return matchesCategory && text.includes(query);
  });

  if (!items.length) {
    container.innerHTML = renderEmptyState("No videos match these filters.", "Try another search term or publish a learning link from the form above.");
    return;
  }

  container.innerHTML = items.map((item) => {
    const videoUrl = safeUrl(item.video_url);
    const thumbnailUrl = safeUrl(item.thumbnail_url);

    return `
      <article class="video-card">
        <div class="thumbnail">
          ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="${escapeHtml(item.title)} thumbnail">` : escapeHtml(item.category)}
        </div>
        <div class="card-topline">
          <span>${escapeHtml(item.category)}</span>
          <span>${escapeHtml(formatViews(item.views))} views</span>
        </div>
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-text">${escapeHtml(item.description)}</p>
        <div class="card-actions">
          ${videoUrl ? `<a class="btn btn-secondary" href="${videoUrl}" target="_blank" rel="noreferrer">Watch link</a>` : ""}
          <span class="inline-note">${escapeHtml(item.author_name)} | ${escapeHtml(formatRelativeTime(item.created_at))}</span>
        </div>
      </article>
    `;
  }).join("");
}

async function initHomePage() {
  const kinds = ["jobs", "community", "code", "videos"];
  const results = await Promise.all(kinds.map((kind) => fetchCollection(kind)));

  kinds.forEach((kind, index) => {
    state.datasets[kind] = results[index].items;
    const stat = document.querySelector(`[data-stat="${kind}"]`);
    if (stat) {
      stat.textContent = String(results[index].items.length);
    }
  });

  const status = document.querySelector("[data-backend-status]");
  if (!status) {
    return;
  }

  const liveCount = results.filter((result) => result.mode === "firebase" && !result.error).length;
  status.dataset.live = String(liveCount === kinds.length);
  if (liveCount === kinds.length) {
    status.textContent = "Firebase is connected across the main content areas.";
    return;
  }

  if (liveCount > 0) {
    status.textContent = "Firebase is connected for some sections. Local fallback is covering the rest until setup is finished.";
    return;
  }

  status.textContent = "Local persisted backend is active. Firebase will take over once Auth and Firestore are enabled.";
}

async function initJobsPage() {
  document.querySelector("#job-search")?.addEventListener("input", renderJobs);

  document.querySelector("#job-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.querySelector('[data-form-message="jobs"]');
    if (!state.session) {
      setMessage(message, "Sign in before publishing a job.", "error");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title") || "").trim(),
      contract_type: String(formData.get("contractType") || "").trim(),
      location: String(formData.get("location") || "").trim(),
      skills: normalizeTags(formData.get("skills")),
      contact_url: String(formData.get("contactUrl") || "").trim(),
      summary: String(formData.get("summary") || "").trim(),
      author_id: state.session.user.id,
      author_name: getAuthorName(state.session)
    };

    try {
      const result = await insertRecord("jobs", payload);
      state.datasets.jobs.unshift(result.record);
      renderJobs();
      form.reset();
      setLiveBadge("jobs", result.mode === "firebase", buildCollectionStatus("jobs", result.mode));
      setMessage(message, result.mode === "firebase" ? "Job published to Firebase." : "Job saved to the local fallback backend.", "success");
    } catch (error) {
      setMessage(message, error?.message || "Unable to publish job.", "error");
    }
  });

  const result = await fetchCollection("jobs");
  state.datasets.jobs = result.items;
  setLiveBadge("jobs", result.mode === "firebase" && !result.error, result.error || buildCollectionStatus("jobs", result.mode));
  renderJobs();
}

async function initCommunityPage() {
  document.querySelectorAll("[data-channel]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filters.channel = button.dataset.channel || "all";
      document.querySelectorAll("[data-channel]").forEach((item) => item.classList.toggle("active", item === button));
      renderCommunity();
    });
  });

  document.querySelector("#community-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.querySelector('[data-form-message="community"]');
    if (!state.session) {
      setMessage(message, "Sign in before posting to the community.", "error");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      channel: sanitizeChannel(String(formData.get("channel") || "general")),
      body: String(formData.get("body") || "").trim(),
      author_id: state.session.user.id,
      author_name: getAuthorName(state.session, formData.get("authorName"))
    };

    try {
      const result = await insertRecord("community", payload);
      state.datasets.community.unshift(result.record);
      renderCommunity();
      form.reset();
      setLiveBadge("community", result.mode === "firebase", buildCollectionStatus("community", result.mode));
      setMessage(message, result.mode === "firebase" ? "Post published to Firebase." : "Post saved to the local fallback backend.", "success");
    } catch (error) {
      setMessage(message, error?.message || "Unable to publish post.", "error");
    }
  });

  const result = await fetchCollection("community");
  state.datasets.community = result.items;
  setLiveBadge("community", result.mode === "firebase" && !result.error, result.error || buildCollectionStatus("community", result.mode));
  renderCommunity();
}

async function initCodePage() {
  document.querySelector("#code-search")?.addEventListener("input", renderCode);
  document.querySelector("#code-language-filter")?.addEventListener("change", renderCode);

  document.querySelector("#code-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.querySelector('[data-form-message="code"]');
    if (!state.session) {
      setMessage(message, "Sign in before sharing code.", "error");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title") || "").trim(),
      summary: String(formData.get("summary") || "").trim(),
      language: String(formData.get("language") || "").trim(),
      repo_url: String(formData.get("repoUrl") || "").trim(),
      snippet: String(formData.get("snippet") || "").trim(),
      author_id: state.session.user.id,
      author_name: getAuthorName(state.session)
    };

    try {
      const result = await insertRecord("code", payload);
      state.datasets.code.unshift(result.record);
      renderCode();
      form.reset();
      setLiveBadge("code", result.mode === "firebase", buildCollectionStatus("code", result.mode));
      setMessage(message, result.mode === "firebase" ? "Code share published to Firebase." : "Code share saved to the local fallback backend.", "success");
    } catch (error) {
      setMessage(message, error?.message || "Unable to publish code share.", "error");
    }
  });

  const result = await fetchCollection("code");
  state.datasets.code = result.items;
  setLiveBadge("code", result.mode === "firebase" && !result.error, result.error || buildCollectionStatus("code", result.mode));
  renderCode();
}

async function initVideosPage() {
  document.querySelector("#video-search")?.addEventListener("input", renderVideos);
  document.querySelector("#video-category-filter")?.addEventListener("change", renderVideos);

  document.querySelector("#video-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.querySelector('[data-form-message="videos"]');
    if (!state.session) {
      setMessage(message, "Sign in before publishing a video link.", "error");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      category: String(formData.get("category") || "").trim(),
      video_url: String(formData.get("videoUrl") || "").trim(),
      thumbnail_url: String(formData.get("thumbnailUrl") || "").trim(),
      author_id: state.session.user.id,
      author_name: getAuthorName(state.session),
      views: 0
    };

    try {
      const result = await insertRecord("videos", payload);
      state.datasets.videos.unshift(result.record);
      renderVideos();
      form.reset();
      setLiveBadge("videos", result.mode === "firebase", buildCollectionStatus("videos", result.mode));
      setMessage(message, result.mode === "firebase" ? "Video link published to Firebase." : "Video link saved to the local fallback backend.", "success");
    } catch (error) {
      setMessage(message, error?.message || "Unable to publish video link.", "error");
    }
  });

  const result = await fetchCollection("videos");
  state.datasets.videos = result.items;
  setLiveBadge("videos", result.mode === "firebase" && !result.error, result.error || buildCollectionStatus("videos", result.mode));
  renderVideos();
}

async function initSigninPage() {
  const message = document.querySelector("[data-auth-message]");
  const form = document.querySelector("#auth-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const intent = event.submitter?.value || "signin";

    try {
      if (intent === "signup") {
        if (firebaseAuth) {
          try {
            const credential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
            const user = credential.user;
            if (user && !user.displayName) {
              await user.updateProfile({
                displayName: user.email?.split("@")[0] || "DevHub member"
              });
            }

            clearLocalFallbackSession();
            await ensureFirebaseProfile(firebaseAuth.currentUser || user, true);
            state.session = createFirebaseSession(firebaseAuth.currentUser || user);
            updateAuthUi();
            setMessage(message, "Account created and connected to Firebase. Redirecting home...", "success");
            setTimeout(() => {
              window.location.href = "index.html";
            }, 700);
            return;
          } catch (error) {
            if (!shouldFallbackToLocal(error)) {
              throw error;
            }
          }
        }

        const localSignup = await signUpLocal(email, password);
        state.session = localSignup.session;
        updateAuthUi();
        setMessage(message, "Firebase is not ready yet, so a local account was created instead. Redirecting home...", "success");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 700);
        return;
      }

      if (firebaseAuth) {
        try {
          const credential = await firebaseAuth.signInWithEmailAndPassword(email, password);
          clearLocalFallbackSession();
          await ensureFirebaseProfile(firebaseAuth.currentUser || credential.user, false);
          state.session = createFirebaseSession(firebaseAuth.currentUser || credential.user);
          updateAuthUi();
          setMessage(message, "Signed in with Firebase. Redirecting home...", "success");
          setTimeout(() => {
            window.location.href = "index.html";
          }, 700);
          return;
        } catch (error) {
          if (!shouldFallbackToLocal(error)) {
            throw error;
          }
        }
      }

      const localSignin = await signInLocal(email, password);
      state.session = localSignin.session;
      updateAuthUi();
      setMessage(message, "Signed in with the local fallback backend. Redirecting home...", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 700);
    } catch (error) {
      setMessage(message, error?.message || "Unable to authenticate right now.", "error");
    }
  });
}

function setYear() {
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
}

async function initApp() {
  initTheme();
  setYear();
  initNav();
  bindGlobalActions();

  if (firebaseAuth) {
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        clearLocalFallbackSession();
        state.session = createFirebaseSession(user);
        updateAuthUi();
        return;
      }

      if (state.session?.backend === "firebase") {
        state.session = null;
        updateAuthUi();
      }
    });
  }

  state.session = await getSession();
  updateAuthUi();

  const page = document.body.dataset.page;
  if (page === "home") {
    await initHomePage();
  }
  if (page === "jobs") {
    await initJobsPage();
  }
  if (page === "community") {
    await initCommunityPage();
  }
  if (page === "code") {
    await initCodePage();
  }
  if (page === "videos") {
    await initVideosPage();
  }
  if (page === "signin") {
    await initSigninPage();
  }
}

document.addEventListener("DOMContentLoaded", initApp);
