const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

/** 后端地址前缀；图片等静态资源需要拼上它（同源时为 ""） */
export const apiOrigin = API_BASE;

export interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
}

export interface NoteMeta {
  path: string;
  name: string;
  title: string;
  date: string;
  tags: string[];
  slug?: string;
}

export interface Note extends NoteMeta {
  content: string;
}

export interface FeedbackItem {
  id: string;
  name: string;
  contact: string;
  category: string;
  content: string;
  createdAt: string;
}

export interface ImageItem {
  name: string;
  path: string;
  url: string;
  size: number;
  modTime: string;
}

export interface NotePayload {
  category: string;
  name: string;
  title: string;
  date: string;
  tags: string[];
  slug: string;
  content: string;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}/api/admin${path}`, {
    credentials: "include",
    ...init,
    headers,
  }).catch(() => {
    throw new ApiError(0, "无法连接后端服务，请确认 Go 服务已启动");
  });

  if (!res.ok) {
    let message = `请求失败（HTTP ${res.status}）`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* 非 JSON 错误，保留默认文案 */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function query(params: Record<string, string>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "") search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const adminApi = {
  login(username: string, password: string) {
    return request<{ username: string; auth_disabled?: boolean }>("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },
  logout() {
    return request<{ status: string }>("/logout", { method: "POST" });
  },
  me() {
    return request<{ username: string; auth_disabled?: boolean }>("/me");
  },

  tree(kind: "notes" | "images") {
    return request<{ tree: TreeNode[] }>(`/tree${query({ kind })}`);
  },
  createCategory(kind: string, parent: string, name: string) {
    return request<TreeNode>("/categories", {
      method: "POST",
      body: JSON.stringify({ kind, parent, name }),
    });
  },
  renameCategory(kind: string, path: string, name: string) {
    return request<TreeNode>("/categories", {
      method: "PATCH",
      body: JSON.stringify({ kind, path, name }),
    });
  },
  deleteCategory(kind: string, path: string) {
    return request<{ status: string }>(`/categories${query({ kind, path })}`, {
      method: "DELETE",
    });
  },

  listNotes(category: string) {
    return request<{ notes: NoteMeta[] }>(`/notes${query({ category })}`);
  },
  getNote(path: string) {
    return request<Note>(`/note${query({ path })}`);
  },
  createNote(payload: NotePayload) {
    return request<Note>("/notes", { method: "POST", body: JSON.stringify(payload) });
  },
  updateNote(path: string, payload: NotePayload) {
    return request<Note>(`/note${query({ path })}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteNote(path: string) {
    return request<{ status: string }>(`/note${query({ path })}`, { method: "DELETE" });
  },

  listImages(category: string) {
    return request<{ images: ImageItem[] }>(`/images${query({ category })}`);
  },
  uploadImages(category: string, files: File[]) {
    const body = new FormData();
    files.forEach((file) => body.append("files", file));
    return request<{ images: ImageItem[] }>(`/images${query({ category })}`, {
      method: "POST",
      body,
    });
  },
  deleteImage(path: string) {
    return request<{ status: string }>(`/image${query({ path })}`, { method: "DELETE" });
  },

  listFeedback() {
    return request<{ feedback: FeedbackItem[] }>("/feedback");
  },
  deleteFeedback(id: string) {
    return request<{ status: string }>(`/feedback${query({ id })}`, { method: "DELETE" });
  },
};

/** 公开接口：意见反馈不需要登录 */
export async function submitFeedback(payload: {
  name: string;
  contact: string;
  category: string;
  content: string;
}) {
  const res = await fetch(`${API_BASE}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    throw new ApiError(0, "无法连接服务器，请稍后再试");
  });

  if (!res.ok) {
    let message = `提交失败（HTTP ${res.status}）`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as { id: string };
}
