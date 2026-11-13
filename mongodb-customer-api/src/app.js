import express from 'express';
import mongoose from 'mongoose';
import { Customer } from './customer.js';

export const app = express();
app.use(express.json({ limit: '16kb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.post('/api/customers', async (req, res, next) => {
  try {
    const { name, email, age } = req.body ?? {};
    const customer = await Customer.create({ name, email, age });
    res.status(201).location('/api/customers/' + customer.id).json(customer);
  } catch (error) { next(error); }
});

app.get('/api/customers', async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100)
      return res.status(400).json({ error: 'page must be >= 1 and limit must be 1..100' });
    const filter = {};
    if (req.query.email) filter.email = String(req.query.email).trim().toLowerCase();
    const [data, total] = await Promise.all([
      Customer.find(filter).sort({ _id: 1 }).skip((page - 1) * limit).limit(limit),
      Customer.countDocuments(filter)
    ]);
    res.json({ data, page, limit, total });
  } catch (error) { next(error); }
});

app.get('/api/customers/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid customer ID' });
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) { next(error); }
});

app.patch('/api/customers/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid customer ID' });
    const allowed = ['name', 'email', 'age'];
    if (!req.body || Object.keys(req.body).length === 0 || Object.keys(req.body).some(k => !allowed.includes(k)))
      return res.status(400).json({ error: 'Provide name, email or age only' });
    const customer = await Customer.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) { next(error); }
});

app.delete('/api/customers/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid customer ID' });
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  if (error?.code === 11000) return res.status(409).json({ error: 'Email already exists' });
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError)
    return res.status(400).json({ error: error.message });
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'Invalid JSON' });
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});
