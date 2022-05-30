var btn = $('#button');

$(window).scroll(function () {
  if ($(window).scrollTop() > 200) {
    btn.addClass('show');
  } else {
    btn.removeClass('show');
  }
});


btn.on('click', function (e) {
  e.preventDefault();
  $('html, body').animate({ scrollTop: 0 }, '200');
});

$("#button").hover(
  function () { // Mouse Over
    $(this).parent().find('i').find('img').attr('src', "../static/images/up-purple.png");
  },
  function () { // Mouse Out
    $(this).parent().find('i').find('img').attr('src', "../static/images/up-black.png");
  }
);
