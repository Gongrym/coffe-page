"use strict";

/* 01. Header and accessible mobile menu */
const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let lastFocused = null;
const syncHeader = () =>
  header.classList.toggle("scrolled", window.scrollY > 12);
syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

function setMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  mobileMenu.classList.toggle("open", open);
  mobileMenu.inert = !open;
  document.body.classList.toggle("menu-open", open);
  if (open) {
    lastFocused = document.activeElement;
    mobileMenu.querySelector("a").focus();
  } else if (mobileMenu.contains(document.activeElement)) {
    (lastFocused || menuButton).focus();
  }
}
menuButton.addEventListener("click", () =>
  setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
);
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  )
    setMenu(false);
  if (
    event.key === "Tab" &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    const focusables = [menuButton, ...mobileMenu.querySelectorAll("a")];
    const first = focusables[0],
      last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
window.addEventListener("resize", () => {
  if (
    window.innerWidth >= 768 &&
    menuButton.getAttribute("aria-expanded") === "true"
  )
    setMenu(false);
});

/* 02. Smooth in-page anchors with sticky header offset */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    if (menuButton.getAttribute("aria-expanded") === "true") setMenu(false);
    const top =
      id === "#top"
        ? 0
        : target.getBoundingClientRect().top +
          window.scrollY -
          header.offsetHeight;
    window.scrollTo({
      top,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
    history.replaceState(null, "", id);
  });
});

/* 03. Scroll reveal */
const revealItems = document.querySelectorAll(".reveal");
if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((el) => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
  );
  revealItems.forEach((el) => observer.observe(el));
}

/* 04. Cart count and temporary demo feedback */
let cartCount = 0;
const countBadge = document.querySelector(".cart-count");
const cartButton = document.querySelector(".cart-button");
const toast = document.querySelector("#toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}
document.querySelectorAll(".add-cart").forEach((button) =>
  button.addEventListener("click", () => {
    cartCount += 1;
    countBadge.textContent = cartCount;
    cartButton.setAttribute("aria-label", `장바구니, 상품 ${cartCount}개`);
    countBadge.classList.remove("bump");
    void countBadge.offsetWidth;
    countBadge.classList.add("bump");
    showToast(
      `${button.dataset.product} 담기 완료 · 현재 ${cartCount}개 (데모)`,
    );
  }),
);
document.querySelectorAll("[data-demo]").forEach((button) =>
  button.addEventListener("click", () => {
    showToast(`${button.dataset.demo} 기능은 데모 화면입니다.`);
  }),
);

/* 05. Subscription price table: sample prices per delivery, KRW */
const SUBSCRIPTION_PRICES = Object.freeze({
  2: Object.freeze({ 200: 14400, 500: 32400 }),
  4: Object.freeze({ 200: 15200, 500: 34200 }),
});
const selection = { cycle: "2", weight: "200" };
const priceOutput = document.querySelector("#subscription-price");
document.querySelectorAll(".option-buttons").forEach((group) => {
  group.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-value]");
    if (!button || !group.contains(button)) return;
    selection[group.dataset.option] = button.dataset.value;
    group.querySelectorAll("button").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    priceOutput.textContent =
      SUBSCRIPTION_PRICES[selection.cycle][selection.weight].toLocaleString(
        "ko-KR",
      );
  });
});

/* 06. Light parallax, only when motion is allowed */
const origin = document.querySelector(".origin");
const originBackground = document.querySelector(".origin-bg");
let ticking = false;
function updateParallax() {
  ticking = false;
  if (reducedMotion.matches) {
    originBackground.style.transform = "";
    return;
  }
  const rect = origin.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > innerHeight) return;
  const progress = (innerHeight - rect.top) / (innerHeight + rect.height) - 0.5;
  originBackground.style.transform = `translate3d(0, ${Math.max(-24, Math.min(24, progress * 48))}px, 0)`;
}
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  },
  { passive: true },
);
reducedMotion.addEventListener?.("change", updateParallax);
updateParallax();

/* 07. Newsletter: front-end validation only, no data transmission */
const newsletter = document.querySelector("#newsletter-form");
const emailInput = document.querySelector("#newsletter-email");
const formMessage = document.querySelector("#form-message");
newsletter.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();
  const valid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && emailInput.validity.valid;
  formMessage.className = `form-message ${valid ? "success" : "error"}`;
  formMessage.textContent = valid
    ? "신청 형식을 확인했어요. 데모 페이지이므로 실제 전송되지는 않습니다."
    : "올바른 이메일 주소를 입력해주세요.";
  emailInput.setAttribute("aria-invalid", String(!valid));
});
emailInput.addEventListener("input", () => {
  formMessage.textContent = "";
  formMessage.className = "form-message";
  emailInput.removeAttribute("aria-invalid");
});
