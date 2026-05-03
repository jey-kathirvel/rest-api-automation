/**
 * REST API Automation Script — Login & Register
 * ==============================================
 * Runtime : Node.js 18+
 * Install : npm install axios
 * Run     : node api_automation.js
 */

const axios = require("axios");
const fs = require("fs");

// ─────────────────────────────────────────────
// CONFIGURATION — update these values
// ─────────────────────────────────────────────
const BASE_URL          = "https://your-api.com"; // <-- Change this
const REGISTER_ENDPOINT = `${BASE_URL}/api/auth/register`;
const LOGIN_ENDPOINT    = `${BASE_URL}/api/auth/login`;
const PROFILE_ENDPOINT  = `${BASE_URL}/api/auth/me`;

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// ─────────────────────────────────────────────
// LOGGER
// ─────────────────────────────────────────────
const logFile = fs.createWriteStream("api_test_results.log", { flags: "a" });

function log(level, message) {
  const line = `[${new Date().toISOString()}] [${level}] ${message}`;
  console.log(line);
  logFile.write(line + "\n");
}

function logResponse(label, status, data, duration) {
  log("INFO", "=".repeat(50));
  log("INFO", `  ${label}`);
  log("INFO", `  Status   : ${status}`);
  log("INFO", `  Duration : ${duration}ms`);
  log("INFO", `  Response : ${JSON.stringify(data, null, 2)}`);
  log("INFO", "=".repeat(50));
}


// ─────────────────────────────────────────────
// REGISTER NEW USER
// ─────────────────────────────────────────────
async function registerUser({ username, email, password, fullName = "", extraFields = {} }) {
  const payload = {
    username,
    email,
    password,
    full_name: fullName,
    ...extraFields,
  };

  log("INFO", `Registering user: ${email}`);
  const start = Date.now();

  try {
    const response = await axios.post(REGISTER_ENDPOINT, payload, {
      headers: DEFAULT_HEADERS,
      timeout: 30000,
      validateStatus: () => true, // Don't throw on non-2xx
    });

    const duration = Date.now() - start;
    logResponse("REGISTER USER", response.status, response.data, duration);

    if (response.status === 200 || response.status === 201) {
      log("INFO", `✅ Registration SUCCESSFUL for ${email}`);
      return { success: true, statusCode: response.status, data: response.data };
    } else {
      log("WARN", `❌ Registration FAILED — Status ${response.status}`);
      return { success: false, statusCode: response.status, data: response.data };
    }
  } catch (error) {
    log("ERROR", `❌ Register error: ${error.message}`);
    return { success: false, statusCode: null, data: { error: error.message } };
  }
}


// ─────────────────────────────────────────────
// LOGIN USER
// ─────────────────────────────────────────────
async function loginUser(email, password) {
  const payload = { email, password };

  log("INFO", `Logging in: ${email}`);
  const start = Date.now();

  try {
    const response = await axios.post(LOGIN_ENDPOINT, payload, {
      headers: DEFAULT_HEADERS,
      timeout: 30000,
      validateStatus: () => true,
    });

    const duration = Date.now() - start;
    logResponse("LOGIN USER", response.status, response.data, duration);

    if (response.status === 200) {
      const data = response.data;

      // Common token field names — adapt to your API
      const token =
        data.token ||
        data.access_token ||
        data.accessToken ||
        data.jwt ||
        data.data?.token ||
        null;

      log("INFO", `✅ Login SUCCESSFUL for ${email}`);
      if (token) log("INFO", `   Token: ${token.substring(0, 20)}...`);

      return { success: true, statusCode: response.status, token, data };
    } else {
      log("WARN", `❌ Login FAILED — Status ${response.status}`);
      return { success: false, statusCode: response.status, token: null, data: response.data };
    }
  } catch (error) {
    log("ERROR", `❌ Login error: ${error.message}`);
    return { success: false, statusCode: null, token: null, data: { error: error.message } };
  }
}


// ─────────────────────────────────────────────
// GET CURRENT USER (Authenticated Request)
// ─────────────────────────────────────────────
async function getCurrentUser(token) {
  log("INFO", "Fetching current user profile...");
  const start = Date.now();

  try {
    const response = await axios.get(PROFILE_ENDPOINT, {
      headers: {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000,
      validateStatus: () => true,
    });

    const duration = Date.now() - start;
    logResponse("GET CURRENT USER", response.status, response.data, duration);

    if (response.status === 200) {
      log("INFO", "✅ Profile fetch SUCCESSFUL");
      return { success: true, data: response.data };
    } else {
      log("WARN", `❌ Profile fetch FAILED — Status ${response.status}`);
      return { success: false, data: response.data };
    }
  } catch (error) {
    log("ERROR", `❌ Profile fetch error: ${error.message}`);
    return { success: false, data: { error: error.message } };
  }
}


// ─────────────────────────────────────────────
// FULL FLOW: Register → Login → Profile
// ─────────────────────────────────────────────
async function runFullFlow() {
  const timestamp = Date.now();
  const testEmail    = `testuser_${timestamp}@example.com`;
  const testPassword = "SecurePass@123";

  log("INFO", "\n🚀 Starting Full API Automation Flow\n");

  // ── Step 1: Register ──────────────────────
  log("INFO", "\n📝 STEP 1: Register new user");
  const registerResult = await registerUser({
    username:  `testuser_${timestamp}`,
    email:     testEmail,
    password:  testPassword,
    fullName:  "Test User",
    // extraFields: { phone: "9876543210", role: "user" }, // uncomment if needed
  });

  if (!registerResult.success) {
    log("WARN", "Registration failed — will still attempt login");
  }

  // ── Step 2: Login ─────────────────────────
  log("INFO", "\n🔐 STEP 2: Login with registered user");
  const loginResult = await loginUser(testEmail, testPassword);

  // ── Step 3: Authenticated request ─────────
  if (loginResult.success && loginResult.token) {
    log("INFO", "\n👤 STEP 3: Fetch user profile with token");
    await getCurrentUser(loginResult.token);
  } else {
    log("INFO", "⏭  Skipping Step 3 — no token available");
  }

  log("INFO", "\n✅ Full flow test complete. See api_test_results.log for details.\n");

  return {
    register: registerResult,
    login:    loginResult,
  };
}


// ─────────────────────────────────────────────
// INDIVIDUAL TEST EXAMPLES
// ─────────────────────────────────────────────
async function testRegisterOnly() {
  return await registerUser({
    username: "john_doe",
    email:    "john@example.com",
    password: "MyPassword@123",
    fullName: "John Doe",
  });
}

async function testLoginOnly() {
  return await loginUser("john@example.com", "MyPassword@123");
}


// ─────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────
(async () => {
  try {
    // Run the full Register → Login → Profile flow
    await runFullFlow();

    // Or test individually:
    // await testRegisterOnly();
    // await testLoginOnly();

  } catch (err) {
    log("ERROR", `Unhandled error: ${err.message}`);
    process.exit(1);
  }
})();
