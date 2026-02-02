// Main UI controller for the 3-step storefront builder flow (assets, prompts, staging).
import "./styles.css";
import { createAuth0Client } from "@auth0/auth0-spa-js";
import { codex } from "./codex-client.js";

const RESPONSE_ROUTE_PREFIX = "/codex-response/";
const RESPONSE_KEY_PREFIX = "codex-response-";

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const auth0 =
  auth0Domain && auth0ClientId
    ? await createAuth0Client({
        domain: auth0Domain,
        clientId: auth0ClientId,
        authorizationParams: {
          redirect_uri: window.location.origin,
        },
      })
    : null;

const renderResponsePage = (threadId) => {
  document.body.innerHTML = `
    <main class="min-h-screen bg-slate-50 text-slate-900">
      <header class="border-b border-slate-200 bg-white">
        <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-slate-400">CODEX RESPONSE</p>
            <p class="text-sm text-slate-600">Thread: ${threadId}</p>
          </div>
          <a class="text-xs uppercase tracking-[0.2em] text-slate-500 underline" href="/">Back</a>
        </div>
      </header>
      <section class="mx-auto max-w-5xl px-6 py-6">
        <pre id="response-log" class="min-h-[60vh] whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700"></pre>
      </section>
    </main>
  `;

  const logEl = document.querySelector("#response-log");
  const stored = localStorage.getItem(`${RESPONSE_KEY_PREFIX}${threadId}`) ?? "";
  if (logEl) logEl.textContent = stored;

  codex.setThreadId(threadId);
  codex.subscribe((message) => {
    if (!message || !logEl) return;
    const { method, params } = message;
    const append = (delta) => {
      if (!delta) return;
      logEl.textContent += delta;
      logEl.scrollTop = logEl.scrollHeight;
      localStorage.setItem(`${RESPONSE_KEY_PREFIX}${threadId}`, logEl.textContent);
    };

    if (method === "item/agentMessage/delta") return append(params?.delta);
    if (method === "item/reasoning/summaryTextDelta") return append(params?.delta ?? params?.summaryTextDelta);
    if (method === "item/commandExecution/outputDelta") return append(params?.delta ?? params?.outputDelta);
    if (method === "item/fileChange/outputDelta") return append(params?.delta ?? params?.outputDelta);
    if (method === "item/completed") {
      const item = params?.item;
      if (item?.type === "agentMessage" && item?.text) append(`\n${item.text}`);
    }
  });
};

const isResponseRoute = window.location.pathname.startsWith(RESPONSE_ROUTE_PREFIX);
if (isResponseRoute) {
  const threadId = window.location.pathname.replace(RESPONSE_ROUTE_PREFIX, "");
  if (threadId) renderResponsePage(threadId);
}

const assetPackages = [
  {
    id: "bakery",
    name: "Bakery",
    logo: "/bakery/logo.png",
    hero: "/bakery/Hero.png",
    products: ["/bakery/product-1.png", "/bakery/product-2.png", "/bakery/product-3.png"],
    about: "/bakery/about.png"
  },
  {
    id: "rock_climbing",
    name: "Rock Climbing",
    logo: "/rock_climbing/logo.png",
    hero: "/rock_climbing/hero.JPG",
    products: ["/rock_climbing/product-1.jpg", "/rock_climbing/product-2.jpg", "/rock_climbing/product-3.jpg"],
    about: "/rock_climbing/About.jpeg"
  },
  {
    id: "fitness",
    name: "Fitness",
    logo: "/fitness/logo.png",
    hero: "/fitness/Hero.jpg",
    products: ["/fitness/product-1.png", "/fitness/product-2.png", "/fitness/product-3.mp4"],
    about: "/fitness/about.png"
  },
  {
    id: "cat_toys",
    name: "Cat Toys",
    logo: "/cat_toys/logo.png",
    hero: "/cat_toys/hero.png",
    products: ["/cat_toys/product-1.png", "/cat_toys/prodcut-2.png", "/cat_toys/product-3.png"],
    about: "/cat_toys/about.png"
  }
];

const packageSelect = document.querySelector("#asset-package");
const packageLogo = document.querySelector("#package-logo");
const stepLabel = document.querySelector("#step-label");
const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const missionSelect = document.querySelector("#mission-select");
const specialSelect = document.querySelector("#special-select");
const uiSelect = document.querySelector("#ui-select");
const organizationSelect = document.querySelector("#organization-select");
const heroSelect = document.querySelector("#hero-select");
const notesSelect = document.querySelector("#notes-select");

