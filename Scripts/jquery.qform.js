(function () {
    "use strict";
    var QForm = function (element, options) {
        this.$form = $(element);
        this.options = options;

        var $form = this.$form;
        if ($form.data("validator") == undefined || $form.data("unobtrusiveValidation") == undefined) {
            $.validator.unobtrusive.parse($form);
        }
        $form.off("submit");
        updateParsed.call(this);
        $form.submit($.proxy(this.submit, this));
    };

    QForm.prototype = {
        constructor: QForm,

        update: function () {
            var $form = this.$form;
            $.validator.unobtrusive.parse($form);
            $form.data("validator").settings.rules = $form.data("unobtrusiveValidation").options.rules;
            $form.data("validator").settings.messages = $form.data("unobtrusiveValidation").options.messages;
        },

        submit: function (e) {
            e && e.preventDefault();
            var self = this, $form = self.$form;

            var event = $.Event('post');
            $form.trigger(event);

            // We check if jQuery.validator exists on the form
            if (event.isDefaultPrevented() || !$form.valid || $form.valid()) {

                $.post($form.attr('action'), $form.serializeArray())
                    .then(function (json) {
                        if ($form.attr("data-form-reset") != "false") {
                            $form.get(0).reset();
                            $form.validate().resetForm();
                            $form.find(".control-group").removeClass("error success");
                        }
                        if ($form.attr("data-form-redirect")) window.location = ($form.attr("data-form-redirect"));

                        $form.trigger("success", [json.data]);
                        $form.trigger("finished");
                    }, function (r) {
                        var json = JSON.parse(r.responseText);
                        if (json.errors) {
                            displayErrors.call(self, json.errors);
                        } else {
                            displayErrors.call(self, r.responseText);
                        }
                        $form.trigger("finished");
                    });
            } else {
                $form.trigger("finished");
            }

        }
    };

    var displayErrors = function (errors) {
        var summary, $form = this.$form;

        if (typeof errors === "string") {
            summary = errors;
        } else if (Object.prototype.toString.call(errors) === '[object Array]') {
            if (errors.length) {
                if (typeof errors[0] === "string") {
                    summary = "<ul>" + $.map(errors, function (v) {
                        return "<li>" + v + "</li>";
                    }).join("") + "</ul>";
                } else if (typeof errors[0] === "object") {
                    //to field
                    var e2 = [];
                    $.each(errors, function (i, error) {
                        var elem = '#' + error.field.replace('.', '_').replace('[', '_').replace(']', '_'),
                            $elem = $(elem);
                        if (!$elem.length) {
                            elem = error.field;
                            $elem = $('[name="' + elem + '"]');
                            if (!$elem.length) {
                                e2.push(error.field + ": " + error.message);
                            } else {
                                disttooltip($elem, error.message);
                            }
                        }
                    });
                    if (e2.length) {
                        summary = '<ul class="unstyled">' + $.map(e2, function (v) {
                            return "<li>" + v + "</li>";
                        }).join("") + "</ul>";
                    }
                } else {
                    summary = "some errors!";
                }
            } else {
                summary = "some errors!";
            }
        }
        if (summary) {
            var $summary = $form.find("[data-val-summary]");
            if (!$summary.length) {
                $summary = $form;
            }
            disttooltip($summary, summary, "top");
        }
    };

    //bootstrap tooltip
    var disttooltip = function ($el, title, placement) {
        $el.tooltip({
            title: title || "default message！",
            html: true,
            trigger: "manual",
            placement: placement || "right",
            container: 'body'
        }).tooltip("show");
        setTimeout(function () {
            $el.tooltip("hide");
        }, 4000);
    };

    var updateParsed = function () {
        var self = this, $form = self.$form,
            settings = $form.data('validator').settings;

        settings.errorPlacement = function (error, element) {
            var $elem = $(element);

            if (!error.is(':empty')) {
                disttooltip($elem, error.text());
            } else {
                $elem.tooltip("hide");
            }
        };
        settings.success = $.noop;

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
            if (!data) $this.data('qform', (data = new QForm(this, options)));
            if (typeof option == 'string') data[option]();
            else $this.submit();
        });
    };

    $.fn.qform.defaults = {

    };

    $.fn.qform.Constructor = QForm;

    $.fn.qform.noConflict = function () {
        $.fn.qform = old;
        return this;
    };

    $(function () {
        $(document).on("click.qform.data-api", '[data-toggle="qform"]', function (e) {
            var $this = $(this),
                href = $this.attr('href'),
                $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, '')) || $this.closest("form")) //strip for ie7
            ;

            e.preventDefault();

            if ($this.prop("disabled") || $this.hasClass("disabled")) {
                return;
            }

            $this.button && $this.button('loading');
            $target.on("finished", function () {
                setTimeout(function () {
                    $this.button && $this.button('reset');
                }, 100);
            }).qform();

        });
    });
})(jQuery);