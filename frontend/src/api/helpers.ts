import { api } from "./client";

/** Normalize tree from API (snake_case → camelCase, add hasGedcom, gedcomUrl, owner) */
export const normalizeTree = (tree, options?: { apiRoot?: string; isPublic?: boolean }) => {
  if (!tree) return tree;
  const baseUrl = options?.apiRoot ?? "";
  const isPublic = options?.isPublic ?? (tree.is_public ?? tree.isPublic ?? false);
  const ownerRaw = tree.owner ?? tree.owner_name ?? "";
  const owner =
    ownerRaw && typeof ownerRaw === "object"
      ? ownerRaw.full_name ?? ownerRaw.fullName ?? ownerRaw.email ?? ""
      : ownerRaw ?? "";
  const hasGedcom = !!(tree.gedcom_path ?? tree.gedcomPath);
  const gedcomPath = hasGedcom
    ? (isPublic ? `/api/trees/${tree.id}/gedcom` : `/api/my/trees/${tree.id}/gedcom`)
    : null;
  const gedcomUrl = gedcomPath ? (baseUrl ? `${baseUrl}${gedcomPath}` : gedcomPath) : null;
  return {
    ...tree,
    id: tree.id,
    title: tree.title ?? "",
    description: tree.description ?? "",
    archiveSource: tree.archive_source ?? tree.archiveSource ?? "",
    documentCode: tree.document_code ?? tree.documentCode ?? "",
    isPublic: !!isPublic,
    hasGedcom,
    gedcomUrl,
    owner,
    createdAt: tree.created_at ?? tree.createdAt,
  };
};

export const getApiRoot = () => {
  const base = String(api.defaults.baseURL || "");
  return base.replace(/\/api\/?$/, "");
};

export const shouldFallbackRoute = (error) => {
  const status = error?.response?.status;
  return status === 404 || status === 405 || status === 501;
};

export const requestWithFallback = async (requests, shouldFallback = shouldFallbackRoute) => {
  let lastError;
  for (const request of requests) {
    try {
      return await request();
    } catch (err) {
      lastError = err;
      if (!shouldFallback(err)) break;
    }
  }
  throw lastError;
};

export const getApiErrorMessage = (error, fallback = "Operation failed", overrides = {}) => {
  const status = error?.response?.status;
  const serverMessage =
    error?.response?.data?.message || error?.response?.data?.error;

  if (error?.code === "AUTH_MISSING") {
    return overrides.unauthorized || "Please log in to continue.";
  }
  if (status === 401) {
    return (
      overrides.unauthorized ||
      serverMessage ||
      "Session expired. Please log in again."
    );
  }
  if (status === 403) {
    return (
      overrides.forbidden ||
      serverMessage ||
      "You do not have permission to perform this action."
    );
  }
  if (status === 404) {
    return overrides.notFound || serverMessage || "Endpoint not found.";
  }
  if (status === 413) {
    return overrides.tooLarge || serverMessage || "File is too large.";
  }
  if (status === 415) {
    return overrides.unsupported || serverMessage || "Unsupported file type.";
  }
  if (status === 422) {
    return overrides.invalid || serverMessage || "Invalid data provided.";
  }
  if (status === 503) {
    return (
      overrides.unavailable ||
      serverMessage ||
      "Service unavailable. Please try again later."
    );
  }
  if (error?.code === "ERR_NETWORK") {
    return overrides.network || "Network error. Please try again.";
  }

  return serverMessage || fallback;
};
