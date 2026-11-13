import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { Customer } from '../src/customer.js';

test('GET /health reports API status', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('POST /api/customers creates a customer', async () => {
  const spy = mock.method(Customer, 'create', async payload => ({ id: '507f1f77bcf86cd799439011', ...payload }));
  try {
    const res = await request(app).post('/api/customers').send({ name: 'Ada Lovelace', email: 'ada@example.com' });
    assert.equal(res.status, 201);
    assert.equal(res.body.name, 'Ada Lovelace');
    assert.equal(res.headers.location, '/api/customers/507f1f77bcf86cd799439011');
  } finally { spy.mock.restore(); }
});

test('GET /api/customers rejects invalid pagination', async () => {
  const res = await request(app).get('/api/customers?limit=101');
  assert.equal(res.status, 400);
});

test('GET /api/customers/:id rejects invalid ObjectId', async () => {
  const res = await request(app).get('/api/customers/not-valid');
  assert.equal(res.status, 400);
});

test('PATCH /api/customers/:id rejects unknown fields', async () => {
  const res = await request(app).patch('/api/customers/507f1f77bcf86cd799439011').send({ role: 'admin' });
  assert.equal(res.status, 400);
});

test('POST /api/customers returns 409 for duplicate email', async () => {
  const spy = mock.method(Customer, 'create', async () => { const err = new Error('duplicate'); err.code = 11000; throw err; });
  try {
    const res = await request(app).post('/api/customers').send({ name: 'Ada Lovelace', email: 'ada@example.com' });
    assert.equal(res.status, 409);
  } finally { spy.mock.restore(); }
});

test('DELETE /api/customers/:id returns 404 for missing customer', async () => {
  const spy = mock.method(Customer, 'findByIdAndDelete', async () => null);
  try {
    const res = await request(app).delete('/api/customers/507f1f77bcf86cd799439011');
    assert.equal(res.status, 404);
  } finally { spy.mock.restore(); }
});
