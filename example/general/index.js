(function ($) {

  var $controls = $('.controls');
  $controls.on('click', '[type="radio"]', function (e) {
    var mode = e.target.value;
    $('.pattern-lock').patternLock(mode);
    $prompt.text(prompts[mode]);
  });

  var prompts = {
    set: '请输入手势密码',
    setTooShort: '密码太短，至少需要五个点',
    setAgain: '请再次输入手势密码',
    setDifferent: '两次输入的不一致',
    setSuccess: '密码设置成功',
    validate: '请验证手势密码',
    validateSuccess: '密码正确',
    validateError: '输入的密码不正确'
  };

  var $prompt = $('.prompt');
  $(document)
    .on('short.patternlock', function (e) {
      $prompt.text(prompts.setTooShort);
    })
    .on('init.patternlock', function (e) {
      $prompt.text(prompts.setAgain);
    })
    .on('diff.patternlock', function (e) {
      $prompt.text(prompts.setDifferent);
      setTimeout(function () {$prompt.text(prompts.start);}, 1000);
    })
    .on('set.patternlock', function (e) {
      $prompt.text(prompts.setSuccess);
    })
    .on('wrong.patternlock', function (e) {
      $prompt.text(prompts.validateError);
      setTimeout(function () {$prompt.text(prompts.start);}, 1000);
    })
    .on('correct.patternlock', function (e) {
      $prompt.text(prompts.validateSuccess);
    });

})(jQuery);


