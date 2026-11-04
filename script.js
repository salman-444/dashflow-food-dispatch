"use strict";

/** Fixed storage and explicit indices; no array shifting or queue libraries. */
class CircularOrderQueue {
  constructor(capacity = 8) {
    this.capacity = capacity;
    this.storage = new Array(capacity).fill(null);
    this.front = -1;
    this.rear = -1;
    this.count = 0;
  }

  isFull() { return this.count === this.capacity; }
  isEmpty() { return this.count === 0; }

  enqueue(order) {
    if (this.isFull()) return false;
    if (this.isEmpty()) this.front = 0;
    // Modulo reuses freed array positions after the rear reaches the last index.
    this.rear = (this.rear + 1) % this.capacity;
    this.storage[this.rear] = order;
    this.count += 1;
    return true;
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const order = this.storage[this.front];
    this.storage[this.front] = null;
    this.count -= 1;
    if (this.isEmpty()) {
      this.front = -1;
      this.rear = -1;
    } else {
      this.front = (this.front + 1) % this.capacity;
    }
    return order;
  }

  display() {
    const orders = [];
    for (let offset = 0; offset < this.count; offset += 1) {
      orders[offset] = this.storage[(this.front + offset) % this.capacity];
    }
    return orders;
  }
}

/** A second circular array permits constant-time changes at BOTH ends. */
class PriorityOrderDeque {
  constructor(capacity = 6) {
    this.capacity = capacity;
    this.storage = new Array(capacity).fill(null);
    this.front = -1;
    this.rear = -1;
    this.count = 0;
  }

  isFull() { return this.count === this.capacity; }
  isEmpty() { return this.count === 0; }

  addFront(order) {
    if (this.isFull()) return false;
    if (this.isEmpty()) {
      this.front = 0;
      this.rear = 0;
    } else {
      // Adding capacity before modulo prevents a negative Java/JS index.
      this.front = (this.front - 1 + this.capacity) % this.capacity;
    }
    this.storage[this.front] = order;
    this.count += 1;
    return true;
  }

  addRear(order) {
    if (this.isFull()) return false;
    if (this.isEmpty()) {
      this.front = 0;
      this.rear = 0;
    } else {
      this.rear = (this.rear + 1) % this.capacity;
    }
    this.storage[this.rear] = order;
    this.count += 1;
    return true;
  }

  removeFront() {
    if (this.isEmpty()) return null;
    const order = this.storage[this.front];
    this.storage[this.front] = null;
    this.count -= 1;
    if (this.isEmpty()) {
      this.front = -1;
      this.rear = -1;
    } else {
      this.front = (this.front + 1) % this.capacity;
    }
    return order;
  }

  removeRear() {
    if (this.isEmpty()) return null;
    const order = this.storage[this.rear];
    this.storage[this.rear] = null;
    this.count -= 1;
    if (this.isEmpty()) {
      this.front = -1;
      this.rear = -1;
    } else {
      this.rear = (this.rear - 1 + this.capacity) % this.capacity;
    }
    return order;
  }

  display() {
    const orders = [];
    for (let offset = 0; offset < this.count; offset += 1) {
      orders[offset] = this.storage[(this.front + offset) % this.capacity];
    }
    return orders;
  }
}

const DRIVERS = ["Rider A12", "Rider K07", "Rider M21", "Rider V04", "Rider S18"];
const ZONE_ETA = Object.freeze({ Central: 12, East: 16, North: 18, West: 20, South: 22 });
const SOURCE_LABELS = Object.freeze({ regular: "REGULAR", urgent: "URGENT FRONT", priority: "PRIORITY REAR" });
const LOG_LIMIT = 48;
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 2 });

function createSimulationState() {
  return {
    queue: new CircularOrderQueue(8),
    deque: new PriorityOrderDeque(6),
    nextOrderNumber: 1,
    dispatched: 0,
    queueOps: 0,
    revenuePaise: 0,
    latestDispatch: null,
    logs: [],
    queueTransition: "Empty queue: front = rear = −1",
    rearWrapped: false
  };
}

let state = createSimulationState();
const byId = (id) => document.getElementById(id);
const pad = (number) => String(number).padStart(2, "0");
const formatMoney = (paise) => money.format(paise / 100);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function createOrder(customer, restaurant, zone, amount, source) {
  const order = {
    id: `O-${String(state.nextOrderNumber).padStart(3, "0")}`,
    customer,
    restaurant,
    zone,
    // Store integer paise, so repeated additions never accumulate float errors.
    amountPaise: Math.round(amount * 100),
    source
  };
  state.nextOrderNumber += 1;
  return order;
}

