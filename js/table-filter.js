/* ========================================================================
 * Bootstrap: tablefilter.js v0.1
 * 
 * ========================================================================
 * Copyright 2016 Adrian Cieślak <rettush@gmail.com>
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  "use strict";

  // PLUGIN NAME PUBLIC CLASS DEFINITION
  // ==============================

  var TableFilter = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, TableFilter.DEFAULTS, options)

    this.$trFiltered = []
    this.criteria = {}

    this.start();

    this.options.hover == 'hover' && !('ontouchstart' in document.documentElement) && ((this.options.parent && this.$element.parents(this.options.parent)) || this.$element)
      .on('mouseenter.bs.tablefilter', $.proxy(this.toggle, this))
      .on('mouseleave.bs.tablefilter', $.proxy(this.toggle, this))
  }

  TableFilter.VERSION = '0.0.1'

  TableFilter.TRANSITION_DURATION = 600

  TableFilter.DEFAULTS = {
    hover: 'hover',
    parent: null,
    class: 'table-filter',
    noResultHtml: 'No results found',
    noResultTrClass: 'no-result',
    noResultTdClass: null,
    ignoreKeys: [
      9,
      13, // enter key
      16,
      17,
      18,
      91,
      93
    ],
    ignoreFields: null
  }

  TableFilter.prototype.getFields = function (type) {
    if (!type) {
      return $([])
    }

    var $fields = this.$element.find(type)

    if (type === 'th') {
      this.options.colspan = $fields.length
    }

    if (this.options.ignoreFields) {
      if(/[\.|\:|\#]/i.test(this.options.ignoreFields)) {
        $fields = $fields.not(this.options.ignoreFields)
      }
    }

    return $fields;
  }

  TableFilter.prototype.start = function () {
    if (this.options.class) {
      this.$element.addClass(this.options.class)
    }

    this.$tbody = this.$element.find('tbody')

    this.$th = this.getFields('th')

    this.$tr = this.getFields('tbody > tr')

    this.$tr.addClass('collapse fade in')

    this.$trFiltered = $([])

    // this.options.colspan = this.$th.length

    this.$th.each(function (index, element) {
      var $input = $('<input />', {
        placeholder: $(element).text(),
        class: 'form-control',
        attr: {
          'data-input': index,
          'data-value': ''
        }
      })

      $(element).html($input)
    })

    this.$input = this.$element.find('[data-input]')

    var criteria = {}

    this.$input.each(function (idx, el) {
      criteria[idx] = el.value
    })

    this.criteria = criteria

    if (this.options.hover == 'hover') {
      this.$input.prop('disabled', true)
    }

    this.$input
      .on('keyup.bs.tablefilter', $.proxy(this.keyup, this))

    var $td = $('<td />', {
      class: this.options.noResultTdClass || '',
      html: this.options.noResultHtml,
      colspan: this.options.colspan
    })
    var $tr = $('<tr />', {
      class: this.options.noResultTrClass + ' collapse fade' || '',
      html: $td
    })

    this.$tbody.append($tr);

    this.$trNoResult = this.$tbody.find('.' + this.options.noResultTrClass)
  }

  TableFilter.prototype.toggle = function (e) {
    var $target = $(e.target)

    switch (e.type) {
      case 'mouseleave':
        this.$input.each(function () {
          $(this).data('value', this.value)
          this.value = ''
        })
        this.$input.focusout().prop('disabled', true)
        break
      case 'mouseenter':
        this.$input.prop('disabled', false).each(function () {
          this.value = $(this).data('value')
        })
        this.$input.first().focus()
        break
    }
  }

  TableFilter.prototype.keyup = function (e) {
    if (!/input/i.test(e.target.tagName)) return

    var code = e.keyCode || e.which;

    if ($.inArray(code, this.options.ignoreKeys) != -1) return;

    var $this = $(e.target)
    var inputValue = $this.val().toLowerCase()
    var index = $this.data('input')
    var criteria = this.criteria

    this.criteria[index] = inputValue

    $this.data('value', inputValue)

    this.$tr.addClass('in')

    var $trFiltered = this.$tr.filter(function () {
      var isset
      var $td = $(this).find('td')

      $.each(criteria, function (key, val) {
        if (val === '') return

        var $this = $td.eq(key)

        if ($this.text().toLowerCase().indexOf(val) === -1)
          isset = true
      })

      return !!isset
    })

    this.$trFiltered = $trFiltered

    this.noResult()

    e.preventDefault()
  }

  TableFilter.prototype.noResult = function () {
    this.$trNoResult.removeClass('in')
    this.$trFiltered.removeClass('in')

    this.$tr.not(this.$trFiltered).addClass('in')

    if (this.$tr.length - this.$trFiltered.length == 0) {
      this.$trNoResult.addClass('in')
    }
  }

  // PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data = $this.data('bs.tablefilter')
      var options = $.extend({}, TableFilter.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action = typeof option == 'string' ? option : null

      if (!data) $this.data('bs.tablefilter', (data = new TableFilter(this, options)))

      if (action) data[action]()
    })
  }

  var old = $.fn.TableFilter

  $.fn.tablefilter = Plugin

  $.fn.tablefilter.Constructor = TableFilter


  // PLUGIN NO CONFLICT
  // ==================

  $.fn.tablefilter.noConflict = function () {
    $.fn.tablefilter = old
    return this
  }


  // PLUGIN DATA-API
  // ===============

  $(window).on('load', function () {
    $('[data-ride="tablefilter"]').each(function () {
      var $tablefilter = $(this)
      Plugin.call($tablefilter, $tablefilter.data())
    })
  })

} (window.jQuery);