const boardLogo = document.querySelector("#board-logo");
const boardHero = document.querySelector("#board-hero");
const boardHeroVideo = document.querySelector("#board-hero-video");
const boardProduct1 = document.querySelector("#board-product-1");
const boardProduct1Video = document.querySelector("#board-product-1-video");
const boardProduct2 = document.querySelector("#board-product-2");
const boardProduct2Video = document.querySelector("#board-product-2-video");
const boardProduct3 = document.querySelector("#board-product-3");
const boardProduct3Video = document.querySelector("#board-product-3-video");
const boardAbout = document.querySelector("#board-about");
const boardAboutVideo = document.querySelector("#board-about-video");

const buildBtn = document.querySelector("#build-btn");
const mcpStatus = document.querySelector("#mcp-status");
const codexResponseLink = document.querySelector("#codex-response-link");
const buildStage = document.querySelector("#build-stage");
const buildLoader = document.querySelector("#build-loader");
const buildPlaceholder = document.querySelector("#build-placeholder");
const buildIframe = document.querySelector("#build-iframe");
const adjustInput = document.querySelector("#adjust-input");
const adjustBtn = document.querySelector("#adjust-btn");
const appHistory = document.querySelector("#app-history");
const appHistoryRefresh = document.querySelector("#app-history-refresh");
const appHistoryClear = document.querySelector("#app-history-clear");
const appHistoryPurge = document.querySelector("#app-history-purge");

const authPanel = document.querySelector("#auth-panel");
const appShell = document.querySelector("#app-shell");
const authForm = document.querySelector("#auth-form");
const authSend = document.querySelector("#auth-send");
const authStatus = document.querySelector("#auth-status");
const authUser = document.querySelector("#auth-user");
const authSignOut = document.querySelector("#auth-signout");

const stepSections = Array.from(document.querySelectorAll("[data-step]"));
const stepIndicators = Array.from(document.querySelectorAll("[data-step-indicator]"));

let currentStep = 1;
let selectedPackage = "bakery";
let activeThreadId = null;

const THREAD_KEY = "codex-thread-id";
const STEP_KEY = "codex-current-step";
const APP_HISTORY_KEY = "codex-app-history";

const restoreThread = () => {
  const saved = localStorage.getItem(THREAD_KEY);
  if (!saved) return;
  const list = loadAppHistory();
  const exists = list.some((item) => item.threadId === saved || item.appId === saved);
  if (exists) setActiveThread(saved);
};

const persistThread = (threadId) => {
  if (threadId) {
    localStorage.setItem(THREAD_KEY, threadId);
    activeThreadId = threadId;
  }
};

const clearThread = () => {
  localStorage.removeItem(THREAD_KEY);
  codex.setThreadId(null);
  activeThreadId = null;
  if (buildIframe) buildIframe.classList.add("hidden");
  if (buildPlaceholder) buildPlaceholder.classList.remove("hidden");
};


