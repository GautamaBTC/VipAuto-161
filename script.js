// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {

// Preloader - activate animation immediately
const preloaderSvg = document.querySelector('.preloader-logo');
if (preloaderSvg) {
  requestAnimationFrame(() => {
    preloaderSvg.classList.add('active');
  });
}

// Preloader - hide after 3s (fast branding experience)
setTimeout(() => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.classList.add('hidden');
    setTimeout(() => {
      preloader.remove();
    }, 500);
  }
}, 3000);

// Logo SVG animation - start after preloader
setTimeout(() => {
  const logoSvg = document.querySelector('header .plate-logo');
  if (logoSvg && logoSvg.tagName === 'svg') {
    logoSvg.classList.add('active');
  }
}, 3500);

// Theme toggle with localStorage
const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");
const gearIcon = themeToggle?.querySelector(".theme-toggle__thumb");
// Always start with light theme on first visit
setTheme(savedTheme || "light");

// Custom Radio Player
const FORMSPREE_URL = "https://formspree.io/f/mnnqojzr";

// Радиостанции (замените URL на реальные потоки)
const radioStations = [
  {
    name: 'Европа Плюс',
    url: 'https://ep256.hostingradio.ru:8052/europaplus256.mp3'
  },
  {
    name: 'Авторадио',
    url: 'https://pub0201.101.ru:8443/stream/air/aac/64/100'
  },
  {
    name: 'Русское Радио',
    url: 'https://rusradio.hostingradio.ru/rusradio96.aacp'
  },
  {
    name: 'Ретро FM',
    url: 'https://retroserver.streamr.ru:8043/retro128'
  },
  {
    name: 'Радио Energy',
    url: 'https://pub0301.101.ru:8443/stream/air/aac/64/99'
  },
  {
    name: 'DFM',
    url: 'https://dfm.hostingradio.ru/dfm96.aacp'
  },
  {
    name: 'Хит FM',
    url: 'https://hitfm.hostingradio.ru:8043/hitfm96.aacp'
  },
  {
    name: 'Дорожное Радио',
    url: 'https://dorognoe.hostingradio.ru:8000/radio'
  },
  {
    name: 'Рок FM',
    url: 'https://nashe1.hostingradio.ru:80/rock-128.mp3'
  },
  {
    name: 'Юмор FM',
    url: 'https://pub0201.101.ru:8443/stream/air/aac/64/202'
  }
];

let currentStation = 0;
let isPlaying = false;

const radioPlayer = document.getElementById('radioPlayer');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const volumeBtn = document.getElementById('volumeBtn');
const stationName = document.getElementById('stationName');
const trackInfo = document.getElementById('trackInfo');
const loadingIndicator = document.getElementById('loadingIndicator');

// Инициализация
if (radioPlayer) {
  radioPlayer.volume = 0.7; // 70% громкости по умолчанию

  // Play/Pause
  playBtn?.addEventListener('click', () => {
    if (isPlaying) {
      pauseRadio();
    } else {
      playRadio();
    }
  });

  // Stop
  stopBtn?.addEventListener('click', () => {
    stopRadio();
  });

  // Предыдущая станция
  prevBtn?.addEventListener('click', () => {
    currentStation = (currentStation - 1 + radioStations.length) % radioStations.length;
    switchStation(currentStation);
  });

  // Следующая станция
  nextBtn?.addEventListener('click', () => {
    currentStation = (currentStation + 1) % radioStations.length;
    switchStation(currentStation);
  });

  // Громкость
  volumeSlider?.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    radioPlayer.volume = volume;
    if (volumeValue) volumeValue.textContent = `${e.target.value}%`;
    updateVolumeIcon(volume);
  });

  // Mute/Unmute
  volumeBtn?.addEventListener('click', () => {
    if (radioPlayer.volume > 0) {
      radioPlayer.dataset.previousVolume = radioPlayer.volume;
      radioPlayer.volume = 0;
      volumeSlider.value = 0;
      if (volumeValue) volumeValue.textContent = '0%';
    } else {
      const prevVolume = parseFloat(radioPlayer.dataset.previousVolume) || 0.7;
      radioPlayer.volume = prevVolume;
      volumeSlider.value = prevVolume * 100;
      if (volumeValue) volumeValue.textContent = `${Math.round(prevVolume * 100)}%`;
    }
    updateVolumeIcon(radioPlayer.volume);
  });

  // События плеера
  radioPlayer.addEventListener('loadstart', () => {
    showLoading(true);
  });

  radioPlayer.addEventListener('canplay', () => {
    showLoading(false);
  });

  radioPlayer.addEventListener('playing', () => {
    showLoading(false);
    updatePlayButton(true);
    if (stopBtn) stopBtn.disabled = false;
  });

  radioPlayer.addEventListener('pause', () => {
    updatePlayButton(false);
  });

  radioPlayer.addEventListener('error', (e) => {
    showLoading(false);
    console.error('Radio error:', e);
    if (trackInfo) trackInfo.textContent = 'Ошибка загрузки станции';
    setTimeout(() => {
      if (trackInfo) trackInfo.textContent = 'Попробуйте другую станцию';
    }, 2000);
  });
}

