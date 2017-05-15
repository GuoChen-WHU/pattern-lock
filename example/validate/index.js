(function ($) {

  var prompts = {
    validateSuccess: '密码正确',
    validateError: '输入的密码不正确'
  };

  var $prompt = $('.prompt');
  $(document)
    .on('wrong.patternlock', function (e) {
      $prompt.text(prompts.validateError);
    })
    .on('correct.patternlock', function (e) {
      $prompt.text(prompts.validateSuccess);
    });

})(jQuery);
