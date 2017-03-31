// Pattern Lock
// -------------------

(function ($) {
  'use strict';

  if (typeof $ === 'undefined') throw new Error('Pattern lock need jquery as a dependency.');

  var PatternLock = function (canvas, options) {
    this.$el = $(canvas);
    this.canvas = canvas;
    this.options = options;
    this.context = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // 只有九个圆的初始绘图
    this.originalDrawing = null;
    // 当前选中的圆
    this.currentCircle = -1;
    // 当前绘图
    this.drawingSurface = null;
    // 橡皮筋区域
    this.rubberbandRect = {};
    // 存放滑过的圆索引，触摸结束时即手势结果
    this.result = [];
    // 初始状态下设置的密码
    this.initPassword = '';

    this.init();
  };

  PatternLock.DEFAULTS = {
    mode: 'set',
    minLength: 5,
    lineColor: '#888',
    circleStrokeColor: '#888',
    circleFillColor: '#f00',
    lineWidth: 2,
    radius: 0.07,
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
   * 初始化
   */
  PatternLock.prototype.init = function () {
    this.options.centers.forEach($.proxy(function (pos) {
      this.drawCircle(pos[0], pos[1], this.options.radius, 'stroke');
    }), this);
    // 保存初始绘图
    this.originalDrawing = this.saveDrawing();
    // 添加触摸和鼠标事件响应
    this.$el.on('touchstart', $.proxy(this.onMouseDownOrTouchStart, this));
    this.$el.on('mousedown', $.proxy(this.onMouseDownOrTouchStart, this));
  };

  /**
   * 绘制一个圆
   * @param x {Number} 圆心x坐标
   * @param y {Number} 圆心y坐标
   * @param r {Number} 圆半径
   * @param type {String} 描边或填充
   * @param style {Object} 样式
   */
  PatternLock.prototype.drawCircle = function (x, y, r, type, style) {
    this.context = $.extend(this.context, {
      strokeStyle: this.options.circleStrokeColor,
      lineWidth: this.options.lineWidth,
      fillStyle: this.options.circleFillColor
    }, style || {});

    this.context.beginPath();
    this.context.arc(this.width * x, this.height * y, this.width * r, 0, Math.PI * 2);
    type === 'stroke' ? this.context.stroke() : this.context.fill();
  };

  /**
   * 绘制一条线
   * @param x1 {Number} 起点x坐标
   * @param y1 {Number} 起点y坐标
   * @param x2 {Number} 终点x坐标
   * @param y2 {String} 终点y坐标
   * @param style {Object} 样式
   */
  PatternLock.prototype.drawLine = function (x1, y1, x2, y2, style) {
    this.context = $.extend(this.context, {
      strokeStyle: this.options.lineColor,
      lineWidth: this.options.lineWidth
    }, style || {});

    this.context.beginPath();
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
  };

  /**
   * 保存当前绘图
   */
  PatternLock.prototype.saveDrawing = function () {
    return this.context.getImageData(0, 0, this.width, this.height);
  };

  /**
   * 恢复到指定绘图
   */
  PatternLock.prototype.restoreDrawing = function (drawing) {
    drawing && this.context.putImageData(drawing, 0, 0);
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
    var bbox = this.canvas.getBoundingClientRect();
    return {
      x: x - bbox.left * (this.canvas.width / bbox.width),
      y: y - bbox.top * (this.canvas.height / bbox.height)
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
        radius = this.options.radius;
    for (var i = 0; i < 9; i++) {
      if (pos.x < centers[i][0] + radius &&
          pos.x > centers[i][0] - radius &&
          pos.y < centers[i][1] + radius &&
          pos.y > centers[i][1] - radius)
        return i;
    }
  };

  /**
   * 更新橡皮筋区域
   */
  PatternLock.prototype.updateRubberbandRect = function (pos) {
    var centers = this.options.centers,
        startX = centers[this.currentCircle][0],
        startY = centers[this.currentCircle][1];
    this.rubberbandRect.width = Math.abs(pos.x - startX);
    this.rubberbandRect.height = Math.abs(pos.y - startY);

    if (pos.x > startX) this.rubberbandRect.left = startX;
    else this.rubberbandRect.left = pos.x;
    if (pos.y > startY) this.rubberbandRect.top = startY;
    else this.rubberbandRect.top = pos.y;
  };

  /**
   * 绘制橡皮筋
   */
  PatternLock.prototype.drawRubberband = function (pos) {
    var centers = this.options.centers;
    this.drawLine(
      centers[this.currentCircle][0] * this.width,
      centers[this.currentCircle][1] * this.height,
      pos.x * this.width,
      pos.y * this.height
    );
  };

  /**
   * 更新橡皮筋
   */
  PatternLock.prototype.updateRubberband = function (pos) {
    this.updateRubberbandRect(pos);
    this.drawRubberband(pos);
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
        radius = this.options.radius;

    // 如果选中了圆，记录该圆的索引，改变它的背景色，监听触摸滑动和触摸结束事件，
    // 保存当前绘图
    if (index !== void 0) {
      this.currentCircle = index;
      this.result.push(index);
      this.drawCircle(centers[index][0], centers[index][1], radius, 'fill');
      this.drawingSurface = this.saveDrawing();

      // 开始监听触摸移动和触摸结束事件
      this.$el.on('touchmove', $.proxy(this.onMouseMoveOrTouchMove, this));
      this.$el.on('touchend', $.proxy(this.onMouseUpOrTouchEnd, this));
      this.$el.on('mousemove', $.proxy(this.onMouseMoveOrTouchMove, this));
      this.$el.on('mouseup', $.proxy(this.onMouseUpOrTouchEnd, this));
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
        radius = this.options.radius;

    // 滑到了一个圆处，需要选中该圆，改变橡皮筋起点
    if (index !== void 0) {
      // 已经记录过的圆，直接返回
      if (this.result.indexOf(index) > -1) return;
      // 橡皮筋弹到圆中心
      this.restoreDrawing(this.drawingSurface);
      pos.x = centers[index][0];
      pos.y = centers[index][1];
      this.updateRubberband(pos);

      // 该圆存入结果中
      this.result.push(index);

      // 高亮该圆
      this.drawCircle(centers[index][0], centers[index][1], radius, 'fill');
      // 改变橡皮筋起点
      this.currentCircle = index;
      // 为下一轮的橡皮筋效果保存绘图
      this.drawingSurface = this.saveDrawing();
      return;
    }
    this.restoreDrawing(this.drawingSurface);
    this.updateRubberband(pos);
  };

  /**
   * 触摸结束响应函数
   */
  PatternLock.prototype.onMouseUpOrTouchEnd = function (e) {
    // 去掉橡皮筋
    this.restoreDrawing(this.drawingSurface);

    // 解绑事件
    this.$el.off('touchmove');
    this.$el.off('touchend');
    this.$el.off('mousemove');
    this.$el.off('mouseup');

    var password = this.result.join('');
    // 设置模式，记录密码，进入'again'状态
    if (this.options.mode === 'set') {
      // 验证密码长度
      if (password.length < this.options.minLength) {
        var shortEvent = $.Event('short.gesturepassword');
        this.$el.trigger(shortEvent);
      } else {
        this.initPassword = password;
        this.options.mode = 'again';
        var initEvent = $.Event('init.gesturepassword', {initPassword: this.initPassword});
        this.$el.trigger(initEvent);
      }

    // again状态，验证密码是否一致
    } else if (this.options.mode === 'again') {
      // 密码不一致
      if (this.initPassword !== password) {
        var diffEvent = $.Event('diff.gesturepassword', {diffPassword: password});
        this.$el.trigger(diffEvent);
      // 密码一致，写入localStorage
      } else {
        var setEvent = $.Event('set.gesturepassword');
        this.$el.trigger(setEvent);
        localStorage.setItem('gesture-password', password);
      }

    // validate状态
    } else if (this.options.mode === 'validate') {
      var target = localStorage.getItem('gesture-password');
      if (password !== target) {
        var wrongEvent = $.Event('wrong.gesturepassword', {wrongPassword: password});
        this.$el.trigger(wrongEvent);
      } else {
        var correctEvent = $.Event('correct.gesturepassword');
        this.$el.trigger(correctEvent);
      }
    }

    // 重置组件状态
    this.result = [];
    this.drawingSurface = null;
    // 延迟半秒擦除密码
    setTimeout($.proxy(function () {
      this.restoreDrawing(this.originalDrawing);
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
    this.$el.off('mousedown');
    this.$el.off('touchstart');
  };

  /**
   * 使组件可用
   */
  PatternLock.prototype.enable = function () {
    this.$el.on('mousedown', $.proxy(this.onMouseDownOrTouchStart, this));
    this.$el.on('touchstart', $.proxy(this.onMouseDownOrTouchStart, this));
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

  // 初始化拥有'pattern-lock'类的组件
  Plugin.call($('.pattern-lock'));

})(jQuery);
