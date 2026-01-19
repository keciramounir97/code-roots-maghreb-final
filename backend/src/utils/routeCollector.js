/**
 * Route Collector - Collects all registered routes for display
 * Passenger-safe: No database queries, just route inspection
 */

function collectRoutes(app) {
  const routes = [];

  // Helper to extract route info
  const extractRouteInfo = (layer) => {
    if (!layer || !layer.route) return null;

    const route = layer.route;
    const path = route.path;
    const methods = Object.keys(route.methods).filter((m) => m !== "_all");

    return methods.map((method) => ({
      method: method.toUpperCase(),
      path: path,
      fullPath: `/api${path}`,
    }));
  };

  // Recursively collect routes from app stack
  const collectFromStack = (stack, basePath = "") => {
    if (!Array.isArray(stack)) return;

    stack.forEach((layer) => {
      if (!layer) return;

      // Check if it's a route
      if (layer.route) {
        const routeInfo = extractRouteInfo(layer);
        if (routeInfo) {
          routes.push(...routeInfo);
        }
      }

      // Check if it's a router middleware
      if (layer.name === "router" && layer.handle && layer.handle.stack) {
        const routerPath = layer.regexp
          ? layer.regexp.toString().replace(/^\^|\$$/g, "").replace(/\\\//g, "/")
          : "";
        collectFromStack(layer.handle.stack, routerPath);
      }
    });
  };

  // Start collecting from app stack
  if (app && app._router && app._router.stack) {
    collectFromStack(app._router.stack);
  }

  // Remove duplicates and sort
  const uniqueRoutes = Array.from(
    new Map(routes.map((r) => [`${r.method}:${r.fullPath}`, r])).values()
  ).sort((a, b) => {
    if (a.path !== b.path) return a.path.localeCompare(b.path);
    return a.method.localeCompare(b.method);
  });

  return uniqueRoutes;
}

function formatRoutesForDisplay(routes, baseUrl = "http://localhost:5000") {
  if (!routes || routes.length === 0) {
    return ["  No routes found"];
  }

  // Group by path
  const grouped = {};
  routes.forEach((route) => {
    if (!grouped[route.path]) {
      grouped[route.path] = [];
    }
    grouped[route.path].push(route.method);
  });

  const lines = [];
  Object.keys(grouped)
    .sort()
    .forEach((path) => {
      const methods = grouped[path].sort().join(", ");
      const fullUrl = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
      lines.push(`  ${methods.padEnd(12)} ${fullUrl}`);
    });

  return lines;
}

module.exports = { collectRoutes, formatRoutesForDisplay };
