/* =============================================
   SOFT URBANITY — main.js
   All functions declared BEFORE they are called
   ============================================= */

const WA    = '2347014254468';
const SIZES = ['XS','S','M','L','XL','XXL'];

/* ── DATA ── */
const products = [
  { id:1,  name:'Soft Urbanity Tee',            price:15000, cat:'tees',    badge:'Bestseller', hasSizes:true,  imgPos:'center top',    img:'./soft.jpg' },
  { id:2,  name:'Stay Original Tee',            price:15000, cat:'tees',    badge:'New',        hasSizes:true,  imgPos:'center top',    img:'./soft2.jpg' },
  { id:3,  name:'Soft Urbanity Joggers',        price:15000, cat:'bottoms', badge:'New',        hasSizes:true,  imgPos:'center center', img:'./joggers.jpg' },
  { id:4,  name:'Soft Urbanity Shorts',         price:12000, cat:'bottoms', badge:null,         hasSizes:true,  imgPos:'center center', img:'./shorts.jpg' },
  { id:5,  name:'Soft Urbanity Face Cap',       price:8000,  cat:'caps',    badge:null,         hasSizes:false, imgPos:'center center', img:'./cap.jpg' },
  { id:6,  name:'Urbanity beanie',         price:8000,  cat:'caps',    badge:null,         hasSizes:false, imgPos:'center center', img:'./cap2.jpg' },
  { id:7,  name:'Soft Urbanity Leather Jacket', price:25000, cat:'sets',    badge:'Premium',    hasSizes:true,  imgPos:'center top',    img:'./jacket.jpg' },
  { id:8,  name:'Camo Up & Down Set',           price:40000, cat:'sets',    badge:'Limited',    hasSizes:true,  imgPos:'center top',    img:'./camo.jpg' }
];

const lbData = [
  { label:'Street Edit',   img:'./jacket.jpg' },
  { label:'Studio Looks',  img:'./hero.jpg' },
  { label:'Fit of Day',    img:'./camo.jpg' },
  { label:'Drop Season',   img:'./lb1.jpg' },
];

const socImgs = [
  './soc1.jpg',
  './soc2.jpg',
  './soc3.jpg',
  './soc4.jpg',
  './soc5.jpg',
  './soc6.jpg',
];

/* ── CART STATE ── */
let cart         = [];
let pendingId    = null;
let selectedSize = null;
let activeFilter = 'all';
let shown        = 8;

/* ════════════════════════════════════
   FUNCTIONS — all declared up top
   ════════════════════════════════════ */

/* Build one product card HTML */
function card(p) {
  return `
    <div class="pc" data-id="${p.id}">
      <div class="pc-img-wrap">
        <img class="pc-img" src="${p.img}" alt="${p.name}" loading="lazy" style="object-position:${p.imgPos || 'center top'}"/>
        ${p.badge ? `<span class="pc-badge">${p.badge}</span>` : ''}
      </div>
      <div class="pc-info">
        <p class="pc-name">${p.name}</p>
        <p class="pc-price">₦${p.price.toLocaleString()}</p>
        <button class="pc-add" onclick="openSz(${p.id})">
          ${p.hasSizes ? 'Select Size & Add' : 'Add to Bag'}
        </button>
      </div>
    </div>`;
}

/* Return filtered product list */
function getFiltered() {
  return activeFilter === 'all'
    ? products
    : products.filter(p => p.cat === activeFilter);
}

/* Render main product grid */
function render() {
  const list = getFiltered();
  const pg   = document.getElementById('pg');
  if (!pg) return;
  pg.innerHTML = list.slice(0, shown).map(card).join('');

  const lm = document.getElementById('load-more');
  if (lm) {
    lm.disabled    = shown >= list.length;
    lm.textContent = shown >= list.length ? 'All Loaded' : 'Load More';
  }
}

/* Filter button click */
function fil(cat, btn) {
  activeFilter = cat;
  shown        = 8;
  document.querySelectorAll('.ft').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  render();
}

/* Load more products */
function loadMore() {
  shown += 4;
  render();
  window.scrollBy({ top: 200, behavior: 'smooth' });
}

/* ── MOBILE MENU ── */
function toggleMenu() {
  document.getElementById('ham').classList.toggle('open');
  document.getElementById('mob-menu').classList.toggle('open');
}

/* ── SIZE MODAL ── */
function openSz(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  /* Caps/one-size — skip modal, go straight to cart */
  if (!p.hasSizes) {
    addToCart(id, 'One Size');
    return;
  }

  pendingId    = id;
  selectedSize = null;

  document.getElementById('sz-pname').textContent =
    p.name + ' — ₦' + p.price.toLocaleString();

  /* Build size buttons */
  document.getElementById('sz-grid').innerHTML = SIZES.map(s =>
    `<button class="sz-btn" onclick="pickSz(this,'${s}')">${s}</button>`
  ).join('');

  document.getElementById('szm').classList.add('on');
}

function pickSz(btn, size) {
  document.querySelectorAll('.sz-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  selectedSize = size;
}

function closeSz() {
  document.getElementById('szm').classList.remove('on');
  pendingId    = null;
  selectedSize = null;
}

function confirmAdd() {
  if (!selectedSize) {
    /* Shake the size grid to prompt selection */
    const grid = document.getElementById('sz-grid');
    grid.style.outline = '1px solid var(--red)';
    setTimeout(() => (grid.style.outline = ''), 900);
    return;
  }
  addToCart(pendingId, selectedSize);
  closeSz();
}

/* ── CART ── */
function addToCart(id, size) {
  const p   = products.find(x => x.id === id);
  const key = `${id}-${size}`;
  const ex  = cart.find(x => x.key === key);

  if (ex) {
    ex.qty++;
  } else {
    cart.push({ ...p, size, key, qty: 1 });
  }

  updateCart();
  openCart();

  /* Flash the card button */
  const btn = document.querySelector(`.pc[data-id="${id}"] .pc-add`);
  if (btn) {
    const original = btn.textContent;
    btn.textContent = '✓ Added';
    btn.classList.add('ok');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('ok');
    }, 1600);
  }
}

