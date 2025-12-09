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

// Lead form
const form = document.getElementById("lead-form");
form?.addEventListener("submit", e => {
  e.preventDefault();
  const data = new FormData(form);
  const name = data.get("name") || "клиент";
  showToast(`Спасибо, ${name}! Мы свяжемся с вами в рабочее время.`);
  form.reset();
});

// Modal form
const modalForm = document.getElementById("modal-form");
modalForm?.addEventListener("submit", e => {
  e.preventDefault();
  const data = new FormData(modalForm);
  const name = data.get("name") || "клиент";
  showToast(`Заявка принята, ${name}. Скоро перезвоним.`);
  closeModal();
  modalForm.reset();
});

// Modal logic
const modalOverlay = document.getElementById("modal-overlay");
const focusableSelector = 'a[href], button, textarea, input, select';
let lastFocused = null;

function openModal() {
  modalOverlay?.classList.add("show");
  modalOverlay?.setAttribute("aria-hidden", "false");
  lastFocused = document.activeElement;
  body.classList.add("no-scroll");
  const focusables = modalOverlay?.querySelectorAll(focusableSelector);
  focusables?.[0]?.focus();
}

function closeModal() {
  modalOverlay?.classList.remove("show");
  modalOverlay?.setAttribute("aria-hidden", "true");
  body.classList.remove("no-scroll");
  lastFocused?.focus();
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

