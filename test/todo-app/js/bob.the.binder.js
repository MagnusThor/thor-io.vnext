var $ = $ ||
    function (selector, el) {
        if (!el) el = document;
        var args = arguments;
        if (args.length === 0) return el;
        if (typeof (arguments[0]) === "function") {
            el.addEventListener("DOMContentLoaded", function (e) {
                args[0].call(this, e);
            });
            return el;
        }
        return el.querySelector(selector);
    };

(function () {
    Element.prototype._addEventListener = Element.prototype.addEventListener;
    Element.prototype.addEventListener = function (a, b, c) {

        if (c == undefined) c = false;
        this._addEventListener(a, b, c);
        if (!this.eventListenerList) this.eventListenerList = {};
        if (!this.eventListenerList[a]) this.eventListenerList[a] = [];
        //this.removeEventListener(a,b,c); // TODO - handle duplicates.. 
        this.eventListenerList[a].push({
            listener: b,
            useCapture: c
        });
    };

    Element.prototype.getEventListeners = function (a) {
        if (!this.eventListenerList) this.eventListenerList = {};
        if (a == undefined) return this.eventListenerList;
        return this.eventListenerList[a];
    };
    Element.prototype.clearEventListeners = function (a) {
        if (!this.eventListenerList) this.eventListenerList = {};
        if (a == undefined) {
            for (var x in (this.getEventListeners())) this.clearEventListeners(x);
            return;
        }
        var el = this.getEventListeners(a);
        if (el == undefined) return;
        for (var i = el.length - 1; i >= 0; --i) {
            var ev = el[i];
            this.removeEventListener(a, ev.listener, ev.useCapture);
        }
    };


    Element.prototype._removeEventListener = Element.prototype.removeEventListener;
    Element.prototype.removeEventListener = function (a, b, c) {
        if (c == undefined) c = false;
        this._removeEventListener(a, b, c);
        if (!this.eventListenerList) this.eventListenerList = {};
        if (!this.eventListenerList[a]) this.eventListenerList[a] = [];
        // find the event in the list
        for (var i = 0; i < this.eventListenerList[a].length; i++) {
            if (this.eventListenerList[a][i].listener == b, this.eventListenerList[a][i].useCapture == c) { // hmm..
                this.eventListenerList[a].splice(i, 1);
                break;
            }
        }
        if (this.eventListenerList[a].length == 0) delete this.eventListenerList[a];
    };

})();

var Bob = Bob || {};

Bob.Guid = {
    newGuid: function (a, b) {
        for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');
        return b;
    }
};

var getExpression = function (data) {
    var prop = data.split(".").first();
    var args = prop.match(/\((.*?)\)/);
    // is a function , remove the arguments...
    if (args) prop = prop.replace(args[0], '');
    var expr = prop.replace(/[()]/g, '');
    expr = expr.replace(/\[(\w+)\]/g, '.$1');
    expr = expr.replace(/^\./, '');
    return {
        prop: expr,
        args: args,
        isFn: args === null ? false : true,

    }
};

Bob.serializeForm = function (form) {
    if (!form) form = this;
    var data, i, len, node, ref;
    data = {};
    ref = form.elements;
    for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        if (!node.disabled && node.name) {
            data[node.name] = node.value;
        }
    }
    return data;
};

