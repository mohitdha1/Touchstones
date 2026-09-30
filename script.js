/* ==========================================================
   North Star Bakery - Site Script
   1. Pre-order list builder (products.html)
   2. Pre-order form validation (contact.html)
   3. localStorage: saved list is shared between both pages
   ========================================================== */

/* ---------- Data ---------- */

// Key used to save the customer's list in localStorage
const STORAGE_KEY = "northStarPreorderList";

// Array of category objects used to build the filter buttons
const categories = [
  { id: "all", label: "All Items" },
  { id: "bread", label: "Breads" },
  { id: "pastry", label: "Pastries and Sweets" }
];

// Array of product objects shown in the list builder
const products = [
  { id: "signature-loaf", name: "Signature Loaf", category: "bread", price: 11.0 },
  { id: "country-sourdough", name: "Country Sourdough", category: "bread", price: 9.0 },
  { id: "seeded-wheat", name: "Seeded Whole Wheat", category: "bread", price: 8.5 },
  { id: "dark-rye", name: "Dark Rye", category: "bread", price: 8.5 },
  { id: "dinner-rolls", name: "Soft Dinner Rolls (dozen)", category: "bread", price: 10.0 },
  { id: "croissant", name: "Butter Croissant", category: "pastry", price: 4.0 },
  { id: "cinnamon-roll", name: "Cinnamon Roll", category: "pastry", price: 4.5 },
  { id: "hand-pie", name: "Seasonal Fruit Hand Pie", category: "pastry", price: 5.0 },
  { id: "cookie", name: "Chocolate Chip Cookie", category: "pastry", price: 2.5 }
];

// The customer's list: an object where each key is a product id
// and each value is the quantity, for example { "croissant": 3 }
let preorderList = {};

// Currently selected filter
let activeCategory = "all";

/* ---------- Shared helpers ---------- */

function formatPrice(amount) {
  return "$" + amount.toFixed(2);
}

function findProduct(productId) {
  return products.find(function (product) {
    return product.id === productId;
  });
}

/* ---------- localStorage ---------- */

function saveList() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preorderList));
  } catch (error) {
    // Storage can be blocked (for example in some private windows).
    // The list still works for this visit, it just won't be remembered.
  }
}

function loadList() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
}

function clearSavedList() {
  preorderList = {};
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Nothing to clear if storage is unavailable
  }
}

// Turns the saved object into readable lines such as "2 x Butter Croissant"
function getListLines(list) {
  return Object.keys(list)
    .filter(function (productId) {
      return findProduct(productId);
    })
    .map(function (productId) {
      return list[productId] + " x " + findProduct(productId).name;
    });
}

/* ==========================================================
   1. Pre-order list builder (products.html)
   ========================================================== */

function renderFilterButtons() {
  const container = document.getElementById("filter-buttons");
  container.innerHTML = "";

  categories.forEach(function (category) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.textContent = category.label;
    button.setAttribute("aria-pressed", category.id === activeCategory ? "true" : "false");
    button.addEventListener("click", function () {
      activeCategory = category.id;
      renderFilterButtons();
      renderProductOptions();
    });
    container.appendChild(button);
  });
}

function getFilteredProducts() {
  if (activeCategory === "all") {
    return products;
  }
  return products.filter(function (product) {
    return product.category === activeCategory;
  });
}

function renderProductOptions() {
  const container = document.getElementById("product-options");
  container.innerHTML = "";

  getFilteredProducts().forEach(function (product) {
    const item = document.createElement("li");
    item.className = "product-option";

    const name = document.createElement("span");
    name.className = "product-name";
    name.textContent = product.name;

    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "add-button";
    button.textContent = "Add";
    button.setAttribute("aria-label", "Add " + product.name + " to your pre-order list");
    button.addEventListener("click", function () {
      addToList(product.id);
    });

    item.append(name, price, button);
    container.appendChild(item);
  });
}

