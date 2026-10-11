
"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const products = [
  {
    id: 1,
    name: "Aurora Poster Pack",
    category: "Posters",
    price: 299,
    badge: "BESTSELLER",
    art: "art-aurora",
    title: "FIND YOUR",
    title2: "UNIVERSE",
    description: "Atmospheric poster templates for bold creative campaigns."
  },
  {
    id: 2,
    name: "Pitch Perfect",
    category: "Presentations",
    price: 449,
    badge: "POPULAR",
    art: "art-pitch",
    title: "THINK",
    title2: "BIGGER",
    description: "A polished presentation kit for your next big idea."
  },
  {
    id: 3,
    name: "Social Bloom Kit",
    category: "Social Media",
    price: 249,
    badge: "NEW",
    art: "art-social",
    title: "STAY",
    title2: "INSPIRED",
    description: "Eye-catching layouts for social media content."
  },
  {
    id: 4,
    name: "Identity Studio",
    category: "Branding",
    price: 599,
    badge: "PREMIUM",
    art: "art-brand",
    title: "LESS",
    title2: "BUT BETTER",
    description: "Elegant visual identity resources for modern brands."
  },
  {
    id: 5,
    name: "Minimal Moodboards",
    category: "Posters",
    price: 349,
    badge: "EDITOR'S PICK",
    art: "art-mood",
    title: "FIND YOUR",
    title2: "BALANCE",
    description: "A calm, curated collection for visual storytelling."
  },
  {
    id: 6,
    name: "Golden Hour Stories",
    category: "Social Media",
    price: 199,
    badge: "STARTER",
    art: "art-golden",
    title: "GOLDEN",
    title2: "MOMENTS",
    description: "Warm, expressive layouts for stories and promotions."
  }
];

const state = {
  category: "All",
  search: "",
  sort: "featured",
  wishlist: new Set(),
  cart: new Map(),
  selectedProduct: null,
  toastTimer: null
};

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function formatPrice(price) {
  return "₹" + Number(price).toLocaleString("en-IN");
}

function getProduct(id) {
  return products.find((product) => product.id === Number(id));
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("visible");

  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2500);
}

