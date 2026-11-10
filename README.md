# Finance AI Backend

An Express 5 and MongoDB API for account authentication, private income and expense tracking, summaries, and AI-assisted budgeting observations.

## Features

- Email and password registration, login, and profile updates
- Password hashing with bcrypt and expiring JWT bearer tokens
- Transaction create, list, update, and delete operations scoped to the signed-in account
- MongoDB aggregation for income, expense, and net savings totals
- Optional Groq-generated budgeting observations from category-level totals
- Request size limits, Helmet security headers, configurable CORS, and endpoint rate limits
- JSON error responses without returning server stack traces

## Requirements

- Node.js 20 or newer
- npm
- MongoDB
- A Groq API key to use the optional AI endpoint

## Run locally

```sh
cp .env.example .env
npm install
```

Generate a signing key and put its output in `JWT_SECRET`:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set `MONGO_URI` to your MongoDB connection string. `GROQ_API_KEY` is optional unless you use AI advice. Start the API with:

```sh
npm run dev
```

For a normal process, use `npm start`. The API listens on port `5000` by default. `PORT` must be a TCP port number from 1 to 65535.

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | No | `5000` | HTTP TCP port |
| `MONGO_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | At least 32 bytes of random signing data |
| `JWT_EXPIRES_IN` | No | `7d` | JWT lifetime accepted by `jsonwebtoken` |
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated browser origins allowed to read API responses |
| `GROQ_API_KEY` | For AI | — | Groq API key; keep it on the server |
| `GROQ_MODEL` | No | `openai/gpt-oss-120b` | Groq chat-completion model ID |

The default Groq model is listed as a production model in the [Groq supported models guide](https://console.groq.com/docs/models). Check the [Groq deprecation guide](https://console.groq.com/docs/deprecations) before changing or deploying a model ID.

## API

Protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/users/register` | Public, rate limited | Create an account; body: `name`, `email`, `password`, optional `phone` |
| `POST` | `/api/users/login` | Public, rate limited | Sign in and receive a JWT |
| `GET` | `/api/users/me` | Bearer token | Read the current profile |
| `PUT` | `/api/users/profile` | Bearer token | Update `name`, `email`, `phone`, or `password` |
| `POST` | `/api/transactions` | Bearer token | Create an income or expense transaction |
| `GET` | `/api/transactions` | Bearer token | List the current account's transactions |
| `GET` | `/api/transactions/summary` | Bearer token | Return income, expense, and net savings totals |
| `PUT` | `/api/transactions/:id` | Bearer token, owner only | Update a transaction |
| `DELETE` | `/api/transactions/:id` | Bearer token, owner only | Delete one transaction |
| `DELETE` | `/api/transactions/clear` | Bearer token | Delete the current account's transactions |
| `POST` | `/api/ai-advice` | Bearer token, rate limited | Generate general budgeting observations; optional body: `{ "days": 30 }` |

Transaction amounts must be finite positive numbers. Types are `income` or `expense`; category names are limited to 80 characters and descriptions to 500 characters. AI date ranges must be whole numbers from 1 to 365.

## AI data and financial limitations

Calling `/api/ai-advice` sends aggregated transaction counts and totals grouped by type and category to Groq. It does not send account identifiers, transaction descriptions, or individual transaction records. Category labels and amounts are still private financial data, so only enable this feature when the account holder agrees to this processing. The API does not store the generated response.

AI output is general budgeting education. It is not financial, tax, or investment advice. The endpoint asks the model not to recommend investments or infer a currency; transaction amounts have no currency field in this API.

## Security notes

- Keep `.env` and `GROQ_API_KEY` out of source control.
- Use a unique random `JWT_SECRET` in each environment.
- Set `CORS_ORIGINS` to the exact deployed frontend origin or origins.
- Rate limits use the in-process default store; multi-instance deployments should configure a shared store.
- MongoDB queries always scope transaction access to the authenticated user.

## License

ISC. See the `license` field in `package.json`.