function removeFromCart(key) {
  cart = cart.filter(x => x.key !== key);
  updateCart();
}

function updateCart() {
  const count = cart.reduce((s, x) => s + x.qty, 0);
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);

  /* Badge */
  const badge = document.getElementById('badge');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('on', count > 0);
  }

  /* Total */
  const ctotal = document.getElementById('ctotal');
  if (ctotal) ctotal.textContent = '₦' + total.toLocaleString();

  /* Item list */
  const list = document.getElementById('clist');
  if (list) {
    list.innerHTML = cart.length
      ? cart.map(x => `
          <div class="c-item">
            <img class="c-thumb" src="${x.img}" alt="${x.name}"/>
            <div class="c-info">
              <p class="c-iname">${x.name}</p>
              <p class="c-isize">Size: ${x.size}</p>
              <p class="c-iprice">₦${x.price.toLocaleString()} × ${x.qty}</p>
              <button class="c-rm" onclick="removeFromCart('${x.key}')">Remove</button>
            </div>
          </div>`).join('')
      : '<p class="c-empty">Your bag is empty.</p>';
  }

  /* WhatsApp message */
  let msg = `Hi Soft Urbanity! 👋\n\nI'd like to order:\n\n`;
  cart.forEach(x => {
    msg += `• ${x.name} — Size: ${x.size} × ${x.qty} = ₦${(x.price * x.qty).toLocaleString()}\n`;
  });
  msg += `\n*Total: ₦${total.toLocaleString()}*\n\nMy delivery location: `;

  const waBtn = document.getElementById('wabtn');
  if (waBtn) waBtn.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}

function openCart() {
  document.getElementById('co').classList.add('on');
  document.getElementById('cd').classList.add('on');
}

function closeCart() {
  document.getElementById('co').classList.remove('on');
  document.getElementById('cd').classList.remove('on');
}

/* ════════════════════════════════════
   INIT — runs after DOM is ready
   ════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {

  /* ── CURSOR ── */
  const cur  = document.getElementById('cur');
  const curR = document.getElementById('cur-r');
  document.addEventListener('mousemove', e => {
    if (cur)  { cur.style.left  = e.clientX + 'px'; cur.style.top  = e.clientY + 'px'; }
    if (curR) { curR.style.left = e.clientX + 'px'; curR.style.top = e.clientY + 'px'; }
  });
  document.addEventListener('mouseover', e => {
    document.body.classList.toggle(
      'h',
      !!e.target.closest('a, button, .pc, .lb-panel, .ft, .soc-item, .how-card')
    );
  });

  /* ── MARQUEE ── */
  const words = ['Stay Original','Fit True','Soft Urbanity','New Drop 2025','Ibadan Made','Limited Edition'];
  const st    = document.getElementById('st');
  if (st) {
    /* Duplicate for seamless loop */
    [...words, ...words].forEach((w, i) => {
      const s = document.createElement('span');
      s.innerHTML = i % 2 === 1 ? `<span class="dot">✦</span> ${w} ` : `${w} `;
      st.appendChild(s);
    });
  }

  /* ── LOOKBOOK ── */
  const lb = document.getElementById('lb');
  if (lb) {
    lbData.forEach(d => {
      lb.innerHTML += `
        <div class="lb-panel">
          <img src="${d.img}" alt="${d.label}" loading="lazy"/>
          <span class="lb-lbl">${d.label}</span>
        </div>`;
    });
  }

  /* ── SOCIAL STRIP ── */
  const sg = document.getElementById('soc-grid');
  if (sg) {
    socImgs.forEach(src => {
      sg.innerHTML += `
        <div class="soc-item">
          <img src="${src}" alt="community" loading="lazy"/>
          <div class="soc-overlay"><span>@softurbanity</span></div>
        </div>`;
    });
  }

  /* ── MAIN PRODUCT GRID ── */
  render();

   /* ── NEW ARRIVALS — static coming soon cards, no price, no cart ── */
  const pg2 = document.getElementById('pg2');
  if (pg2) {
    pg2.innerHTML = `
      <div class="pc cs-card">
        <div class="pc-img-wrap">
          <img class="pc-img" src="./new1.jpg" alt="Coming Soon" loading="lazy" style="object-position:center top"/>
          <div class="cs-overlay"><span class="cs-label">Coming Soon</span></div>
        </div>
        <div class="pc-info">
          <p class="pc-name">New Drop</p>
          <p class="pc-price" style="color:var(--red);letter-spacing:.18em">COMING SOON</p>
        </div>
      </div>
      <div class="pc cs-card">
        <div class="pc-img-wrap">
          <img class="pc-img" src="./new2.jpg" alt="Coming Soon" loading="lazy" style="object-position:center top"/>
          <div class="cs-overlay"><span class="cs-label">Coming Soon</span></div>
        </div>
        <div class="pc-info">
          <p class="pc-name">New Drop</p>
          <p class="pc-price" style="color:var(--red);letter-spacing:.18em">COMING SOON</p>
        </div>
      </div>`;
  }

  /* ── SCROLL REVEAL ── */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.rv').forEach(el => obs.observe(el));

});