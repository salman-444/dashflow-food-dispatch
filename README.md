# DashFlow

**Smart Food Delivery Dispatch System Using Circular Queue and Deque**

DashFlow is a university DSA mini-project: a fully interactive, responsive dispatch control system built with HTML, CSS and vanilla JavaScript. It makes array storage, queue pointers, circular reuse and priority dispatch visible. No framework, build step, account or network service is required.

## Project overview

Food delivery orders enter one of two lanes. Regular orders wait in an 8-slot Circular Queue. Urgent and special orders wait in a 6-slot Deque. Dispatch always checks the Deque first, then falls back to the regular queue. A deterministic rider cycle and zone-based ETA complete the simulation.

The interface includes order intake, all eight physical queue slots, a priority lane, driver assignment, metrics, a timestamped operation trace and DSA explanations for presentation and viva use.

## Problem statement

A delivery service must process normal orders fairly while accommodating urgent, delayed or reassigned orders. A simple linear queue wastes freed array positions unless elements move. A FIFO-only lane also cannot place an urgent request ahead of waiting special orders. DashFlow demonstrates how a Circular Queue and Deque address these two problems with explicit, constant-time operations.

## Why a Circular Queue?

- Regular orders follow first in, first out (FIFO).
- The array has exactly 8 positions; it does not grow.
- `front` identifies the next order to leave; `rear` identifies the last inserted order.
- `count` distinguishes empty (`0`) and full (`8`) states.
- `rear = (rear + 1) % capacity` wraps the rear back to index 0.
- Removing clears the physical slot and advances the front with modulo.
- When the final order leaves, both pointers reset to `-1`.
- No `Array.shift()`, `unshift()`, `splice()` or queue library implements the algorithm.

## Why a Deque?

A double-ended queue allows urgent orders to enter the front and special, lower-priority orders to enter the rear. Either end can also be removed. DashFlow implements the Deque as a fixed circular array of 6 slots, with explicit `front`, `rear` and `count` fields. This avoids shifting elements and keeps each end operation O(1).

The Deque visualization displays its **logical front-to-rear order**. The Circular Queue visualization displays **physical array indexes**.

## Core operations

| Operation | Behavior | Time |
| --- | --- | --- |
| `enqueue()` | Add a regular order at the circular rear | O(1) |
| `dequeue()` | Remove the regular order at the circular front | O(1) |
| `addFront()` | Add an urgent order at the Deque front | O(1) |
| `addRear()` | Add a special order at the Deque rear | O(1) |
| `removeFront()` | Remove the Deque front | O(1) |
| `removeRear()` | Remove the Deque rear | O(1) |
| `isFull()` / `isEmpty()` | Check count against capacity / zero | O(1) |
| `display()` | Traverse logical order without changing storage | O(n) |

The DSA operations themselves are O(1). Rendering and logging are separate application work; drawing the interface traverses the visible slots and events.

The application functions `addDequeFront()`, `addDequeRear()`, `removeDequeFront()` and `removeDequeRear()` wrap the Deque methods to record successful operations. `dispatchNext()` and `dispatchBatch()` apply the priority rule.

```text
if the Deque is not empty:
    order = Deque.removeFront()
else if the Circular Queue is not empty:
    order = CircularQueue.dequeue()
else:
    display an empty-system message

assign order to the next rider
add the order amount to revenue
```

## Features

- Validated customer, restaurant, delivery zone and order amount inputs.
- Amounts from ₹0.01 to ₹100,000, with up to two decimal places.
- Permanently visible queue slots numbered 0–7.
- Cyan front pointer, orange rear pointer, lime occupied slots; both pointers appear when they share a slot.
- Live queue state: EMPTY, ACTIVE or FULL.
- Physical occupancy strip and the most recent pointer calculation.
- Clear wrap-around, full-lane and empty-lane feedback.
- Urgent front and priority rear insertion, plus removal from either end.
- Priority-aware dispatch of one or up to three orders.
- Latest dispatch card with dispatch ID, customer, restaurant, zone, amount, source, rider and ETA.
- Live dispatched count, queue operation count, revenue and system load.
- Newest-first UTC operation trace, capped at 48 events, with clear-log control.
- One-click demo and complete session reset.
- Responsive desktop, tablet and mobile layout; keyboard focus styles and reduced-motion support.
- No external fonts, images, libraries, APIs or CDNs.

