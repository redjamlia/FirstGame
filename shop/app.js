const PRODUCT_FILE = "products.json";
const CART_KEY = "little-market-cart-v1";

const grid = document.querySelector("#product-grid");
const status = document.querySelector("#status");
const cartPanel = document.querySelector("#cart-panel");
const cartBackdrop = document.querySelector("#cart-backdrop");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
const toast = document.querySelector("#toast");
let products = [];
let cart = readCart();
let toastTimer;

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function money(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

function renderProducts() {
  grid.replaceChildren();
  for (const product of products) {
    const card = document.createElement("article");
    card.className = "product-card";

    const art = document.createElement("div");
    art.className = "product-art";
    art.style.setProperty("--art-bg", product.color || "#eeece5");
    art.setAttribute("aria-hidden", "true");
    const emoji = document.createElement("span");
    emoji.textContent = product.emoji || "📦";
    art.append(emoji);

    const info = document.createElement("div");
    info.className = "product-info";
    const details = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = product.name;
    const description = document.createElement("p");
    description.textContent = product.description;
    details.append(name, description);
    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = money(product.price);
    info.append(details, price);

    const add = document.createElement("button");
    add.className = "add-button";
    add.type = "button";
    add.textContent = "Add to cart";
    add.addEventListener("click", () => addToCart(product.id));
    card.append(art, info, add);
    grid.append(card);
  }
  status.textContent = `${products.length} lovely things to explore`;
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function addToCart(id) {
  const line = cart.find((item) => item.id === id);
  if (line) line.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveCart();
  showToast("Added to your cart");
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = count;
  cartItems.replaceChildren();

  const lines = cart.map((item) => ({
    ...item,
    product: products.find((product) => product.id === item.id),
  })).filter((item) => item.product);

  if (lines.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-cart";
    empty.textContent = "Your cart is waiting for something lovely.";
    cartItems.append(empty);
  }

  let subtotal = 0;
  for (const item of lines) {
    subtotal += item.product.price * item.quantity;
    const row = document.createElement("div");
    row.className = "cart-row";
    const emoji = document.createElement("span");
    emoji.className = "cart-emoji";
    emoji.setAttribute("aria-hidden", "true");
    emoji.textContent = item.product.emoji || "📦";
    const detail = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = item.product.name;
    const quantity = document.createElement("p");
    quantity.textContent = `${item.quantity} × ${money(item.product.price)}`;
    const remove = document.createElement("button");
    remove.className = "remove-button";
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => removeFromCart(item.id));
    detail.append(name, quantity, remove);
    const lineTotal = document.createElement("strong");
    lineTotal.textContent = money(item.product.price * item.quantity);
    row.append(emoji, detail, lineTotal);
    cartItems.append(row);
  }
  cartTotal.textContent = money(subtotal);
}

function setCartOpen(open) {
  cartPanel.classList.toggle("open", open);
  cartPanel.setAttribute("aria-hidden", String(!open));
  document.querySelector("#cart-toggle").setAttribute("aria-expanded", String(open));
  cartBackdrop.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
  if (open) document.querySelector("#cart-close").focus();
}

document.querySelector("#cart-toggle").addEventListener("click", () => setCartOpen(true));
document.querySelector("#cart-close").addEventListener("click", () => setCartOpen(false));
cartBackdrop.addEventListener("click", () => setCartOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setCartOpen(false);
});
document.querySelector("#checkout-button").addEventListener("click", () => {
  showToast("Demo only: no order or payment was made.");
});

async function loadProducts() {
  try {
    const response = await fetch(PRODUCT_FILE);
    if (!response.ok) throw new Error("Could not load products");
    products = await response.json();
    if (!Array.isArray(products)) throw new Error("Product data should be a list");
    renderProducts();
    renderCart();
  } catch (error) {
    console.error(error);
    status.textContent = "Products could not be loaded. Please refresh the page.";
  }
}

loadProducts();
