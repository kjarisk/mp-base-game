let currentQuestState = {};

async function loadQuests() {
  const res = await fetch('/quests');
  const data = await res.json();
  currentQuestState = data.questState || {};
  renderQuests(data.quests, currentQuestState);
}

function renderQuests(quests, questState) {
  const container = document.getElementById('questsList');
  if (!container) return;
  container.innerHTML = '';
  quests.forEach((q) => {
    const div = document.createElement('div');
    const progress = questState[q.id] || 0;
    div.innerHTML = `${q.description} : <span data-id="${q.id}">${progress}/${q.goal}</span>`;
    const btn = document.createElement('button');
    btn.textContent = '+';
    btn.addEventListener('click', () => {
      const newState = { ...currentQuestState, [q.id]: progress + 1 };
      updateQuests(newState);
    });
    div.appendChild(btn);
    container.appendChild(div);
  });
}

async function updateQuests(state) {
  await fetch('/quests/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questState: state })
  });
  loadQuests();
}

document.addEventListener('DOMContentLoaded', loadQuests);