Bob.binders = {
    registerBinder: function (name, binder, cb) {
        if (!this.hasOwnProperty(name)) {
            this[name] = binder;
        } else {
            throw "Binder name already exists '" + name + "'";
        }
        if (cb) cb();
        return this;
    },

    loadfile: function (node, onchange) {

        var readFile = (function () {
            var file = function () {
                this.read = function (f, fn) {
                    var reader = new FileReader();
                    reader.onload = (function (tf) {
                        return function (e) {
                            fn(tf, e.target.result);
                        };
                    })(f);
                    reader.readAsArrayBuffer(f);
                }
            }
            return file;
        }());
        return {
            updateProperty: function (value) {
                node.clearEventListeners("change");
                var listener = function (evt) {

                    var reader = new readFile();
                    var file = evt.target.files[0];
                    for (var p in file) {
                        value.meta[p] = file[p];
                    };
                    reader.read(file, function (result, arrayBuffer) {
                        value.bytes = arrayBuffer;
                    });
                };

                node.addEventListener("change", listener);

            }
        };
    },
    hide: function (node, onchange) {
        return {
            updateProperty: function (value) {
                if (typeof (value) === "function") {
                    value = value();
                };
                if (value) {
                    node.style.display = "";
                } else {
                    node.style.display = "none";
                }
            }
        }
    },
    css: function (node) {
        var previous;
        return {
            updateProperty: function (newValue) {

                if (typeof (newValue) === "function") {
                    newValue = newValue();
                };
                if (!newValue) return;

                if (previous) {
                    previous.split(",").forEach(function (c) {
                        node.classList.remove(c);
                    });
                } else {
                    newValue.split(",").forEach(function (c) {
                        node.classList.remove(c);
                    });
                }
                node.classList.add(newValue);
                previous = newValue;
            }
        }
    },
    keyup: function (node, onchange) {

        var listener;

        return {
            updateProperty: function () {
                var args = arguments;
              
                if (!listener) {

                    //   console.log("listener",listener)

                    listener = function () {

                        onchange(node.value);
                    };
                    if (Array.isArray(args[4])) { // if onther delagate is speicified...
                        //  console.log(args[4].first())
                        if (args[3].hasOwnProperty(args[4].first())) {
                            var mi = args[3][(args[4].first())];
                            node.addEventListener('keyup', function (evt) {
                                mi.apply(evt, [args[2], args[3]]);
                               
                            });
                        }
                      
                    }

                      node.addEventListener('keyup', listener);
                   
                  
                    // var args = arguments;
                    // console.log(args);
                    //      if(args[3].hasOwnProperty("keyup"))
                    //            args[3]["onkeyup"].apply(args[2], [args[3], args[2],args[0]]);
                    // if (typeof (args[0]) !== "function") node.value = args[0];
                }
            }
        }

    },
    value: function (node, onchange) {
        var listener;

        return {

            updateProperty: function (value) {
               
                if (!listener) {
                    listener = function () {
                        onchange(node.value);
                      
                    }
                      node.addEventListener('keyup',listener);
                }
             
                if (value !== node.value) {
                    node.value = value;
                }
            }
        };
    },
    count: function (node) {
        return {
            updateProperty: function (value) {
                node.textContent = String(value).length;
            }
        };
    },
    html: function (node) {
        return {
            updateProperty: function (value) {
                node.htmlText = value;
            }
        };
    },
    href: function (node) {
        return {
            updateProperty: function (value) {
                node.setAttribute("href", value);
            }
        };
    },
    domId: function (node) {
        return {
            updateProperty: function (value) {
                node.setAttribute("id", value);
            }
        };
    },
    input: function (node) {
        return {
            updateProperty: function (value) {
                node.clearEventListeners("input");
                var args = arguments;
                var listener = function (evt) {
                    args[0].apply(args[0](), [JSON.stringify(args[2])]);
                };
                node.addEventListener("input", listener);
            }
        };
    },
    dataset: function (node) {
        return {
            updateProperty: function (value) {
                node.dataset[value] = value;
            }
        };
    },
    text: function (node) {

        return {
            updateProperty: function (value) {
                node.textContent = typeof (value) === "function" ? value() : value;
            },

        };
    },
    selectchange: function (node, onchange, onadd, onremove) {
        var obj;


        return {
            updateProperty: function () {
                node.clearEventListeners("change");
                var args = arguments;
                obj = args[5];
                var listener = function (e) {
                    var options = e.target.querySelectorAll("option");
                    for (var i = 0; i < options.length; i++) {
                        if (!options[i].selected)
                            onremove(obj[i]);

                    }
                    for (var i = 0; i < options.length; i++) {
                        if (options[i].selected) {
                            onadd(obj[i]);
                        }
                    }
                };
                node.addEventListener('change', listener);
            }
        }
    },
    select: function (node) {

        return {
            updateProperty: function () {

                var args = arguments;
                if (Array.isArray(args[0])) {
                    var values = args[0];
                    var match = values.findIndex(function (a) {
                        return JSON.stringify(a) == JSON.stringify(args[3]);
                    });
                    if (match > -1) node.selected = true;
                } else {
                    var value = args[0];
                    if (args[3]) {
                        if (JSON.stringify(value) === JSON.stringify(args[3]))
                            node.selected = true;
                        return;
                    }
                    if (value == node.value) {
                        node.selected = true;
                    } else {
                        node.selected = false;
                    }

                }
            }
        }
    },
    checkchange: function (node, onchange, onadd, onremove) {

        var obj;
        var isBool;
        return {
            updateProperty: function () {

                var args = arguments;
                obj = args[3];
                node.clearEventListeners("click");
                if (!isBool) isBool = typeof (args[0]) === "boolean";

                var listener = function (e) {
                    if (isBool) {
                        onchange(node.checked);
                        if (obj.hasOwnProperty(args[4])) obj[args[4]].apply(obj, args);

                    } else {

                        if (node.checked) {
                            onadd(obj);
                        } else onremove(obj);
                    };
                }

                node.addEventListener('click', listener);
            }
        }
    }

    ,
    checked: function (node, onchange, object) {
        return {
            updateProperty: function () {
                var args = arguments;

                if (!Array.isArray(args[0])) {

                    node.checked = args[0];
                } else {
                    throw "Not yet implemented";
                }
            }
        }
    },
    validate: function (node) {
        return {
            updateProperty: function (v) {}
        }
    },
    click: function (node) {


        return {
            updateProperty: function (fn) {
                var args = arguments;
                var parent;
                node.clearEventListeners("click");

                function listener(e) {

                    fn.apply(args[2], [args[3], args[2], e]);
                };
                node.addEventListener('click', listener);
            }
        };
    },
};


