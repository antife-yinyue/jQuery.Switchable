(function($) {

  var effects = ['accordion', 'horizaccordion'],
      fxAttrs = [
        ['height', 'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'],
        ['width', 'marginLeft', 'marginRight', 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth']
      ];


  // 新增参数
  $.extend($.switchable.Config, {
    // 允许同时展开多个 panels
    multiple: false,
    // 收缩状态的样式
    customProps: {}
  });


  /**
   * 手风琴效果
   */
  for ( var i = 0; i < 2; i++ ) {
    $.switchable.Effects[effects[i]] = function(from, to) {
      var self = this,
          cfg = self.config,
          neq = from !== to;

      // toggle toPanel
      if ( self.anim ) {
        self.anim.stop(neq);
      }

      self.anim = new $.switchable.Anim(
        self.panels.eq(to),
        // triggers 在 panels 之后切换, 如果 triggers 有 currentTriggerCls, 则 panels 的动作是: 收缩
        self.triggers.eq(to).hasClass(cfg.currentTriggerCls) ? self.collapseProps : self.expandProps[to],
        cfg.duration,
        cfg.easing,
        function(){ self.anim = undefined; }
      ).run();


      // 非 multiple 模式下, 同时收缩 fromPanel
      if ( !cfg.multiple && from !== undefined && neq ) {
        if ( self.anim2 ) {
          self.anim2.stop(neq);
        }

        self.anim2 = new $.switchable.Anim(
          self.panels.eq(from),
          self.collapseProps,
          cfg.duration,
          cfg.easing,
          function(){ self.anim2 = undefined; }
        ).run();
      }

    };
  }


  $.switchable.Plugins.push({
    name: 'accordion effect',

    init: function(host) {
      var cfg = host.config,
          index = $.inArray(cfg.effect, effects);

      if ( index === -1 || cfg.steps !== 1 ) {
        return;
      }

      window.console && console.info("Remember to set the border-width for the accordion's panels, even without border.");

      // 调整内部api
      $.extend(host, {
        // 同一个 trigger 可被连续触发, 即切换 panel 的展开/收缩状态
        _triggerIsValid: function(to) {
          return true;
        },

        _switchTrigger: function(from, to) {
          var triggers = host.triggers,
              cls = cfg.currentTriggerCls;

          triggers.eq(to).toggleClass(cls);
          // 非 multiple 模式下, 展开一个 panel, 将同时自动收缩之前展开的 panel
          // 所以, 需要移除对应 trigger 的 currentTriggerCls
          if ( !cfg.multiple && from !== undefined && from !== to ) {
            triggers.eq(from).removeClass(cls);
          }
        }
      });


      host.expandProps = [];  // 各 panel 展开状态的styles
      host.collapseProps = {}; // panels 收缩状态的styles

      var len = fxAttrs[index].length,
          props = {},
          panel, fxAttr, i;

      for ( i = 0; i < len; i++ ) {
        host.collapseProps[fxAttrs[index][i]] = 0;
      }
      $.extend(host.collapseProps, cfg.customProps);

      for ( i = 0; i < host.length; i++ ) {
        panel = host.panels.eq(i);

        // 存储各 panel 展开状态的styles
        for ( var j = 0; j < len; j++  ) {
          fxAttr = fxAttrs[index][j];
          props[fxAttr] = panel.css(fxAttr);
        }
        host.expandProps.push( $.extend({}, props) );
      
        // init styles
        panel.css( $.extend({overflow: 'hidden'}, i === host.index ? props : host.collapseProps) );
      }

    }
  });

})(jQuery);