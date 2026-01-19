# 🏥 Health Check Endpoints

All API routes now have health check endpoints similar to the main `/api/health` endpoint.

## 📋 Available Health Endpoints

### Main Health Endpoints
- **`GET /api/health`** - Main API health check
- **`GET /api/db-health`** - Database health check
- **`GET /api/users/count`** - User count (example safe query)

### Route-Specific Health Endpoints

All routes now have their own health check endpoint:

1. **Auth Routes**
   - `GET /api/auth/health`
   - Returns: `{ status: "ok", route: "auth", time: "..." }`

2. **Books Routes**
   - `GET /api/books/health`
   - Returns: `{ status: "ok", route: "books", time: "..." }`

3. **Trees Routes**
   - `GET /api/trees/health`
   - Returns: `{ status: "ok", route: "trees", time: "..." }`

4. **Users Routes**
   - `GET /api/users/health`
   - Returns: `{ status: "ok", route: "users", time: "..." }`

5. **Gallery Routes**
   - `GET /api/gallery/health`
   - Returns: `{ status: "ok", route: "gallery", time: "..." }`

6. **Persons Routes**
   - `GET /api/persons/health`
   - Returns: `{ status: "ok", route: "persons", time: "..." }`

7. **Contact Routes**
   - `GET /api/contact/health`
   - Returns: `{ status: "ok", route: "contact", time: "..." }`

8. **Newsletter Routes**
   - `GET /api/newsletter/health`
   - Returns: `{ status: "ok", route: "newsletter", time: "..." }`

9. **Search Routes**
   - `GET /api/search/health`
   - Returns: `{ status: "ok", route: "search", time: "..." }`

10. **Settings Routes**
    - `GET /api/settings/health`
    - Returns: `{ status: "ok", route: "settings", time: "..." }`

11. **Stats Routes**
    - `GET /api/stats/health`
    - Returns: `{ status: "ok", route: "stats", time: "..." }`

12. **Activity Routes**
    - `GET /api/activity/health`
    - Returns: `{ status: "ok", route: "activity", time: "..." }`

13. **Roles Routes**
    - `GET /api/roles/health`
    - Returns: `{ status: "ok", route: "roles", time: "..." }`

14. **Diagnostics Routes**
    - `GET /api/diagnostics/health`
    - Returns: `{ status: "ok", route: "diagnostics", time: "..." }`

15. **Health Routes (Enhanced)**
    - `GET /api/health`
    - Returns: `{ status: "ok", route: "health", time: "...", node: "...", env: "..." }`

## 🔍 Usage

### Test All Health Endpoints

You can test all health endpoints using curl:

```bash
# Main health
curl http://localhost:5000/api/health

# Database health
curl http://localhost:5000/api/db-health

# Route-specific health checks
curl http://localhost:5000/api/auth/health
curl http://localhost:5000/api/books/health
curl http://localhost:5000/api/trees/health
curl http://localhost:5000/api/users/health
curl http://localhost:5000/api/gallery/health
curl http://localhost:5000/api/persons/health
curl http://localhost:5000/api/contact/health
curl http://localhost:5000/api/newsletter/health
curl http://localhost:5000/api/search/health
curl http://localhost:5000/api/settings/health
curl http://localhost:5000/api/stats/health
curl http://localhost:5000/api/activity/health
curl http://localhost:5000/api/roles/health
curl http://localhost:5000/api/diagnostics/health
```

### Expected Response Format

All health endpoints return a JSON response with the following format:

```json
{
  "status": "ok",
  "route": "route-name",
  "time": "2026-01-19T12:00:00.000Z"
}
```

The main `/api/health` endpoint includes additional information:

```json
{
  "status": "ok",
  "route": "health",
  "time": "2026-01-19T12:00:00.000Z",
  "node": "v18.17.0",
  "env": "development"
}
```

## ✅ Benefits

1. **Route Verification** - Quickly verify that each route module is loaded and working
2. **Monitoring** - Use health endpoints for monitoring and alerting
3. **Debugging** - Isolate issues to specific route modules
4. **Load Balancing** - Health checks can be used for load balancer health checks
5. **Consistency** - All routes follow the same health check pattern

## 📝 Notes

- All health endpoints are **public** (no authentication required)
- Health endpoints are **lightweight** (no database queries, minimal processing)
- Health endpoints return **immediately** (no blocking operations)
- Health endpoints are placed **at the beginning** of each route file for easy access
