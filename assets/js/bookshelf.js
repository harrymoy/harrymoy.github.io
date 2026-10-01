// Shows a book's title and author above its spine on hover or keyboard focus.
(function () {
  var bookcase = document.querySelector('[data-bookcase]');
  if (!bookcase) return;

  var tip = bookcase.querySelector('.book-tip');
  var tipTitle = tip.querySelector('.book-tip__title');
  var tipAuthor = tip.querySelector('.book-tip__author');
  var tipNotes = tip.querySelector('.book-tip__notes');

  function show(spine) {
    tipTitle.textContent = spine.dataset.title;
    tipAuthor.textContent = spine.dataset.author;
    tipNotes.hidden = !spine.classList.contains('spine--notes');
    tip.hidden = false;

    var box = bookcase.getBoundingClientRect();
    var rect = spine.getBoundingClientRect();
    var centre = rect.left + rect.width / 2 - box.left;
    var half = tip.offsetWidth / 2;
    var left = Math.min(Math.max(centre, half), box.width - half);

    tip.style.left = left + 'px';
    tip.style.top = (rect.top - box.top - 12) + 'px';
    tip.style.setProperty('--arrow', (centre - left) + 'px');
  }

  function hide() { tip.hidden = true; }

  bookcase.querySelectorAll('.spine').forEach(function (spine) {
    spine.addEventListener('mouseenter', function () { show(spine); });
    spine.addEventListener('focus', function () { show(spine); });
    spine.addEventListener('mouseleave', hide);
    spine.addEventListener('blur', hide);
  });
})();