Bob.Notifier = (function () {
    var ctor = function () {
        var notifiers = [];
        this.name = undefined;
        this.on = function (obj, mutator, fn) {

            if (!obj.hasOwnProperty("$bob")) {


                obj["$bob"] = new Bob.Dispatcher(mutator, fn);

                notifiers.push(
                    obj["$bob"]
                );
                return obj["$bob"];
            } else return obj["$bob"];
        };
        this.clone = function (name, obj) {
            obj["$bob"] =
                notifiers.findBy(function (pre) {
                    return pre.name === name;
                }).first();
        };

        this.off = function (mutator, cb) {
            var index = notifiers.findIndex(function (pre) {
                return pre.name === mutator;
            });
            notifiers.splice(index, 1);
            if (cb) cb();

        };

    };
    return ctor;
})();

Bob.Dispatcher = (function () {
    var ctor = function (name, map, fn) {
        this.name = name;
        this.fn = fn;
    };
    ctor.prototype.add = function (fn) {
        this.$add = fn;
        return this;
    };
    ctor.prototype.update = function (fn) {
        this.$update = fn;
        return this;
    };
    ctor.prototype.delete = function (fn) {
        this.$delete = fn;
        return this;
    };

    return ctor;
})();


Bob.apply = function (binders) {

    if (!binders) binders = Bob.binders;


    var depenents = [];


    var instanceId = Bob.Guid.newGuid();
    var $root;
    var notifier = new Bob.Notifier();

    function findObservable(obj, path) {

        if (path.indexOf("$this").length > 0) {
            return obj;
        }
        var parts = path.split(".");
        var meta = getExpression(parts[0]);



        var root = (new RegExp("^\\$root")).test(meta.prop);
        if (root) {
            return findObservable($root, parts.slice(1).join("."), path);
        }
        if (parts.length == 1) {
            if (meta.isFn) {
                var fnResult = (obj[meta.prop]).apply(obj, meta.args[1].split(","));

                return fnResult;
            }
            if ((typeof (obj[meta.prop]) === "object")) {
                return obj[meta.prop];
            } else {
                return obj;
            }
        }
        if (meta.isFn) {
            return findObservable((obj[meta.prop]).apply(obj, meta.args[1].split(",")), parts.slice(1).join("."), path);
        } else {
            return findObservable(obj[meta.prop], parts.slice(1).join("."), path);
        }
    };

    function bindObject(node, binderName, object, propertyName) {
        var objectToObserve = findObservable(object, propertyName);
        var context;
        var propertySet = propertyName.split("|");
        propertyName = propertySet[0];
        propertySet = propertySet.slice(1);
        var removeValue = function (value) {
            if (!objectToObserve[propertyName.split(".").pop()]) {
                if (Array.isArray(objectToObserve)) {

                    var m = objectToObserve.findIndex(function (ar) {
                        return JSON.stringify(ar) === JSON.stringify(value);
                    });
                    objectToObserve.remove(m);
                }
            } else {
                objectToObserve[propertyName.split(".").pop()] = value;
                //  throw "Not yet implemented";
            }
        };
        var addValue = function (value, parent) {
            if (!parent) {
                parent = propertyName;
            }
            if (!objectToObserve[parent.split(".").pop()]) {

                if (Array.isArray(objectToObserve)) {

                    var m = objectToObserve.findIndex(function (ar) {
                        return JSON.stringify(ar) === JSON.stringify(value);
                    });

                    if (m === -1)

                        objectToObserve.push(value);

                } else {

                    for (var prop in value) {
                        objectToObserve[prop] = value[prop];
                    }
                }
            } else {
                throw "Not yet implemented";
            }
        };
        var updateValue = function (newValue, parent) {

            if (!parent) {
                parent = propertyName;
            }
            parent = parent.split(".").pop();
            parent = parent.replace("(", "").replace(")", "");
            if (typeof (objectToObserve[parent]) == "function") {
                objectToObserve[parent].apply(objectToObserve[parent], [newValue]);
            } else
                objectToObserve[parent] = newValue;


            return;
        }

        var binder = binders[binderName](node, updateValue, addValue, removeValue, object);
        var key = propertyName.split(".").pop();
        if (node.dataset.with && propertySet.length === 0) {
            context = findObservable($root, node.dataset.with);
        } else if (propertySet.length > 1) {
            context = findObservable($root, propertySet[0]);
        }
        binder.updateProperty.apply(object, [objectToObserve.hasOwnProperty(key) ? objectToObserve[key] : objectToObserve,
            binderName, objectToObserve, object, propertySet, context || null
        ]);

        var observer = function (changes) {
            var n = objectToObserve["$bob"];
            var changed = changes.some(function (a) {
                return a.name === propertyName.split(".").pop();
            });
            if (changed) {
                var change = changes.first();
                var args = change.object;
                if (n) {

                    if (n.hasOwnProperty("$" + change.type))
                        n["$" + change.type].apply(change.object, [args, change.name, change.type, change.oldValue, binderName]);
                    if (n.fn)
                        n.fn.apply(n, [args, change.name, change.type, change.oldValue, binderName]);
                    n.type = change.type;
                };
                binder.updateProperty(objectToObserve[key], binderName, objectToObserve, object, propertySet, context);
            }
            if (typeof (objectToObserve[key]) === "function" && !changed) {
                binder.updateProperty(objectToObserve[key], binderName, objectToObserve, object, propertySet, context);
            }
        };
        var observe = function () {
            Object.observe(objectToObserve, observer);
        }
        var unobserve = function () {
            Object.unobserve(objectToObserve, observer);
        }
        if (typeof (objectToObserve) === "object") {

            Object.observe(objectToObserve, observer);

            Object.observe(objectToObserve, function (changes) {
                changes.forEach(function (change) {
                    var changed = changes.some(function (a) {
                        return a.key === propertyName.split(".").pop();
                    });

                    if (change.type === "$update" && changed) {
                        Object.unobserve(objectToObserve, observer);
                        binder.updateProperty(change.$object[change.key], binderName, change.object, object, propertySet, context);
                        Object.observe(objectToObserve, observer);
                    };
                });
            }, ["$update"]);
        }


        return {
            propertyName: propertyName,
            $binder: function (value, obj) {
                Object.unobserve(objectToObserve, observer);
                binder.updateProperty(value, binderName, obj, object, propertySet, context);
                Object.observe(objectToObserve, observer);
            },
            observe: observe,
            unobserve: unobserve
        };
    };

    function bindAttributes(node, attr, object, key) {
        node.setAttribute(attr, object[key]);
        var updateItem = function (element, update) {
            node.setAttribute(attr, update);
        }
        var observer = function (changes) {
            updateItem(node, object[changes[0].name]);
        };

        delete node.dataset.attr;

        Object.observe(object, observer);
        return {
            unobserve: function () {
                Object.unobserve(object, observer);
            },
            observe: function () {
                Object.observe(object, observer);
            }
        };
    };

    function bindCollection(node, array) {

        function capture(original) {
            var before = original.previousSibling;
            var parentNode = original.parentNode;
            var cloned = original.cloneNode(true);
            original.parentNode.removeChild(original);
            return {
                insert: function () {
                    var newNode = cloned.cloneNode(true);
                    parentNode.insertBefore(newNode, before);
                    return newNode;
                }
            };
        }
        node.dataset.parent = node.dataset.repeat;
        delete node.dataset.repeat;
        var parent = node.parentNode;
        var captured = capture(node);
        var bindItem = function (element) {
            var newEl = captured.insert();
            var model = bindModel(newEl, element, array);
            return model;
        };
        var bindings = array.map(function (a) {
            return bindItem(a);
        });

        var observer = function (changes) {
            var n = array["$bob"];

            var tc = changes.findIndex(function (pre) {
                return pre.type === "delete";
            });



            if (tc >= 0 && n && n.hasOwnProperty("$delete"))
                n["$delete"].apply(changes[0].oldValue, [changes[0].oldValue, changes[0].name, "delete"]);

            changes.forEach(function (change) {
                var index = parseInt(change.name, 10),
                    child;
                if (isNaN(index)) return;
                var args = isNaN(index) ? change.object : change.object[index];
                if (!args) args = change.object;
                if (change.type === 'add') {
                    if (n && n.hasOwnProperty("$add")) {
                        n["$" + change.type].apply(change.object, [args, change.name, change.type, change.oldvalue]);
                    }
                    bindings.push(bindItem(array[index]));
                } else if (change.type === 'update') {
                    bindings[index].unobserve();
                    bindModel(parent.children[index], array[index]);
                } else if (change.type === 'delete') {

                    child = parent.children[index];

                    child.parentNode.removeChild(child);
                }
            });
        };

        var unobserve = function () {
            Object.unobserve(array, observer);
        };
        var observe = function () {
            Object.observe(array, observer);
        };
        Object.observe(array, observer);
        Object.observe(array, function (changes) {

            changes.forEach(function (change) {




                var index, obj, child;
                if (change.type === "$add") {
                    obj = change.$object;
                    Object.unobserve(array, observer);
                    index = array.push(obj);
                    bindings.push(bindItem(array[index - 1]));
                    Object.observe(array, observer);

                } else if (change.type === "$delete") {
                    var remove = change.$object;
                    index = array.findIndex(function (pre) {
                        return JSON.stringify(pre) === JSON.stringify(remove);
                    });
                    child = parent.children[index];
                    child.parentNode.removeChild(child);
                    Object.unobserve(array, observer);
                    array.remove(index);
                    Object.observe(array, observer);
                } else if (change.type === "$update") {
                    index = array.findIndex(function (pre) {

                        return pre[change.key] === change.oldValue;
                    });

                    if (bindings[index]) {
                        var l = bindings[index].bindings.findBy(function (a) {
                            if (a)
                                return a.first().propertyName === change.key;
                        });
                    }
                    array[index][change.key] = change.$object[change.key];
                    Object.observe(array, observer);

                    if (l) {
                        l.forEach(function (binder) {
                            var method = binder.first().$binder;
                            method.apply(change, [change.$object[change.key], change.$object]);
                        });
                    }
                }
            });
        }, ["$add", "$delete", "$update"]);
        return {
            unobserve: unobserve,
            observe: observe
        };
    }


    var applyTemplate = function (node, tmpl, object) {
        window.fetch(tmpl, {
            method: 'get'
        }).then(function (res) {
            return res.text();
        }).then(function (html) {
            node.insertAdjacentHTML('afterbegin', html);
            bindModel(node, object);

        });
    };


    function bindModel(container, object) {

        if (typeof (container) === "string") container = $(container);
        var templates = typeof (container) === "object" ? container.querySelectorAll("[data-template]") : $(container).querySelectorAll("[data-template]");

        for (var i = 0; i < templates.length; i++) {
            applyTemplate(templates[i], templates[i].dataset.template, object);
            delete templates[i].dataset.template;
        }



        if (!$root) $root = object;

        function isDirectNested(node) {
            node = node.parentElement;
            while (node) {
                if (node.dataset.repeat) {
                    return false;
                }
                node = node.parentElement;
            }
            return true;
        }

        function onlyDirectNested(selector) {
            var collection = container.querySelectorAll(selector);
            var arr = Array.prototype.filter.call(collection, isDirectNested);
            return arr;
        }

        var bindings = onlyDirectNested('[data-bind]').map(function (node) {

            var datasets = node.dataset.bind;
            return datasets.split(",").map(function (dataset) {
                var binderName = dataset.substr(0, dataset.indexOf(":"));
                var binderProp = dataset.substr(binderName.length + 1, dataset.length);
                return bindObject(node, binderName, object, binderProp, datasets);
            });


        }).concat(onlyDirectNested('[data-repeat]').map(function (node) {

            var obj = findObservable(object, node.dataset.repeat);

            return bindCollection(node, obj);

        })).concat([container].map(function (node) {
            var datasets = node.dataset.bind;
            if (!datasets) return;
            return datasets.split(",").forEach(function (dataset) {
                var binderName = dataset.substr(0, dataset.indexOf(":"));
                var binderProp = dataset.substr(binderName.length + 1, dataset.length);
                return bindObject(node, binderName, object, binderProp, datasets);
            });
        })).concat(onlyDirectNested('[data-attr]').map(function (node) {

            var datasets = node.dataset.attr;

            return datasets.split(",").map(function (dataset) {

                var binderName = dataset.substr(0, dataset.indexOf(":"));
                var binderProp = dataset.substr(binderName.length + 1, dataset.length);

                return bindAttributes(node, binderName, object, binderProp);
            });

        }));

        return {
            bindings: bindings,
            unobserve: function () {
                bindings.forEach(function (binding) {

                    if (binding && binding.hasOwnProperty("unobserve")) binding.unobserve();
                });
            },
            observe: function () {
                bindings.forEach(function (binding) {
                    binding.observe();
                });
            },

        };
    };
    return {
        on: function () {
            return notifier.on.apply(this, arguments);
        },
        off: function () {
            return notifier.off.apply(this, arguments);
        },
        $instanceId: instanceId,
        notifier: notifier,
        bind: bindModel,
        $root: function () {
            return $root;
        },
    };
};


