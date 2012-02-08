(function(app){
    
// sandbox/facade
app.f = {
    define:function( core, module ){        
        
        //debug
        var core = app.core,
            dom = core.dom,
            events = core.events;
            component = core.dom.query(module)._elements;

        return {

            publish:function( e ){
                events.trigger(e);

            },
            subscribe:function( e ){
                events.register(e, module);
            },

            find:function( selector ){
                return component.query(selector)._elements;
            },

            getEl:function(){
                return component[0];
            },

            animate:function( props ){
                return core.dom.animate(props);
            },

            bind:function( el , type, fn ){
                dom.bind(el, type, fn);
            },

            unbind:function( el , type, fn ){
                dom.unbind(el, type, fn);
            },

            ignore:function( e ){
                events.remove(e, module);
            },

            createElement:function( el, config ){

                var i, child, text;
                el = dom.createElement(el);
                
                if (config) {
                    if (config.children && dom.isArray(config.children)) {
                        i = 0;
                        while(child = config.children[i]) {
                            el.appendChild(child);
                            i++;
                        }
                        delete config.children;
                    }
                    if (config.text) {
                        el.appendChild(document.createTextNode(config.text));
                        delete config.text;
                    }
                    dom.attr(el, config);
                }

                return el;
            },

            setHTML: function( el, content ){
                el.innerHTML = content;
            },

            newGUID: function(){
                return app.utils.newGUID();
            },

            css: function( el, props ){
                dom.css(el, props);
            },

            animate: function( el, props, duration){
                dom.animate(el, props, duration);
            },

            getRandomColor:function(){
                return app.randomColor();
            }
        }
    }
};

})(app);