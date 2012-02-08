(function(app){

app.core = (function(){
    var data = {};
    return{

        define: function(id, constructor){
            if(app.utils.typeEqual(id, 'string') && app.utils.typeEqual(constructor, 'function')){
                temp = constructor(app.f.define(this, id));
                if(temp.init && app.utils.typeEqual(temp.init, 'function') 
                    && temp.destroy && app.utils.typeEqual(temp.destroy, 'function')){
                    temp = null;
                    data[id] = { define: constructor, instance: null};
                }else{
                    app.core.throwError(1, 'Module' + id + 'registration failed. Instance cannot be initialized');
                }
            }else{
                app.core.throwError(1, 'Module' + id + 'registration failed. One or more args are of an incorrect type');
            }
        },
        start: function(id){
            var module = data[id];
            module.instance = module.define(app.f.define(this,id));
            module.instance.init();
        },
        startAll: function(){
            var id;
            for(id in data){
                if(data.hasOwnProperty(id)){
                    this.start(id);
                }
            }
        },
        stop:function(id){
            var modData;
            if(modData = data[id] && modData.instance){
                modData.instance.destroy();
                modData.instance = null;
            }
        },
        stopAll:function(){
            var id;
            for(id in data){
                if(data.hasOwnProperty(id)){
                    this.stop(id);
                }
            }
        },

        throwError: function(errType, msg){
            console.log(errType, msg);
        },

        events: {
            register:function(events, module){

                if(app.core.dom.isObject(events) && module){
                    if(data[module]){
                        data[module].events = events;
                    }else{
                    }
                }
            },
            trigger: function(events){
                console.log('trigger',events);
                if(app.core.dom.isObject(events)){
                    var mod;
                    for(mod in data){
                        if(data.hasOwnProperty(mod)){
                            mod = data[mod];
                            if(mod.events && mod.events[events.type]){
                                mod.events[events.type](events.data);
                            }
                        }
                    }
                }
            },
            remove:function(events, module){
                if(app.core.dom.isObject(events) && module && (module = data[module]) && module.events){
                    delete module.events;
                }
            }
        },

        validConstructor: function(temp){
           return (temp.init && app.utils.typeEqual(temp.init, 'function') && temp.destroy && app.utils.typeEqual(temp.destroy, 'function'));
        },

        dom: {

            query : function (selector, context) {

                var ret = {}, that = this, len, i =0, djEls;

                djEls = dojo.query( ((context) ? context + " " : "") + selector);
                len = djEls.length;

                djEls.query = function (sel) {
                    return that.query(sel, selector);
                }

                djEls.css = function(props){
                    return that.css(djEls, props)
                }
                
                this._elements = djEls;
           
                return this;

            },
            eventStore : {},

            bind : function (element, evt, fn) {

                (evt == "hover")? evt = "mouseenter" : evt = evt;

                if (element && evt) {
                    if (app.utils.typeEqual(evt, 'function')) {
                        fn = evt;
                        evt = 'click';
                    }
                    if (element.length) {
                        var i = 0, len = element.length;
                        for ( ; i < len ; ) {
                            this.eventStore[element[i] + evt + fn] = dojo.connect(element[i], evt, element[i], fn);
                            i++;
                        }
                    } else {
                       this.eventStore[element + evt + fn] = dojo.connect(element, evt, element, fn);
                    }
                }
            },

            unbind : function (element, evt, fn) {
                if (element && evt) {
                    if (app.utils.typeEqual(evt,'function')) {
                        fn = evt;
                        evt = 'click';
                    }
                     if (element.length) {
                        var i = 0, len = element.length;
                        for ( ; i < len ; ) {
                            dojo.disconnect(this.eventStore[element[i] + evt + fn]);
                            delete this.eventStore[element[i] + evt + fn];
                            i++;
                        }
                    } else {
                        dojo.disconnect(this.eventStore[element + evt + fn]);
                        delete this.eventStore[element + evt + fn];
                    }
                }
            },

            attr:function(el, attribs){
                var attr;
                for (attr in attribs) {
                    dojo.attr(el, attr, attribs[attr]);
                }

            },

            getAttribute:function(el, attribs){

                var that = this;
                var q = null;
                attribs = attribs || el; 

                //chaining
                if(this._elements != undefined){
                    el  = this._elements;
                }

                // object
                if(app.utils.typeEqual(el, 'object')){
                    q = dojo.attr(dojo.query(el)[0], attribs);    
                } //string
                else if(app.utils.typeEqual(el, 'string')){
                    console.log('stringy');
                    console.log('stringy', el, attribs);

                    //currently only handling id
                    q = dojo.attr(dojo.byId(el), attribs);  
                    this._elements = q;
                }
                // array
                else if(app.utils.typeEqual(el, 'array')){
                    q =  dojo.attr(el[0], attribs);
                    this._elements = q;
                }

              return this._elements;

            },

            setAttribute:function(el, attribs){
                var attr;
                for (attr in attribs) {
                    dojo.attr(el, attr, attribs[attr]);
                }  
            },


            css:function(el, props){

                var q = null;
                props = props || el; 

                //chaining
                if(this._elements != undefined){
                    console.log()
                    el  = this._elements;
                }
                // string selector
                if(app.utils.typeEqual(el, 'string')){
                    q = dojo.query(el).style(props);
                }
                // array
                else if(app.utils.typeEqual(el, 'array')){
                    q =  el.style(props);
                }
                // object
                else if(app.utils.typeEqual(el, 'object')){

                    var l = el.length,i;
                    for(i=0; i<l;i++){
                        dojo.style(el[i], props);
                    }

                    q = el;
                }
                else{
                    q = el;
                }

                this._elements = q;
                return this
                
            },

            ready: function(fn){
                return dojo.ready(fn);
            },


            animate: function(el, props, duration){
            
              if(duration){
                  props.duration = duration;
              }

              var nodes, anims;
              nodes = dojo.query(el); //collection
              anims = [];
              nodes.forEach(function(n){
                  dojo.anim(n, props);
               });

              return anims; 
                
            },


            ajax:function(options){
                
                var xhrArgs = {}, xhrMethod = null, m = options.type.toLowerCase();
                xhrArgs[options.type + 'Data'] = options.data;
                xhrArgs.url = options.url;
                xhrArgs.handleAs = options.dataType;
                xhrArgs.load = options.success;
                xhrArgs.error = options.error;
                xhrArgs.preventCache = options.cache;


                if(m == 'get'){
                    xhrMethod = dojo.xhrGet(xhrArgs);
                }else if(m == 'post'){
                    xhrMethod = dojo.xhrPost(xhrArgs);
                }else if(m =='put'){
                    xhrMethod = dojo.xhrPut(xhrArgs);
                }else if(m == 'delete'){
                    xhrMethod = dojo.xhrDelete(xhrArgs);
                }

                return xhrMethod;
            },

            
            create:function(tag, attrs, refNode, pos){
                 if(refNode ==undefined || refNode == 'body'){
                    refNode = dojo.body();
                }

                return dojo.create(tag, attrs, refNode, pos);
            },
            

            //this is deprecated. use create instead.
            createElement: function(el){
                return document.createElement(el);  
            },

            isArray:function(arr){
                return dojo.isArray(arr);
            },
            isObject:function(obj){

                return dojo.isObject(obj);
            }
        }
    }
}());

})(app);