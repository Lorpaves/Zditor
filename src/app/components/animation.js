module.exports = {
  hideNextAll: (firstElement, cls) =>
    firstElement.nextAll().animate(
      {
        height: 'toggle',
        opacity: 'toggle',
      },
      {
        duration: 300,
        easing: 'swing',

        complete: function () {
          $(this).parent().children().eq(0).addClass(cls);
        },
      }
    ),
};
