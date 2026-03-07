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

export async function listTeachers() {
  const res = await fetch(`${BASE_URL}/api/coaches/teachers`, { headers: headers() });
  return handleRes(res);
}

export async function getTeacherDetail(teacherId) {
  const res = await fetch(`${BASE_URL}/api/coaches/teachers/${teacherId}`, { headers: headers() });
  return handleRes(res);
}

export async function createEvaluation(data) {
  const res = await fetch(`${BASE_URL}/api/coaches/evaluations`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function listEvaluations() {
  const res = await fetch(`${BASE_URL}/api/coaches/evaluations`, { headers: headers() });
  return handleRes(res);
}