function logOperation(type, detail) {
  state.logs = [{ type, detail, timestamp: new Date().toISOString().slice(11, 19) }, ...state.logs].slice(0, LOG_LIMIT);
}

function notify(message, tone = "success") {
  byId("systemMessage").dataset.tone = tone;
  byId("messageText").textContent = message;
}

function enqueue(order) {
  const previousRear = state.queue.rear;
  if (!state.queue.enqueue(order)) return false;
  state.queueOps += 1;
  state.rearWrapped = previousRear === state.queue.capacity - 1;
  state.queueTransition = `rear = (${previousRear} + 1) % 8 = ${state.queue.rear}${state.rearWrapped ? " · WRAP-AROUND: slot 0 reused" : ` · ${order.customer} → CQ[${state.queue.rear}]`}`;
  logOperation("ENQUEUE", `${order.customer} → CQ[${state.queue.rear}] · rear = (${previousRear} + 1) % 8 = ${state.queue.rear}${state.rearWrapped ? " · WRAP-AROUND" : ""}`);
  return true;
}

function dequeue() {
  const previousFront = state.queue.front;
  const order = state.queue.dequeue();
  if (!order) return null;
  state.queueOps += 1;
  state.rearWrapped = false;
  state.queueTransition = state.queue.isEmpty()
    ? `Removed CQ[${previousFront}] · queue empty: front = rear = −1`
    : `front = (${previousFront} + 1) % 8 = ${state.queue.front} · CQ[${previousFront}] is now free`;
  logOperation("DEQUEUE", `${order.customer} ← CQ[${previousFront}] · ${state.queue.isEmpty() ? "queue empty; F = R = −1" : `front → ${state.queue.front}`}`);
  return order;
}

function addDequeFront(order) {
  if (!state.deque.addFront(order)) return false;
  state.queueOps += 1;
  logOperation("ADD_FRONT", `${order.customer} → Priority Deque front · URGENT FRONT`);
  return true;
}

function addDequeRear(order) {
  if (!state.deque.addRear(order)) return false;
  state.queueOps += 1;
  logOperation("ADD_REAR", `${order.customer} → Priority Deque rear · PRIORITY REAR`);
  return true;
}

function removeDequeFront() {
  const order = state.deque.removeFront();
  if (!order) return null;
  state.queueOps += 1;
  logOperation("REMOVE_FRONT", `${order.customer} ← Deque front`);
  return order;
}

function removeDequeRear() {
  const order = state.deque.removeRear();
  if (!order) return null;
  state.queueOps += 1;
  logOperation("REMOVE_REAR", `${order.customer} ← Deque rear`);
  return order;
}

function dispatchNext(quiet = false) {
  if (state.deque.isEmpty() && state.queue.isEmpty()) {
    if (!quiet) {
      logOperation("EMPTY", "No waiting orders. Dispatch paused.");
      renderAll();
      notify("Both lanes are empty. Add an order before dispatching.", "error");
    }
    return null;
  }

  // The dispatch policy is deliberately explicit for a DSA demonstration.
  const fromPriority = !state.deque.isEmpty();
  const order = fromPriority ? removeDequeFront() : dequeue();
  const driver = DRIVERS[state.dispatched % DRIVERS.length];
  state.dispatched += 1;
  state.revenuePaise += order.amountPaise;
  state.latestDispatch = {
    id: `D-${String(state.dispatched).padStart(3, "0")}`,
    order,
    driver,
    eta: ZONE_ETA[order.zone]
  };
  logOperation("DISPATCH", `${state.latestDispatch.id} assigned to ${driver} · ${order.customer} · ${SOURCE_LABELS[order.source]} · ${fromPriority ? "Deque served first" : "Deque empty → Circular Queue"} · ETA ${ZONE_ETA[order.zone]} min`);
  if (!quiet) {
    renderAll();
    notify(`${state.latestDispatch.id} · ${order.customer} assigned to ${driver}. ${fromPriority ? "Priority Deque served first." : "Deque empty; regular queue served."} ETA ${ZONE_ETA[order.zone]} min.`);
    animateLatestDispatch();
  }
  return state.latestDispatch;
}

