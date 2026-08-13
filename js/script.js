/* =====================================================================
   DESTINATION DATA
   Order: 1) Palm Jumeirah  2) Dubai Marina  3) Dubai Desert  4) Burj Khalifa

   LOCAL IMAGES: point to the "assets/" folder at the project root,
   next to this index.html. Place the files using these exact names:
     assets/palm.jpg
     assets/marina.jpg
     assets/deserto.jpg
     assets/burj.jpg
   Each file is used both as the full-screen background and the card
   thumbnail (same image, shown at different sizes via CSS).
   ===================================================================== */
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

const CARD_SLOTS = 3;     // fixed number of visible cards in the queue
let current = 0;          // active destination index
let isAnimating = false;  // lock to prevent simultaneous clicks

const $ = (id) => document.getElementById(id);
const bgA = $("bgA"), bgB = $("bgB"), track = $("cardTrack");
let bgToggle = true; // toggles which background layer is "on top" during the crossfade

/* =====================================================================
   PRELOADING — ensures that by the time the arrows are clicked, the
   images are already in the browser cache (no flash / no waiting).
   ===================================================================== */
function preloadImages() {
  destinations.forEach((d) => {
    new Image().src = d.bg;
    new Image().src = d.card;
  });
}

/* Returns the indexes of the destinations that should occupy the card
   slots, starting from the destination right after the active one. */
function queueOrder(activeIndex) {
  const order = [];
  for (let i = 1; i <= CARD_SLOTS; i++) order.push((activeIndex + i) % destinations.length);
  return order;
}

/* =====================================================================
   CREATING THE 3 CARD SLOTS — runs ONCE.
   After that, the slots are never recreated: only their inner content
   changes. Each card's footer is a liquid-glass panel (backdrop-blur)
   over the photo itself, keeping the effect clearly visible.
   ===================================================================== */
function buildCardSlots() {
  track.innerHTML = "";
  for (let slot = 0; slot < CARD_SLOTS; slot++) {
    const el = document.createElement("div");
    el.className = "dest-card shrink-0 relative w-[150px] md:w-[240px] 2xl:w-[330px] h-[230px] md:h-[350px] 2xl:h-[470px] rounded-2xl 2xl:rounded-3xl overflow-hidden cursor-pointer shadow-2xl shadow-black/40";
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

/* Fills a card slot with a destination's data (no animation — used on
   initial load and internally by the smooth swap). */
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

/* Swaps every slot's content smoothly (fade + slight shift), without
   ever removing or recreating the DOM elements. */
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
          // GSAP would otherwise leave "opacity"/"transform" as an inline
          // style on each card forever — inline styles beat any CSS
          // selector, including :hover, so without this the Grow Shadow
          // hover (and the sibling recede/dim) would silently stop
          // working after the very first navigation.
          onComplete: () => gsap.set(slots, { clearProps: "opacity,transform" }),
        }
      );
    },
  });
}

/* =====================================================================
   SIDE PAGINATION — numbers only (01, 02, 03, 04), no extra text.
   Created once; only the "active" class is swapped on each navigation.
   ===================================================================== */
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

/* =====================================================================
   TEXT / COUNTERS
   ===================================================================== */
function updateMeta() {
  $("counterLabel").textContent = `${String(current + 1).padStart(2, "0")} / ${String(destinations.length).padStart(2, "0")}`;
  updatePageIndicator();
}

/* =====================================================================
   TITLE — always exactly two lines: the destination's first word on
   #titleLine1, every remaining word on #titleLine2 (all 4 current
   destination names have exactly two words, so this is a clean 1:1
   split — a name with 3+ words would put all the extras on line 2).
   This replaces relying on the browser's natural text wrap, which
   used to break at whatever word happened to fit.
   ===================================================================== */
function setTitleLines(name) {
  const [first, ...rest] = name.split(" ");
  $("titleLine1").textContent = first;
  $("titleLine2").textContent = rest.join(" ");
}

/* Shrinks the title's shared font-size just enough that the WIDER of
   the two fixed lines fits the text column — long single words (e.g.
   on narrow screens) get scaled down instead of overflowing. Must run
   AFTER setTitleLines(), and BEFORE any SplitText split of the title
   (so the split measures the final size). */
function fitTitleFont() {
  const el = $("title");
  el.style.fontSize = ""; // reset to the CSS default (per-breakpoint clamp) first

  // clientWidth INCLUDES the parent's own padding, so the space actually
  // available to a child is clientWidth minus that padding — not
  // clientWidth itself.
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

/* Quick fade-out of the current text + clip-path reveal of the new one */
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

/* =====================================================================
   ROLLING TEXT — GSAP SplitText "rolling text" effect (based on
   https://demos.gsap.com/demo/rolling-text/), used ONLY when navigating
   via the prev/next arrows. The outgoing text rolls upward and out of
   an overflow-hidden mask, then the incoming text rolls upward into
   place, like a cinema marquee / odometer.

   `mask: type` makes SplitText auto-wrap each piece in an
   overflow-hidden span, which is what makes the "roll" read as a
   reveal instead of a plain slide.
   ===================================================================== */

/* Rolls one element from its current text to `newText`, split into
   "lines" — used for the description, a full sentence where rolling
   whole lines keeps it legible instead of turning into visual soup. */
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

/* Same roll, but for the two fixed title lines together: both lines
   roll out, BOTH get their new word(s) set and the shared font-size
   is re-fit in one shot (so line 1 and line 2 never briefly disagree
   on size), then both roll in together. */
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

/* Arrow-only text swap: eyebrow keeps its existing fade, title and
   description roll (by line) at the same time. */
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

/* =====================================================================
   BACKGROUND — crossfade between the active destination's photo and
   the next one
   ===================================================================== */
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

/* =====================================================================
   NAVIGATION — used by the arrows, the pagination numbers and clicking
   on any card.

   `viaArrow` is only true when triggered by the prev/next buttons: in
   that case the title/description use the rolling-text effect instead
   of the regular clip-path/fade swap. Cards and pagination numbers
   keep the original transition. */
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

/* =====================================================================
   PAGE ENTRANCE SEQUENCE (first load)
   ===================================================================== */
window.addEventListener("DOMContentLoaded", () => {
  preloadImages();

  // initial background
  const first = destinations[current];
  bgA.style.backgroundImage = `url('${first.bg}')`;

  // text / counters / pagination
  buildPageIndicator();
  updateMeta();

  // cards: create the 3 fixed slots and fill them with the initial content
  buildCardSlots();
  queueOrder(current).forEach((destIndex, slot) => fillCardSlot(slot, destIndex));

  // title: fit the (already in the HTML) initial name to one line,
  // then start it hidden by the clip-path for the reveal below
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
        // same reason as in updateCardSlotsSmooth(): without this, the
        // inline style GSAP leaves behind would permanently block the
        // CSS :hover (Grow Shadow) and sibling-recede effects.
        onComplete: () => gsap.set("#cardTrack .dest-card", { clearProps: "opacity,transform" }),
      },
      0.5
    )
    .fromTo("#hero .absolute.bottom-9", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 1.1);
});

// re-fit the title on breakpoint/orientation changes (its column
// width and the clamp() font size both depend on viewport width)
window.addEventListener("resize", fitTitleFont);
