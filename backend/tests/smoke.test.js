/**
 * Smoke tests — verify the app boots and core pure utilities behave.
 * No DB connection required; anything that needs Mongo is mocked or skipped.
 */

// Prevent modules that read env at import time from exploding.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-not-for-production";
process.env.DATABASE = process.env.DATABASE || "mongodb://localhost:27017/test";
process.env.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || "x";
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

describe("utils/paginate", () => {
  const { getPagination, buildPagination } = require("../utils/paginate");

  test("defaults when no query params", () => {
    const req = { query: {} };
    const p = getPagination(req);
    expect(p.page).toBe(1);
    expect(p.limit).toBe(20);
    expect(p.skip).toBe(0);
  });

  test("clamps negative page to 1", () => {
    const req = { query: { page: "-5", limit: "10" } };
    expect(getPagination(req).page).toBe(1);
  });

  test("clamps limit to maxLimit", () => {
    const req = { query: { limit: "500" } };
    expect(getPagination(req, { maxLimit: 50 }).limit).toBe(50);
  });

  test("skip calculation", () => {
    const p = getPagination({ query: { page: "3", limit: "10" } });
    expect(p.skip).toBe(20);
  });

  test("buildPagination fields", () => {
    const meta = buildPagination(2, 10, 35);
    expect(meta).toEqual({
      page: 2,
      limit: 10,
      total: 35,
      totalPages: 4,
      hasNext: true,
      hasPrev: true,
    });
  });
});

describe("utils/logger", () => {
  const logger = require("../utils/logger");

  test("exposes the expected level methods", () => {
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });

  test("respects LOG_LEVEL=silent", () => {
    // LOG_LEVEL=silent is set at top of file; these should not throw.
    expect(() => logger.info("hidden")).not.toThrow();
    expect(() => logger.debug("hidden")).not.toThrow();
  });
});

describe("middlewares/uploadFactory", () => {
  const { createImageUploader } = require("../middlewares/uploadFactory");

  test("rejects disallowed extensions", () => {
    const uploader = createImageUploader({ subDir: "_test", filePrefix: "t" });
    const fileFilter = uploader.fileFilter;
    let err, accepted;
    fileFilter({}, { originalname: "shell.php", mimetype: "image/png" }, (e, ok) => {
      err = e;
      accepted = ok;
    });
    expect(err).toBeInstanceOf(Error);
    expect(accepted).toBeUndefined();
  });

  test("rejects disallowed MIME types", () => {
    const uploader = createImageUploader({ subDir: "_test", filePrefix: "t" });
    const fileFilter = uploader.fileFilter;
    let err, accepted;
    fileFilter({}, { originalname: "ok.jpg", mimetype: "application/x-php" }, (e, ok) => {
      err = e;
      accepted = ok;
    });
    expect(err).toBeInstanceOf(Error);
    expect(accepted).toBeUndefined();
  });

  test("accepts a valid image", () => {
    const uploader = createImageUploader({ subDir: "_test", filePrefix: "t" });
    const fileFilter = uploader.fileFilter;
    let err, accepted;
    fileFilter({}, { originalname: "photo.jpg", mimetype: "image/jpeg" }, (e, ok) => {
      err = e;
      accepted = ok;
    });
    expect(err).toBeNull();
    expect(accepted).toBe(true);
  });
});

describe("docs/openapi spec", () => {
  test("has basic OpenAPI shape and key paths", () => {
    const spec = require("../docs/openapi");
    expect(spec.openapi).toMatch(/^3\./);
    expect(spec.info.title).toBe("SportsHub API");
    expect(spec.paths["/health"]).toBeDefined();
    expect(spec.paths["/ai/search-stadiums"]).toBeDefined();
    expect(spec.paths["/reviews"]).toBeDefined();
  });
});

describe("GET /api/health", () => {
  const request = require("supertest");
  // mongoose connection state "disconnected" is fine for this smoke check
  const app = require("../app");

  test("returns 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.uptime).toBe("number");
    expect(typeof res.body.timestamp).toBe("string");
  });
});
