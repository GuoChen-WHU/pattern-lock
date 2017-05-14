// Pattern Lock
// -------------------

(function ($) {
  'use strict';

  if (typeof $ === 'undefined') throw new Error('Pattern lock need jquery as a dependency.');

  var PatternLock = function (container, options) {
    this.$container = $(container);
    this.$container.css('position', 'relative');
    this.options = options;
    this.width = this.$container.width();
    this.height = this.$container.height();

    // 绘制背景圆的canvas
    let circleCanvas = document.createElement('canvas');
    $.extend(circleCanvas.style, {
      position: 'absolute',
      top: 0,
      left: 0
    });
    circleCanvas.width = this.width;
    circleCanvas.height = this.height;
    // 绘制点的canvas
    let pointCanvas = circleCanvas.cloneNode(true);
    // 绘制线的canvas，把它和pointCanvas分开使得圆和点可以覆盖在线上面
    let lineCanvas = circleCanvas.cloneNode(true);
    // 绘制橡皮筋的canvas
    let elasticCanvas = circleCanvas.cloneNode(true);

    this.$container.append(lineCanvas);
    this.$container.append(elasticCanvas);
    this.$container.append(circleCanvas);
    this.$container.append(pointCanvas);

    // 绘制背景圆
    let circleCtx = circleCanvas.getContext('2d');
    this.options.centers.forEach($.proxy(function (pos) {
      this.drawCircle(circleCtx, pos[0], pos[1], this.options.circleRadius, 'stroke');
    }), this);

    this.pointCtx = pointCanvas.getContext('2d');
    this.lineCtx = lineCanvas.getContext('2d');
    this.elasticCtx = elasticCanvas.getContext('2d');

    // 当前选中的圆
    this.currentCircle = -1;
    // 存放滑过的圆索引，触摸结束时即手势结果
    this.result = [];
    // 初始状态下设置的密码
    this.initPassword = '';
    // 用于validate的正确密码
    this.password = this.options.correctPassword;

    // 添加触摸和鼠标事件响应
    this.$container.on('touchstart', $.proxy(this.onMouseDownOrTouchStart, this));
    this.$container.on('mousedown', $.proxy(this.onMouseDownOrTouchStart, this));
  };

  PatternLock.DEFAULTS = {
    mode: 'set',
    minLength: 5,
    lineColor: '#888',
    circleStrokeColor: '#888',
    circleFillColor: '#f00',
    lineWidth: 2,
    circleRadius: 0.07,
    pointRadius: 0.05,
    centers: [
      [0.15, 0.15],
      [0.5,  0.15],
      [0.85, 0.15],
      [0.15, 0.5],
      [0.5,  0.5],
      [0.85, 0.5],
      [0.15, 0.85],
      [0.5,  0.85],
      [0.85, 0.85]
    ]
  };

  /**
   * 绘制一个圆
   * @param {Object} ctx 绘图上下文
   * @param {Number} x 圆心x坐标
   * @param {Number} y 圆心y坐标
   * @param {Number} r 圆半径
   * @param {String} type 描边或填充
   * @param {Object} style 样式
   */
  PatternLock.prototype.drawCircle = function (ctx, x, y, r, type, style) {
    ctx = $.extend(ctx, {
      strokeStyle: this.options.circleStrokeColor,
      lineWidth: this.options.lineWidth,
      fillStyle: this.options.circleFillColor
    }, style || {});

    ctx.beginPath();
    ctx.arc(this.width * x, this.height * y, this.width * r, 0, Math.PI * 2);
    type === 'stroke' ? ctx.stroke() : ctx.fill();
  };

  /**
   * 绘制一条线
   * @param {Object} ctx 绘图上下文
   * @param {Number} x1 起点x坐标
   * @param {Number} y1 起点y坐标
   * @param {Number} x2 终点x坐标
   * @param {String} y2 终点y坐标
   * @param {Object} style 样式
   */
  PatternLock.prototype.drawLine = function (ctx, x1, y1, x2, y2, style) {
    ctx = $.extend(ctx, {
      strokeStyle: this.options.lineColor,
      lineWidth: this.options.lineWidth
    }, style || {});

    ctx.beginPath();
    ctx.moveTo(x1 * this.width, y1 * this.height);
    ctx.lineTo(x2 * this.width, y2 * this.height);
    ctx.stroke();
  };

  /**
   * 获取单击/触摸事件发生的页面坐标
   */
  PatternLock.prototype.getEvtPos = function (e) {
    return {
      x: e.pageX || e.originalEvent.touches[0].pageX,
      y: e.pageY || e.originalEvent.touches[0].pageY
    };
  };

  /**
   * 页面坐标转换为canvas坐标
   */
  PatternLock.prototype.windowToCanvas = function (x, y) {
    var bbox = this.$container[0].getBoundingClientRect();
    return {
      x: x - bbox.left * (this.width / bbox.width),
      y: y - bbox.top * (this.height / bbox.height)
    };
  };

  /**
   * 像素坐标转成归一化坐标
   */
  PatternLock.prototype.getStdPos = function (pos) {
    return {
      x: pos.x / this.width,
      y: pos.y / this.height
    };
  };

  /**
   * 根据触摸位置获取对应的圆
   */
  PatternLock.prototype.getTargetCircle = function (pos) {
    // TODO:改用效率更高的搜索算法
    var centers = this.options.centers,
        radius = this.options.circleRadius;
    for (var i = 0; i < 9; i++) {
      if (pos.x < centers[i][0] + radius &&
          pos.x > centers[i][0] - radius &&
          pos.y < centers[i][1] + radius &&
          pos.y > centers[i][1] - radius)
        return i;
    }
  };

  /**
   * 更新橡皮筋
   */
  PatternLock.prototype.updateElastic = function (pos) {
    var centers = this.options.centers;
    this.elasticCtx.clearRect(0, 0, this.width, this.height);
    this.drawLine(
      this.elasticCtx,
      centers[this.currentCircle][0],
      centers[this.currentCircle][1],
      pos.x,
      pos.y
    );
  };

  /**
   * 触摸开始响应函数
   */
  PatternLock.prototype.onMouseDownOrTouchStart = function (e) {
    e.preventDefault();

    var coor = this.getEvtPos(e),
        pos = this.getStdPos(this.windowToCanvas(coor.x, coor.y)),
        index = this.getTargetCircle(pos),
        centers = this.options.centers,
        radius = this.options.pointRadius;

    // 如果选中了圆，记录该圆的索引，改变它的背景色，监听触摸滑动和触摸结束事件，
    // 保存当前绘图
    if (index !== void 0) {
      this.currentCircle = index;
      this.result.push(index);
      this.drawCircle(this.pointCtx, centers[index][0], centers[index][1], radius, 'fill');

      // 开始监听触摸移动和触摸结束事件
      this.$container.on('touchmove', $.proxy(this.onMouseMoveOrTouchMove, this));
      this.$container.on('touchend', $.proxy(this.onMouseUpOrTouchEnd, this));
      this.$container.on('mousemove', $.proxy(this.onMouseMoveOrTouchMove, this));
      this.$container.on('mouseup', $.proxy(this.onMouseUpOrTouchEnd, this));
    }
  };

  /**
   * 触摸移动响应函数
   */
  PatternLock.prototype.onMouseMoveOrTouchMove = function (e) {
    e.preventDefault();

    var coor = this.getEvtPos(e),
        pos = this.getStdPos(this.windowToCanvas(coor.x, coor.y)),
        index = this.getTargetCircle(pos),
        centers = this.options.centers,
        radius = this.options.pointRadius;

    // 滑到了一个圆处，需要选中该圆，改变橡皮筋起点
    if (index !== void 0) {
      // 已经记录过的圆，直接返回
      if (this.result.indexOf(index) > -1) return;
      // 画线
      this.drawLine(this.lineCtx, centers[this.currentCircle][0], centers[this.currentCircle][1], centers[index][0], centers[index][1]);

      // 该圆存入结果中
      this.result.push(index);

      // 高亮该圆
      this.drawCircle(this.pointCtx, centers[index][0], centers[index][1], radius, 'fill');
      // 改变橡皮筋起点
      this.currentCircle = index;
      // 清除橡皮筋
      this.elasticCtx.clearRect(0, 0, this.width, this.height);
      return;
    }
    this.updateElastic(pos);
  };

  /**
   * 触摸结束响应函数
   */
  PatternLock.prototype.onMouseUpOrTouchEnd = function (e) {
    // 解绑事件
    this.$container.off('touchmove');
    this.$container.off('touchend');
    this.$container.off('mousemove');
    this.$container.off('mouseup');

    var password = this.result.join('');
    // 设置模式，记录密码，进入'again'状态
    if (this.options.mode === 'set') {
      // 验证密码长度
      if (password.length < this.options.minLength) {
        var shortEvent = $.Event('short.gesturepassword', {shortPassword: password});
        this.$container.trigger(shortEvent);
      } else {
        this.initPassword = password;
        this.options.mode = 'again';
        var initEvent = $.Event('init.gesturepassword', {initPassword: password});
        this.$container.trigger(initEvent);
      }

    // again状态，验证密码是否一致
    } else if (this.options.mode === 'again') {
      // 密码不一致
      if (this.initPassword !== password) {
        var diffEvent = $.Event('diff.gesturepassword', {diffPassword: password});
        this.$container.trigger(diffEvent);
      // 密码一致
      } else {
        var setEvent = $.Event('set.gesturepassword', {password: password});
        this.$container.trigger(setEvent);
        this.password = password;
      }

    // validate状态
    } else if (this.options.mode === 'validate') {
      if (!this.password) throw new Error('No password set');
      if (password !== this.password) {
        var wrongEvent = $.Event('wrong.gesturepassword', {wrongPassword: password});
        this.$container.trigger(wrongEvent);
      } else {
        var correctEvent = $.Event('correct.gesturepassword');
        this.$container.trigger(correctEvent);
      }
    }

    // 重置组件状态
    this.result = [];
    // 去掉橡皮筋
    this.elasticCtx.clearRect(0, 0, this.width, this.height);
    // 延迟半秒擦除密码
    setTimeout($.proxy(function () {
      this.pointCtx.clearRect(0, 0, this.width, this.height);
      this.lineCtx.clearRect(0, 0, this.width, this.height);
    }, this), 500);
  };


  // API
  // ===============

  /**
   * 切换到设置密码状态
   */
  PatternLock.prototype.set = function () {
    this.options.mode = 'set';
  };

  /**
   * 切换到验证密码状态
   */
  PatternLock.prototype.validate = function () {
    this.options.mode = 'validate';
  };

  /**
   * 使组件不可用
   */
  PatternLock.prototype.disable = function () {
    this.$container.off('mousedown');
    this.$container.off('touchstart');
  };

  /**
   * 使组件可用
   */
  PatternLock.prototype.enable = function () {
    this.$container.on('mousedown', $.proxy(this.onMouseDownOrTouchStart, this));
    this.$container.on('touchstart', $.proxy(this.onMouseDownOrTouchStart, this));
  };


  // 插件方法
  // ================

  function Plugin (option) {
    return this.each(function () {
      var $this   = $(this),
          data    = $this.data('patternLock'),
          options = $.extend({}, PatternLock.DEFAULTS, $this.data(), typeof option == 'object' && option);

      if (!data) $this.data('patternLock', (data = new PatternLock(this, options)));
      if (typeof option == 'string') data[option]();
    });
  }

  // 命名冲突处理
  // =================

  var old = $.fn.patternLock;

  $.fn.patternLock = Plugin;
  $.fn.patternLock.Constructor = PatternLock;

  $.fn.patternLock.noConflict = function () {
    $.fn.patternLock = old;
    return this;
  };

  $(function () {
    Plugin.call($('.pattern-lock'));
  });

})(jQuery);