const loadAppHistory = () => {
  const raw = localStorage.getItem(APP_HISTORY_KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    const normalized = list.map((item) => {
      if (!item?.appId) return item;
      const expected = `/staged-store-front/${item.appId}/index.html`;
      if (!item.routePath) return { ...item, routePath: expected };
      const corrected = item.routePath.replace("/src/staged-store-front/", "/staged-store-front/");
      if (!corrected.includes(`/staged-store-front/${item.appId}`)) {
        return { ...item, routePath: expected };
      }
      if (corrected !== item.routePath) return { ...item, routePath: corrected };
      return item;
    });
    if (JSON.stringify(list) !== JSON.stringify(normalized)) {
      localStorage.setItem(APP_HISTORY_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return [];
  }
};

const updateCodexResponseLink = (threadId) => {
  if (!codexResponseLink || !threadId) return;
  codexResponseLink.href = `${window.location.origin}${RESPONSE_ROUTE_PREFIX}${threadId}`;
};

const saveAppHistory = (list) => {
  localStorage.setItem(APP_HISTORY_KEY, JSON.stringify(list));
};

const setAuthState = (session) => {
  if (!appShell) return;
  if (!auth0) {
    appShell.classList.remove("hidden");
    if (authForm) authForm.classList.add("hidden");
    if (authUser) authUser.classList.add("hidden");
    if (authSignOut) authSignOut.classList.add("hidden");
    if (authStatus) {
      const urlStatus = auth0Domain ? "yes" : "no";
      const keyStatus = auth0ClientId ? "yes" : "no";
      authStatus.textContent =
        "Auth not configured (set VITE_AUTH0_DOMAIN + VITE_AUTH0_CLIENT_ID). " +
        `Loaded URL: ${urlStatus}, key: ${keyStatus}.`;
    }
    return;
  }

  const user = session?.user;
  if (user) {
    appShell.classList.remove("hidden");
    if (authForm) authForm.classList.add("hidden");
    if (authUser) {
      authUser.textContent = `Signed in as ${user.email ?? user.name ?? "user"}`;
      authUser.classList.remove("hidden");
    }
    if (authSignOut) authSignOut.classList.remove("hidden");
    if (authStatus) authStatus.textContent = "";
  } else {
    appShell.classList.add("hidden");
    if (authForm) authForm.classList.remove("hidden");
    if (authUser) authUser.classList.add("hidden");
    if (authSignOut) authSignOut.classList.add("hidden");
    if (authStatus) authStatus.textContent = "Sign in with Auth0 to continue.";
  }
};

const initAuth = async () => {
  setAuthState(null);
  if (!auth0) return false;

  if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
    await auth0.handleRedirectCallback();
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const isAuthenticated = await auth0.isAuthenticated();
  const user = isAuthenticated ? await auth0.getUser() : null;
  setAuthState({ user });
  return isAuthenticated;
};

const renderAppHistory = (list = loadAppHistory()) => {
  if (!appHistory) return;
  appHistory.innerHTML = `<option value="">App History</option>`;
  list.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.appId;
    option.textContent = `${item.appId} · ${item.status ?? "completed"}`;
    appHistory.appendChild(option);
  });
};

const upsertAppHistory = (appId, threadId, status = "completed") => {
  if (!appId || !threadId) return;
  const list = loadAppHistory();
  const existing = list.find((item) => item.appId === appId);
  const updatedAt = new Date().toISOString();
  const entry = {
    appId,
    threadId,
    status,
    routePath: `/staged-store-front/${appId}/index.html`,
    updatedAt,
  };
  if (existing) {
    Object.assign(existing, entry);
  } else {
    list.unshift(entry);
  }
  saveAppHistory(list);
  renderAppHistory(list);
};

const fetchAppHistory = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/staged-apps/list");
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const data = await response.json();
    const list = (data.apps || []).map((appId) => ({
      appId,
      threadId: appId,
      status: "completed",
      routePath: `/staged-store-front/${appId}/index.html`,
      updatedAt: new Date().toISOString(),
    }));
    saveAppHistory(list);
    renderAppHistory(list);
  } catch (error) {
    if (mcpStatus) mcpStatus.textContent = `App history fetch failed: ${error.message ?? error}`;
  }
};


const setActiveThread = (threadId) => {
  if (!threadId) return;
  activeThreadId = threadId;
  codex.setThreadId(threadId);
  persistThread(threadId);
  updateCodexResponseLink(threadId);
  const list = loadAppHistory();
  const item = list.find((entry) => entry.threadId === threadId || entry.appId === threadId);
  const routePath = item?.routePath ?? `/staged-store-front/${threadId}/index.html`;
  if (buildIframe) {
    buildIframe.src = routePath;
    buildIframe.classList.remove("hidden");
    if (buildPlaceholder) buildPlaceholder.classList.add("hidden");
  }
  setStageReady();
};

const getActiveThread = () => {
  if (activeThreadId) return activeThreadId;
  const current = codex.getThreadId?.() || localStorage.getItem(THREAD_KEY);
  if (current) return current;
  const selectedApp = appHistory?.value;
  if (selectedApp) {
    const entry = loadAppHistory().find((item) => item.appId === selectedApp);
    if (entry?.threadId) return entry.threadId;
  }
  const list = loadAppHistory();
  if (list.length && list[0]?.threadId) return list[0].threadId;
  return null;
};

const persistStep = (step) => {
  localStorage.setItem(STEP_KEY, String(step));
};

const restoreStep = () => {
  const saved = localStorage.getItem(STEP_KEY);
  if (!saved) return null;
  const value = Number(saved);
  return Number.isNaN(value) ? null : value;
};