function addToList(productId) {
  preorderList[productId] = (preorderList[productId] || 0) + 1;
  saveList();
  renderPreorderList(findProduct(productId).name + " added to your list.");
}

function removeFromList(productId) {
  const productName = findProduct(productId).name;
  preorderList[productId] -= 1;
  if (preorderList[productId] <= 0) {
    delete preorderList[productId];
  }
  saveList();
  renderPreorderList("Removed one " + productName + ".");
}

function calculateTotal() {
  return Object.keys(preorderList).reduce(function (total, productId) {
    const product = findProduct(productId);
    return product ? total + product.price * preorderList[productId] : total;
  }, 0);
}

function renderPreorderList(statusMessage) {
  const listElement = document.getElementById("preorder-list");
  const totalElement = document.getElementById("list-total");
  const statusElement = document.getElementById("list-status");
  const actions = document.getElementById("list-actions");
  const productIds = Object.keys(preorderList).filter(findProduct);

  listElement.innerHTML = "";

  if (productIds.length === 0) {
    statusElement.textContent = statusMessage || "Your list is empty. Add items above to get started.";
    totalElement.textContent = "";
    actions.hidden = true;
    return;
  }

  productIds.forEach(function (productId) {
    const product = findProduct(productId);
    const quantity = preorderList[productId];

    const item = document.createElement("li");

    const text = document.createElement("span");
    text.textContent = quantity + " x " + product.name + " (" + formatPrice(product.price * quantity) + ")";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-button";
    removeButton.textContent = "Remove one";
    removeButton.setAttribute("aria-label", "Remove one " + product.name);
    removeButton.addEventListener("click", function () {
      removeFromList(productId);
    });

    item.append(text, removeButton);
    listElement.appendChild(item);
  });

  statusElement.textContent = statusMessage || "Welcome back! We saved your list from last time.";
  totalElement.textContent = "Estimated total: " + formatPrice(calculateTotal());
  actions.hidden = false;
}

function initListBuilder() {
  preorderList = loadList();
  renderFilterButtons();
  renderProductOptions();
  renderPreorderList();

  document.getElementById("clear-list").addEventListener("click", function () {
    clearSavedList();
    renderPreorderList("Your list has been cleared.");
  });
}

/* ==========================================================
   2. Pre-order form validation (contact.html)
   ========================================================== */

// Each rule is an object: which field it checks and a function that
// returns an error message, or an empty string when the value is valid.
const validationRules = [
  {
    fieldId: "name",
    check: function (value) {
      if (value === "") return "Please enter your full name.";
      if (value.length < 2) return "Your name must be at least 2 characters.";
      if (!/^[A-Za-z][A-Za-z .'-]*$/.test(value)) {
        return "Please use letters only (spaces, hyphens, and apostrophes are okay).";
      }
      return "";
    }
  },
  {
    fieldId: "email",
    check: function (value) {
      if (value === "") return "Please enter your email address.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        return "Please enter a valid email address, like name@example.com.";
      }
      return "";
    }
  },
  {
    fieldId: "pickup-date",
    check: function (value) {
      if (value === "") return "Please choose a pickup date.";
      const pickup = new Date(value + "T12:00:00");
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (pickup < tomorrow) return "Pickup date must be at least one day from today.";
      if (pickup.getDay() === 1) return "We're closed on Mondays. Please choose Tuesday through Sunday.";
      return "";
    }
  },
  {
    fieldId: "request-type",
    check: function (value) {
      return value === "" ? "Please choose a request type." : "";
    }
  },
  {
    fieldId: "item-details",
    check: function (value) {
      if (value === "") return "Please tell us what you'd like to order.";
      if (value.length < 10) return "Please add a little more detail (at least 10 characters).";
      if (value.length > 500) return "Please keep item details under 500 characters.";
      return "";
    }
  },
  {
    fieldId: "allergy-notes",
    check: function (value) {
      return value.length > 300 ? "Please keep allergy notes under 300 characters." : "";
    }
  }
];

