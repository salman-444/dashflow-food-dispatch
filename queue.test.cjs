"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { CircularOrderQueue, PriorityOrderDeque } = require("../script.js");

test("both structures reject invalid capacities", () => {
  for (const Queue of [CircularOrderQueue, PriorityOrderDeque]) {
    for (const capacity of [0, -1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1]) {
      assert.throws(() => new Queue(capacity), RangeError);
    }
  }
});

test("circular queue preserves FIFO order and reuses wrapped slots", () => {
  const queue = new CircularOrderQueue(3);
  assert.equal(queue.isEmpty(), true);
  assert.equal(queue.dequeue(), null);
  assert.equal(queue.enqueue("A"), true);
  assert.equal(queue.enqueue("B"), true);
  assert.equal(queue.enqueue("C"), true);
  assert.equal(queue.isFull(), true);
  assert.equal(queue.enqueue("D"), false);
  assert.equal(queue.dequeue(), "A");
  assert.equal(queue.enqueue("D"), true);
  assert.deepEqual(queue.display(), ["B", "C", "D"]);
  assert.equal(queue.dequeue(), "B");
  assert.equal(queue.dequeue(), "C");
  assert.equal(queue.dequeue(), "D");
  assert.equal(queue.front, -1);
  assert.equal(queue.rear, -1);
  assert.deepEqual(queue.storage, [null, null, null]);
});

test("deque supports insertion and removal at both ends across wrap-around", () => {
  const deque = new PriorityOrderDeque(4);
  assert.equal(deque.removeFront(), null);
  assert.equal(deque.addRear("B"), true);
  assert.equal(deque.addFront("A"), true);
  assert.equal(deque.addRear("C"), true);
  assert.equal(deque.removeRear(), "C");
  assert.equal(deque.addFront("Z"), true);
  assert.deepEqual(deque.display(), ["Z", "A", "B"]);
  assert.equal(deque.removeRear(), "B");
  assert.equal(deque.removeFront(), "Z");
  assert.equal(deque.removeFront(), "A");
  assert.equal(deque.front, -1);
  assert.equal(deque.rear, -1);
  assert.deepEqual(deque.storage, [null, null, null, null]);
});

test("deque enforces fixed capacity and resets after a single-item removal", () => {
  const deque = new PriorityOrderDeque(2);
  assert.equal(deque.addFront("A"), true);
  assert.equal(deque.addRear("B"), true);
  assert.equal(deque.addRear("C"), false);
  assert.equal(deque.removeRear(), "B");
  assert.equal(deque.removeRear(), "A");
  assert.equal(deque.isEmpty(), true);
  assert.equal(deque.addRear("D"), true);
  assert.deepEqual(deque.display(), ["D"]);
});
