let username = localStorage.getItem("ufcUser") || "";

if (username) {
  document.getElementById("login-section").style.display = "none";
  document.getElementById("app-section").style.display = "block";
  init();
}

function setUsername() {
  const u = document.getElementById("usernameInput").value.trim();
  if (!u) return alert("Type a name!");
  localStorage.setItem("ufcUser", u);
  location.reload();
}

async function init() {
  const r = await fetch("/api/fights");
  const d = await r.json();
  document.getElementById("eventName").textContent = d.event;
  const f = d.fights;
  const form = document.getElementById("picksForm");
  f.forEach(fight => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${fight.fighterA} vs ${fight.fighterB}</strong><br>
      <select name="fighter-${fight.id}">
        <option value="${fight.fighterA}">${fight.fighterA}</option>
        <option value="${fight.fighterB}">${fight.fighterB}</option>
      </select>
      <select name="method-${fight.id}">
        <option value="KO/TKO">KO/TKO</option>
        <option value="Submission">Submission</option>
        <option value="Decision">Decision</option>
      </select>
      <hr>`;
    form.appendChild(div);
  });
  loadScores();
}

async function submitPicks() {
  const r = await fetch("/api/fights");
  const d = await r.json();
  const fd = new FormData(document.getElementById("picksForm"));
  const picks = d.fights.map(f => ({
    fightId: f.id,
    fighter: fd.get(`fighter-${f.id}`),
    method: fd.get(`method-${f.id}`)
  }));
  await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, picks })
  });
  alert("Picks submitted!");
  loadScores();
}

async function loadScores() {
  const r = await fetch("/api/leaderboard");
  const { weekly, allTime } = await r.json();
  document.getElementById("weeklyBoard").innerHTML = weekly.map(u =>
    `<li>${u.user}: ${u.weekly} pts`
  ).join("");
  document.getElementById("allTimeBoard").innerHTML = allTime.map(u =>
    `<li>${u.user}: ${u.total} pts`
  ).join("");
}
