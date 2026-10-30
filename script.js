const themeToggle = document.getElementById('themeToggle');
const entryForm = document.getElementById('entryForm');
const entriesList = document.getElementById('entriesList');
const formMessage = document.getElementById('formMessage');

let entries = readStorage('mysoul-entries', []);
let goals = readStorage('mysoul-goals', []);
let editingId = null;

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function updateThemeButton() {
  const dark = document.body.classList.contains('dark-mode');
  themeToggle.textContent = dark ? '☀️ Күндүзгү тема' : '🌙 Түнкү тема';
}

if (localStorage.getItem('mysoul-theme') === 'dark') {
  document.body.classList.add('dark-mode');
}
updateThemeButton();

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem(
    'mysoul-theme',
    document.body.classList.contains('dark-mode') ? 'dark' : 'light'
  );
  updateThemeButton();
});

function showDate() {
  const date = new Date();
  document.getElementById('todayDate').textContent = date.toLocaleDateString('ky-KG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).toLocaleUpperCase();
}

function renderEntries() {
  entriesList.innerHTML = '';
  if (entries.length === 0) {
    entriesList.innerHTML = '<div class="empty-state"><span>📝</span><p>Азырынча жазуу жок.</p><small>Биринчи жазууңду кошуп көр!</small></div>';
  } else {
    entries.forEach((entry) => {
      const card = document.createElement('article');
      card.className = 'entry-card';

      const top = document.createElement('div');
      top.className = 'entry-card-top';
      const titleWrap = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = entry.title;
      const date = document.createElement('span');
      date.className = 'entry-date';
      date.textContent = new Date(entry.createdAt).toLocaleString('ky-KG');
      titleWrap.append(title, date);

      const mood = document.createElement('span');
      mood.textContent = entry.mood || '😊';
      mood.setAttribute('aria-label', 'Жазуудагы маанай');
      top.append(titleWrap, mood);

      const text = document.createElement('p');
      text.className = 'entry-text';
      text.textContent = entry.text;

      const actions = document.createElement('div');
      actions.className = 'entry-actions';
      const edit = document.createElement('button');
      edit.className = 'small-button';
      edit.type = 'button';
      edit.textContent = 'Оңдоо';
      edit.addEventListener('click', () => editEntry(entry.id));
      const remove = document.createElement('button');
      remove.className = 'small-button delete-button';
      remove.type = 'button';
      remove.textContent = 'Өчүрүү';
      remove.addEventListener('click', () => deleteEntry(entry.id));
      actions.append(edit, remove);
      card.append(top, text, actions);
      entriesList.append(card);
    });
  }

  document.getElementById('entryCount').textContent = entries.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  document.getElementById('monthCount').textContent = entries.filter((entry) => {
    const date = new Date(entry.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;
  document.getElementById('lastEntry').textContent = entries[0] ? entries[0].title : 'Азырынча жок';
}

entryForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.getElementById('entryTitle').value.trim();
  const text = document.getElementById('entryText').value.trim();
  const mood = document.getElementById('entryMood').value;
  if (!title || !text) return;

  if (editingId !== null) {
    entries = entries.map((entry) => entry.id === editingId
      ? { ...entry, title, text, mood }
      : entry);
    editingId = null;
    formMessage.textContent = 'Өзгөртүүлөр сакталды 💗';
  } else {
    entries.unshift({ id: Date.now(), title, text, mood, createdAt: new Date().toISOString() });
    formMessage.textContent = 'Жазууң сакталды 💗';
  }
  saveStorage('mysoul-entries', entries);
  entryForm.reset();
  renderEntries();
});

function editEntry(id) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) return;
  editingId = id;
  document.getElementById('entryTitle').value = entry.title;
  document.getElementById('entryText').value = entry.text;
  document.getElementById('entryMood').value = entry.mood || '😊';
  formMessage.textContent = 'Жазууну өзгөртүп, «Сактоо» баскычын бас.';
  entryForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function deleteEntry(id) {
  if (!confirm('Бул жазууну өчүргүң келеби?')) return;
  entries = entries.filter((entry) => entry.id !== id);
  saveStorage('mysoul-entries', entries);
  if (editingId === id) {
    editingId = null;
    entryForm.reset();
  }
  renderEntries();
  formMessage.textContent = 'Жазуу өчүрүлдү.';
}

document.getElementById('writeNow').addEventListener('click', () => {
  document.getElementById('entryTitle').focus();
  document.getElementById('diary').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('showAll').addEventListener('click', () => {
  entriesList.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelectorAll('[data-mood]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-mood]').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    const messages = {
      '🥰': 'Бактылуу көз ирмемдериңди баала. 💗',
      '😊': 'Жакшы маанайың узакка созулсун!',
      '😌': 'Тынч дем алып, өзүңө убакыт бер.',
      '😔': 'Баары жакшы болбосо да, сен жалгыз эмессиң.',
      '😴': 'Эс алуу да маанилүү. Өзүңдү ая.'
    };
    document.getElementById('moodMessage').textContent = messages[button.dataset.mood];
  });
});

const goalForm = document.getElementById('goalForm');
const goalInput = document.getElementById('goalInput');
const goalList = document.getElementById('goalList');

function renderGoals() {
  goalList.innerHTML = '';
  if (goals.length === 0) {
    goalList.innerHTML = '<li class="empty-goal">Азырынча максат жок.</li>';
    return;
  }
  goals.forEach((goal) => {
    const li = document.createElement('li');
    if (goal.done) li.classList.add('done');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = goal.done;
    checkbox.setAttribute('aria-label', 'Максат аткарылды');
    checkbox.addEventListener('change', () => {
      goal.done = checkbox.checked;
      saveStorage('mysoul-goals', goals);
      renderGoals();
    });
    const label = document.createElement('span');
    label.textContent = goal.text;
    const remove = document.createElement('button');
    remove.className = 'small-button delete-button';
    remove.type = 'button';
    remove.textContent = '×';
    remove.setAttribute('aria-label', 'Максатты өчүрүү');
    remove.addEventListener('click', () => {
      goals = goals.filter((item) => item.id !== goal.id);
      saveStorage('mysoul-goals', goals);
      renderGoals();
    });
    li.append(checkbox, label, remove);
    goalList.append(li);
  });
}

goalForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = goalInput.value.trim();
  if (!text) return;
  goals.unshift({ id: Date.now(), text, done: false });
  saveStorage('mysoul-goals', goals);
  goalInput.value = '';
  renderGoals();
});

showDate();
renderEntries();
renderGoals();
