// scripts/test-appwrite.js
// Simple smoke test to validate Appwrite credentials and collection IDs.

// Prefer loading .env.local (used by Next.js) but fall back to .env if needed
require("dotenv").config({ path: ".env.local" });
const sdk = require("node-appwrite");

const {
  NEXT_PUBLIC_ENDPOINT: ENDPOINT,
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  APPOINTMENT_COLLECTION_ID,
} = process.env;

const missing = [];
if (!ENDPOINT) missing.push("NEXT_PUBLIC_ENDPOINT");
if (!PROJECT_ID) missing.push("PROJECT_ID");
if (!API_KEY) missing.push("API_KEY");
if (!DATABASE_ID) missing.push("DATABASE_ID");
if (!APPOINTMENT_COLLECTION_ID) missing.push("APPOINTMENT_COLLECTION_ID");

if (missing.length) {
  console.error("Missing required environment variables:", missing.join(", "));
  process.exit(1);
}

// Detect common placeholder patterns (angle brackets or strings starting with "your-")
const placeholderIssues = [];
const placeholders = {
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  APPOINTMENT_COLLECTION_ID,
};
for (const [k, v] of Object.entries(placeholders)) {
  if (!v) continue;
  if (
    String(v).includes("<") ||
    String(v).toLowerCase().startsWith("your-") ||
    String(v).toLowerCase().startsWith("<")
  ) {
    placeholderIssues.push(k);
  }
}

if (placeholderIssues.length) {
  console.error(
    "It looks like some environment variables still contain placeholder values (e.g. <...> or your-...):",
    placeholderIssues.join(", ")
  );
  console.error(
    "Please update `.env.local` and replace placeholders with the real IDs/keys from your Appwrite project."
  );
  process.exit(1);
}

const client = new sdk.Client();
client.setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);

const databases = new sdk.Databases(client);

(async () => {
  try {
    console.log("Connecting to Appwrite endpoint:", ENDPOINT);
    const res = await databases.listDocuments(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      []
    );
    console.log(
      "SUCCESS: connected to Appwrite and retrieved documents from collection."
    );
    console.log(
      "Result summary:",
      JSON.stringify({ total: res.total, limit: res.limit ?? null }, null, 2)
    );
    process.exit(0);
  } catch (err) {
    console.error("Appwrite request failed.");
    if (err && err.response) {
      try {
        console.error("Status:", err.response.status);
        console.error(
          "Body:",
          JSON.stringify(err.response.data || err.response, null, 2)
        );
      } catch (e) {
        console.error(err.response);
      }
    } else {
      console.error(err);
    }
    process.exit(2);
  }
})();
