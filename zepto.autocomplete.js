;
var ZeptoAutocomplete = {
    init: function (limit, data) {
        this.limit = limit;
        this.data = data;
        this.remoteTimeout = 3000;
        this._setSelectionRange();
    },
    _clear: function () {
        this.limit = 2;
        this.data = '';
        this.remoteTimeout = 3000;
    },
    _setSelectionRange: function () {
        $('.autocomplete-input').click(function (event) {
            this.setSelectionRange(0, this.value.length);
        });
    },
    autocomplete: function (options) {
        this._clear();
        if (!this._isDataSourceDefined(options)) {
            return;
        }
        if (this._isLocal(options)) {
            this._initLocal(options.limit, options.data);
            return;
        }
        if (this._isRemote(options)) {
            this._initRemote(options.limit, options.data);
        }
    },
    _isDataSourceDefined: function (options) {
        return typeof options !== "undefined" &&
            typeof options.datasource !== "undefined" &&
            options.datasource !== "" &&
            options.datasource;
    },
    _isRemote: function (options) {
        return options.datasource === 'remote' && typeof options.data !== "undefined" && options.data;
    },
    _isLocal: function (options) {
        return options.datasource === 'local' && typeof options.data !== "undefined" && $.isArray(options.data);
    },
    _initLocal: function (limit, data) {
        this.init(limit, data);
        var searchTextField = $('.autocomplete-input');
        var _this = this;
        searchTextField.bind("keyup", $.proxy(this._handleLocalSearch, _this));
    },
    _initRemote: function (limit, data) {
        this.init(limit, data);
        var searchTextField = $('.autocomplete-input');
        var _this = this;
        searchTextField.bind("keyup", $.proxy(this._handleRemoteSearch, _this));
    },
    _isWithinLimit: function (message) {
        return message !== undefined && message.length > this.limit;
    },
    _handleLocalSearch: function () {
        var message = $('.autocomplete-input').val();
        if (!this._isWithinLimit(message)) {
            this._clearResults();
            return;
        }
        this._successHandler(this.data.filter(function (i) {
            return i.indexOf(message) > -1;
        }));
    },
    _handleRemoteSearch: function (evt) {
        var message = $('.autocomplete-input').val();
        var url = this.data + message;
        if (!this._isWithinLimit(message)) {
            this._clearResults();
            return;
        }
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            success: $.proxy(this._successHandler, this),
            error: function (err) {
                alert('Request failed to load suggestions.');
            },
            timeout: this.remoteTimeout
        });
    },
    _successHandler: function (data) {
        if (data === undefined && data.length <= 0)
            return;
        var resultContainer = $('.auto-complete-result');
        var autocompleteHTML = "<ol>";
        $.map(data, function (listItem) {
            autocompleteHTML += "<li>" + listItem + "</li>";
        });
        autocompleteHTML += "</ol>";
        resultContainer.html(autocompleteHTML);
        var _this = this;
        $('.auto-complete-result li').on('click', function (evt) {
            var selectedValue = $(this).text();
            $('.autocomplete-input').val(selectedValue);
            _this._clearResults();
        });
        resultContainer.show();
    },
    _clearResults: function () {
        var resultContainer = $('.auto-complete-result');
        resultContainer.html('');
        resultContainer.hide();
    }
};
(function ($) {
    $.extend($.fn, ZeptoAutocomplete);
    $.autocomplete = $.fn.autocomplete;
})(Zepto);