function dispatchBatch() {
  const available = state.queue.count + state.deque.count;
  if (available === 0) return dispatchNext();
  const batchSize = Math.min(3, available);
  const dispatchIds = [];
  for (let index = 0; index < batchSize; index += 1) {
    dispatchIds[index] = dispatchNext(true).id;
  }
  renderAll();
  notify(`Batch complete: ${batchSize} ${batchSize === 1 ? "order" : "orders"} dispatched (${dispatchIds.join(", ")}). Priority Deque checked before each dispatch.`);
  animateLatestDispatch();
}

function animateLatestDispatch() {
  const panel = document.querySelector(".latest-panel");
  panel.classList.remove("animate-dispatch");
  requestAnimationFrame(() => panel.classList.add("animate-dispatch"));
}

function handleOrderSubmit(event) {
  event.preventDefault();
  const form = byId("orderForm");
  const customer = byId("customer").value.trim();
  const restaurant = byId("restaurant").value.trim();
  for (const [id, value] of [["customer", customer], ["restaurant", restaurant]]) {
    if (!value) {
      byId(id).setCustomValidity(`Enter a ${id === "customer" ? "customer name" : "restaurant name"}.`);
      byId(id).reportValidity();
      return;
    }
  }
  if (!form.reportValidity()) return;
  const source = event.submitter?.dataset.lane || "regular";
  const target = source === "regular" ? state.queue : state.deque;
  if (target.isFull()) {
    logOperation("FULL", `${source === "regular" ? "Circular Queue (8/8)" : "Priority Deque (6/6)"} · insertion rejected; ${customer} was not added`);
    renderAll();
    notify(`${source === "regular" ? "Circular Queue is full (8/8)." : "Priority Deque is full (6/6)."} Remove or dispatch an order to free a slot.`, "error");
    return;
  }
  const order = createOrder(customer, restaurant, byId("zone").value, Number(byId("amount").value), source);
  if (source === "regular") enqueue(order);
  else if (source === "urgent") addDequeFront(order);
  else addDequeRear(order);
  renderAll();
  notify(`${order.id} · ${customer} added to ${source === "regular" ? `CQ[${state.queue.rear}]${state.rearWrapped ? " — rear wrapped to slot 0" : ""}` : source === "urgent" ? "the Deque front; next in priority" : "the Deque rear"}.`, source === "regular" ? "success" : "priority");
  form.reset();
  byId("customer").focus({ preventScroll: true });
}

function handleDequeRemoval(end) {
  const order = end === "front" ? removeDequeFront() : removeDequeRear();
  if (!order) logOperation("EMPTY", `Cannot remove ${end}: Priority Deque is empty`);
  renderAll();
  notify(order ? `${order.customer} removed from the Deque ${end}. This is a removal only; no delivery was dispatched.` : `Priority Deque is empty. There is no ${end} order to remove.`, order ? "priority" : "error");
}

function resetSimulation(showMessage = true) {
  state = createSimulationState();
  byId("orderForm").reset();
  byId("customer").setCustomValidity("");
  byId("restaurant").setCustomValidity("");
  renderAll();
  if (showMessage) notify("Simulation reset. Both lanes, metrics, driver cycle and operation trace are clear.");
}

