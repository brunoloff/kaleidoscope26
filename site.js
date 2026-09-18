const tabButtons = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];

function activateTab(tabName, { focus = false, updateHash = true } = {}) {
  const selectedButton = tabButtons.find(button => button.dataset.tab === tabName) || tabButtons[0];

  tabButtons.forEach(button => {
    const selected = button === selectedButton;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });

  panels.forEach(panel => {
    const selected = panel.id === selectedButton.dataset.tab;
    panel.hidden = !selected;
    panel.classList.toggle('is-active', selected);
  });

  if (focus) selectedButton.focus();
  if (updateHash) history.replaceState(null, '', `#${selectedButton.dataset.tab}`);
}

tabButtons.forEach((button, index) => {
  button.addEventListener('click', () => activateTab(button.dataset.tab));
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabButtons.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabButtons.length - 1;
    activateTab(tabButtons[nextIndex].dataset.tab, { focus: true });
  });
});

const directory = document.querySelector('#participant-directory');
const participantLines = document.querySelector('#participants-data').textContent.trim().split(/\n+/);

participantLines.forEach(line => {
  const [name, institution] = line.split('|');
  const entry = document.createElement('div');
  entry.className = 'participant-entry';
  const personName = document.createElement('strong');
  const affiliation = document.createElement('span');
  personName.textContent = name.trim();
  affiliation.textContent = institution.trim();
  entry.append(personName, affiliation);
  directory.append(entry);
});

const initialTab = location.hash.slice(1);
activateTab(['talks', 'participants', 'acknowledgements'].includes(initialTab) ? initialTab : 'talks', {
  updateHash: false
});

window.addEventListener('hashchange', () => {
  const tabName = location.hash.slice(1);
  if (['talks', 'participants', 'acknowledgements'].includes(tabName)) activateTab(tabName, { updateHash: false });
});

const photoFrame = document.querySelector('#photo-frame');
const photoIframe = document.querySelector('#group-photo-embed');
const photoFullscreenButton = document.querySelector('#photo-fullscreen-button');

function notifyPhotoFullscreen(active) {
  photoIframe?.contentWindow?.postMessage({ type: 'photo-fullscreen', active }, '*');
}

if (photoFrame && photoFullscreenButton) {
  photoFullscreenButton.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement === photoFrame) {
        await document.exitFullscreen();
      } else if (photoFrame.requestFullscreen) {
        await photoFrame.requestFullscreen();
      } else {
        window.open('photo.html', '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.info('Full-screen mode was not available.', error);
    }
  });

  document.addEventListener('fullscreenchange', () => {
    const active = document.fullscreenElement === photoFrame;
    photoFullscreenButton.textContent = active ? 'Exit full screen' : 'Show photo in full screen';
    photoFullscreenButton.setAttribute('aria-pressed', String(active));
    notifyPhotoFullscreen(active);
  });

  photoIframe?.addEventListener('load', () => notifyPhotoFullscreen(document.fullscreenElement === photoFrame));
}
