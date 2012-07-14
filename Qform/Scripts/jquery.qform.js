(function () {
    "use strict";
    var qform = function (element, options) {
        this.$element = $(element);
        this.options = options;
    };

    qform.prototype = {
        constructor: qform,
        setParm: function () {

        },
        qtipdestory: function () {
            this.$element.qtip('destroy');
            this.$element.children().qtip('destroy');
        },
        update: function () {
            clear.call(this);
            initUnverified.call(this);
        },
        init: function () {
            if (this.$element.data('validator')) {
                updateParsed.call(this);
            } else {
                initUnverified.call(this);
            }
        }
    };

    //private
    var displayErrors = function (errors) {
        var $form = this.$element, summary = [];
        for (var i = 0; i < errors.length; i++) {
            if (typeof errors[i] == "string") {
                summary.push(errors.splice(i--, 1));
            }
        }

        var $summary = $form.find("[data-val-summary]"),
                position = {
                    my: "bottom right",
                    at: "bottom right",
                    viewport: $(window)
                };
        if (!$summary.length) {
            $summary = $form;
            position = {
                my: "bottom center",
                at: "top center",
                viewport: $(window)
            };
        }
        if (summary.length) {
            var ul = "<ul>" + $.map(summary.join(",").split(","), function (v) {
                return "<li>" + v + "</li>";
            }).join("") + "</ul>";
            $summary.qtip({
                content: ul,
                position: position,
                show: {
                    event: false,
                    ready: true
                },
                hide: { /*target: $form, event: "submit",*/inactive: 3000 },
                style: {
                    classes: 'ui-tooltip-red ui-tooltip-shadow ui-tooltip-rounded'
                }
            });
        } else {
            $summary.qtip("destroy");
        }

        if (errors.length) {
            $.each(errors, function (i, error) {
                var elem = '#' + error.field.replace('.', '_').replace('[', '_').replace(']', '_'),
                    $elem = $(elem),
                    corners = ['left center', 'right center'],
                    flipIt = $elem.hasClass("right"),
                    message = error.message;

                if (message) {
                    $elem.qtip({
                        content: message,
                        position: {
                            my: corners[flipIt ? 0 : 1],
                            at: corners[flipIt ? 1 : 0],
                            viewport: $(window)
                        },
                        show: {
                            event: false,
                            ready: true
                        },
                        hide: { /*target: $form, event: "submit",*/inactive: 3000 },
                        style: {
                            classes: 'ui-tooltip-red ui-tooltip-shadow ui-tooltip-rounded'
                        }
                    });
                }
            });
        }
    };

    var formSubmitHandler = function () {
        var self = this, $form = self.$element;

        // We check if jQuery.validator exists on the form
        if ((!$form.valid || $form.valid())) {
            if ($form.data("prevent-post")) {
                $form.trigger("submitHandler");
            } else {
                //no repeat submit
                if ($form.data("post-disabled")) {
                    return;
                } else {
                    $form.data("post-disabled", true);
                    setTimeout(function () {
                        $form.data("post-disabled", false);
                    }, 1000);
                }

                $.post($form.attr('action'), $form.serializeArray())
                    .done(function (json) {
                        json = json || {};

                        // In case of success, we redirect to the provided URL or the same page.
                        if (json.success) {
                            //reset form
                            if ($form.data("form-reset")) {
                                $form.get(0).reset();
                                $form.validate().resetForm();
                                $form.find(".control-group").removeClass("error success");
                            }
                            if ($form.data("form-redirect")) window.location = ($form.data("form-redirect"));
                            $form.trigger("submitHandler", [json.data]);
                        } else if (json.errors) {
                            displayErrors.call(self, json.errors);
                        }
                    });
                //                    .error(function () {
                //                        displayErrors.call(self, ['An unknown error happened.']);
                //                    });
            }
        }

    };

    var clear = function () {
        this.$element.removeData("validator");
        this.$element.off("submit");
        this.$element.off("click");
        this.$element.off("focusin");
        this.$element.off("focusout");
        this.$element.off("keyup");
        this.$element.off("invalid-form");
        this.$element.removeData("unobtrusiveValidation");
    };

    var initUnverified = function () {
        var $val = $(this.$element).find(":input[data-val=true]");
        if ($val.length === 0) return;
        $val.each(function () {
            $.validator.unobtrusive.parseElement(this);
        });
        updateParsed.call(this);
    };

    var updateParsed = function () {
        var self = this, $form = self.$element,
            settings = $form.data('validator').settings;

        settings.errorPlacement = function (error, element) {
            var $elem = $(element),
                corners = ['left center', 'right center'],
                flipIt = $elem.hasClass("right");

            if (!error.is(':empty')) {
                $elem.filter(':not(.valid)').qtip({
                    overwrite: false,
                    content: error,
                    position: {
                        my: corners[flipIt ? 0 : 1],
                        at: corners[flipIt ? 1 : 0],
                        viewport: $(window)
                    },
                    show: {
                        event: false,
                        ready: true
                    },
                    hide: { target: $("a, button"), event: 'click', inactive: 3000 },
                    events: {
                        hide: function (event, api) {
                            $elem.qtip('destroy');
                        }
                    },
                    style: {
                        classes: 'ui-tooltip-red ui-tooltip-shadow ui-tooltip-rounded'
                    }
                }).qtip('option', 'content.text', error);
            } else {
                $elem.qtip('destroy');
            }
        };
        settings.success = $.noop;
        settings.submitHandler = function () {
            formSubmitHandler.call(self);
        };
        //        settings.success = function (element) {
        //            element.parents(".control-group").removeClass("error").addClass("success");
        //        };
        
        //http://twitter.github.com/bootstrap/
        settings.highlight = function (element) {
            $(element).parents(".control-group").removeClass("success").addClass("error");
        };
        settings.unhighlight = function (element) {
            $(element).parents(".control-group").removeClass("error").addClass("success");
        };
    };

    //plugin
    $.fn.qform = function (option) {
        return this.each(function () {
            var $this = $(this), data = $this.data('qform'),
                options = $.extend({}, $.fn.qform.defaults, $this.data(), typeof option == 'object' && option);
            if (!data) $this.data('qform', (data = new qform(this, options)));
            if (typeof option == 'string') data[option]();
            else if (options) data.init();
        });
    };
    $.fn.qform.defaults = {
    };

    $.fn.qform.Constructor = qform;

    $(function () {
        $('form').qform();
    });
})(jQuery);