import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  form: document.getElementById('search-form'),
  input: document.querySelector('input[type="text"]'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);
refs.form.addEventListener('submit', submitForm);
refs.input.addEventListener('input', resetNumberPage);

let totalCountPictures = 0;

const options = {
  params: {
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: 40,
    page: 1,
  },
};

function onLoadMoreBtnClick(e) {
  e.preventDefault();
  options.params.page += 1;

  fetchPic(refs.input.value.trim())
    .then(res => markup(res))
    .then(makeMarkup)
    .catch(error => console.log(error));
}

async function fetchPic(name) {
  const BASE_URL = 'https://pixabay.com/api/';
  const API_KEY = 'key=22566736-9270eb24c03fe92310988cdef';
  return await axios.get(`${BASE_URL}?${API_KEY}&q=${name}`, options);
}

async function submitForm(e) {
  e.preventDefault();

  if (options.params.page === 1) {
    refs.gallery.innerHTML = '';
  }

  if (refs.input.value.trim() === '') {
    refs.gallery.innerHTML = '';
    return;
  }
  await fetchPic(refs.input.value.trim())
    .then(res => markup(res))
    .then(makeMarkup)
    .catch(error => console.log(error));
}

function markup(pictures) {
  if (pictures.data.hits.length > 0) {
    refs.loadMoreBtn.classList.add('active');
  }
  totalCountPictures += pictures.data.hits.length;
  if (
    totalCountPictures >= pictures.data.totalHits &&
    pictures.data.total !== 0
  ) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    refs.loadMoreBtn.classList.remove('active');
  }

  if (pictures.data.total === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }

  return pictures.data.hits
    .map(({ webformatURL, likes, views, comments, downloads, tags }) => {
      return `
    <div class="photo-card">
    <img src="${webformatURL}" alt="${tags}" loading="lazy" width=300/>
    <div class="info">
    <div class="wrap">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
    </div>
  </div>
</div>`;
    })
    .join('');
}

function makeMarkup(result) {
  refs.gallery.insertAdjacentHTML('beforeend', result);
}

function resetNumberPage() {
  options.params.page = 1;
}
