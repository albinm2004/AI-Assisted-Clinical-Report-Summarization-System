const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function handle(res) {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function fetchPatients() {
  const res = await fetch(`${BASE_URL}/patients`);
  return handle(res);
}

export async function fetchPatientDetail(patientId) {
  const res = await fetch(`${BASE_URL}/patients/${patientId}`);
  return handle(res);
}

export async function analyzePatient(patientId) {
  const res = await fetch(`${BASE_URL}/patients/${patientId}/analyze`, {
    method: "POST",
  });
  return handle(res);
}