const ensureStageEmpty = () => {
  if (!buildIframe || !buildPlaceholder) return;
  buildIframe.src = "about:blank";
  buildIframe.classList.add("hidden");
  buildPlaceholder.classList.remove("hidden");
  if (buildStage) {
    buildStage.classList.remove("is-ready", "is-loading");
    buildStage.classList.add("is-idle");
  }
};

const setStageLoading = () => {
  if (!buildStage) return;
  buildStage.classList.remove("is-ready", "is-idle");
  buildStage.classList.add("is-loading");
};

const setStageReady = () => {
  if (!buildStage) return;
  buildStage.classList.remove("is-loading", "is-idle");
  buildStage.classList.add("is-ready");
};

const storeResponse = (threadId, text) => {
  if (!threadId) return;
  localStorage.setItem(`${RESPONSE_KEY_PREFIX}${threadId}`, text ?? "");
};

let streamActive = false;

const appendResponse = (threadId, text) => {
  if (!threadId || !text) return;
  const key = `${RESPONSE_KEY_PREFIX}${threadId}`;
  const current = localStorage.getItem(key) ?? "";
  localStorage.setItem(key, current + text);
};

const isVideo = (path) => /\.(mp4|webm)$/i.test(path || "");

const setMedia = (imgEl, videoEl, path) => {
  if (!imgEl || !videoEl) return;
  if (isVideo(path)) {
    imgEl.classList.add("hidden");
    videoEl.src = path;
    videoEl.classList.remove("hidden");
    videoEl.load();
  } else {
    videoEl.classList.add("hidden");
    videoEl.removeAttribute("src");
    imgEl.src = path;
    imgEl.classList.remove("hidden");
  }
};

const applyPackage = (pkg) => {
  if (!pkg) return;
  selectedPackage = pkg.id;

  if (packageLogo) packageLogo.src = pkg.logo;
  if (boardLogo) boardLogo.src = pkg.logo;
  setMedia(boardHero, boardHeroVideo, pkg.hero);
  setMedia(boardProduct1, boardProduct1Video, pkg.products[0]);
  setMedia(boardProduct2, boardProduct2Video, pkg.products[1]);
  setMedia(boardProduct3, boardProduct3Video, pkg.products[2]);
  setMedia(boardAbout, boardAboutVideo, pkg.about);

  // Step 3 rendering handled by MCP build output (placeholder for now).
};

const updateStepUI = () => {
  stepSections.forEach((section, index) => {
    section.classList.toggle("hidden", index + 1 !== currentStep);
  });

  stepIndicators.forEach((indicator) => {
    const step = Number(indicator.dataset.stepIndicator);
    indicator.classList.toggle("bg-ink", step <= currentStep);
    indicator.classList.toggle("bg-slate-200", step > currentStep);
  });

  if (stepLabel) stepLabel.textContent = String(currentStep);
  if (prevBtn) prevBtn.disabled = currentStep === 1;
  if (prevBtn) prevBtn.classList.toggle("opacity-50", currentStep === 1);
  if (nextBtn) nextBtn.textContent = currentStep === 3 ? "Done" : "Continue →";
  if (currentStep === 3 && !activeThreadId && !(appHistory && appHistory.value)) {
    ensureStageEmpty();
  }
};

const setStep = (step) => {
  currentStep = Math.min(3, Math.max(1, step));
  updateStepUI();
  persistStep(currentStep);
};

const initPackages = () => {
  if (!packageSelect) return;
  const selected = assetPackages.find((pkg) => pkg.id === packageSelect.value) || assetPackages[0];
  if (selected) applyPackage(selected);

  packageSelect.addEventListener("change", () => {
    const next = assetPackages.find((pkg) => pkg.id === packageSelect.value);
    if (next) applyPackage(next);
  });
};

const initNavigation = () => {
  if (prevBtn) {
    prevBtn.addEventListener("click", () => setStep(currentStep - 1));
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentStep < 3) {
        setStep(currentStep + 1);
      }
    });
  }
};