// Array extenders //
Array.prototype.intersect = function (array) {
    var result = [];

    var a = this.slice(0);
    var b = array.slice(0);
    var aLast = a.length - 1;
    var bLast = b.length - 1;
    while (aLast >= 0 && bLast >= 0) {
        if (a[aLast] > b[bLast]) {
            a.pop();
            aLast--;
        } else if (a[aLast] < b[bLast]) {
            b.pop();
            bLast--;
        } else {
            result.push(a.pop());
            b.pop();
            aLast--;
            bLast--;
        }
    }
    return result;
};
Array.prototype.first = function (num) {
    if (!num) return this[0];
    if (num < 0) num = 0;
    return this.slice(0, num);
};
Array.prototype.take = function (num) {
    if (!num) num = 2;

    return (this.filter(function (t, i) {
        if (i < num) return t;

    }) || []);

};
Array.prototype.findBy = function (pre) {
    var arr = this;
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        if (pre(arr[i]))
            result.push(arr[i]);
    };
    return result;
};
Array.prototype.count = function (pre) {
    var arr = this;
    var result = 0;
    if (!pre) return this.length;

    for (var i = 0; i < this.length; i++) {
        if (pre(arr[i])) {
            result++;
        }
    }
    return result;
};
Array.prototype.findIndex = function (pre) {
    var arr = this;

    for (var i = 0; i < this.length; i++) {
        if (pre(arr[i])) {
            return i;
        }
    }
    return -1;
};
Array.prototype.remove = function (index) {

    this.splice(index, 1);

    return this.length;
};
Array.prototype.clone = function () {
    return this.slice(0);
};
Array.prototype.removeAll = function () {

    for (var i = 0; this.length; i++) {
        this.splice(i, 1);
    }

    return this.length;
};

// Object extenders //
Object.defineProperties(Object, {
    'extend': {
        'configurable': true,
        'enumerable': false,
        'value': function extend(what, wit) {
            var extObj, witKeys = Object.keys(wit);
            extObj = Object.keys(what).length ? Object.clone(what) : {};
            witKeys.forEach(function (key) {
                Object.defineProperty(extObj, key, Object.getOwnPropertyDescriptor(wit, key));
            });
            return extObj;
        },
        'writable': true
    },
    'clone': {
        'configurable': true,
        'enumerable': false,
        'value': function clone(obj) {
            return Object.extend({}, obj);
        },
        'writable': true
    }
});

//Object.prototype.equalTo= function() {
//    throw "Not yet implemented";
//};