function playRadio() {
  const station = radioStations[currentStation];
  radioPlayer.src = station.url;
  radioPlayer.play().then(() => {
    isPlaying = true;
    if (trackInfo) trackInfo.textContent = 'Загрузка потока...';
  }).catch(err => {
    console.error('Play error:', err);
    if (trackInfo) trackInfo.textContent = 'Не удалось запустить';
  });
}

function pauseRadio() {
  radioPlayer.pause();
  isPlaying = false;
}

function stopRadio() {
  radioPlayer.pause();
  radioPlayer.currentTime = 0;
  radioPlayer.src = '';
  isPlaying = false;
  updatePlayButton(false);
  visualizer?.classList.remove('active');
  if (trackInfo) trackInfo.textContent = 'Остановлено';
  if (stopBtn) stopBtn.disabled = true;
}

function switchStation(index) {
  const wasPlaying = isPlaying;
  
  // Останавливаем текущую
  if (isPlaying) {
    radioPlayer.pause();
  }
  
  // Переключаем станцию
  currentStation = index;
  const station = radioStations[index];
  
  // Обновляем UI
  if (stationName) stationName.textContent = station.name;
  if (trackInfo) trackInfo.textContent = wasPlaying ? 'Переключение...' : 'Нажмите Play для запуска';
  
  // Если играло, запускаем новую станцию
  if (wasPlaying) {
    setTimeout(() => {
      playRadio();
    }, 300);
  }
}

function updatePlayButton(playing) {
  const iconPlay = playBtn?.querySelector('.icon-play');
  const iconPause = playBtn?.querySelector('.icon-pause');
  
  if (iconPlay && iconPause) {
    if (playing) {
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
    } else {
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
    }
  }
}

function showLoading(show) {
  if (loadingIndicator && playBtn) {
    loadingIndicator.style.display = show ? 'flex' : 'none';
    playBtn.style.display = show ? 'none' : 'flex';
  }
}

function updateVolumeIcon(volume) {
  const iconUp = volumeBtn?.querySelector('.icon-volume-up');
  const iconMute = volumeBtn?.querySelector('.icon-volume-mute');
  
  if (iconUp && iconMute) {
    if (volume === 0) {
      iconUp.style.display = 'none';
      iconMute.style.display = 'block';
    } else {
      iconUp.style.display = 'block';
      iconMute.style.display = 'none';
    }
  }
}

// Инициализация первой станции (без автоплея)
if (stationName) stationName.textContent = radioStations[0].name;
if (trackInfo) trackInfo.textContent = 'Нажмите Play для запуска';

// Динамическая позиция радиобара под хедером
function updateRadioBarPosition() {
  const header = document.getElementById('header');
  const radioBar = document.querySelector('.radio-bar');
  
  if (header && radioBar) {
    const headerHeight = header.offsetHeight;
    radioBar.style.top = `${headerHeight}px`;
  }
}

// Обновляем позицию при загрузке
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateRadioBarPosition);
} else {
  updateRadioBarPosition();
}

// Обновляем при ресайзе окна
window.addEventListener('resize', updateRadioBarPosition);

// Обновляем при изменении размера хедера
const header = document.getElementById('header');
if (header) {
  const resizeObserver = new ResizeObserver(updateRadioBarPosition);
  resizeObserver.observe(header);
}

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
    gearIcon.classList.remove("tap-animate");
    void gearIcon.offsetWidth; // restart animation
    gearIcon.classList.add("tap-animate");
  }
});

// Custom smooth scroll with controllable duration (optimized: 1s)
function smoothScrollTo(target, duration = 1000) {
  const startY = window.scrollY;
  const endY = target.getBoundingClientRect().top + window.scrollY;
  const distance = endY - startY;
  const startTime = performance.now();
  const ease = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t); // easeInOutQuad

  const step = now => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = ease(progress);
    window.scrollTo(0, startY + distance * eased);
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        smoothScrollTo(target);
        closeNav();
      }
    }
  });
});

// Responsive nav (new menu)
const menuIcon = document.getElementById("menu-icon");
const navMenu = document.querySelector("#header nav");

function closeNav() {
  navMenu?.classList.remove("open");
  menuIcon?.classList.remove("active");
  menuIcon?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("no-scroll");
}

