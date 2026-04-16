"use strict";

const mobileToggle = document.querySelector(".mobile-nav-toggle");
const navMenu = document.querySelector(".nav-links");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const dpiButtons = Array.from(document.querySelectorAll(".dpi-button"));
const dpiValue = document.querySelector(".dpi-value");
const dpiDescription = document.querySelector(".dpi-description");
const ctaTrigger = document.querySelector(".js-cta-trigger");
const toast = document.querySelector(".toast");
const mouseStage = document.querySelector(".mouse-stage");

const dpiProfiles = {
  "400": {
    description:
      "Precision-first profile for tactical FPS duels, holding angles, and deliberate crosshair placement.",
    highlight: "#6de2ff",
    accent: "#ff7b42",
  },
  "800": {
    description:
      "Balanced tournament setting for fast entries, quick reclears, and stable recoil tracking across maps.",
    highlight: "#ccff4e",
    accent: "#6de2ff",
  },
  "1600": {
    description:
      "High-speed profile for aggressive peek timings, hybrid aiming styles, and rapid target switching.",
    highlight: "#ff9a5b",
    accent: "#ccff4e",
  },
  "3200": {
    description:
      "Ultra-responsive setup for arena shooters, creative workflows, and players who prefer minimal desk travel.",
    highlight: "#ff5d7a",
    accent: "#ffd166",
  },
};

let toastTimerId;
let menuIsOpen = false;

const mobileNavQuery = window.matchMedia("(max-width: 760px)");

function isMobileNavigation() {
  return mobileNavQuery.matches;
}

function setMenuState(isOpen, options = {}) {
  if (!mobileToggle || !navMenu) {
    return;
  }

  const { moveFocus = false, restoreFocus = false } = options;
  const isMobile = isMobileNavigation();
  menuIsOpen = isMobile ? isOpen : false;

  mobileToggle.setAttribute("aria-expanded", String(menuIsOpen));
  mobileToggle.setAttribute(
    "aria-label",
    menuIsOpen ? "Close navigation menu" : "Open navigation menu"
  );
  navMenu.classList.toggle("is-open", menuIsOpen);
  document.body.classList.toggle("nav-open", menuIsOpen);

  if (isMobile) {
    navMenu.toggleAttribute("hidden", !menuIsOpen);
    navMenu.setAttribute("aria-hidden", String(!menuIsOpen));
    navMenu.inert = !menuIsOpen;
  } else {
    navMenu.removeAttribute("hidden");
    navMenu.removeAttribute("aria-hidden");
    navMenu.inert = false;
  }

  if (menuIsOpen && moveFocus) {
    navLinks[0]?.focus();
  }

  if (!menuIsOpen && restoreFocus) {
    mobileToggle.focus();
  }
}

function updateDpiProfile(selectedDpi) {
  const profile = dpiProfiles[selectedDpi];

  if (!profile || !dpiValue || !dpiDescription) {
    return;
  }

  dpiButtons.forEach((button) => {
    const isActive = button.dataset.dpi === selectedDpi;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  dpiValue.textContent = selectedDpi;
  dpiDescription.textContent = profile.description;

  if (mouseStage) {
    mouseStage.style.setProperty("--profile-highlight", profile.highlight);
    mouseStage.style.setProperty("--profile-accent", profile.accent);
  }
}

function showToast(message) {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimerId);
  toastTimerId = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function setActiveNavLink(id) {
  navLinks.forEach((link) => {
    const isCurrent = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-current", isCurrent);
    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if (mobileToggle && navMenu) {
  setMenuState(false);

  mobileToggle.addEventListener("click", () => {
    setMenuState(!menuIsOpen, { moveFocus: !menuIsOpen });
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (isMobileNavigation()) {
        setMenuState(false);
      }
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;

    if (
      menuIsOpen &&
      isMobileNavigation() &&
      target instanceof Node &&
      !navMenu.contains(target) &&
      !mobileToggle.contains(target)
    ) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuIsOpen) {
      setMenuState(false, { restoreFocus: true });
    }

    if (event.key === "Tab" && menuIsOpen && isMobileNavigation()) {
      const focusableItems = [mobileToggle, ...navLinks];
      const currentIndex = focusableItems.indexOf(document.activeElement);
      const firstIndex = 0;
      const lastIndex = focusableItems.length - 1;

      if (!event.shiftKey && currentIndex === lastIndex) {
        event.preventDefault();
        focusableItems[firstIndex].focus();
      }

      if (event.shiftKey && currentIndex <= firstIndex) {
        event.preventDefault();
        focusableItems[lastIndex].focus();
      }
    }
  });

  mobileNavQuery.addEventListener("change", () => {
    setMenuState(false);
  });
}

if (dpiButtons.length > 0) {
  dpiButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateDpiProfile(button.dataset.dpi || "400");
    });
  });

  updateDpiProfile("400");
}

if (ctaTrigger) {
  ctaTrigger.addEventListener("click", () => {
    showToast("Launch bundle locked in. Speedlight Pro will ping your setup queue.");
  });
}

const observedSections = navLinks
  .map((link) => link.getAttribute("href"))
  .filter((href) => href && href.startsWith("#"))
  .map((href) => document.querySelector(href))
  .filter(Boolean);

if (observedSections.length > 0 && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

      if (visibleEntry?.target.id) {
        setActiveNavLink(visibleEntry.target.id);
      }
    },
    {
      threshold: [0.2, 0.45, 0.7],
      rootMargin: "-25% 0px -45% 0px",
    }
  );

  observedSections.forEach((section) => observer.observe(section));
}
