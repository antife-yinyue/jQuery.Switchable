(function($){

  $.switchable = {
    /**
     * 配置
     */
    Config: {
      // Boolean, String, jQuery
      triggers: true,

      // 使用何种方法把自动生成的 triggers 插入到DOM树中, 位置相对于 panels 的容器
      putTriggers: 'insertAfter', // 常用的还有: insertBefore 和 appendTo

      // triggers's wrap 的 className, 自动生成 triggers 时生效, 方便为 triggers 设置样式
      triggersWrapCls: 'switchable-triggers',

      // 当前 trigger 的 className
      currentTriggerCls: 'current',

      // Selector, jQuery
      panels: null,

      // 每次切换所包含的 panels 的数量
      steps: 1,

      // 触发类型
      triggerType: 'mouse', // or 'click'

      // 触发延迟, 单位: 秒
      delay: .1, // 100ms

      // 默认激活项
      initIndex: 0,

      // 效果
      effect: 'none',

      easing: 'ease',

      // 每次切换所花的时间, 单位: 秒
      duration: .5,

      // 循环
      loop: true,

      beforeSwitch: null,

      onSwitch: null,

      api: false
    },

    /**
     * 切换效果
     */
    Effects: {
      'none': function(from, to) {
        var self = this,
            cfg = self.config;

        self.panels
          .slice(from * cfg.steps, (from + 1) * cfg.steps).hide()
          .end()
          .slice(to * cfg.steps, (to + 1) * cfg.steps).show();

      }
    },

    /**
     * 插件
     */
    Plugins: []
  };


  /**
   * API:
   * 
   * this.config      =>  Object
   * this.container   =>  jQuery
   * this.triggers    =>  jQuery
   * this.panels      =>  jQuery
   * this.length      =>  Number
   * this.index       =>  Number
   * this.willTo()    =>  Number, Boolean
   * this.switchTo()  =>  Function
   */
  function Switchable($container, cfg, selector){
    var self = this,
        $self = $(this),
        _beforeFn = 'beforeSwitch',
        _onFn = 'onSwitch';

    if ( $.isFunction(cfg[_beforeFn]) ) {
      $self.bind(_beforeFn, cfg[_beforeFn]);
    }
    if ( $.isFunction(cfg[_onFn]) ) {
      $self.bind(_onFn, cfg[_onFn]);
    }

    $.extend(self, {
      /**
       * install plugins
       */
      _initPlugins: function() {
        var plugins = $.switchable.Plugins,
            len = plugins.length,
            i = 0;

        for ( ; i < len; i++ ) {
          if ( plugins[i].init ) {
            plugins[i].init(self);
          }
        }
      },

      /**
       * init Switchable
       */
      _init: function() {
        self.container = $container;
        self.config = cfg;

        // 获取 panels
        if ( !!cfg.panels && (cfg.panels.jquery || $.type(cfg.panels) === 'string') ) {
          self.panels = $container.find(cfg.panels);
        } else {
          self.panels = $container.children();
        }

        // panel-groups's length
        self.length = Math.ceil(self.panels.length / cfg.steps);

        // if no panel
        if ( self.length < 1 ) {
          window.console && console.warn('No panel in ' + selector);
          return;
        }

        // 当前自然数索引
        self.index = cfg.initIndex === null ? undefined : (cfg.initIndex + (cfg.initIndex < 0 ? self.length : 0));

        // 不使用效果时直接显示, 否则由各 effect 自己初始化
        if ( cfg.effect === 'none' ) {
          self.panels.slice(self.index * cfg.steps, (self.index + 1) * cfg.steps).show();
        }

        // 获取 triggers 并绑定事件
        if ( !!cfg.triggers ) {
          var trigger, i, index;

          if ( cfg.triggers.jquery ) {
            self.triggers = cfg.triggers.slice(0, self.length);

          } else {
            // 自动生成 triggers 的 markup
            var custom = $.type(cfg.triggers) === 'string',
                arr = [];

            for ( i = 1; i <= self.length; i++ ) {
              arr.push('<li>' + (custom ? cfg.triggers : i) + '</li>');
            }

            self.triggers = $('<ul/>', {
              'class': cfg.triggersWrapCls,
              'html': arr.join('')
            })[cfg.putTriggers]( $container ).find('li');
          }

          // 为激活项对应的 trigger 添加 currentTriggerCls
          self.triggers.eq(self.index).addClass(cfg.currentTriggerCls);

          // bind event
          for ( i = 0; i < self.length; i++ ) {
            trigger = self.triggers.eq(i);

            trigger.click({ index: i }, function(e) {
              index = e.data.index;

              // 避免重复触发
              if ( !self._triggerIsValid(index) ) {
                return;
              }

              self._cancelDelayTimer();
              self.switchTo(index);
            });

            if ( cfg.triggerType === 'mouse' ) {
              trigger.mouseenter({ index: i }, function(e) {
                index = e.data.index;

                // 避免重复触发
                if ( !self._triggerIsValid(index) ) {
                  return;
                }

                self._delayTimer = setTimeout(function(){
                  self.switchTo(index);
                }, cfg.delay * 1000);

              }).mouseleave(function() {
                self._cancelDelayTimer();
              });
            }
          }

        }

      },

      /**
       * is repeat?
       */
      _triggerIsValid: function(to) {
        return self.index !== to;
      },

      /**
       * cancel delay timer
       */
      _cancelDelayTimer: function() {
        if ( self._delayTimer ) {
          clearTimeout(self._delayTimer);
          self._delayTimer = undefined;
        }
      },

      /**
       * switch a trigger
       */
      _switchTrigger: function(from, to) {
        self.triggers
          .eq(from).removeClass(cfg.currentTriggerCls)
          .end()
          .eq(to).addClass(cfg.currentTriggerCls);
      },

      /**
       * switch panels
       */
      _switchPanels: function(from, to, direction) {
        $.switchable.Effects[cfg.effect].call(self, from, to, direction);
      },

      /**
       * get toIndex
       */
      willTo: function(isBackward) {
        if ( isBackward ) {
          return self.index > 0 ? self.index - 1 : (cfg.loop ? self.length - 1 : false);
        } else {
          return self.index < self.length - 1 ? self.index + 1 : (cfg.loop ? 0 : false);
        }
      },

      /**
       * switch to
       */
      switchTo: function(to, direction) {
        // call beforeSwitch()
        var event = $.Event(_beforeFn);
        $self.trigger(event, [to]);
        // 如果 beforeSwitch() return false 则阻止本次切换
        if ( event.isDefaultPrevented() ) {
          return;
        }

        // switch panels & triggers
        self._switchPanels(self.index, to, direction);
        if ( !!cfg.triggers ) {
          self._switchTrigger(self.index, to);
        }

        // update index
        self.index = to;

        // call onSwitch()
        event.type = _onFn;
        $self.trigger(event, [to]);

        return self;
      }
    });

    // 初始化并安装插件
    self._init();
    self._initPlugins();
  }


  $.fn.switchable = function(cfg) {
    var $self = $(this),
        len = $self.length,
        selector = $self.selector,
        el = [],
        i;

    cfg = $.extend({}, $.switchable.Config, cfg);
    // 将 effect 格式化为小写
    cfg.effect = cfg.effect.toLowerCase();

    for ( i = 0; i < len; i++ ) {
      el[i] = new Switchable($self.eq(i), cfg, selector + '[' + i + ']');
    }

    return cfg.api ? el[0] : $self;
  };

})(jQuery);