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

export async function getCycleProgress(cycleId) {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/progress`, { headers: headers() });
  return handleRes(res);
}

function stageQs(stage) {
  const s = stage && String(stage).trim();
  if (!s) return "";
  return `?stage=${encodeURIComponent(s)}`;
}

export async function getPaso(cycleId, pasoNum, stage = "pre") {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/${pasoNum}${stageQs(stage)}`, { headers: headers() });
  return handleRes(res);
}

export async function savePaso(cycleId, pasoNum, data, stage = "pre") {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/${pasoNum}${stageQs(stage)}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ ...data, stage }),
  });
  return handleRes(res);
}

export async function getPaso2General(cycleId, stage = "pre") {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/2/general${stageQs(stage)}`, { headers: headers() });
  return handleRes(res);
}

export async function savePaso2General(cycleId, data, stage = "pre") {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/2/general${stageQs(stage)}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ ...data, stage }),
  });
  return handleRes(res);
}

export async function getPaso3General(cycleId, stage = "pre") {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/3/general${stageQs(stage)}`, { headers: headers() });
  return handleRes(res);
}

export async function savePaso3General(cycleId, data, stage = "pre") {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/3/general${stageQs(stage)}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ ...data, stage }),
  });
  return handleRes(res);
}

export async function getPaso4General(cycleId, stage = "pre") {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/4/general${stageQs(stage)}`, { headers: headers() });
  return handleRes(res);
}

export async function savePaso4General(cycleId, data, stage = "pre") {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso/4/general${stageQs(stage)}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ ...data, stage }),
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

export async function generateLessonPlan(teacherCycleId, stage = "pre") {
  const res = await fetch(`${BASE_URL}/api/lesson-plans/generate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ teacherCycleId, stage }),
  });
  return handleRes(res);
}

export async function createBlankLessonPlan({ teacherCycleId, stage = "pre" }) {
  const res = await fetch(`${BASE_URL}/api/lesson-plans`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ teacherCycleId, stage }),
  });
  return handleRes(res);
}

export async function listLessonPlans(stage) {
  const q = stage ? `?stage=${encodeURIComponent(stage)}` : "";
  const res = await fetch(`${BASE_URL}/api/lesson-plans${q}`, { headers: headers() });
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

/** AI sufficiency review for a single Paso field. */
export async function reviewPasoResponse(cycleId, body) {
  const res = await fetch(`${BASE_URL}/api/cycles/${cycleId}/paso-response-review`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return handleRes(res);
}
