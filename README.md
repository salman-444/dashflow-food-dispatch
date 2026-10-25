# DashFlow — Smart Food Delivery Dispatch System

DashFlow is a frontend DSA mini-project that demonstrates the practical use of **Circular Queue** and **Deque** in a food-delivery dispatch system.

The project is built with plain **HTML, CSS, and JavaScript** so it can be uploaded directly to GitHub and deployed using GitHub Pages without installing packages.

## Project idea

### Regular orders — Circular Queue
Normal delivery orders are stored in a Circular Queue.

- New regular orders are inserted at the rear.
- Drivers receive orders from the front.
- Empty array positions are reused through wrap-around.
- This demonstrates FIFO behavior.

Core formula:

```text
rear = (rear + 1) % capacity
```

### Priority orders — Deque
Urgent and special orders are stored in a Deque.

- `addFront()` — urgent or reassigned order
- `addRear()` — lower-priority special order
- `removeFront()` — dispatch highest-priority order
- `removeRear()` — remove an order from the rear when required

During dispatch, DashFlow checks the priority Deque first. If it is empty, the next order comes from the Circular Queue.

## Features

- Interactive Circular Queue visualization
- Live `front` and `rear` indicators
- Circular wrap-around behavior
- Priority Deque with front and rear insertion
- Remove from both ends of the Deque
- Dispatch one order
- Batch dispatch up to three orders
- Latest driver assignment
- Live dispatched/order-operation/revenue/load counters
- DSA operation trace for viva/demo
- Demo data button
- Responsive desktop and mobile layout
- No external libraries or frameworks

## Files

```text
DashFlow/
├── index.html
├── styles.css
├── script.js
├── README.md
└── .nojekyll
```

## Run locally

Open `index.html` in a browser. You can also use VS Code Live Server.

## Upload to GitHub

1. Create a new GitHub repository.
2. Upload **all files from this ZIP to the repository root**.
3. Commit the files.

Do not put `index.html` inside another folder if you want the simplest GitHub Pages setup.

## Deploy with GitHub Pages

1. Open the GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main` (or the branch containing the files).
5. Select `/ (root)`.
6. Click **Save**.

The website will normally be available at:

```text
https://USERNAME.github.io/REPOSITORY-NAME/
```

## Suggested Java implementation

Use two classes:

```text
CircularOrderQueue
PriorityOrderDeque
```

### CircularOrderQueue

```text
enqueue()
dequeue()
isFull()
isEmpty()
display()
```

### PriorityOrderDeque

```text
addFront()
addRear()
removeFront()
removeRear()
isFull()
isEmpty()
display()
```

The webpage is a visual simulation of the same DSA logic.

## Viva explanation

> DashFlow is a Smart Food Delivery Dispatch System. Regular orders are stored in a Circular Queue because they follow FIFO order and array positions can be reused using wrap-around. Urgent and special orders are stored in a Deque because a Deque allows insertion and deletion from both the front and rear. During dispatch, priority orders are handled first, followed by regular orders.

## Technologies

- HTML5
- CSS3
- JavaScript
- Circular Queue
- Deque

## Notes

This repository contains only the frontend simulation. It does not require a backend, database, API key, npm, or any package installation.
