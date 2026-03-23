const REPO_OWNER = "hive-tracker";
const REPO_NAME = "Hive-Progress-Tracker-Website";

async function addToQueue(username) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/queue.txt`;

  const res = await fetch(url);
  const file = await res.json();
  const sha = file.sha;
  const content = atob(file.content);

  const newContent = content + username + "\n";

  await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Queue ${username}`,
      content: btoa(newContent),
      sha
    })
  });
}

async function waitForStats(username) {
  for (let i = 0; i < 60; i++) {
    const res = await fetch(`data/${username}.json?cacheBust=${Date.now()}`);
    if (res.ok) return await res.json();
    await new Promise(r => setTimeout(r, 2000));
  }
  return null;
}

async function loadStats() {
  const user = document.getElementById("username").value;
  if (!user) return;

  document.getElementById("results").innerHTML = "Loading...";

  await addToQueue(user);
  const data = await waitForStats(user);

  if (!data) {
    document.getElementById("results").innerHTML = "Timed out.";
    return;
  }

  let html = "";
  for (const mode in data) {
    const xp = data[mode]?.xp || 0;
    html += `
      <div class="card">
        <h2>${mode}</h2>
        <p>XP: ${xp}</p>
      </div>
    `;
  }

  document.getElementById("results").innerHTML = html;
}
