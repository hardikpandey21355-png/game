const setupScreen = document.querySelector('#setupScreen');
const gameScreen = document.querySelector('#gameScreen');
const setupForm = document.querySelector('#setupForm');
const choiceArea = document.querySelector('#choiceArea');
const recipientName = document.querySelector('#recipientName');
const celebration = document.querySelector('#celebration');
const winnerName = document.querySelector('#winnerName');
const winMessage = document.querySelector('#winMessage');
const movingNamesInput = document.querySelector('#movingNames');
const correctNameInput = document.querySelector('#correctName');
const titleWordInput = document.querySelector('#titleWord');
const setupWordPreview = document.querySelector('#setupWordPreview');
const titleWordDisplay = document.querySelector('#titleWordDisplay');
const brandWord = document.querySelector('#brandWord');
const linkResult = document.querySelector('#linkResult');
const shareLink = document.querySelector('#shareLink');
const copyStatus = document.querySelector('#copyStatus');
const comicLayer = document.querySelector('#comicPopups');

let currentRecipient = '';
const DEFAULT_WORD = 'Didi';

const COMIC_COLORS = ['#ffd75a', '#b6f1d0', '#d9c6ff', '#ffffff'];

// Funny comic-book style lines that pop up when she almost catches a fleeing name.
// Keep everything warm and playful — this is for a child, so no teasing that could sting.
function comicMessages(recipient) {
  const who = recipient || 'tu';
  return [
    'wah wah!',
    'itni jaldi nahi!',
    'ye wala try kar!',
    'pakad ke dikha!',
    'zara dhyaan se!',
    'बिल्कुल पास थी!',
    'फिर कोशिश कर!',
    'हा हा, चूक गयी!',
    'ek aur chance!',
    'yaha nahi, waha!',
    'बाप रे बाप!',
    `${who} tez ho jaa!`,
    'बहुत तेज़ है ये!',
    'oops, phisal gaya!',
    'सबसे अच्छा ढूंढ!',
    'come on, tu kar sakti hai!',
    'चल एक बार फिर!',
    'ये तो शरारती है!',
    'itna paas! itna door!',
    'wow kya try tha!',
    `${who}, mast khel rahi hai!`,
    'भाग गया फिर से!',
    'hehe, catch me if you can!',
    'ज़रा और तेज़!',
    'ये भाग रहा है दोस्त!',
    'सुपरस्टार कोशिश थी!',
    'almost got it!',
    'thoda aur near!',
    'शाबाश, लगे रहो!',
    'kamaal ki koshish!',
    'चुलबुला है ये नाम!',
    'ये तो नटखट है!',
    'नज़दीक थी बहुत!',
    'you are doing great!',
    'चल एक और दांव!',
    'बड़ी मेहनत लगेगी!',
    'यह भागू है!',
    'keep going champ!',
    'ये तो हवा जैसा है!',
    'लगा लगा, फिर लगा!'
  ];
}

// Places a comic bubble right where the button was when she reached for it.
function spawnComicPopupAt(centerX, topY) {
  if (!comicLayer) return;
  const messages = comicMessages(currentRecipient);
  const text = messages[Math.floor(Math.random() * messages.length)];
  const color = COMIC_COLORS[Math.floor(Math.random() * COMIC_COLORS.length)];
  const bubble = document.createElement('div');
  bubble.className = 'comic-bubble';
  bubble.textContent = text;
  bubble.style.setProperty('--bubble-bg', color);
  bubble.style.setProperty('--rot', `${(Math.random() * 16 - 8).toFixed(1)}deg`);

  const bubbleWidth = 180;
  const left = Math.min(Math.max(centerX - bubbleWidth / 2, 12), window.innerWidth - bubbleWidth - 12);
  const top = Math.min(Math.max(topY - 78, 8), window.innerHeight - 140);
  bubble.style.left = `${left}px`;
  bubble.style.top = `${top}px`;

  comicLayer.appendChild(bubble);
  window.setTimeout(() => bubble.classList.add('is-leaving'), 1100);
  window.setTimeout(() => bubble.remove(), 1500);
}

function clearComicPopups() {
  if (comicLayer) comicLayer.replaceChildren();
}

// Picks a fresh random spot anywhere on the page for a fleeing name to jump to.
function randomPositionFor(button) {
  const width = button.offsetWidth || 140;
  const height = button.offsetHeight || 56;
  const maxLeft = Math.max(window.innerWidth - width - 16, 16);
  const topFloor = 92;
  const maxTop = Math.max(window.innerHeight - height - 96, topFloor);
  const left = 16 + Math.random() * maxLeft;
  const top = topFloor + Math.random() * (maxTop - topFloor > 0 ? maxTop - topFloor : maxTop);
  return { left, top };
}

