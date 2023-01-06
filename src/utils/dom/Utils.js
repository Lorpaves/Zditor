module.exports = {
  hideSideBarFile: () => {
    $('.sub-dir__name')
      .nextAll()
      .animate(
        {
          height: 'toggle',
          opacity: 'toggle',
        },
        {
          duration: 300,
          easing: 'swing',
          done: function () {
            $(this).parent().children().eq(0).addClass('dir-closed');
          },
        }
      );
  },
};
