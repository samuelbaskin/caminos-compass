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
      `Server returned non-JSON response (${res.status}). Is the backend running?`
    );
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Request failed.");
  return data;
}

/**
 * @param {{ message: string, history?: { role: string, content: string }[] }} body
 */
export async function postEducationalChat(body) {
  const res = await fetch(`${BASE_URL}/api/chat/educational`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return handleRes(res);
}