const initStep2Prompts = () => {
  const missions = [
    {
      id: "fitness",
      text:
        "We’re here to help you embrace movement as a way to improve every aspect of your life. True health is about more than just physical fitness; it’s about creating balance, building confidence, and enhancing your overall well-being. Our mission is to guide you toward lasting changes that align with your goals and values, so you can move more and live better."
    },
    {
      id: "bakery",
      text:
        "At Hearthstone Bakery, we believe bread is more than food; it’s a daily ritual that connects us to tradition, community, and the earth. Every loaf we craft begins with organic, locally-sourced grains and the patient hands of skilled bakers who honor time-tested techniques. No shortcuts, no additives; just flour, water, salt, and time. We bake fresh every morning so your family can gather around bread that nourishes both body and soul."
    },
    {
      id: "rock",
      text:
        "Rock climbing adventures exists to take you beyond the guidebook and into the world's most breathtaking vertical landscapes. We're climbers first, guides who've spent decades on rock faces from Patagonia to the Dolomites. We design journeys for those who crave the raw challenge of the climb and the profound stillness of remote wilderness. Whether you're chasing your first outdoor lead or ticking a dream route off your list, we handle the logistics so you can focus on the moment your hands touch stone."
    },
    {
      id: "cat",
      text:
        "Wildpaw crafts cat toys the way nature intended—using only real feathers, sustainably-sourced wood, natural fibers, and materials that honor your cat's instincts. We believe cats deserve playtime that's free from plastic, dyes, and synthetics. Every toy is handmade in small batches, designed to spark the hunter within while being gentle on the planet. Because when your cat pounces on a Wildpaw toy, they're connecting with something real."
    }
  ];

  const specials = [
    "Hand-finished details and small-batch production that make every item feel personal.",
    "Premium materials, thoughtful craftsmanship, and a focus on timeless design.",
    "Guided expertise, safety-first planning, and personalized progression for every level of adventurer.",
    "Transformative coaching built around your goals, recovery, and long-term performance."
  ];

  const uiDirections = [
    "Warm, bright, airy layout with generous whitespace and soft shadows.",
    "Bold, high-contrast look with oversized typography and strong grid lines.",
    "Calm, minimalist aesthetic with muted palette and subtle texture.",
    "Playful, colorful presentation with rounded cards and animated accents."
  ];

  const organizationIdeas = [
    "Group by use case: everyday, premium, gift-worthy.",
    "Highlight three hero products, then show a curated grid.",
    "Organize by collection themes with a short story per group.",
    "Lead with best sellers, then show the full lineup."
  ];

  const heroMessaging = [
    "Lead with a short, poetic line and a single clear CTA.",
    "Use a bold headline that names the feeling you want customers to have.",
    "Place the logo inside a clean badge and let the hero image do the talking.",
    "Keep the hero minimal: headline, one sentence, one button."
  ];

  const extraNotes = [
    "Prefer rounded corners, soft gradients, and minimal borders.",
    "Use tighter vertical spacing and compact cards.",
    "Keep navigation minimal—no extra links beyond the primary sections.",
    "Include a strong brand story section with a pull quote."
  ];

  const fillOptions = (select, items) => {
    if (!select) return;
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = typeof item === "string" ? item : item.text;
      option.textContent = typeof item === "string" ? item : item.id;
      select.appendChild(option);
    });
  };

  fillOptions(
    missionSelect,
    missions.map((mission) => ({
      id: `${mission.id.toUpperCase()} mission`,
      text: mission.text
    }))
  );
  fillOptions(specialSelect, specials);
  fillOptions(uiSelect, uiDirections);
  fillOptions(organizationSelect, organizationIdeas);
  fillOptions(heroSelect, heroMessaging);
  fillOptions(notesSelect, extraNotes);

  const bindSelectToTextarea = (selectId) => {
    const select = document.querySelector(selectId);
    if (!select) return;
    const textarea = select.parentElement?.querySelector("textarea");
    if (!textarea) return;
    select.addEventListener("change", () => {
      if (select.value) textarea.value = select.value;
    });
  };

  bindSelectToTextarea("#mission-select");
  bindSelectToTextarea("#special-select");
  bindSelectToTextarea("#ui-select");
  bindSelectToTextarea("#organization-select");
  bindSelectToTextarea("#hero-select");
  bindSelectToTextarea("#notes-select");
};

