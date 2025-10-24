const request = require("supertest");
const app = require("../app");

(async () => {
  try {
    const testUser = {
      email: `debug${Date.now()}@example.com`,
      password: "Test@1234",
      firstName: "Debug",
      lastName: "User",
      role: "RENTER",
    };

    console.log("Registering user:", testUser.email);
    const reg = await request(app).post("/api/auth/register").send(testUser);
    console.log("Register status:", reg.status);
    console.log("Register body:", JSON.stringify(reg.body, null, 2));

    console.log("Attempting login...");
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    console.log("Login status:", login.status);
    console.log("Login body:", JSON.stringify(login.body, null, 2));
  } catch (err) {
    console.error("Debug script error:", err);
  }
})();