// Only the fleeing (moving) names dodge — the correct name always stays put so it can be clicked.
function fleeAndPop(button) {
  const rect = button.getBoundingClientRect();
  spawnComicPopupAt(rect.left + rect.width / 2, rect.top);
  const { left, top } = randomPositionFor(button);
  button.style.left = `${left}px`;
  button.style.top = `${top}px`;
}

function makeChoice(name, isMoving) {
  const button = document.createElement('button');
  button.className = 'choice' + (isMoving ? ' escape' : '');
  button.type = 'button';
  button.textContent = name;
  if (isMoving) {
    button.addEventListener('mouseenter', () => fleeAndPop(button));
    button.addEventListener('touchstart', (event) => {
      event.preventDefault();
      fleeAndPop(button);
    }, { passive: false });
  }
  button.addEventListener('click', () => win(name));
  return button;
}

const WIN_LINES = [
  'Correct answer. Big hugs unlocked.',
  'Didi has been located successfully!',
  'Achievement unlocked: World\'s Best Guesser.',
  'Confirmed. 100% certified Didi.',
  'Caught her fair and square!',
  'Level complete. Hugs loading...'
];

function win(name) {
  clearComicPopups();
  winnerName.textContent = name;
  if (winMessage) {
    winMessage.textContent = WIN_LINES[Math.floor(Math.random() * WIN_LINES.length)];
  }
  celebration.classList.remove('is-hidden');
}

function startGame(recipient, movingNames, correctName, titleWord) {
  currentRecipient = recipient;
  recipientName.textContent = recipient;
  const word = (titleWord && titleWord.trim()) || DEFAULT_WORD;
  if (titleWordDisplay) titleWordDisplay.textContent = word.toLowerCase();
  if (brandWord) brandWord.textContent = word.toUpperCase();

  const entries = [
    ...movingNames.map((name) => ({ name, isMoving: true })),
    { name: correctName, isMoving: false }
  ].sort(() => Math.random() - 0.5);

  const choices = entries.map(({ name, isMoving }) => makeChoice(name, isMoving));
  choiceArea.replaceChildren(...choices);
  setupScreen.classList.add('is-hidden');
  gameScreen.classList.remove('is-hidden');
  choices.forEach((button) => {
    const { left, top } = randomPositionFor(button);
    button.style.left = `${left}px`;
    button.style.top = `${top}px`;
  });
}

if (titleWordInput && setupWordPreview) {
  titleWordInput.addEventListener('input', () => {
    setupWordPreview.textContent = titleWordInput.value.trim() || DEFAULT_WORD.toLowerCase();
  });
}

setupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const recipient = document.querySelector('#recipient').value.trim();
  const movingNames = movingNamesInput.value.split(',').map((name) => name.trim()).filter(Boolean);
  const correctName = correctNameInput.value.trim();
  const titleWord = (titleWordInput?.value.trim()) || DEFAULT_WORD;
  if (!recipient || !movingNames.length || !correctName) return;
  const params = new URLSearchParams({ recipient, moving: movingNames.join(','), correct: correctName, word: titleWord });
  shareLink.value = `${window.location.origin}${window.location.pathname}?${params}`;
  linkResult.classList.remove('is-hidden');
  copyStatus.textContent = 'Copy this link and send it to her.';
});

document.querySelector('#copyLink').addEventListener('click', async () => {
  await navigator.clipboard.writeText(shareLink.value);
  copyStatus.textContent = 'Copied. Her game is ready!';
});

document.querySelector('#playAgain').addEventListener('click', () => {
  celebration.classList.add('is-hidden');
});
document.querySelector('#resetButton').addEventListener('click', () => {
  clearComicPopups();
  gameScreen.classList.add('is-hidden');
  setupScreen.classList.remove('is-hidden');
});

const params = new URLSearchParams(window.location.search);
const sharedRecipient = params.get('recipient');
const sharedMovingNames = params.get('moving')?.split(',').map((name) => name.trim()).filter(Boolean);
const sharedCorrectName = params.get('correct');
const sharedTitleWord = params.get('word');
if (sharedRecipient && sharedMovingNames?.length && sharedCorrectName) {
  startGame(sharedRecipient, sharedMovingNames, sharedCorrectName, sharedTitleWord);
}