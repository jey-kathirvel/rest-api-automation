# MongoDB Customer Management API

A small **portfolio learning project** demonstrating MongoDB/NoSQL, REST API development, validation, indexing, and automated API tests. This demo is intentionally independent of the other projects in this repository.

## Technology stack

- Node.js 20+ and Express
- MongoDB 7 (local Docker container)
- Mongoose ODM (document schema, validation, unique email index)
- Node built-in test runner and Supertest

## Architecture

```text
HTTP Client / Postman
        |
        v
Express REST API  (/api/customers)
        |
        v
Mongoose ODM (Customer schema, validation, indexes)
        |
        v
MongoDB (customers collection)
```

## Quick start

Requirements: Node.js 20+, npm, Docker with Compose.

```bash
cd mongodb-customer-api
docker compose up -d
cp .env.example .env
npm install
npm test
npm start
```

Open http://localhost:3000/health. The database URI is read from `.env`; **never commit production credentials**. Docker binds MongoDB to localhost only.

## API reference

| Method | Route | Description | Expected response |
| --- | --- | --- | --- |
| GET | /health | API/database status | 200 |
| POST | /api/customers | Create customer | 201, 400, 409 |
| GET | /api/customers | List/filter, paginate | 200, 400 |
| GET | /api/customers/:id | Get by MongoDB ObjectId | 200, 400, 404 |
| PATCH | /api/customers/:id | Update name/email/age | 200, 400, 404, 409 |
| DELETE | /api/customers/:id | Delete customer | 204, 400, 404 |

### Example CRUD workflow

```bash
curl -X POST http://localhost:3000/api/customers \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","age":36}'
# Copy the returned id as CUSTOMER_ID.

curl 'http://localhost:3000/api/customers?page=1&limit=10'
curl 'http://localhost:3000/api/customers?email=ada@example.com'
curl http://localhost:3000/api/customers/CUSTOMER_ID

curl -X PATCH http://localhost:3000/api/customers/CUSTOMER_ID \
  -H 'Content-Type: application/json' -d '{"age":37}'

curl -X DELETE http://localhost:3000/api/customers/CUSTOMER_ID
```

## MongoDB concepts demonstrated

1. **Documents and collections:** Customers are JSON-like BSON documents in the `customers` collection.
2. **Schema validation:** Mongoose enforces name, email format, and age bounds at the application layer.
3. **Indexes:** A unique email index supports efficient exact-email lookup and duplicate protection (HTTP 409).
4. **ObjectId:** Record routes validate MongoDB identifiers.
5. **CRUD:** Create, find, update and delete use Mongoose model methods.
6. **Query pagination:** `page` and `limit` control result size; list queries sort by `_id`.
7. **Timestamps:** `createdAt` and `updatedAt` are managed by Mongoose.

The demo uses a single MongoDB document per customer. It does **not** claim distributed transactions, sharding, replication, or production-grade authentication.

## Testing strategy

Run `npm test`. Automated tests use Supertest and mock Mongoose model methods, so they run without MongoDB. They cover health, create, pagination validation, ObjectId validation, update input validation, duplicate email, and not-found deletion.

For **real database integration testing**, run Docker + the API and execute the CRUD requests above. Verify:

- Inserted documents persist and returned IDs can be queried.
- Email uniqueness yields 409 after the unique index has been built.
- PATCH updates the intended fields only.
- DELETE removes the document; a repeated GET returns 404.
- Invalid name/email/age is rejected by Mongoose validation.
- Service startup fails clearly if MongoDB cannot connect.

## QA interview talking points

- REST API status codes and input/schema validation.
- SQL relational rows vs. MongoDB BSON documents.
- Unique-index behavior and duplicate test scenarios.
- Database consistency, negative tests, and pagination.
- Difference between unit/API route tests with mocked data and true MongoDB integration tests.

## Scope and security

This is a learning/portfolio demo, **not production-ready**. It has no user authentication, authorization, rate limiting, or deployment hardening. Do not expose it publicly with real customer data.

## Resume wording (after running and validating the project)

"Built a portfolio MongoDB Customer Management REST API using Node.js, Express, and Mongoose, implementing document CRUD, schema validation, unique indexing, pagination, and automated API testing."
