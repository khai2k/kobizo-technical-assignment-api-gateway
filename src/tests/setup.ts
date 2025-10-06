// Test setup file
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Set test environment
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.DIRECTUS_URL = "http://localhost:8055";
process.env.PORT = "0"; // Use random port for tests
