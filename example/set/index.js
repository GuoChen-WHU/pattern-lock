(function ($) {

  var prompts = {
    start: '请输入手势密码',
    setTooShort: '密码太短，至少需要五个点',
    setAgain: '请再次输入手势密码',
    setDifferent: '两次输入的不一致',
    setSuccess: '密码设置成功'
  };

  var $prompt = $('.prompt');
  $(document)
    .on('short.patternlock', function (e) {
      $prompt.text(prompts.setTooShort);
    })
    .on('init.patternlock', function (e) {
      $prompt.text(prompts.setAgain + ' 第一次设置的密码为：' + e.initPassword);
    })
    .on('diff.patternlock', function (e) {
      $prompt.text(prompts.setDifferent);
      setTimeout(function () {$prompt.text(prompts.start);}, 1000);
    })
    .on('set.patternlock', function (e) {
      $prompt.text(prompts.setSuccess + ' 设置的密码为' + e.password);
    })
    .on('wrong.patternlock', function (e) {
      $prompt.text(prompts.validateError);
      setTimeout(function () {$prompt.text(prompts.start);}, 1000);
    })
    .on('correct.patternlock', function (e) {
      $prompt.text(prompts.validateSuccess);
    });

})(jQuery);


