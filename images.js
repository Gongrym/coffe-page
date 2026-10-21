/* =========================================================
   ondo 이미지 설정 — 여기 경로만 채우면 끝.
   - 빈 문자열("")이면 기존 placeholder가 그대로 보여.
   - 경로는 index.html 기준 상대경로 (예: "images/hero.jpg").
   - 파일이 없거나 경로가 틀리면 자동으로 placeholder로 돌아가고,
     콘솔(F12)에 어떤 슬롯이 문제인지 경고가 떠.
   ========================================================= */
const IMAGES = {
  hero: "images/Morning coffee photograph.png", //            1. 히어로 — 창가 커피잔 / 따뜻한 역광
  productBlend: "images/Coffee packaging.png", //    2. 온도 블렌드 패키지
  productSidamo: "images/Coffee packaging (1).png", //   3. 에티오피아 시다모 패키지
  productDecaf: "images/Coffee packaging (2).png", //    4. 밤의 온도 디카페인 패키지
  roastery: "images/Editorial photograph.png", //        5. 로스터리의 로스터
  origin: "images/Coffee origin landscape.png", //          6. 에티오피아 시다마 구릉 풍경 (배경)
  subscription: "images/Editorial photograph (1).png", //    7. 열린 택배 박스 + 원두 봉투 + 커피잔
  journalOne: "images/Editorial photograph (2).png", //      8. 저널 1 — 핸드드립 장면
  journalTwo: "images/Editorial photograph (3).png", //      9. 저널 2 — 오래된 종이 위 원두와 스푼
  space: "images/Editorial photograph (4).png", //          10. 카페 내부 — 큰 창과 나무 바 카운터
};

/* ---------- 아래는 건드릴 필요 없음 ---------- */
(function () {
  // 슬롯 이름 → 해당 요소 선택자
  const SLOTS = {
    hero: ".hero-image",
    productBlend: ".tone-blend .product-image",
    productSidamo: ".tone-ethiopia .product-image",
    productDecaf: ".tone-decaf .product-image",
    roastery: ".roastery-image",
    origin: ".origin-bg",
    subscription: ".subscription-image",
    journalOne: ".journal-one",
    journalTwo: ".journal-two",
    space: ".space-image",
  };

  // 이미지가 들어간 placeholder에 필요한 최소 스타일
  const style = document.createElement("style");
  style.textContent = `
    .image-placeholder.has-image { overflow: hidden; }
    .image-placeholder.has-image > .slot-img {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; display: block;
    }
    .image-placeholder.has-image > .placeholder-label,
    .image-placeholder.has-image > .package { display: none; }
  `;
  document.head.appendChild(style);

  function applyImage(name, src) {
    const el = document.querySelector(SLOTS[name]);
    if (!el) {
      console.warn(
        `[images.js] "${name}" 슬롯 요소를 못 찾았어: ${SLOTS[name]}`,
      );
      return;
    }

    // 6번 origin: <img>가 아니라 CSS 배경 레이어
    if (name === "origin") {
      const probe = new Image();
      probe.onload = () => {
        el.style.backgroundImage = `url("${src}")`;
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
      };
      probe.onerror = () =>
        console.warn(`[images.js] "${name}" 이미지를 못 불러왔어: ${src}`);
      probe.src = src;
      return;
    }

    // 나머지 9개: placeholder 안에 <img> 삽입
    const alt = el.getAttribute("aria-label") || "";
    const img = new Image();
    img.className = "slot-img";
    img.alt = alt;
    img.decoding = "async";
    if (name !== "hero") img.loading = "lazy"; // 히어로만 즉시 로드

    img.onload = () => {
      if (getComputedStyle(el).position === "static")
        el.style.position = "relative";
      el.classList.add("has-image");
      el.prepend(img);
      // 이미지가 alt를 갖게 되니까 div의 중복 접근성 속성은 제거
      el.removeAttribute("role");
      el.removeAttribute("aria-label");
    };
    img.onerror = () =>
      console.warn(`[images.js] "${name}" 이미지를 못 불러왔어: ${src}`);
    img.src = src;
  }

  Object.keys(SLOTS).forEach((name) => {
    const src = (IMAGES[name] || "").trim();
    if (src) applyImage(name, src);
  });
})();