function openNav() {
  navMenu?.classList.add("open");
  menuIcon?.classList.add("active");
  menuIcon?.setAttribute("aria-expanded", "true");
  document.body.classList.add("no-scroll");
}

function toggleNav() {
  if (navMenu?.classList.contains("open")) {
    closeNav();
  } else {
    openNav();
  }
}

menuIcon?.addEventListener("click", toggleNav);

// Закрытие меню при клике на ссылку
document.querySelectorAll("#header nav a").forEach(link => {
  link.addEventListener("click", () => {
    if (navMenu?.classList.contains("open")) {
      closeNav();
    }
  });
});


// Toast helper
const toast = document.getElementById("toast");
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}

// Form helpers
function clearErrors(form) {
  form.querySelectorAll(".field.error").forEach(f => f.classList.remove("error"));
  form.querySelectorAll(".field-error").forEach(msg => msg.textContent = "");
}

function setError(form, fieldName, message) {
  const field = form.querySelector(`[name="${fieldName}"]`);
  const msg = form.querySelector(`[data-error="${fieldName}"]`);
  if (field) field.classList.add("error");
  if (msg) msg.textContent = message;
}

function validateForm(form) {
  const data = new FormData(form);
  const errors = {};
  const name = (data.get("name") || "").trim();
  const phoneDigits = (data.get("phone") || "").replace(/\D/g, "");
  const consent = data.get("consent");
  
  // Валидация имени
  if (!name) {
    errors.name = "Пожалуйста, укажите ваше имя";
  } else if (name.length < 2) {
    errors.name = "Имя должно быть не короче 2 символов";
  } else if (name.length > 50) {
    errors.name = "Имя слишком длинное (макс. 50 символов)";
  } else if (!/^[а-яёА-ЯЁa-zA-Z\s\-]+$/.test(name)) {
    errors.name = "Имя может содержать только буквы";
  }
  
  // Валидация телефона
  if (!phoneDigits) {
    errors.phone = "Укажите номер телефона";
  } else if (phoneDigits.length !== 11) {
    errors.phone = "Введите полный номер (11 цифр)";
  } else if (!phoneDigits.startsWith("7")) {
    errors.phone = "Номер должен начинаться с +7";
  }
  
  // Валидация согласия
  if (!consent) {
    errors.consent = "Необходимо согласие на обработку данных";
  }
  
  return errors;
}

function setButtonLoading(button, isLoading) {
  if (!button) return;
  const baseLabel = button.dataset.submitLabel || button.textContent;
  if (isLoading) {
    button.dataset.submitLabel = baseLabel;
    button.textContent = "Отправляем...";
    button.disabled = true;
  } else {
    button.textContent = button.dataset.submitLabel || baseLabel;
    button.disabled = false;
  }
}

async function submitForm(form, source) {
  clearErrors(form);
  const errors = validateForm(form);
  if (Object.keys(errors).length) {
    Object.entries(errors).forEach(([field, message]) => setError(form, field, message));
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  setButtonLoading(submitButton, true);

  try {
    const formData = new FormData(form);
    formData.append("source", source);
    formData.append("page", window.location.href);
    const response = await fetch(FORMSPREE_URL, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData
    });

    if (!response.ok) throw new Error("formspree_error");

    const name = (formData.get("name") || "клиент").toString();
    showToast(`Спасибо, ${name}! Мы свяжемся в рабочее время.`);
    form.reset();
    clearErrors(form);
    if (form.id === "modal-form") closeModal();
  } catch (err) {
    const code = err?.message || "";
    const isValidation = code.includes("formspree");
    showToast(isValidation ? "Не удалось отправить. Попробуйте позже." : "Ошибка сети. Проверьте подключение.");
  } finally {
    setButtonLoading(submitButton, false);
  }
}

// Lead form
const form = document.getElementById("lead-form");
form?.addEventListener("submit", e => {
  e.preventDefault();
  submitForm(form, "hero");
});

// Modal form
const modalForm = document.getElementById("modal-form");
modalForm?.addEventListener("submit", e => {
  e.preventDefault();
  submitForm(modalForm, "modal");
});

// Floating CTA close (only hides until page reload)
const floatingCta = document.querySelector(".floating-cta");
const floatingClose = floatingCta?.querySelector("[data-close-floating]");
floatingClose?.addEventListener("click", () => {
  floatingCta.classList.add("hidden");
  floatingCta.setAttribute("aria-hidden", "true");
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
  // Handle Escape key
  if (e.key === "Escape") {
    if (navMenu?.classList.contains("open")) {
      closeNav();
    } else if (modalOverlay?.classList.contains("show")) {
      closeModal();
    }
  }
  
  // Handle Tab key for modal focus trap
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

// End of DOMContentLoaded
});

