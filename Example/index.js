(function ($) {

  // 两个按钮上绑定事件，切换组件模式
  var $controls = $('.controls');
  $controls.on('click', '[type="radio"]', function (e) {
    e.target.value === 'set' ?
      $('canvas').patternLock('set') :
      $('canvas').patternLock('validate');
    $prompt.text(prompts.start);
  });

  // 提示信息
  var prompts = {
    start: '请输入手势密码',
    setTooShort: '密码太短，至少需要五个点',
    setAgain: '请再次输入手势密码',
    setDifferent: '两次输入的不一致',
    setSuccess: '密码设置成功',
    validateSuccess: '密码正确',
    validateError: '输入的密码不正确'
  };

  // 根据组件发出的事件修改提示信息
  var $prompt = $('.prompt');
  $(document)
    .on('short.gesturepassword', function (e) {
      $prompt.html(prompts.setTooShort);
    })
    .on('init.gesturepassword', function (e) {
      $prompt.html(prompts.setAgain);
    })
    .on('diff.gesturepassword', function (e) {
      $prompt.html(prompts.setDifferent);
      setTimeout(function () {$prompt.text(prompts.start);}, 1000);
      $('canvas').patternLock('set');
    })
    .on('set.gesturepassword', function (e) {
      $prompt.html(prompts.setSuccess);
    })
    .on('wrong.gesturepassword', function (e) {
      $prompt.html(prompts.validateError);
      setTimeout(function () {$prompt.text(prompts.start);}, 1000);
    })
    .on('correct.gesturepassword', function (e) {
      $prompt.html(prompts.validateSuccess);
    });

})(jQuery);


