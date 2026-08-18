const destinations = [
  {
    country: "United Arab Emirates",
    name: "Palm Jumeirah",
    desc: "A palm-shaped island rising from the sea, framed by five-star resorts and private beaches — a symbol of Dubai's architectural ambition.",
    bg:   "assets/palm.jpg",
    card: "assets/palm.jpg",
    rating: 5,
  },
  {
    country: "United Arab Emirates",
    name: "Dubai Marina",
    desc: "A valley of mirrored skyscrapers lining an artificial canal, where yachts glide at dusk and the nightlife never sleeps.",
    bg:   "assets/marina.jpg",
    card: "assets/marina.jpg",
    rating: 4,
  },
  {
    country: "United Arab Emirates",
    name: "Dubai Desert",
    desc: "Rust-red dunes stretching to the horizon, where the desert's silence is broken only by the wind and the bells of camels at sunset.",
    bg:   "assets/deserto.jpg",
    card: "assets/deserto.jpg",
    rating: 5,
  },
  {
    country: "United Arab Emirates",
    name: "Burj Khalifa",
    desc: "The tallest tower on Earth rises over Dubai's skyline like a blade of glass and steel. From the top, the city dissolves into golden dunes and the endless blue of the Persian Gulf.",
    bg:   "assets/burj.jpg",
    card: "assets/burj.jpg",
    rating: 5,
  },
];

gsap.registerPlugin(SplitText);

const CARD_SLOTS = 3;  
let current = 0;          
let isAnimating = false;  

const $ = (id) => document.getElementById(id);
const bgA = $("bgA"), bgB = $("bgB"), track = $("cardTrack");
let bgToggle = true; 

function preloadImages() {
  destinations.forEach((d) => {
    new Image().src = d.bg;
    new Image().src = d.card;
  });
}
function queueOrder(activeIndex) {
  const order = [];
  for (let i = 1; i <= CARD_SLOTS; i++) order.push((activeIndex + i) % destinations.length);
  return order;
}

function buildCardSlots() {
  track.innerHTML = "";
  for (let slot = 0; slot < CARD_SLOTS; slot++) {
    const el = document.createElement("div");
    el.className = "dest-card shrink-0 snap-center relative w-[150px] md:w-[240px] 2xl:w-[330px] h-[230px] md:h-[350px] 2xl:h-[470px] rounded-2xl 2xl:rounded-3xl overflow-hidden cursor-pointer shadow-2xl shadow-black/40";
    el.id = `card-${slot}`;
    el.innerHTML = `
      <img id="card-img-${slot}" src="" alt="" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-dune/75 via-transparent to-transparent"></div>

      <!-- bookmark/pin button in liquid glass -->
      <button aria-label="Save destination" class="liquid-glass-soft absolute top-3 right-3 2xl:top-4 2xl:right-4 w-8 h-8 2xl:w-11 2xl:h-11 rounded-full flex items-center justify-center text-white hover:scale-105 transition">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 2h12v20l-6-4.5L6 22V2z"/>
        </svg>
      </button>

      <!-- bottom panel in liquid glass (lighter), over the photo -->
      <div class="liquid-glass-card absolute bottom-2 left-2 right-2 2xl:bottom-3 2xl:left-3 2xl:right-3 rounded-xl 2xl:rounded-2xl px-3 py-2.5 2xl:px-4 2xl:py-4">
        <div id="card-dots-${slot}" class="flex gap-1 2xl:gap-1.5 mb-1.5 2xl:mb-2"></div>
        <p id="card-name-${slot}" class="text-xs md:text-sm 2xl:text-base font-semibold text-white"></p>
      </div>
    `;
    el.addEventListener("click", () => {
      const destIndex = parseInt(el.dataset.destIndex, 10);
      if (!isNaN(destIndex)) goToDestination(destIndex);
    });
    track.appendChild(el);
  }
}


function fillCardSlot(slot, destIndex) {
  const dest = destinations[destIndex];
  const card = $(`card-${slot}`);
  card.dataset.destIndex = destIndex;
  $(`card-img-${slot}`).src = dest.card;
  $(`card-img-${slot}`).alt = dest.name;
  $(`card-name-${slot}`).textContent = dest.name;
  $(`card-dots-${slot}`).innerHTML = Array.from({ length: 5 }).map((_, i) =>
    `<span class="dot ${i < dest.rating ? "filled" : ""}"></span>`
  ).join("");
}

function updateCardSlotsSmooth() {
  const order = queueOrder(current);
  const slots = Array.from({ length: CARD_SLOTS }, (_, i) => $(`card-${i}`));

  gsap.to(slots, {
    opacity: 0,
    x: -14,
    duration: 0.22,
    ease: "power2.in",
    stagger: 0.03,
    onComplete: () => {
      order.forEach((destIndex, slot) => fillCardSlot(slot, destIndex));
      gsap.fromTo(slots,
        { opacity: 0, x: 14 },
        {
          opacity: 1, x: 0, duration: 0.4, ease: "power2.out", stagger: 0.06,
          onComplete: () => gsap.set(slots, { clearProps: "opacity,transform" }),
        }
      );
    },
  });
}

