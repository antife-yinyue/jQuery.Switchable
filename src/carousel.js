(function($) {

  // 新增参数
  $.extend($.switchable.Config, {
    // Selector, jQuery
    prev: null,
    next: null
  });


  /**
   * API:
   * 
   * this.prevBtn  =>  jQuery
   * this.nextBtn  =>  jQuery
   */
  $.switchable.Plugins.push({
    name: 'carousel',

    init: function(host) {
      var cfg = host.config,
          direction = ['backward', 'forward'],
          prefix = ['prev', 'next'],
          _prefix, _cfg,
          btn, i = 0;

      if ( !cfg.prev && !cfg.next ) {
        return;
      }

      for ( ; i < 2; i++ ) {
        _prefix = prefix[i];
        _cfg = cfg[_prefix];

        if ( _cfg ) {
          // 新增API
          btn = host[_prefix + 'Btn'] = _cfg.jquery ? _cfg : $(_cfg);

          btn.click(
            { direction: direction[i] }, // 传递参数
            function(e) {
              e.preventDefault();

              if ( !host.anim ) {
                var d = e.data.direction,
                    to = host.willTo(d === direction[0]);

                if ( to !== false ) {
                  host.switchTo(to, d);
                }
              }
            }
          );

        }
      }

    }
  });

})(jQuery);