/**
 * jQuery-Plugin "clearField"
 * 
 * @version: 1.0, 31.07.2009
 * 
 * @author: Stijn Van Minnebruggen
 *          stijn@donotfold.be
 *          http://www.donotfold.be
 * 
 * @example: $('selector').clearField();
 * @example: $('selector').clearField({ blurClass: 'myBlurredClass', activeClass: 'myActiveClass' });
 * 
 */
(function($){jQuery.fn.clearField=function(b){b=jQuery.extend({blurClass:'clearFieldBlurred',activeClass:'clearFieldActive'},b);jQuery(this).each(function(){var a=jQuery(this);if(a.attr('rel')==undefined){a.attr('rel',a.val()).addClass(b.blurClass)}a.focus(function(){if(a.val()==a.attr('rel')){a.val('').removeClass(b.blurClass).addClass(b.activeClass)}});a.blur(function(){if(a.val()==''){a.val(a.attr('rel')).removeClass(b.activeClass).addClass(b.blurClass)}})});return jQuery}})(jQuery);