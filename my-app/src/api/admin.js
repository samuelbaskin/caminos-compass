const BASE_URL = process.env.REACT_APP_API_URL || "";

function headers() {
  const token = localStorage.getItem("cc_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleRes(res) {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      `Server returned non-JSON response (${res.status}). Is the backend running on port 5000?`
    );
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Request failed.");
  return data;
}

export async function listUsers() {
  const res = await fetch(`${BASE_URL}/api/admin/users`, { headers: headers() });
  return handleRes(res);
}

export async function createUser(data) {
  const res = await fetch(`${BASE_URL}/api/admin/users`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function updateUser(id, data) {
  const res = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function deleteUser(id) {
  const res = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  return handleRes(res);
}

export async function listAllCycles() {
  const res = await fetch(`${BASE_URL}/api/admin/cycles`, { headers: headers() });
  return handleRes(res);
}

export async function getCycleDetail(id) {
  const res = await fetch(`${BASE_URL}/api/admin/cycles/${id}`, { headers: headers() });
  return handleRes(res);
}

export async function listAllLessonPlans() {
  const res = await fetch(`${BASE_URL}/api/admin/lesson-plans`, { headers: headers() });
  return handleRes(res);
}

export async function listAllEvaluations() {
  const res = await fetch(`${BASE_URL}/api/admin/evaluations`, { headers: headers() });
  return handleRes(res);
}