/* =====================================================================
   MOBILE "ACTIVE CARD" — touch devices have no real :hover, so on the
   swipeable mobile card row we fake it: whichever card is currently
   centered in the (horizontally-scrolling) track gets `.is-active`,
   the exact same grow/lift/shadow CSS that `:hover` gives on desktop
   (see styles.css, itself gated to `(hover: hover) and (pointer: fine)`
   so the two mechanisms never compete for the same device).

   Only runs on devices WITHOUT a real pointer. On desktop #cardTrack
   doesn't scroll (it's `absolute`/`overflow: visible`) so this would
   be a no-op there anyway — but without this guard, the one-time call
   on page load would still permanently mark card 0 `.is-active`, which
   *does* render (that CSS isn't hover-gated), showing a stray grown
   card alongside whatever the mouse is actually hovering. */
const isTouchDevice = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* First/last card can never scroll to the exact geometric center — the
   track simply runs out of room to scroll further, so "closest to
   center" quietly picks their NEIGHBOR instead once you're pinned
   against either end. That neighbor then shows as active alongside
   whatever a tap independently triggers. Fix: use the scroll position
   itself — at either end of the scrollable range, force that end's
   card active instead of trusting the geometry. */
function updateActiveCard() {
  if (!isTouchDevice) return;

  const maxScrollLeft = track.scrollWidth - track.clientWidth;
  const atStart = track.scrollLeft <= 4;
  const atEnd = track.scrollLeft >= maxScrollLeft - 4;

  let activeSlot;
  if (atStart) {
    activeSlot = 0;
  } else if (atEnd) {
    activeSlot = CARD_SLOTS - 1;
  } else {
    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;
    let closestDist = Infinity;
    for (let slot = 0; slot < CARD_SLOTS; slot++) {
      const card = $(`card-${slot}`);
      if (!card) continue;
      const dist = Math.abs(card.getBoundingClientRect().left + card.getBoundingClientRect().width / 2 - trackCenter);
      if (dist < closestDist) { closestDist = dist; activeSlot = slot; }
    }
  }

  for (let slot = 0; slot < CARD_SLOTS; slot++) {
    $(`card-${slot}`)?.classList.toggle("is-active", slot === activeSlot);
  }
}

let activeCardRaf = null;
track.addEventListener("scroll", () => {
  if (activeCardRaf) return;
  activeCardRaf = requestAnimationFrame(() => {
    updateActiveCard();
    activeCardRaf = null;
  });
}, { passive: true });

function buildPageIndicator() {
  const wrap = $("pageIndicator");
  wrap.innerHTML = "";
  destinations.forEach((_, i) => {
    const span = document.createElement("span");
    span.id = `page-${i}`;
    span.className = "page-num" + (i === current ? " active" : "");
    span.textContent = String(i + 1).padStart(2, "0");
    span.addEventListener("click", () => goToDestination(i));
    wrap.appendChild(span);
  });
}

function updatePageIndicator() {
  destinations.forEach((_, i) => {
    $(`page-${i}`).classList.toggle("active", i === current);
  });
}


function updateMeta() {
  $("counterLabel").textContent = `${String(current + 1).padStart(2, "0")} / ${String(destinations.length).padStart(2, "0")}`;
  updatePageIndicator();
}


function setTitleLines(name) {
  const [first, ...rest] = name.split(" ");
  $("titleLine1").textContent = first;
  $("titleLine2").textContent = rest.join(" ");
}


function fitTitleFont() {
  const el = $("title");
  el.style.fontSize = ""; // reset to the CSS default (per-breakpoint clamp) first

  const parent = el.parentElement;
  const parentStyle = getComputedStyle(parent);
  const maxWidth = parent.clientWidth
    - parseFloat(parentStyle.paddingLeft)
    - parseFloat(parentStyle.paddingRight);

  const widestLine = Math.max($("titleLine1").scrollWidth, $("titleLine2").scrollWidth);
  if (widestLine > maxWidth) {
    const base = parseFloat(getComputedStyle(el).fontSize);
    el.style.fontSize = `${base * (maxWidth / widestLine) * 0.97}px`; // 3% safety margin
  }
}


function swapText(dest) {
  const tl = gsap.timeline();
  tl.to(["#eyebrow", "#title", "#desc"], { opacity: 0, y: -14, duration: 0.25, ease: "power2.in" })
    .call(() => {
      $("eyebrow").textContent = dest.country;
      setTitleLines(dest.name);
      fitTitleFont();
      $("desc").textContent = dest.desc;
      gsap.set("#title", { clipPath: "inset(100% 0 0 0)", y: 0, opacity: 1 });
      gsap.set(["#eyebrow", "#desc"], { y: 0, opacity: 0 });
    })
    .to("#title", { clipPath: "inset(0% 0 0 0)", duration: 0.6, ease: "power3.out" }, "+=0.02")
    .to(["#eyebrow", "#desc"], { opacity: 1, y: 0, duration: 0.45, stagger: 0.07 }, "<0.1");
  return tl;
}

