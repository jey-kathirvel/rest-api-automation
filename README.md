# 🚀 REST API Automation — Login & Register

A lightweight JavaScript automation script to test **User Registration** and **Login** REST API endpoints using [Axios](https://axios-http.com/). Includes token extraction, authenticated requests, and detailed logging.

---

## 📁 Project Structure

```
rest-api-automation/
├── api_automation.js     # Main automation script
├── .env                  # Your API base URL (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)
- A running REST API with `/register` and `/login` endpoints

---

## 📦 Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/rest-api-automation.git
cd rest-api-automation

# 2. Install dependencies
npm install
```

---

## 🔧 Configuration

Open `api_automation.js` and update the base URL at the top of the file:

```js
const BASE_URL = "https://your-api.com"; // <-- Change this
```

| Variable            | Description                        | Example                        |
|---------------------|------------------------------------|--------------------------------|
| `BASE_URL`          | Your API's base URL                | `https://api.myapp.com`        |
| `REGISTER_ENDPOINT` | Register endpoint (auto-generated) | `BASE_URL/api/auth/register`   |
| `LOGIN_ENDPOINT`    | Login endpoint (auto-generated)    | `BASE_URL/api/auth/login`      |
| `PROFILE_ENDPOINT`  | Profile endpoint (auto-generated)  | `BASE_URL/api/auth/me`         |

---

## ▶️ Usage

### Run the Full Flow (Register → Login → Profile)

```bash
node api_automation.js
```

This will automatically:
1. 📝 Register a new test user
2. 🔐 Login with that user and extract the token
3. 👤 Fetch the user profile using the token

---

### Run Individual Functions

You can also call functions individually by editing the bottom of `api_automation.js`:

```js
// Register only
await testRegisterOnly();

// Login only
await testLoginOnly();
```

---

## 📋 API Endpoints Expected

### Register — `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "full_name": "John Doe"
}
```

**Success Response (`201 Created`):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "123",
    "email": "john@example.com"
  }
}
```

---

### Login — `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Success Response (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "john@example.com"
  }
}
```

> The script auto-detects token fields: `token`, `access_token`, `accessToken`, `jwt`, or `data.token`.

---

## 📊 Sample Output

```
[INFO] 📝 STEP 1: Register new user
[INFO] Registering user: testuser_1234567890@example.com
[INFO] ==================================================
[INFO]   REGISTER USER
[INFO]   Status   : 201
[INFO]   Duration : 320ms
[INFO]   Response : { "message": "User registered successfully" }
[INFO] ==================================================
[INFO] ✅ Registration SUCCESSFUL

[INFO] 🔐 STEP 2: Login with registered user
[INFO] Logging in: testuser_1234567890@example.com
[INFO] ✅ Login SUCCESSFUL
[INFO]    Token: eyJhbGciOiJIUzI1...

[INFO] 👤 STEP 3: Fetch user profile with token
[INFO] ✅ Profile fetch SUCCESSFUL

[INFO] ✅ Full flow test complete. See api_test_results.log for details.
```

---

## 📝 Logging

All results are logged to:
- **Console** — real-time output
- **`api_test_results.log`** — persistent log file (auto-created)

---

## 🛠️ Built With

- [Node.js](https://nodejs.org/) — JavaScript runtime
- [Axios](https://axios-http.com/) — HTTP client for API requests

---

## 🔒 Security Notes

- Never commit your `.env` file or hardcode real credentials
- Use environment variables for sensitive data in production
- The `.gitignore` already excludes `node_modules/`, `.env`, and log files

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).


