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

export async function listCycles() {
  const res = await fetch(`${BASE_URL}/api/cycles`, { headers: headers() });
  return handleRes(res);
}

export async function createCycle(name) {
  const res = await fetch(`${BASE_URL}/api/cycles`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ name }),
  });
  return handleRes(res);
}

export async function getCycle(id) {
  const res = await fetch(`${BASE_URL}/api/cycles/${id}`, { headers: headers() });
  return handleRes(res);
}

export async function getPaso(cycleId, pasoNum) {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/${pasoNum}`, { headers: headers() });
  return handleRes(res);
}

export async function savePaso(cycleId, pasoNum, data) {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/${pasoNum}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function getPaso2General(cycleId) {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/2/general`, { headers: headers() });
  return handleRes(res);
}

export async function savePaso2General(cycleId, data) {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/2/general`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function getPaso3General(cycleId) {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/3/general`, { headers: headers() });
  return handleRes(res);
}

export async function savePaso3General(cycleId, data) {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/3/general`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function getPaso4General(cycleId) {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/4/general`, { headers: headers() });
  return handleRes(res);
}

export async function savePaso4General(cycleId, data) {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/4/general`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function listStudents(cycleId) {
  const res = await fetch(`${BASE_URL}/api/students?cycleId=${cycleId}`, { headers: headers() });
  return handleRes(res);
}

export async function createStudent(data) {
  const res = await fetch(`${BASE_URL}/api/students`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function uploadWritingSample(studentId, text) {
  const res = await fetch(`${BASE_URL}/api/students/${studentId}/writing-sample`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ text }),
  });
  return handleRes(res);
}

export async function generateLessonPlan(teacherCycleId) {
  const res = await fetch(`${BASE_URL}/api/lesson-plans/generate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ teacherCycleId }),
  });
  return handleRes(res);
}

export async function listLessonPlans() {
  const res = await fetch(`${BASE_URL}/api/lesson-plans`, { headers: headers() });
  return handleRes(res);
}

export async function getLessonPlan(id) {
  const res = await fetch(`${BASE_URL}/api/lesson-plans/${id}`, { headers: headers() });
  return handleRes(res);
}

export async function updateLessonPlan(id, data) {
  const res = await fetch(`${BASE_URL}/api/lesson-plans/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function deleteLessonPlan(id) {
  const res = await fetch(`${BASE_URL}/api/lesson-plans/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  return handleRes(res);
}