### Metric definitions

- **Dispatched:** number of orders assigned to riders.
- **Queue ops:** successful insertions and removals across both data structures. A dispatch counts as one removal. Failed attempts do not increment this metric. Loading the demo produces 7 queue operations.
- **Revenue:** sum of dispatched order amounts, stored as integer paise to avoid floating-point accumulation errors. Removing a Deque order manually does not create a dispatch or revenue.
- **System load:** `round((Circular Queue count + Deque count) / 14 × 100)`. Seven waiting orders produce 50% load.

### Riders and ETAs

Riders cycle through **Rider A12 → Rider K07 → Rider M21 → Rider V04 → Rider S18**, then repeat. Resetting or loading demo data restarts this cycle and dispatch numbering at D-001.

| Zone | ETA |
| --- | --- |
| Central | 12 minutes |
| East | 16 minutes |
| North | 18 minutes |
| West | 20 minutes |
| South | 22 minutes |

## Technology stack

- Semantic HTML5
- Responsive CSS with Grid, Flexbox and custom properties
- Vanilla JavaScript, ES2015+ classes and explicit array algorithms
- GitHub Pages compatible static files

## Folder structure

```text
DashFlow/
├── index.html
├── styles.css
├── script.js
├── README.md
└── .nojekyll
```

The supplied ZIP contains these five files directly at its top level. Extract it into a folder named `DashFlow`.

## How to run locally

1. Extract the ZIP into a folder.
2. Open `index.html` in a modern browser.
3. Click **LOAD DEMO ORDERS**, or enter your own order and choose its lane.

Opening the HTML file directly works, including offline. An optional static server is also supported:

```bash
cd DashFlow
python3 -m http.server 8000
```

Open the address printed by Python in your browser. No package installation or build is needed. Avoid running a server from the entire home directory.

## Demo data

Loading demo data starts a fresh session, replacing existing orders, metrics and logs.

| Customer | Restaurant | Zone | Amount | Lane |
| --- | --- | --- | --- | --- |
| Anu | Spice Route | Central | ₹280 | Regular |
| Nikhil | Burger Lab | North | ₹460 | Regular |
| Maya | Urban Bowl | West | ₹350 | Regular |
| Arjun | Grill House | South | ₹520 | Regular |
| Sara | Cafe Nine | East | ₹210 | Regular |
| Meera | Wok Street | Central | ₹390 | Urgent front |
| Joel | Grill House | North | ₹610 | Priority rear |

Expected initial state: Circular Queue count **5**, front **0**, rear **4**; Deque count **2**; system load **50%**; revenue **₹0**.

The first batch dispatches **Meera, Joel, Anu**, in that order. It assigns A12, K07 and M21, produces **₹1,280** revenue, leaves 4 regular orders, and advances the queue front to **1**. Queue ops become **10**.

## Demonstration and verification checklist

1. Reset. Add one regular order: count 1, front 0, rear 0, both pointer labels on slot 0.
2. Add two more regular orders: rear becomes 2; front remains 0.
3. Dispatch once with the Deque empty: the first regular order leaves and front becomes 1.
4. Add five regular orders: rear becomes 7 and count becomes 7.
5. Add one more: rear wraps to 0, count becomes 8, and the queue shows FULL. Slot 0 is reused; front is still 1.
6. Try one more regular insertion: it is rejected, with state unchanged.
7. Reset. Add urgent A, priority B, urgent C: the Deque order is C, A, B.
8. Remove front: C leaves. Remove rear: B leaves. These actions do not dispatch orders.
9. Fill the Deque to 6; verify an extra insertion is rejected.
10. Load demo. Dispatch once: Meera leaves the Deque first, with Anu still in CQ[0].
11. Dispatch again: Joel leaves. Dispatch again: Anu leaves CQ[0].
12. Load demo again and dispatch up to 3: verify the batch values described above.
13. Use batch with 0, 1 or 2 orders: it safely handles the available amount.
14. Clear the log: events clear while orders and metrics remain.
15. Reset: both arrays clear, pointers become -1, all counters and revenue return to 0, logs clear, and the latest card returns to its placeholder.
16. Check at 1440, 1366, 768 and 390 pixels wide; all eight slots remain visible without page overflow.
17. Refresh: a new empty session loads. Check browser console for errors and verify CSS/JS load under a repository subpath.

