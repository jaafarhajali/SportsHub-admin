/**
 * Hand-written OpenAPI 3.0 spec for SportsHub.
 *
 * Kept in one place instead of scattered JSDoc annotations so the full API
 * surface is scannable. Update this when adding / removing routes.
 */

module.exports = {
  openapi: "3.0.3",
  info: {
    title: "SportsHub API",
    version: "1.0.0",
    description:
      "REST API for the SportsHub platform — stadium & academy booking, tournaments, teams, reviews, and AI features.",
  },
  servers: [
    { url: "http://localhost:8080/api", description: "Local dev" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string" },
          code: { type: "string" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
          hasNext: { type: "boolean" },
          hasPrev: { type: "boolean" },
        },
      },
      Stadium: {
        type: "object",
        properties: {
          _id: { type: "string" },
          ownerId: { type: "string" },
          name: { type: "string" },
          location: { type: "string" },
          description: { type: "string" },
          pricePerMatch: { type: "number" },
          maxPlayers: { type: "integer" },
          workingHours: {
            type: "object",
            properties: {
              start: { type: "string", example: "15:00" },
              end: { type: "string", example: "23:00" },
            },
          },
          penaltyPolicy: {
            type: "object",
            properties: {
              hoursBefore: { type: "integer" },
              penaltyAmount: { type: "number" },
            },
          },
        },
      },
      Review: {
        type: "object",
        properties: {
          _id: { type: "string" },
          stadium: { type: "string" },
          user: { type: "string" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AiSearchFilter: {
        type: "object",
        properties: {
          location: { type: "string", nullable: true },
          priceMin: { type: "number", nullable: true },
          priceMax: { type: "number", nullable: true },
          minPlayers: { type: "integer", nullable: true },
          openAt: { type: "string", nullable: true, example: "19:00" },
          dayOfWeek: { type: "string", nullable: true },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        security: [],
        responses: {
          200: {
            description: "Service is up",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    db: { type: "string", example: "connected" },
                    uptime: { type: "number" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in with email + password",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "JWT issued" },
          401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Create a new user",
        security: [],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 201: { description: "Created" }, 400: { description: "Validation error" } },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request password reset email",
        security: [],
        responses: { 200: { description: "Reset email sent (if account exists)" } },
      },
    },
    "/stadiums": {
      get: {
        tags: ["Stadiums"],
        summary: "List stadiums (public listing)",
        responses: { 200: { description: "Array of stadiums" } },
      },
    },
    "/stadiums/{id}": {
      get: {
        tags: ["Stadiums"],
        summary: "Get stadium by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Stadium" }, 404: { description: "Not found" } },
      },
    },
    "/dashboard/stadiums": {
      get: {
        tags: ["Dashboard"],
        summary: "List stadiums (paginated, admin/owner)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
        ],
        responses: {
          200: {
            description: "Paginated list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    count: { type: "integer" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Stadium" } },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/dashboard/users": {
      get: {
        tags: ["Dashboard"],
        summary: "List users (paginated, admin only)",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: { 200: { description: "Paginated list" } },
      },
    },
    "/dashboard/bookings": {
      get: {
        tags: ["Dashboard"],
        summary: "List bookings (paginated, admin/owner)",
        responses: { 200: { description: "Paginated list" } },
      },
    },
    "/reviews/stadium/{stadiumId}": {
      get: {
        tags: ["Reviews"],
        summary: "List reviews for a stadium",
        security: [],
        parameters: [{ name: "stadiumId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Array of reviews" } },
      },
    },
    "/reviews": {
      post: {
        tags: ["Reviews"],
        summary: "Post a review for a stadium",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["stadiumId", "rating", "comment"],
                properties: {
                  stadiumId: { type: "string" },
                  rating: { type: "integer", minimum: 1, maximum: 5 },
                  comment: { type: "string", maxLength: 1000 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Review created", content: { "application/json": { schema: { $ref: "#/components/schemas/Review" } } } },
          409: { description: "Already reviewed this stadium" },
        },
      },
    },
    "/reviews/{id}": {
      delete: {
        tags: ["Reviews"],
        summary: "Delete own review",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" }, 403: { description: "Not owner" } },
      },
    },
    "/ai/search-stadiums": {
      post: {
        tags: ["AI"],
        summary: "Natural-language stadium search",
        description: "Converts a plain-English query into a MongoDB filter and returns matching stadiums.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["query"],
                properties: { query: { type: "string", example: "turf in luanda under 50k for 10+ players" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Matches",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    count: { type: "integer" },
                    parsed: { $ref: "#/components/schemas/AiSearchFilter" },
                    data: { type: "array", items: { $ref: "#/components/schemas/Stadium" } },
                  },
                },
              },
            },
          },
          429: { description: "Rate limit exceeded" },
          502: { description: "AI parsing failed" },
        },
      },
    },
    "/ai/generate-description": {
      post: {
        tags: ["AI"],
        summary: "Generate marketing description for a stadium or academy",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["type", "name", "location"],
                properties: {
                  type: { type: "string", enum: ["stadium", "academy"] },
                  name: { type: "string" },
                  location: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Generated description" } },
      },
    },
    "/ai/chat": {
      post: {
        tags: ["AI"],
        summary: "Booking assistant chatbot",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  messages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        role: { type: "string", enum: ["user", "assistant"] },
                        content: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Assistant reply" } },
      },
    },
    "/ai/generate-bracket": {
      post: {
        tags: ["AI"],
        summary: "Generate tournament bracket with AI-assigned schedule",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["tournamentId"],
                properties: { tournamentId: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { description: "Bracket with schedule" }, 400: { description: "Tournament needs ≥2 teams" } },
      },
    },
    "/ai/review-summary/{stadiumId}": {
      get: {
        tags: ["AI"],
        summary: "AI summary of a stadium's reviews (pros/cons/overall)",
        parameters: [{ name: "stadiumId", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Summary" } },
      },
    },
    "/ai/suggest-team-members": {
      post: {
        tags: ["AI"],
        summary: "Suggest complementary team members based on existing roster",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["teamId"],
                properties: { teamId: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { description: "Suggestions" } },
      },
    },
    "/users/me/skills": {
      get: {
        tags: ["Users"],
        summary: "Get my player skills",
        responses: { 200: { description: "Skills" } },
      },
      put: {
        tags: ["Users"],
        summary: "Update my player skills",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  position: { type: "string", enum: ["goalkeeper", "defender", "midfielder", "forward"] },
                  skillLevel: { type: "integer", minimum: 1, maximum: 10 },
                  preferredFoot: { type: "string", enum: ["left", "right", "both"] },
                  bio: { type: "string", maxLength: 300 },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Updated skills" } },
      },
    },
  },
};