function loadDemo() {
  resetSimulation(false);
  const regularOrders = [
    ["Anu", "Spice Route", "Central", 280],
    ["Nikhil", "Burger Lab", "North", 460],
    ["Maya", "Urban Bowl", "West", 350],
    ["Arjun", "Grill House", "South", 520],
    ["Sara", "Cafe Nine", "East", 210]
  ];
  for (const order of regularOrders) enqueue(createOrder(...order, "regular"));
  addDequeFront(createOrder("Meera", "Wok Street", "Central", 390, "urgent"));
  addDequeRear(createOrder("Joel", "Grill House", "North", 610, "priority"));
  renderAll();
  notify("Demo ready: 5 regular + 2 priority orders. Dispatch next to send Meera first. Loading demo starts a fresh session.");
  byId("dispatch").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderCircularQueue() {
  const queue = state.queue;
  const slots = [];
  const cells = [];
  for (let index = 0; index < queue.capacity; index += 1) {
    const order = queue.storage[index];
    const isFront = queue.front === index;
    const isRear = queue.rear === index;
    const classes = `${order ? " occupied" : ""}${isFront ? " is-front" : ""}${isRear ? " is-rear" : ""}`;
    const angle = (index * 45 - 90) * Math.PI / 180;
    const x = 50 + 37 * Math.cos(angle);
    const y = 50 + 39 * Math.sin(angle);
    const pointerLabels = `${isFront ? '<span class="slot-pointer">FRONT</span>' : ""}${isRear ? '<span class="slot-pointer rear">REAR</span>' : ""}`;
    slots[index] = `<div class="queue-slot${classes}" style="left:${x}%;top:${y}%" data-index="${index}" aria-label="Slot ${index}${isFront ? ", front" : ""}${isRear ? ", rear" : ""}${order ? `: ${escapeHtml(order.customer)}, ${escapeHtml(order.restaurant)}, ${escapeHtml(order.zone)}` : ": empty"}"><div class="slot-pointers">${pointerLabels}</div><div class="slot-top"><span class="slot-index">[${index}]</span>${order ? `<span class="slot-id">${order.id}</span>` : '<span class="slot-empty-mark" aria-hidden="true">·</span>'}</div>${order ? `<strong class="slot-customer" title="${escapeHtml(order.customer)}">${escapeHtml(order.customer)}</strong><span class="slot-restaurant" title="${escapeHtml(order.restaurant)}">${escapeHtml(order.restaurant)}</span><span class="slot-zone">${escapeHtml(order.zone)}</span>` : '<span class="slot-empty">AVAILABLE</span>'}</div>`;
    cells[index] = `<span class="memory-cell${classes}" aria-label="Index ${index}: ${order ? "occupied" : "available"}">${index}</span>`;
  }
  byId("queueSlots").innerHTML = slots.join("");
  byId("memoryStrip").innerHTML = cells.join("");
  byId("queueCount").textContent = queue.count;
  const status = queue.isEmpty() ? "EMPTY" : queue.isFull() ? "FULL" : "ACTIVE";
  byId("queueState").textContent = status;
  byId("queueState").dataset.state = status.toLowerCase();
  byId("frontIndex").textContent = queue.front;
  byId("rearIndex").textContent = queue.rear;
  byId("queueCenterCaption").textContent = queue.isEmpty() ? "Awaiting orders" : `${queue.count} / 8 orders`;
  byId("queueTransition").textContent = state.queueTransition;
  document.querySelector(".algorithm-readout").dataset.wrapped = String(state.rearWrapped);
}

function renderDeque() {
  const orders = state.deque.display();
  byId("dequeCount").textContent = state.deque.count;
  byId("dequeAvailable").textContent = state.deque.isFull() ? "DEQUE FULL" : `${state.deque.capacity - state.deque.count} SLOTS AVAILABLE`;
  byId("dequeOrders").innerHTML = orders.length === 0
    ? '<div class="deque-empty"><span aria-hidden="true">⇅</span><strong>Priority lane is clear.</strong><p>Urgent at the front. Special at the rear.</p></div>'
    : orders.map((order, index) => `<div class="deque-order"><span class="deque-order-position">${pad(index + 1)}</span><div class="deque-order-details"><div class="deque-order-top"><strong class="deque-customer" title="${escapeHtml(order.customer)}">${escapeHtml(order.customer)}</strong><span class="priority-type">${order.source === "urgent" ? "URGENT FRONT" : "PRIORITY REAR"}</span></div><div class="deque-order-bottom"><span>${escapeHtml(order.zone)}</span><span>${formatMoney(order.amountPaise)}</span></div></div></div>`).join("");
}

function renderMetrics() {
  const waiting = state.queue.count + state.deque.count;
  const totalCapacity = state.queue.capacity + state.deque.capacity;
  const load = Math.round((waiting / totalCapacity) * 100);
  byId("dispatchedMetric").textContent = pad(state.dispatched);
  byId("operationsMetric").textContent = pad(state.queueOps);
  byId("revenueMetric").textContent = formatMoney(state.revenuePaise);
  byId("waitingMetric").textContent = `${waiting} / ${totalCapacity}`;
  byId("loadMetric").innerHTML = `${load}<span class="percent">%</span>`;
  byId("loadBar").style.width = `${load}%`;
}

function renderLatestDispatch() {
  const dispatch = state.latestDispatch;
  byId("latestDispatchId").textContent = dispatch?.id || "D-000";
  if (!dispatch) {
    byId("latestDispatch").innerHTML = '<div class="empty-dispatch"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M5 12h19v17H5zM24 18h6l5 6v5H24M8 8h11M2 19h9"/><circle cx="12" cy="30" r="3"/><circle cx="29" cy="30" r="3"/></svg><strong>Ready when you are.</strong><p>Dispatch an order to see its rider, route and ETA here.</p></div>';
    return;
  }
  const order = dispatch.order;
  byId("latestDispatch").innerHTML = `<div class="dispatch-customer">${escapeHtml(order.customer)}</div><div class="dispatch-restaurant">${escapeHtml(order.restaurant)}</div><div class="dispatch-detail-row"><span>Delivery zone</span><strong>${escapeHtml(order.zone)}</strong></div><div class="dispatch-detail-row"><span>Order amount</span><strong>${formatMoney(order.amountPaise)}</strong></div><span class="source-badge${order.source === "regular" ? " regular" : ""}">${SOURCE_LABELS[order.source]}</span><div class="rider-card"><span class="rider-avatar" aria-hidden="true">${dispatch.driver.split(" ")[1]}</span><div><strong>${dispatch.driver}</strong><span class="tiny-label">ASSIGNED DRIVER</span></div><div class="eta"><strong>${dispatch.eta}<span> min</span></strong><span class="tiny-label">ESTIMATED ARRIVAL</span></div></div>`;
}

function renderOperationLog() {
  byId("traceCounter").textContent = `${state.logs.length} ${state.logs.length === 1 ? "EVENT" : "EVENTS"}`;
  const typeClass = (type) => type === "DISPATCH" ? "dispatch" : ["FULL", "EMPTY"].includes(type) ? "warning" : type.startsWith("ADD_") ? "priority" : type.startsWith("REMOVE_") || type === "DEQUEUE" ? "removal" : "";
  byId("operationLog").innerHTML = state.logs.length === 0
    ? '<li class="log-empty">Awaiting operations. Your first order starts the trace.</li>'
    : state.logs.map((entry) => `<li class="log-entry"><time class="log-time">${entry.timestamp}</time><span class="log-type ${typeClass(entry.type)}">${entry.type}</span><span class="log-detail">${escapeHtml(entry.detail)}</span></li>`).join("");
  byId("operationLog").scrollTop = 0;
}

function renderAll() {
  renderCircularQueue();
  renderDeque();
  renderMetrics();
  renderLatestDispatch();
  renderOperationLog();
}

function clearLog() {
  state.logs = [];
  renderOperationLog();
  notify("Operation trace cleared. Queue contents and session metrics are unchanged.");
}

function updateClock() {
  const now = new Date();
  byId("sessionClock").textContent = `${now.toISOString().slice(11, 19)} UTC`;
  byId("sessionClock").dateTime = now.toISOString();
}

function initializeApp() {
  byId("orderForm").addEventListener("submit", handleOrderSubmit);
  for (const id of ["customer", "restaurant"]) byId(id).addEventListener("input", () => byId(id).setCustomValidity(""));
  const actions = {
    demo: loadDemo,
    dispatch: () => dispatchNext(),
    batch: dispatchBatch,
    reset: () => resetSimulation(),
    "remove-front": () => handleDequeRemoval("front"),
    "remove-rear": () => handleDequeRemoval("rear"),
    "clear-log": clearLog
  };
  document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", actions[button.dataset.action]));
  const navigationLinks = document.querySelectorAll(".nav-link");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) navigationLinks.forEach((link) => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
      }
    }, { rootMargin: "-12% 0px -60% 0px", threshold: 0 });
    for (const id of ["dispatch", "dsa-logic", "about"]) observer.observe(byId(id));
  }
  renderAll();
  updateClock();
  window.setInterval(updateClock, 1000);
  // A detached snapshot makes inspection useful during a viva without exposing live state.
  window.DashFlow = Object.freeze({
    CircularOrderQueue,
    PriorityOrderDeque,
    getState: () => JSON.parse(JSON.stringify(state))
  });
}

if (typeof document !== "undefined") initializeApp();
// The model can also be tested with Node, with no DOM or third-party packages.
if (typeof module !== "undefined" && module.exports) module.exports = { CircularOrderQueue, PriorityOrderDeque };