// Creates an empty error message element right below a field
function createErrorElement(field) {
  const error = document.createElement("span");
  error.className = "error-message";
  error.id = field.id + "-error";
  error.setAttribute("aria-live", "polite");
  field.insertAdjacentElement("afterend", error);
  field.setAttribute("aria-describedby", error.id);
  return error;
}

function showFieldResult(field, message) {
  const error = document.getElementById(field.id + "-error");
  error.textContent = message;
  if (message) {
    field.setAttribute("aria-invalid", "true");
  } else {
    field.removeAttribute("aria-invalid");
  }
}

// Checks one field and shows or clears its message. Returns true if valid.
function validateField(rule) {
  const field = document.getElementById(rule.fieldId);
  const message = rule.check(field.value.trim());
  showFieldResult(field, message);
  return message === "";
}

// Checks every field and returns the first invalid field (or null)
function validateForm() {
  let firstInvalidField = null;
  validationRules.forEach(function (rule) {
    const isValid = validateField(rule);
    if (!isValid && !firstInvalidField) {
      firstInvalidField = document.getElementById(rule.fieldId);
    }
  });
  return firstInvalidField;
}

function showFormMessage(text, type) {
  const message = document.getElementById("form-message");
  message.textContent = text;
  message.className = "form-message " + type;
  message.hidden = false;
}

// Fills in the item details field with the list saved on the products page
function prefillFromSavedList() {
  const lines = getListLines(loadList());
  const details = document.getElementById("item-details");
  if (lines.length === 0 || details.value.trim() !== "") {
    return;
  }
  details.value = lines.join("\n");
  document.getElementById("request-type").value = "pre-order";
  showFormMessage(
    "We added the " + lines.length + " item(s) from your saved pre-order list below. You can edit them before sending.",
    "info"
  );
}

// Sets the earliest selectable pickup date to tomorrow
function setMinimumPickupDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  document.getElementById("pickup-date").min = tomorrow.getFullYear() + "-" + month + "-" + day;
}

function handleSubmit(event) {
  event.preventDefault();
  const firstInvalidField = validateForm();

  if (firstInvalidField) {
    showFormMessage("Please fix the highlighted fields below. Everything you typed is still here.", "error");
    firstInvalidField.focus();
    return;
  }

  const name = document.getElementById("name").value.trim();
  showFormMessage(
    "Thank you, " + name + "! Your request has been received. We'll email you within one business day to confirm.",
    "success"
  );
  clearSavedList();
  event.target.reset();
}

function initFormValidation() {
  const form = document.querySelector("form");
  form.noValidate = true; // use our messages instead of the browser pop-ups

  const message = document.createElement("p");
  message.id = "form-message";
  message.setAttribute("role", "status");
  message.hidden = true;
  form.insertAdjacentElement("beforebegin", message);

  validationRules.forEach(function (rule) {
    const field = document.getElementById(rule.fieldId);
    createErrorElement(field);

    // Check a field when the user leaves it. Skip this when the user is
    // clicking the submit button: a new error message would push the button
    // down mid-click, and handleSubmit checks every field anyway.
    field.addEventListener("blur", function (event) {
      const next = event.relatedTarget;
      if (next && next.type === "submit") {
        return;
      }
      if (field.value.trim() !== "" || field.hasAttribute("aria-invalid")) {
        validateField(rule);
      }
    });

    // Once a field shows an error, update it live as the user fixes it
    field.addEventListener("input", function () {
      if (field.hasAttribute("aria-invalid")) {
        validateField(rule);
      }
    });
    field.addEventListener("change", function () {
      if (field.hasAttribute("aria-invalid")) {
        validateField(rule);
      }
    });
  });

  setMinimumPickupDate();
  prefillFromSavedList();
  form.addEventListener("submit", handleSubmit);
}

/* ---------- Start the right feature for each page ---------- */

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("product-options")) {
    initListBuilder();
  }
  if (document.getElementById("item-details")) {
    initFormValidation();
  }
});