if (!isResponseRoute) {
  let appInitialized = false;

  const bootApp = () => {
    if (appInitialized) return;
    appInitialized = true;

    initPackages();
    initNavigation();
    initStep2Prompts();
    const restoredStep = restoreStep();
    if (restoredStep) currentStep = restoredStep;
    updateStepUI();
    restoreThread();
    renderAppHistory();
    fetchAppHistory();
    if (!loadAppHistory().length) {
      clearThread();
      ensureStageEmpty();
    }
    if (appHistory?.value) {
      const list = loadAppHistory();
      const entry = list.find((item) => item.appId === appHistory.value);
      if (entry?.threadId) setActiveThread(entry.threadId);
    }
    if (codex.getThreadId?.()) {
      const restored = codex.getThreadId();
      activeThreadId = restored;
      updateCodexResponseLink(restored);
    } else {
      const fallbackThread = loadAppHistory()[0]?.threadId;
      if (fallbackThread) updateCodexResponseLink(fallbackThread);
    }

    if (codexResponseLink) {
      codexResponseLink.addEventListener("click", (event) => {
        const id = getActiveThread();
        if (!id) {
          event.preventDefault();
          if (mcpStatus) mcpStatus.textContent = "No active thread to open.";
          return;
        }
        setActiveThread(id);
        updateCodexResponseLink(id);
      });
    }
  };

  if (authSend) {
    authSend.addEventListener("click", async () => {
      if (!auth0) return;
      await auth0.loginWithRedirect({
        authorizationParams: { redirect_uri: window.location.origin },
      });
    });
  }

  if (authSignOut) {
    authSignOut.addEventListener("click", async () => {
      if (!auth0) return;
      auth0.logout({ logoutParams: { returnTo: window.location.origin } });
    });
  }

  initAuth().then((signedIn) => {
    if (signedIn || !auth0) bootApp();
  });

  if (auth0) {
    const pollAuth = async () => {
      const isAuthed = await auth0.isAuthenticated();
      if (isAuthed) {
        const user = await auth0.getUser();
        setAuthState({ user });
        bootApp();
      }
    };
    window.addEventListener("focus", pollAuth);
  }
}

// Stream Codex output into the response panel.
codex.subscribe((message) => {
  if (!streamActive || !message) return;
  const { method, params } = message;
  const threadId = codex.getThreadId?.();
  if (!threadId) return;
  if (method === "item/agentMessage/delta") {
    const delta = params?.delta;
    if (delta) appendResponse(threadId, delta);
    return;
  }
  if (method === "item/reasoning/summaryTextDelta") {
    const delta = params?.delta ?? params?.summaryTextDelta;
    if (delta) appendResponse(threadId, delta);
    return;
  }
  if (method === "item/commandExecution/outputDelta") {
    const delta = params?.delta ?? params?.outputDelta;
    if (delta) appendResponse(threadId, delta);
    return;
  }
  if (method === "item/fileChange/outputDelta") {
    const delta = params?.delta ?? params?.outputDelta;
    if (delta) appendResponse(threadId, delta);
    return;
  }
  if (method === "item/completed") {
    const item = params?.item;
    if (item?.type === "agentMessage" && item?.text) {
      appendResponse(threadId, `\n${item.text}`);
    }
    return;
  }
  if (method === "turn/completed") {
    const status = params?.turn?.status ?? "completed";
    const threadId = codex.getThreadId?.();
    if (threadId) upsertAppHistory(threadId, threadId, status);
    streamActive = false;
  }
});

if (buildBtn) {
  buildBtn.addEventListener("click", () => {
    if (buildLoader) buildLoader.classList.remove("hidden");
    if (buildPlaceholder) buildPlaceholder.classList.add("hidden");
    if (mcpStatus) mcpStatus.textContent = "Sending build request to Codex MCP...";
    setStageLoading();
    streamActive = true;
    const existingThread = codex.getThreadId?.();
    if (existingThread) storeResponse(existingThread, "");
    if (existingThread) upsertAppHistory(existingThread, existingThread, "running");

    const payload = {
      package_id: selectedPackage,
      prompts: {
        brand_mission: document.querySelector("#prompt-mission")?.value.trim() ?? "",
        product_special: document.querySelector("#prompt-special")?.value.trim() ?? "",
        ui_preferences: document.querySelector("#prompt-ui")?.value.trim() ?? "",
        product_organization: document.querySelector("#prompt-organization")?.value.trim() ?? "",
        hero_logo_messaging: document.querySelector("#prompt-hero")?.value.trim() ?? "",
        additional_notes: document.querySelector("#prompt-notes")?.value.trim() ?? ""
      }
    };

    codex
      .send("", undefined, payload)
      .then((result) => {
        setActiveThread(result.threadId);
        upsertAppHistory(result.threadId, result.threadId, "completed");
        storeResponse(result.threadId, result.result);
        if (mcpStatus) mcpStatus.textContent = `Build completed (thread ${result.threadId}).`;
        if (buildIframe) {
          buildIframe.src = `/staged-store-front/${result.threadId}/index.html`;
          buildIframe.classList.remove("hidden");
          if (buildPlaceholder) buildPlaceholder.classList.add("hidden");
        }
        setStageReady();
      })
      .catch((error) => {
        if (String(error?.payload ?? error?.message ?? "").includes("thread not found")) {
          clearThread();
          if (existingThread) upsertAppHistory(existingThread, existingThread, "expired");
          if (mcpStatus) mcpStatus.textContent = "Thread expired. Please try again.";
          ensureStageEmpty();
          return;
        }
        if (mcpStatus) mcpStatus.textContent = `MCP error: ${error.message ?? error}`;
        ensureStageEmpty();
      })
      .finally(() => {
        if (buildLoader) buildLoader.classList.add("hidden");
      });
  });
}