function rollTextTo(el, newText) {
  const outSplit = new SplitText(el, { type: "lines", mask: "lines" });

  return gsap.to(outSplit.lines, {
    yPercent: -120,
    duration: 0.4,
    ease: "power3.in",
    stagger: 0.02,
    onComplete: () => {
      outSplit.revert();       // back to plain text (old value) …
      el.textContent = newText; // … then swap to the new value

      const inSplit = new SplitText(el, { type: "lines", mask: "lines" });
      gsap.fromTo(inSplit.lines,
        { yPercent: 120 },
        {
          yPercent: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.02,
          onComplete: () => inSplit.revert(),
        }
      );
    },
  });
}


function rollTitleTo(newName) {
  const line1 = $("titleLine1"), line2 = $("titleLine2");
  const outSplit1 = new SplitText(line1, { type: "lines", mask: "lines" });
  const outSplit2 = new SplitText(line2, { type: "lines", mask: "lines" });

  return gsap.to([...outSplit1.lines, ...outSplit2.lines], {
    yPercent: -120,
    duration: 0.4,
    ease: "power3.in",
    stagger: 0.02,
    onComplete: () => {
      outSplit1.revert();
      outSplit2.revert();
      setTitleLines(newName);
      fitTitleFont();

      const inSplit1 = new SplitText(line1, { type: "lines", mask: "lines" });
      const inSplit2 = new SplitText(line2, { type: "lines", mask: "lines" });
      gsap.fromTo([...inSplit1.lines, ...inSplit2.lines],
        { yPercent: 120 },
        {
          yPercent: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.02,
          onComplete: () => { inSplit1.revert(); inSplit2.revert(); },
        }
      );
    },
  });
}


function rollTextSwap(dest) {
  const tl = gsap.timeline();
  tl.to("#eyebrow", { opacity: 0, y: -14, duration: 0.25, ease: "power2.in" })
    .call(() => { $("eyebrow").textContent = dest.country; })
    .to("#eyebrow", { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "<0.05")
    .add(() => {
      rollTitleTo(dest.name);
      rollTextTo($("desc"), dest.desc);
    }, 0);
  return tl;
}


function crossfadeBackground(dest) {
  const incoming = bgToggle ? bgB : bgA;
  const outgoing = bgToggle ? bgA : bgB;
  bgToggle = !bgToggle;

  incoming.style.backgroundImage = `url('${dest.bg}')`;
  gsap.killTweensOf([incoming, outgoing]);
  gsap.set(incoming, { scale: 1.08, opacity: 0 });
  gsap.to(incoming, { opacity: 1, scale: 1, duration: 1.1, ease: "power2.out" });
  gsap.to(outgoing, { opacity: 0, duration: 0.9, ease: "power1.out" });
}


function goToDestination(index, { viaArrow = false } = {}) {
  if (isAnimating || index === current) return;
  isAnimating = true;
  current = index;
  const dest = destinations[current];

  crossfadeBackground(dest);
  if (viaArrow) {
    rollTextSwap(dest);
  } else {
    swapText(dest);
  }
  updateMeta();
  updateCardSlotsSmooth();

  // releases new clicks once the longest animation (text) finishes —
  // rolling text runs a bit longer than the clip-path/fade swap.
  gsap.delayedCall(viaArrow ? 1.05 : 0.75, () => { isAnimating = false; });
}

function goNext() { goToDestination((current + 1) % destinations.length, { viaArrow: true }); }
function goPrev() { goToDestination((current - 1 + destinations.length) % destinations.length, { viaArrow: true }); }

$("prevBtn").addEventListener("click", goPrev);
$("nextBtn").addEventListener("click", goNext);

window.addEventListener("DOMContentLoaded", () => {
  preloadImages();

  // initial background
  const first = destinations[current];
  bgA.style.backgroundImage = `url('${first.bg}')`;


  buildPageIndicator();
  updateMeta();


  buildCardSlots();
  queueOrder(current).forEach((destIndex, slot) => fillCardSlot(slot, destIndex));
  updateActiveCard(); // mobile: mark the first card active before any scrolling happens


  fitTitleFont();
  gsap.set("#title", { clipPath: "inset(100% 0 0 0)" });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.fromTo(bgA, { scale: 1.18 }, { scale: 1, duration: 2.4, ease: "power2.out" }, 0)
    .to("#title", { clipPath: "inset(0% 0 0 0)", duration: 1, ease: "power4.out" }, 0.3)
    .fromTo("#eyebrow", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 0.15)
    .fromTo("#desc", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 0.6)
    .fromTo("#exploreBtn", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, 0.75)
    .fromTo("nav", { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.7 }, 0)
    .fromTo("#pageIndicator", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.9)
    .fromTo("#cardTrack .dest-card",
      { x: 120, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "back.out(1.5)",
  
        onComplete: () => gsap.set("#cardTrack .dest-card", { clearProps: "opacity,transform" }),
      },
      0.5
    )
    .fromTo("#bottomControls", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 1.1);
});


window.addEventListener("resize", fitTitleFont);
