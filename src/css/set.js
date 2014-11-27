/**
 * css/set.js
 */
jax.extend({
    /**
     * Function to set the CSS properties of the object passed.
     *
     * @param {Object} obj
     * @param {Mixed}  props
     * @param {Mixed}  val
     */
    setCss : function(obj, props, val) {
        if ((props.constructor == String) && (val != null)) {
            var properties = {};
            properties[props] = val;
        } else {
            var properties = props;
        }

        for (var prop in properties) {
            switch(prop) {
                // Handle the opacity/filter issue.
                case 'opacity':
                    if ((window.jax.browser.msie) && (parseInt(window.jax.browser.version) < 10)) {
                        obj.style.filter = 'alpha(opacity=' + properties[prop] + ')';
                    } else {
                        obj.style.opacity = properties[prop] / 100;
                    }
                    break;
                // Handle the styleFloat/cssFloat issue.
                case 'float':
                    if (window.jax.browser.msie) {
                        eval("obj.style.styleFloat = '" + properties[prop] + "';");
                    } else {
                        eval("obj.style.cssFloat = '" + properties[prop] + "';");
                    }
                    break;
                // Handle all other CSS properties.
                default:
                    // Create properly formatted property, converting a dashed property to a camelCase property if applicable.
                    if (prop.indexOf('-') != -1) {
                        var propAry = prop.split('-');
                        var prp = propAry[0].toLowerCase() + propAry[1].substring(0, 1).toUpperCase() + propAry[1].substring(1);
                    } else {
                        var prp = prop;
                    }
                    eval("obj.style." + prp + " = '" + properties[prop] + "';");
            }
        }
    }
});