function renderProducts() {
  const grid = $("#productGrid");
  const empty = $("#emptyProducts");
  if (!grid || !empty) return;

  let filtered = products.filter((product) => {
    const matchesCategory =
      state.category === "All" || product.category === state.category;

    const searchable = [
      product.name,
      product.category,
      product.description,
      product.badge
    ].join(" ").toLowerCase();

    return matchesCategory && searchable.includes(state.search.toLowerCase());
  });

  if (state.sort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.sort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  grid.innerHTML = filtered.map((product, index) => `
    <article class="product-card" style="animation-delay:${index * 60}ms">
      <div class="product-art ${product.art}">
        <div class="product-art-top">
          <span class="product-tag">${escapeHTML(product.badge)}</span>
          <button
            class="wishlist-product ${state.wishlist.has(product.id) ? "active" : ""}"
            data-action="wishlist"
            data-id="${product.id}"
            aria-label="${state.wishlist.has(product.id) ? "Remove from" : "Add to"} wishlist"
            aria-pressed="${state.wishlist.has(product.id)}"
          >${state.wishlist.has(product.id) ? "♥" : "♡"}</button>
        </div>
        <div class="mini-poster">
          <span class="mini-label">NOVA / CREATIVE SERIES</span>
          <span class="mini-shape"></span>
          <span class="mini-title">${escapeHTML(product.title)}<br>${escapeHTML(product.title2)}.</span>
          <span class="mini-footer"><span>NOVA STUDIO</span><span>NO. 0${product.id}</span></span>
        </div>
      </div>
      <div class="product-info">
        <span class="product-category">${escapeHTML(product.category)}</span>
        <div class="product-title-row">
          <h3 class="product-title">${escapeHTML(product.name)}</h3>
          <span class="product-price">${formatPrice(product.price)}</span>
        </div>
        <p class="product-description">${escapeHTML(product.description)}</p>
        <div class="product-actions">
          <button class="product-details-button" data-action="details" data-id="${product.id}">
            Preview details
          </button>
          <button class="product-add-button" data-action="add" data-id="${product.id}">
            + Add to bag
          </button>
        </div>
      </div>
    </article>
  `).join("");

  empty.hidden = filtered.length !== 0;
  grid.hidden = filtered.length === 0;
}

function updateWishlistCount() {
  const count = $("#wishlistCount");
  if (count) count.textContent = state.wishlist.size;
}

function updateCart() {
  const count = [...state.cart.values()]
    .reduce((sum, quantity) => sum + quantity, 0);

  if ($("#cartCount")) $("#cartCount").textContent = count;
  if ($("#drawerCartCount")) $("#drawerCartCount").textContent = `(${count})`;

  const cartItems = $("#cartItems");
  const totalElement = $("#cartTotal");
  if (!cartItems || !totalElement) return;

  if (state.cart.size === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <div style="font-size:34px;margin-bottom:12px">✧</div>
        <strong>Your bag is waiting for inspiration.</strong>
        <p>Explore the collection and add something you love.</p>
      </div>
    `;
  } else {
    cartItems.innerHTML = [...state.cart.entries()].map(([id, quantity]) => {
      const product = getProduct(id);
      if (!product) return "";

      return `
        <article class="cart-item">
          <div class="cart-item-art ${product.art}">
            ${escapeHTML(product.title.slice(0, 1))}
          </div>
          <div>
            <h4>${escapeHTML(product.name)}</h4>
            <p>${formatPrice(product.price)} each</p>
            <div class="quantity-controls">
              <button data-action="decrease" data-id="${id}" aria-label="Decrease quantity">−</button>
              <span>${quantity}</span>
              <button data-action="increase" data-id="${id}" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove-item" data-action="remove" data-id="${id}">Remove</button>
          </div>
          <strong>${formatPrice(product.price * quantity)}</strong>
        </article>
      `;
    }).join("");
  }

  const total = [...state.cart.entries()].reduce((sum, [id, quantity]) => {
    const product = getProduct(id);
    return sum + (product ? product.price * quantity : 0);
  }, 0);

  totalElement.textContent = formatPrice(total);
}

function addToCart(id) {
  const product = getProduct(id);
  if (!product) return;

  state.cart.set(product.id, (state.cart.get(product.id) || 0) + 1);
  updateCart();
  showToast(`${product.name} added to your bag.`);
}

function changeQuantity(id, amount) {
  const current = state.cart.get(Number(id)) || 0;
  const next = current + amount;

  if (next <= 0) {
    state.cart.delete(Number(id));
  } else {
    state.cart.set(Number(id), next);
  }

  updateCart();
}

function toggleWishlist(id) {
  const product = getProduct(id);
  if (!product) return;

  if (state.wishlist.has(product.id)) {
    state.wishlist.delete(product.id);
    showToast("Removed from your wishlist.");
  } else {
    state.wishlist.add(product.id);
    showToast("Added to your wishlist.");
  }

  updateWishlistCount();
  renderProducts();
}

function openCart() {
  $("#cartDrawer")?.classList.add("open");
  $("#cartDrawer")?.setAttribute("aria-hidden", "false");
  $("#overlay")?.classList.add("visible");
  document.body.style.overflow = "hidden";
  $("#closeCart")?.focus();
}

function closeCart() {
  $("#cartDrawer")?.classList.remove("open");
  $("#cartDrawer")?.setAttribute("aria-hidden", "true");
  $("#overlay")?.classList.remove("visible");
  document.body.style.overflow = "";
}

function openProductDetails(id) {
  const product = getProduct(id);
  if (!product) return;

  state.selectedProduct = product.id;
  const modal = $("#productModal");
  const content = $("#productModalContent");

  content.innerHTML = `
    <div class="eyebrow">NOVA COLLECTION / ${String(product.id).padStart(2, "0")}</div>
    <div class="modal-product-art ${product.art}">
      <span>${escapeHTML(product.title)}<br>${escapeHTML(product.title2)}</span>
    </div>
    <p class="product-category" style="margin-top:18px">${escapeHTML(product.category)}</p>
    <h2 id="modalTitle">${escapeHTML(product.name)}</h2>
    <p>${escapeHTML(product.description)}</p>
    <p>Explore this digital resource as part of the NOVA STUDIO demo collection.</p>
    <strong style="font-size:20px">${formatPrice(product.price)}</strong>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="button button-primary" data-action="modal-add" data-id="${product.id}">Add to bag ↗</button>
      <button class="button button-secondary" data-action="modal-wishlist" data-id="${product.id}">
        ${state.wishlist.has(product.id) ? "♥ Wishlisted" : "♡ Add to wishlist"}
      </button>
    </div>
  `;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  $("#overlay")?.classList.add("visible");
  document.body.style.overflow = "hidden";
  $("#closeProductModal")?.focus();
}

function closeProductDetails() {
  $("#productModal")?.classList.remove("open");
  $("#productModal")?.setAttribute("aria-hidden", "true");

  if (!$("#cartDrawer")?.classList.contains("open")) {
    $("#overlay")?.classList.remove("visible");
    document.body.style.overflow = "";
  }
}

function closeAllPanels() {
  closeCart();
  closeProductDetails();
}

function setCategory(category) {
  state.category = category;
  $$(".category-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });
  renderProducts();
}

function setTheme(isLight) {
  document.body.classList.toggle("light-theme", isLight);
  $("#themeIcon").textContent = isLight ? "☾" : "☼";
  $("#themeToggle").setAttribute(
    "aria-label",
    isLight ? "Switch to dark theme" : "Switch to light theme"
  );
}

function toggleMobileMenu() {
  const nav = $("#mainNav");
  const button = $("#menuToggle");
  const open = nav.classList.toggle("open");
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
}

function runConceptDemo(event) {
  event.preventDefault();

  const prompt = $("#aiPrompt").value.trim();
  const style = $("#artStyle").value;
  const type = $("#artType").value;

  if (!prompt) {
    $("#aiPrompt").focus();
    showToast("Describe your creative idea first.");
    return;
  }

  const button = $(".ai-generate-button");
  const result = $("#aiResult");
  const originalText = button.innerHTML;

  button.disabled = true;
  button.innerHTML = "✳ Exploring your idea...";
  result.innerHTML = `
    <div class="result-placeholder">
      <span class="placeholder-sparkle">✧</span>
      <strong>Putting your concept together...</strong>
      <p>Preparing a sample concept preview.</p>
    </div>
  `;

  // Demo only: this creates a styled concept card, not an AI-generated image.
  setTimeout(() => {
    const title = prompt.length > 68
      ? prompt.slice(0, 65).trim() + "..."
      : prompt;

    result.innerHTML = `
      <article class="concept-result">
        <span class="concept-label">✳ NOVA CONCEPT / DEMO PREVIEW</span>
        <h3>${escapeHTML(title)}</h3>
        <p>Your ${escapeHTML(type.toLowerCase())} concept uses a ${escapeHTML(style.toLowerCase())} visual direction. Refine your prompt or explore another creative direction.</p>
        <div class="concept-meta">${escapeHTML(style.toUpperCase())} / ${escapeHTML(type.toUpperCase())} / CONCEPT 001</div>
      </article>
    `;

    button.disabled = false;
    button.innerHTML = originalText;
    showToast("Your demo concept is ready.");
  }, 650);
}

function handleDocumentClick(event) {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const id = Number(actionButton.dataset.id);
  const action = actionButton.dataset.action;

  switch (action) {
    case "wishlist":
      toggleWishlist(id);
      break;
    case "add":
    case "modal-add":
      addToCart(id);
      if (action === "modal-add") closeProductDetails();
      break;
    case "details":
      openProductDetails(id);
      break;
    case "increase":
      changeQuantity(id, 1);
      break;
    case "decrease":
      changeQuantity(id, -1);
      break;
    case "remove":
      state.cart.delete(id);
      updateCart();
      showToast("Item removed from your bag.");
      break;
    case "modal-wishlist":
      toggleWishlist(id);
      openProductDetails(id);
      break;
  }
}

function handleCheckout() {
  if (state.cart.size === 0) {
    showToast("Your bag is empty. Explore the collection first.");
    return;
  }

  showToast("Demo checkout only — no payment was made.");
}

function resetFilters() {
  state.category = "All";
  state.search = "";
  state.sort = "featured";
  $("#searchInput").value = "";
  $("#sortSelect").value = "featured";
  setCategory("All");
}

function initialize() {
  $("#currentYear").textContent = new Date().getFullYear();

  renderProducts();
  updateWishlistCount();
  updateCart();
  setTheme(false);

  $("#categoryTabs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (button) setCategory(button.dataset.category);
  });

  $("#searchInput")?.addEventListener("input", (event) => {
    state.search = event.target.value.trim();
    renderProducts();
  });

  $("#sortSelect")?.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });

  $("#resetFilters")?.addEventListener("click", resetFilters);
  $("#productGrid")?.addEventListener("click", handleDocumentClick);
  $("#cartItems")?.addEventListener("click", handleDocumentClick);
  $("#productModalContent")?.addEventListener("click", handleDocumentClick);

  $("#aiForm")?.addEventListener("submit", runConceptDemo);
  $("#themeToggle")?.addEventListener("click", () => {
    setTheme(!document.body.classList.contains("light-theme"));
  });

  $("#cartButton")?.addEventListener("click", openCart);
  $("#closeCart")?.addEventListener("click", closeCart);
  $("#closeProductModal")?.addEventListener("click", closeProductDetails);
  $("#overlay")?.addEventListener("click", closeAllPanels);
  $("#checkoutButton")?.addEventListener("click", handleCheckout);
  $("#wishlistButton")?.addEventListener("click", () => {
    setCategory("All");
    state.search = "";
    $("#searchInput").value = "";
    renderProducts();
    document.querySelector("#marketplace").scrollIntoView({ behavior: "smooth" });
    showToast(
      state.wishlist.size
        ? `You have ${state.wishlist.size} saved design${state.wishlist.size === 1 ? "" : "s"}. Look for the highlighted hearts.`
        : "Tap the heart on any design to save it."
    );
  });

  $("#menuToggle")?.addEventListener("click", toggleMobileMenu);

  $$("#mainNav a").forEach((link) => {
    link.addEventListener("click", () => {
      $("#mainNav").classList.remove("open");
      $("#menuToggle").setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllPanels();
      $("#mainNav")?.classList.remove("open");
      $("#menuToggle")?.setAttribute("aria-expanded", "false");
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}

/* NOVA STUDIO — CONNECT SERVICE BUTTONS TO ORDER FORM */
(function connectNovaOrderButtons() {
  function setupOrderButtons() {
    const serviceButtons = document.querySelectorAll(".service-order-btn");
    const orderSection = document.getElementById("custom-order");
    const serviceSelect = document.getElementById("orderService");

    if (!orderSection || !serviceSelect || !serviceButtons.length) {
      return;
    }

    serviceButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const selectedService = button.dataset.service;

        if (selectedService) {
          const matchingOption = Array.from(serviceSelect.options).find(
            function (option) {
              return option.value === selectedService;
            }
          );

          if (matchingOption) {
            serviceSelect.value = selectedService;
          }
        }

        orderSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        serviceSelect.focus({ preventScroll: true });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupOrderButtons);
  } else {
    setupOrderButtons();
  }
})();