For inspection during a viva, run `DashFlow.getState()` in the browser console. It returns a detached snapshot, including physical storage and pointers. `DashFlow.CircularOrderQueue` and `DashFlow.PriorityOrderDeque` expose the model classes for independent experiments.

For independent algorithm testing with Node.js, `script.js` also exports the two classes through CommonJS. Node is optional and is not required to use the app.

## How to upload to GitHub

1. Sign in to GitHub and create a repository with a name you choose.
2. Extract the ZIP. Upload **the contents** of `DashFlow`, including `.nojekyll`, to the repository root.
3. Confirm that `index.html`, `styles.css`, `script.js` and `README.md` are at the root, rather than inside another nested folder.
4. Commit the uploaded files. No repository or upload is created automatically by this project.

## How to deploy with GitHub Pages

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select your default branch (usually `main`) and the **/(root)** folder.
4. Save and wait for GitHub Pages to finish publishing.

Expected URL format:

```text
https://USERNAME.github.io/REPOSITORY/
```

Replace both placeholders with your real GitHub username and repository name. No fake repository URL is included. All CSS and script paths are relative, so project-site subpaths work. `.nojekyll` keeps this a plain static site.

## Sample viva explanation

“DashFlow simulates food delivery dispatch using two manually implemented data structures. Normal orders use a Circular Queue of capacity eight. I maintain a fixed array, front, rear and count. Enqueue advances the rear using `(rear + 1) % capacity`, which reuses free slots. Dequeue removes from the front, preserving FIFO.

“Urgent and special orders use a Deque of capacity six. Urgent orders enter at the front; lower-priority special orders enter at the rear. Both ends support removal. I implement this using another circular array, so every insert and remove is O(1).

“When dispatching, I check the Deque first. If it is empty, I take the Circular Queue front. Each dispatched order receives a rider and zone-based ETA. The interface shows pointer changes and a timestamped operation trace, so we can verify the algorithm visually.”

Possible follow-up: new urgent requests can postpone regular orders indefinitely. That is a tradeoff of strict priority dispatch. Aging or a maximum-priority-streak policy could address starvation in a future version; this project deliberately demonstrates the specified Deque-first rule.

## Suggested Java class structure

```java
class Order {
    String id, customer, restaurant, zone, source;
    long amountPaise;
}

class CircularOrderQueue {
    Order[] storage = new Order[8];
    int front = -1, rear = -1, count = 0;

    boolean enqueue(Order order) { /* full guard, modulo rear, insert */ }
    Order dequeue() { /* empty guard, clear front, modulo advance */ }
    boolean isFull() { return count == storage.length; }
    boolean isEmpty() { return count == 0; }
    void display() { /* traverse count slots from front using modulo */ }
}

class PriorityOrderDeque {
    Order[] storage = new Order[6];
    int front = -1, rear = -1, count = 0;

    boolean addFront(Order order) { /* (front - 1 + capacity) % capacity */ }
    boolean addRear(Order order) { /* (rear + 1) % capacity */ }
    Order removeFront() { /* clear, decrement count, advance or reset */ }
    Order removeRear() { /* clear, decrement count, retreat or reset */ }
    boolean isFull() { return count == storage.length; }
    boolean isEmpty() { return count == 0; }
    void display() { /* traverse logical front-to-rear order */ }
}

class DispatchService {
    CircularOrderQueue regularOrders;
    PriorityOrderDeque priorityOrders;
    // dispatchNext(): take Deque front first, otherwise regular queue front.
    // dispatchBatch(): repeat dispatchNext at most three times.
}
```

These declarations are an outline for discussion, not a compiled Java submission. Port the complete algorithms from the JavaScript classes into the indicated methods.

## Scope and limitations

This is a frontend simulation. Riders, ETAs and online status are simulated; no payment, restaurant, routing or delivery API is connected. Revenue is dispatched order value, not actual payment settlement. There is no login, backend or persistent storage. Refreshing starts an empty session. Latest dispatch shows the most recent delivery; earlier assignments remain in the bounded trace until cleared. Loading demo or resetting clears the current session immediately. A strict priority rule can starve regular orders under continuous urgent traffic.

The files are transferable and contain no student's personal information. Nothing is uploaded, pushed or deployed as part of the local project package.
