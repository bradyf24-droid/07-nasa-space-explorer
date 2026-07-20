// Find the date picker inputs, button, and gallery on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.querySelector('button');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalVideoMessage = document.getElementById('modalVideoMessage');
const modalVideoLink = document.getElementById('modalVideoLink');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeButton = document.querySelector('.modal-close');
const spaceFact = document.getElementById('spaceFact');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

const funFacts = [
  'A day on Venus is longer than a year on Venus.',
  'The Sun contains more than 99% of the mass in our solar system.',
  'Neutron stars are so dense that a teaspoon of them would weigh billions of tons.',
  'Jupiter has a storm that has been raging for hundreds of years.',
  'Mars has the tallest volcano in the solar system: Olympus Mons.'
];

function showRandomFact() {
  const randomIndex = Math.floor(Math.random() * funFacts.length);
  spaceFact.textContent = funFacts[randomIndex];
}

showRandomFact();

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDateRange(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    dates.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

function openModal(photoData) {
  if (photoData.media_type === 'video') {
    modalImage.classList.add('hidden');
    modalVideoMessage.classList.remove('hidden');
    modalVideoLink.href = photoData.url;
    modalVideoLink.textContent = 'Open video';
  } else {
    modalImage.src = photoData.url;
    modalImage.alt = photoData.title;
    modalImage.classList.remove('hidden');
    modalVideoMessage.classList.add('hidden');
  }

  modalTitle.textContent = photoData.title;
  modalDate.textContent = photoData.date;
  modalExplanation.textContent = photoData.explanation || 'No explanation available for this item.';
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

function createGalleryItem(photoData) {
  const card = document.createElement('div');
  card.className = 'gallery-item';

  const mediaUrl = photoData.media_type === 'video' ? (photoData.thumbnail_url || photoData.url) : photoData.url;

  const image = document.createElement('img');
  image.src = mediaUrl;
  image.alt = photoData.title;

  const caption = document.createElement('p');
  caption.textContent = `${photoData.title} — ${photoData.date}`;

  const badge = document.createElement('span');
  badge.className = 'gallery-media-type';
  badge.textContent = photoData.media_type === 'video' ? 'Video' : 'Image';

  card.appendChild(image);
  card.appendChild(caption);
  card.appendChild(badge);

  if (photoData.media_type === 'video') {
    const videoLink = document.createElement('a');
    videoLink.className = 'gallery-video-link';
    videoLink.href = photoData.url;
    videoLink.target = '_blank';
    videoLink.rel = 'noopener noreferrer';
    videoLink.textContent = 'Open video';
    card.appendChild(videoLink);
  }

  card.addEventListener('click', () => {
    openModal(photoData);
  });

  return card;
}

async function fetchSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;
  const dates = getDateRange(startDate, endDate);

  gallery.innerHTML = '';

  const loadingMessage = document.createElement('div');
  loadingMessage.className = 'placeholder';
  loadingMessage.innerHTML = '<div class="placeholder-icon">🚀</div><p>Loading space images...</p>';
  gallery.appendChild(loadingMessage);

  try {
    const requests = dates.map((date) => {
      return fetch(`https://api.nasa.gov/planetary/apod?api_key=RBMuiilwwtUmVXWABJc84N3pqhJwdn5J2CkjvEDq&date=${date}`);
    });

    const responses = await Promise.all(requests);
    const photos = [];

    for (const response of responses) {
      if (!response.ok) {
        throw new Error('Unable to fetch images right now.');
      }

      const photoData = await response.json();

      if (photoData.media_type === 'image' || photoData.media_type === 'video') {
        photos.push(photoData);
      }
    }

    gallery.innerHTML = '';

    if (photos.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'placeholder';
      emptyState.innerHTML = '<div class="placeholder-icon">🪐</div><p>No images were found for this date range.</p>';
      gallery.appendChild(emptyState);
      return;
    }

    photos.forEach((photo) => {
      gallery.appendChild(createGalleryItem(photo));
    });
  } catch (error) {
    gallery.innerHTML = '';

    const errorState = document.createElement('div');
    errorState.className = 'placeholder';
    errorState.innerHTML = `<div class="placeholder-icon">⚠️</div><p>${error.message}</p>`;
    gallery.appendChild(errorState);
  }
}

button.addEventListener('click', fetchSpaceImages);
closeButton.addEventListener('click', closeModal);

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

fetchSpaceImages();
