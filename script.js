// Theme toggle with localStorage
const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");
const gearIcon = themeToggle?.querySelector(".gear-icon");
setTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

function setTheme(mode) {
  body.classList.toggle("theme-light", mode === "light");
  body.classList.toggle("theme-dark", mode === "dark");
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", mode === "light" ? "false" : "true");
    themeToggle.setAttribute("aria-label", mode === "light" ? "Светлая тема" : "Тёмная тема");
    themeToggle.dataset.mode = mode;
  }
  localStorage.setItem("theme", mode);
}

themeToggle?.addEventListener("click", () => {
  const next = body.classList.contains("theme-light") ? "dark" : "light";
  setTheme(next);
  if (gearIcon) {
    gearIcon.classList.remove("gear-spin");
    void gearIcon.offsetWidth; // restart animation
    gearIcon.classList.add("gear-spin");
  }
});

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
        closeMobileNav();
      }
    }
  });
});

// Burger menu
const burger = document.getElementById("burger");
const mobileNav = document.getElementById("mobileNav");
const navScrim = document.getElementById("nav-scrim");

function closeMobileNav() {
  burger?.classList.remove("active");
  mobileNav?.classList.remove("open");
  navScrim?.classList.remove("show");
  burger?.setAttribute("aria-expanded", "false");
}

burger?.addEventListener("click", () => {
  burger.classList.toggle("active");
  mobileNav?.classList.toggle("open");
  navScrim?.classList.toggle("show", mobileNav?.classList.contains("open"));
  const expanded = mobileNav?.classList.contains("open");
  burger?.setAttribute("aria-expanded", expanded ? "true" : "false");
});

navScrim?.addEventListener("click", closeMobileNav);

// Toast helper
const toast = document.getElementById("toast");
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}

const modalForm = document.getElementById("modal-form");

function serializeForm(form) {
  const formData = new FormData(form);
  const payload = {};
  formData.forEach((value, key) => {
    if (payload[key]) {
      payload[key] = [].concat(payload[key], value);
    } else {
      payload[key] = value;
    }
  });
  return payload;
}

function toggleFormLoading(form, isLoading) {
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn?.toggleAttribute("disabled", isLoading);
  if (submitBtn) {
    submitBtn.dataset.loading = isLoading ? "true" : "false";
  }
}

async function handleFormSubmit(event, form) {
  event.preventDefault();
  const endpoint = form.dataset.endpoint;
  if (!endpoint) return;
  const statusEl = form.querySelector(".form-status");
  if (statusEl) statusEl.textContent = "Отправляем...";
  toggleFormLoading(form, true);
  const payload = serializeForm(form);
  payload.formName = form.dataset.form || form.id || "lead";
  payload.source = "vipauto161.ru";
  payload.timestamp = new Date().toISOString();
  payload._subject = `Новая заявка (${payload.formName})`;
  payload._template = "table";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Failed to submit form");
    const name = payload.name || "клиент";
    if (statusEl) {
      statusEl.textContent = "Заявка отправлена, перезвоним в рабочие часы.";
      setTimeout(() => { statusEl.textContent = ""; }, 3200);
    }
    showToast(`Спасибо, ${name}! Мы свяжемся с вами в рабочее время.`);
    form.reset();
    if (form === modalForm) {
      closeModal();
    }
  } catch (error) {
    console.error("Form submit error:", error);
    if (statusEl) {
      statusEl.textContent = "Не удалось отправить. Попробуйте ещё раз или позвоните нам.";
      setTimeout(() => { statusEl.textContent = ""; }, 3200);
    }
    showToast("Не получилось отправить заявку. Позвоните 8 (928) 7777-009.");
    const fallback = form.dataset.fallback;
    if (fallback) {
      setTimeout(() => window.location.href = fallback, 2000);
    }
  } finally {
    toggleFormLoading(form, false);
  }
}

document.querySelectorAll("form[data-endpoint]").forEach(form => {
  form.addEventListener("submit", event => handleFormSubmit(event, form));
});

const estimateForm = document.getElementById("estimate-form");
const estimateResult = document.getElementById("estimateResult");
const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});

const basePrices = {
  electric: 2500,
  light: 4900,
  aircon: 4200,
  starline: 11200,
  tint: 6200,
  multimedia: 7600
};

const carClassMultiplier = {
  compact: 1,
  crossover: 1.18,
  business: 1.32
};

const urgencyMultiplier = {
  standard: 1,
  fast: 1.25
};

function calculateEstimate() {
  if (!estimateForm || !estimateResult) return;
  const service = estimateForm.elements.service.value;
  const carClass = estimateForm.elements.carClass.value;
  const urgency = estimateForm.elements.urgency.value;
  const diagnosticsOnly = estimateForm.elements.needDiagnostics.checked;
  const base = basePrices[service] || 3000;
  const totalMultiplier = (carClassMultiplier[carClass] || 1) * (urgencyMultiplier[urgency] || 1);
  let total = Math.round((base * totalMultiplier) / 100) * 100;
  if (diagnosticsOnly) {
    const diagnosticsEstimate = Math.round((base * 0.65) / 100) * 100;
    total = Math.max(2500, diagnosticsEstimate);
  }
  estimateResult.textContent = `Ориентировочно ${priceFormatter.format(total)}`;
}

