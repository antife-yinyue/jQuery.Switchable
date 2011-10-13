(function($) {

  var effects = ['scrollleft', 'scrollright', 'scrollup', 'scrolldown'],
      _position = 'position',
      _absolute = 'absolute',
      _relative = 'relative';

  // 新增参数
  $.extend($.switchable.Config, {
    // 首尾相连
    end2end: false,
    // panel-group 的尺寸, panels 多列垂直滚动或者自动获取不正确时设置
    groupSize: [],
    // container 内可见 panels 的数量
    visible: null,
    clonedCls: 'switchable-cloned'
  });


  /**
   * 滚动效果
   */
  for ( var i = 0; i < 4; i++ ) {
    $.switchable.Effects[effects[i]] = function(from, to, direction) {
      var self = this,
          cfg = self.config,
          max = self.length - 1,
          isBackward = direction === 'backward',
          isCritical = cfg.end2end && (isBackward && from === 0 && to === max || direction === 'forward' && from === max && to === 0),
          props = {};

      props[self.isHoriz ? 'left' : 'top'] = isCritical ? self._adjustPosition(isBackward) : -self.groupSize[self.isHoriz ? 0 : 1] * to;

      if ( self.anim ) {
        self.anim.stop();
      }

      self.anim = new $.switchable.Anim(self.panels.parent(), props, cfg.duration, cfg.easing, function(){
        if ( isCritical ) {
          self._resetPosition(isBackward);
        }
        self.anim = undefined;
      }).run();
    };
  }


  $.switchable.Plugins.push({
    name: 'scroll effect',

    init: function(host) {
      var cfg = host.config,
          steps = cfg.steps,
          panels = host.panels,
          wrap = panels.parent(),
          index = $.inArray(cfg.effect, effects),
          isHoriz = index === 0 || index === 1,
          w = panels.eq(0).outerWidth(true),
          h = panels.eq(0).outerHeight(true),
          x = isHoriz ? 0 : 1,
          max = host.length - 1,
          prop = isHoriz ? 'left' : 'top',
          props = {};

      if ( index === -1 ) {
        return;
      }

      // 1. 获取 panel-group 尺寸
      host.groupSize = [
        cfg.groupSize[0] || w * steps,
        cfg.groupSize[1] || h * steps
      ];

      // 2. if end2end == true
      // 注: 此时若是多列垂直滚动, 请确保 panels 的总个数是 steps 的整数倍
      if ( cfg.end2end ) {
        var len = panels.length,
            totalSize = !isHoriz && cfg.groupSize[0] ?
                          // 多列垂直滚动
                          host.groupSize[x] * host.length :
                            // 单行水平或单列垂直滚动
                            (isHoriz ? w : h) * len,
            lastGroupLen = len - max * steps,
            lastGroupSize = (isHoriz ? w : h) * lastGroupLen,
            adjustSize = !isHoriz && cfg.groupSize[0] ? host.groupSize[x] : lastGroupSize,
            start;

        // 强制 loop == true
        cfg.loop = true;

        // clone panels from beginning to end
        if ( cfg.visible && cfg.visible < len && cfg.visible > lastGroupLen ) {
          panels.slice(0, cfg.visible)
            .clone(true).addClass(cfg.clonedCls)
            .appendTo(wrap)
            // 同步 click 事件
            .click(function(e){
              e.preventDefault();
              panels.eq( $(this).index() - len ).click();
            });
        }

        $.extend(host, {
          /**
           * 调整位置
           */
          _adjustPosition: function(isBackward) {
            start = isBackward ? max : 0;

            props[_position] = _relative;
            props[prop] = (isBackward ? -1 : 1) * totalSize;
            panels.slice(start * steps, (start + 1) * steps).css(props);

            return isBackward ? adjustSize : -totalSize;
          },

          /**
           * 复原位置
           */
          _resetPosition: function(isBackward) {
            start = isBackward ? max : 0;

            props[_position] = '';
            props[prop] = '';
            panels.slice(start * steps, (start + 1) * steps).css(props);

            props[_position] = undefined;
            props[prop] = isBackward ? -host.groupSize[x] * max : 0;
            wrap.css(props);
          }
        });
      }

      // 3. 初始化样式
      if ( host.container.css(_position) == 'static' ) {
        host.container.css(_position, _relative);
      }

      props[_position] = _absolute;
      props[prop] = -host.groupSize[x] * host.index;
      wrap.css(props)
          .css('width',
            // 水平滚动时, 保证有足够的空间让 panels 一字排开
            isHoriz ? 2 * host.groupSize[x] * host.length :
              // 多列垂直滚动时, 让 panels 在限定宽度内折行
              cfg.groupSize[0] ? cfg.groupSize[0] : undefined
          );

      // 4. 存储动画属性, 便于外部(如 autoplay)调用
      host.isHoriz = isHoriz;
      host.isBackward = index === 1 || index === 3;
    }
  });

})(jQuery);