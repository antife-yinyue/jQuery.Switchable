(function($) {

  /**
   * 淡入淡出效果
   */
  $.switchable.Effects['fade'] = function(from, to) {
    var self = this,
        cfg = self.config,
        panels = self.panels,
        fromPanel = panels.eq(from),
        toPanel = panels.eq(to);

    if ( self.anim ) {
      self.anim.stop();
      // 继续上次未完成
      panels
        .eq(self.anim.to).css({zIndex: self.length})
        .end()
        .eq(self.anim.from).css({opacity: 0, zIndex: 1});
    }

    // 1. 去掉不透明度
    toPanel.css({opacity: 1});

    self.anim = new $.switchable.Anim(fromPanel, {opacity: 0}, cfg.duration, cfg.easing, function(){
      // 2. 调整 z-index
      toPanel.css({zIndex: self.length});
      fromPanel.css({zIndex: 1});
      self.anim = undefined;
    }, 'opacity').run();

    // 存储本次切换的索引
    self.anim.from = from;
    self.anim.to = to;
  };


  $.switchable.Plugins.push({
    name: 'fade effect',

    init: function(host) {
      var cfg = host.config,
          initPanel = host.panels.eq(host.index);

      // fade effect only supports steps == 1.
      if ( cfg.effect !== 'fade' || cfg.steps !== 1 ) {
        return;
      }

      // init styles
      host.panels.not( initPanel ).css({opacity: 0, zIndex: 1});
      initPanel.css({opacity: 1, zIndex: host.length});
    }
  });

})(jQuery);