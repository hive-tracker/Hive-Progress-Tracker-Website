// GitHub repo info
const REPO_OWNER = "raid2256";
const REPO_NAME = "Hive-Progress-Tracker-Website";
const BRANCH = "main";

// GitHub Pages exposes WEB_TOKEN automatically
const GITHUB_TOKEN = WEB_TOKEN;

// XP tables
const LEVEL_TABLES = {
  bed: [0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,20400,22950,25650,28500],
  sky: [0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750,18000,20400,22950,25650,28500],
  murder: [0,100,300,600,1000,1500,2100,2800,3600,4500,5500,6600,7800,9100,10500,12000,13600,15300,17100,19000],
  dr: [0,200,600,1200,2000,3000,4200,5600,7200,9000,11000,13200,15600,18200,21000],
  party: [0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750],
  drop: [0,150,450,900,1500,2250,3150,4200,5400,6750,8250,9900,11700,13650,15750],
  bridge: [0,300,924,1897,3246,5001,7194,9860,13036,16762],
  build: [0,100,300,600,1000,1500,2100,2800,3600,4500],
  ctf: [0,150,450,900,1500,2250,3150,4200,5400,6750],
  grav: [0,150,450,900,1500,2250,3150,4200,5400,6750],
  ground: [0,150,450,900,1500,2250,3150,4200,5400,6750],
  hide: [0,100,300,600,1000,1500,2100,2800,3600,4500],
  sg: [0,150,450,900,1500,2250,3150,4200,5400,6750]
};

const MODE_NAMES = {
  bed: "BedWars",
  sky: "SkyWars",
  murder: "Murder Mystery",
  dr: "Deathrun",
  party: "Block Party",
  drop: "Block Drop",
  bridge: "The Bridge",
  build: "Build Battle",
  ctf: "Capture The Flag",
  grav: "Gravity",
  ground: "Ground Wars",
  hide: "Hide and Seek",
  sg: "Survival Games"
};

function calculateLevel(mode, xp) {
  const table = LEVEL_TABLES[mode];
  let level = 1;
  for (let i = 1; i < table.length; i++) {
    if (xp >= table[i]) level = i + 1;
    else break;
  }
  return Math.min(level, table.length);
}

async function updateSearchFile(username) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/search.txt`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GITHUB_TOKEN}`
    },
    body: JSON.stringify({
      message: `Search for ${username}`,
      content: btoa(username),
      branch: BRANCH
    })
  });

  return res.ok;
}

async function waitForStats(username) {
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`data/${username}.json?cacheBust=${Date.now()}`);
    if (res.ok) return await res.json();
    await new Promise(r => setTimeout(r, 3000));
  }
  return null;
}

async function loadStats() {
  const user = document.getElementById("username").value;
  if (!user) return;

  document.getElementById("results").innerHTML = "<p>Loading...</p>";

  await updateSearchFile(user);
  const data = await waitForStats(user);

  if (!data) {
    document.getElementById("results").innerHTML = "<p>User not found or API slow.</p>";
    return;
  }

  const container = document.getElementById("results");
  container.innerHTML = "";

  for (const mode in LEVEL_TABLES) {
    const stats = data[mode];
    if (!stats) continue;

    const xp = stats.xp || 0;
    const level = calculateLevel(mode, xp);
    const max = LEVEL_TABLES[mode].length;

    const prevXP = LEVEL_TABLES[mode][level - 2] || 0;
    const nextXP = LEVEL_TABLES[mode][level - 1] || LEVEL_TABLES[mode][max - 1];

    const progress = ((xp - prevXP) / (nextXP - prevXP)) * 100;

    container.innerHTML += `
      <div class="card">
        <h2>${MODE_NAMES[mode]}</h2>
        <p>Level: ${level} / ${max}</p>
        <p>XP: ${xp.toLocaleString()}</p>
        <div class="progress">
          <div class="progress-bar" style="width:${progress}%"></div>
        </div>
      </div>
    `;
  }
}