function buildEstimateSummary() {
  if (!estimateForm) return "";
  const serviceSelect = estimateForm.elements.service;
  const classSelect = estimateForm.elements.carClass;
  const urgencySelect = estimateForm.elements.urgency;
  const serviceText = serviceSelect?.options?.[serviceSelect.selectedIndex]?.textContent?.trim() || "";
  const classText = classSelect?.options?.[classSelect.selectedIndex]?.textContent?.trim() || "";
  const urgencyText = urgencySelect?.options?.[urgencySelect.selectedIndex]?.textContent?.trim() || "";
  const diagnosticsOnly = estimateForm.elements.needDiagnostics.checked ? "Только диагностика" : "Полный объём работ";
  const priceLine = estimateResult?.textContent?.replace("Ориентировочно", "").trim() || "";
  return [
    `Услуга: ${serviceText}`,
    `Класс авто: ${classText}`,
    `Срок: ${urgencyText}`,
    diagnosticsOnly,
    `Бюджет: ${priceLine}`
  ].join("; ");
}

estimateForm?.addEventListener("change", calculateEstimate);
estimateForm?.addEventListener("input", calculateEstimate);
calculateEstimate();

// Modal logic
const modalOverlay = document.getElementById("modal-overlay");
const focusableSelector = 'a[href], button, textarea, input, select';
let lastFocused = null;
let modalTrigger = null;

function openModal(evt) {
  evt?.preventDefault();
  modalTrigger = evt?.currentTarget || null;
  modalOverlay?.classList.add("show");
  modalOverlay?.setAttribute("aria-hidden", "false");
  lastFocused = document.activeElement;
  body.classList.add("no-scroll");
  const focusables = modalOverlay?.querySelectorAll(focusableSelector);
  focusables?.[0]?.focus();
  if (modalTrigger?.dataset.prefill === "estimate" && modalForm) {
    const commentField = modalForm.querySelector('textarea[name="comment"]');
    const summary = buildEstimateSummary();
    if (commentField && summary) {
      commentField.value = summary;
    }
  }
}

function closeModal() {
  modalOverlay?.classList.remove("show");
  modalOverlay?.setAttribute("aria-hidden", "true");
  body.classList.remove("no-scroll");
  lastFocused?.focus();
  modalForm?.querySelector(".form-status")?.textContent = "";
  modalTrigger = null;
}

document.querySelectorAll("[data-open-modal]").forEach(btn => {
  btn.addEventListener("click", openModal);
});

document.querySelectorAll("[data-close-modal]").forEach(btn => {
  btn.addEventListener("click", closeModal);
});

modalOverlay?.addEventListener("click", e => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
  if (e.key === "Tab" && modalOverlay?.classList.contains("show")) {
    const focusables = Array.from(modalOverlay.querySelectorAll(focusableSelector))
      .filter(el => !el.hasAttribute("disabled"));
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

// Accordion
document.querySelectorAll(".accordion").forEach(acc => {
  const toggle = acc.querySelector(".accordion-toggle");
  const panel = acc.querySelector(".accordion-panel");
  toggle?.addEventListener("click", () => {
    const isOpen = acc.classList.contains("open");
    document.querySelectorAll(".accordion.open").forEach(openAcc => {
      openAcc.classList.remove("open");
      const p = openAcc.querySelector(".accordion-panel");
      if (p) p.style.maxHeight = null;
      const t = openAcc.querySelector(".accordion-toggle");
      t?.setAttribute("aria-expanded", "false");
    });
    if (!isOpen) {
      acc.classList.add("open");
      toggle?.setAttribute("aria-expanded", "true");
      if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
    } else {
      toggle?.setAttribute("aria-expanded", "false");
    }
  });
  toggle?.setAttribute("aria-expanded", "false");
});

// Scroll animations
const animated = document.querySelectorAll("[data-animate]");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

animated.forEach(el => observer.observe(el));

// Active nav highlight
const navLinks = document.querySelectorAll("nav a.nav-link");
const sectionTargets = Array.from(navLinks)
  .map(link => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute("id");
      navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === `#${id}`));
    }
  });
}, { threshold: 0.55 });

sectionTargets.forEach(sec => navObserver.observe(sec));

// Phone mask
const phoneInputs = document.querySelectorAll('input[name="phone"]');
const maskPhone = value => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const parts = ["+7"];
  if (digits.length > 1) parts.push(" (" + digits.slice(1, 4));
  if (digits.length >= 4) parts.push(") " + digits.slice(4, 7));
  if (digits.length >= 7) parts.push("-" + digits.slice(7, 9));
  if (digits.length >= 9) parts.push("-" + digits.slice(9, 11));
  return parts.join("");
};

phoneInputs.forEach(input => {
  input.addEventListener("input", e => {
    e.target.value = maskPhone(e.target.value);
  });
  input.addEventListener("focus", e => {
    if (!e.target.value) e.target.value = "+7 ";
  });
});