if (adjustBtn) {
  adjustBtn.addEventListener("click", () => {
    if (!adjustInput?.value) return;
    if (mcpStatus) mcpStatus.textContent = "Sending adjustment to Codex MCP...";
    streamActive = true;
    const existingThread = activeThreadId ?? codex.getThreadId?.();
    if (existingThread) storeResponse(existingThread, "");
    if (existingThread) upsertAppHistory(existingThread, existingThread, "running");
    codex
      .send(adjustInput.value, existingThread)
      .then((result) => {
        setActiveThread(result.threadId);
        upsertAppHistory(result.threadId, result.threadId, "completed");
        storeResponse(result.threadId, result.result);
        if (mcpStatus) mcpStatus.textContent = `Adjustment completed (thread ${result.threadId}).`;
      })
      .catch((error) => {
        if (String(error?.payload ?? error?.message ?? "").includes("thread not found")) {
          clearThread();
          if (existingThread) upsertAppHistory(existingThread, existingThread, "expired");
          if (mcpStatus) mcpStatus.textContent = "Thread expired. Please try again.";
          return;
        }
        if (mcpStatus) mcpStatus.textContent = `MCP error: ${error.message ?? error}`;
      });
    adjustInput.value = "";
  });
}

if (appHistory) {
  appHistory.addEventListener("change", () => {
    const appId = appHistory.value;
    if (!appId) return;
    const list = loadAppHistory();
    const entry = list.find((item) => item.appId === appId);
    if (!entry) return;
    setActiveThread(entry.threadId);
    if (buildIframe) {
      const routePath =
        entry.routePath?.replace("/src/staged-store-front/", "/staged-store-front/") ??
        `/staged-store-front/${entry.appId}/index.html`;
      buildIframe.src = routePath;
      buildIframe.classList.remove("hidden");
      if (buildPlaceholder) buildPlaceholder.classList.add("hidden");
    }
    setStageReady();
    const responseUrl = `${window.location.origin}${RESPONSE_ROUTE_PREFIX}${entry.threadId}`;
    updateCodexResponseLink(entry.threadId);
  });
}

if (appHistoryRefresh) {
  appHistoryRefresh.addEventListener("click", () => {
    fetchAppHistory();
  });
}

// Thread recovery controls removed; use App History instead.

if (appHistoryClear) {
  appHistoryClear.addEventListener("click", () => {
    localStorage.removeItem(APP_HISTORY_KEY);
    clearThread();
    ensureStageEmpty();
    renderAppHistory([]);
    if (mcpStatus) mcpStatus.textContent = "Cleared app history.";
  });
}

if (appHistoryPurge) {
  appHistoryPurge.addEventListener("click", async () => {
    try {
      const response = await fetch("http://localhost:3001/api/staged-apps/purge", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      localStorage.removeItem(APP_HISTORY_KEY);
      clearThread();
      ensureStageEmpty();
      renderAppHistory([]);
      if (buildIframe) buildIframe.classList.add("hidden");
      if (buildPlaceholder) buildPlaceholder.classList.remove("hidden");
      if (mcpStatus) mcpStatus.textContent = "Purged staged apps.";
    } catch (error) {
      if (mcpStatus) mcpStatus.textContent = `Purge failed: ${error.message ?? error}`;
    }
  });
}

// Test MCP button removed — wiring full build prompt next.
