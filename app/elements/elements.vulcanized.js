

  // CoreStyle.g.theme = {
  //   colorOne: '#abcdef',
  //   colorTwo: '#123456',
  //   colorThree: '#224433'
  // }
;


  Polymer('core-header-panel',{

    /**
     * Fired when the content has been scrolled.  `event.detail.target` returns
     * the scrollable element which you can use to access scroll info such as
     * `scrollTop`.
     *
     *     <core-header-panel on-scroll="{{scrollHandler}}">
     *       ...
     *     </core-header-panel>
     *
     *
     *     scrollHandler: function(event) {
     *       var scroller = event.detail.target;
     *       console.log(scroller.scrollTop);
     *     }
     *
     * @event scroll
     */

    publish: {
      /**
       * Controls header and scrolling behavior. Options are
       * `standard`, `seamed`, `waterfall`, `waterfall-tall`, `scroll` and 
       * `cover`. Default is `standard`.
       *
       * `standard`: The header is a step above the panel. The header will consume the
       * panel at the point of entry, preventing it from passing through to the
       * opposite side.
       *
       * `seamed`: The header is presented as seamed with the panel.
       *
       * `waterfall`: Similar to standard mode, but header is initially presented as
       * seamed with panel, but then separates to form the step.
       *
       * `waterfall-tall`: The header is initially taller (`tall` class is added to
       * the header).  As the user scrolls, the header separates (forming an edge)
       * while condensing (`tall` class is removed from the header).
       *
       * `scroll`: The header keeps its seam with the panel, and is pushed off screen.
       *
       * `cover`: The panel covers the whole `core-header-panel` including the
       * header. This allows user to style the panel in such a way that the panel is
       * partially covering the header.
       *
       *     <style>
       *       core-header-panel[mode=cover]::shadow #mainContainer {
       *         left: 80px;
       *       }
       *       .content {
       *         margin: 60px 60px 60px 0;
       *       }
       *     </style>
       *
       *     <core-header-panel mode="cover">
       *       <core-toolbar class="tall">
       *         <core-icon-button icon="menu"></core-icon-button>
       *       </core-toolbar>
       *       <div class="content"></div>
       *     </core-header-panel>
       *
       * @attribute mode
       * @type string
       * @default ''
       */
      mode: {value: '', reflect: true},

      /**
       * The class used in waterfall-tall mode.  Change this if the header
       * accepts a different class for toggling height, e.g. "medium-tall"
       *
       * @attribute tallClass
       * @type string
       * @default 'tall'
       */
      tallClass: 'tall',

      /**
       * If true, the drop-shadow is always shown no matter what mode is set to.
       *
       * @attribute shadow
       * @type boolean
       * @default false
       */
      shadow: false
    },

    animateDuration: 200,

    modeConfigs: {
      shadowMode: {'waterfall': 1, 'waterfall-tall': 1},
      noShadow: {'seamed': 1, 'cover': 1, 'scroll': 1},
      tallMode: {'waterfall-tall': 1},
      outerScroll: {'scroll': 1}
    },
    
    ready: function() {
      this.scrollHandler = this.scroll.bind(this);
      this.addListener();
    },
    
    detached: function() {
      this.removeListener(this.mode);
    },
    
    addListener: function() {
      this.scroller.addEventListener('scroll', this.scrollHandler);
    },
    
    removeListener: function(mode) {
      var s = this.getScrollerForMode(mode);
      s.removeEventListener('scroll', this.scrollHandler);
    },

    domReady: function() {
      this.async('scroll');
    },

    modeChanged: function(old) {
      var configs = this.modeConfigs;
      var header = this.header;
      if (header) {
        // in tallMode it may add tallClass to the header; so do the cleanup
        // when mode is changed from tallMode to not tallMode
        if (configs.tallMode[old] && !configs.tallMode[this.mode]) {
          header.classList.remove(this.tallClass);
          this.async(function() {
            header.classList.remove('animate');
          }, null, this.animateDuration);
        } else {
          header.classList.toggle('animate', configs.tallMode[this.mode]);
        }
      }
      if (configs && (configs.outerScroll[this.mode] || configs.outerScroll[old])) {
        this.removeListener(old);
        this.addListener();
      }
      this.scroll();
    },

    get header() {
      return this.$.headerContent.getDistributedNodes()[0];
    },
    
    getScrollerForMode: function(mode) {
      return this.modeConfigs.outerScroll[mode] ?
          this.$.outerContainer : this.$.mainContainer;
    },

    /**
     * Returns the scrollable element.
     *
     * @property scroller
     * @type Object
     */
    get scroller() {
      return this.getScrollerForMode(this.mode);
    },

    scroll: function() {
      var configs = this.modeConfigs;
      var main = this.$.mainContainer;
      var header = this.header;

      var sTop = main.scrollTop;
      var atTop = sTop === 0;

      this.$.dropShadow.classList.toggle('hidden', !this.shadow &&
          (atTop && configs.shadowMode[this.mode] || configs.noShadow[this.mode]));

      if (header && configs.tallMode[this.mode]) {
        header.classList.toggle(this.tallClass, atTop ||
            header.classList.contains(this.tallClass) &&
            main.scrollHeight < this.$.outerContainer.offsetHeight);
      }

      this.fire('scroll', {target: this.scroller}, this, false);
    }

  });

;


(function() {

  Polymer('core-toolbar', {
    
    /**
     * Controls how the items are aligned horizontally.
     * Options are `start`, `center`, `end`, `between` and `around`.
     *
     * @attribute justify
     * @type string
     * @default ''
     */
    justify: '',
    
    /**
     * Controls how the items are aligned horizontally when they are placed
     * in the middle.
     * Options are `start`, `center`, `end`, `between` and `around`.
     *
     * @attribute middleJustify
     * @type string
     * @default ''
     */
    middleJustify: '',
    
    /**
     * Controls how the items are aligned horizontally when they are placed
     * at the bottom.
     * Options are `start`, `center`, `end`, `between` and `around`.
     *
     * @attribute bottomJustify
     * @type string
     * @default ''
     */
    bottomJustify: '',
    
    justifyChanged: function(old) {
      this.updateBarJustify(this.$.topBar, this.justify, old);
    },
    
    middleJustifyChanged: function(old) {
      this.updateBarJustify(this.$.middleBar, this.middleJustify, old);
    },
    
    bottomJustifyChanged: function(old) {
      this.updateBarJustify(this.$.bottomBar, this.bottomJustify, old);
    },
    
    updateBarJustify: function(bar, justify, old) {
      if (old) {
        bar.removeAttribute(this.toLayoutAttrName(old));
      }
      if (this.justify) {
        bar.setAttribute(this.toLayoutAttrName(justify), '');
      }
    },
    
    toLayoutAttrName: function(value) {
      return value === 'between' ? 'justified' : value + '-justified';
    }
    
  });

})();

;

    Polymer('core-selection', {
      /**
       * If true, multiple selections are allowed.
       *
       * @attribute multi
       * @type boolean
       * @default false
       */
      multi: false,
      ready: function() {
        this.clear();
      },
      clear: function() {
        this.selection = [];
      },
      /**
       * Retrieves the selected item(s).
       * @method getSelection
       * @returns Returns the selected item(s). If the multi property is true,
       * getSelection will return an array, otherwise it will return 
       * the selected item or undefined if there is no selection.
      */
      getSelection: function() {
        return this.multi ? this.selection : this.selection[0];
      },
      /**
       * Indicates if a given item is selected.
       * @method isSelected
       * @param {any} item The item whose selection state should be checked.
       * @returns Returns true if `item` is selected.
      */
      isSelected: function(item) {
        return this.selection.indexOf(item) >= 0;
      },
      setItemSelected: function(item, isSelected) {
        if (item !== undefined && item !== null) {
          if (isSelected) {
            this.selection.push(item);
          } else {
            var i = this.selection.indexOf(item);
            if (i >= 0) {
              this.selection.splice(i, 1);
            }
          }
          this.fire("core-select", {isSelected: isSelected, item: item});
        }
      },
      /**
       * Set the selection state for a given `item`. If the multi property
       * is true, then the selected state of `item` will be toggled; otherwise
       * the `item` will be selected.
       * @method select
       * @param {any} item: The item to select.
      */
      select: function(item) {
        if (this.multi) {
          this.toggle(item);
        } else if (this.getSelection() !== item) {
          this.setItemSelected(this.getSelection(), false);
          this.setItemSelected(item, true);
        }
      },
      /**
       * Toggles the selection state for `item`.
       * @method toggle
       * @param {any} item: The item to toggle.
      */
      toggle: function(item) {
        this.setItemSelected(item, !this.isSelected(item));
      }
    });
  ;


    Polymer('core-selector', {

      /**
       * Gets or sets the selected element.  Default to use the index
       * of the item element.
       *
       * If you want a specific attribute value of the element to be
       * used instead of index, set "valueattr" to that attribute name.
       *
       * Example:
       *
       *     <core-selector valueattr="label" selected="foo">
       *       <div label="foo"></div>
       *       <div label="bar"></div>
       *       <div label="zot"></div>
       *     </core-selector>
       *
       * In multi-selection this should be an array of values.
       *
       * Example:
       *
       *     <core-selector id="selector" valueattr="label" multi>
       *       <div label="foo"></div>
       *       <div label="bar"></div>
       *       <div label="zot"></div>
       *     </core-selector>
       *
       *     this.$.selector.selected = ['foo', 'zot'];
       *
       * @attribute selected
       * @type Object
       * @default null
       */
      selected: null,

      /**
       * If true, multiple selections are allowed.
       *
       * @attribute multi
       * @type boolean
       * @default false
       */
      multi: false,

      /**
       * Specifies the attribute to be used for "selected" attribute.
       *
       * @attribute valueattr
       * @type string
       * @default 'name'
       */
      valueattr: 'name',

      /**
       * Specifies the CSS class to be used to add to the selected element.
       * 
       * @attribute selectedClass
       * @type string
       * @default 'core-selected'
       */
      selectedClass: 'core-selected',

      /**
       * Specifies the property to be used to set on the selected element
       * to indicate its active state.
       *
       * @attribute selectedProperty
       * @type string
       * @default ''
       */
      selectedProperty: '',

      /**
       * Specifies the attribute to set on the selected element to indicate
       * its active state.
       *
       * @attribute selectedAttribute
       * @type string
       * @default 'active'
       */
      selectedAttribute: 'active',

      /**
       * Returns the currently selected element. In multi-selection this returns
       * an array of selected elements.
       * Note that you should not use this to set the selection. Instead use
       * `selected`.
       * 
       * @attribute selectedItem
       * @type Object
       * @default null
       */
      selectedItem: null,

      /**
       * In single selection, this returns the model associated with the
       * selected element.
       * Note that you should not use this to set the selection. Instead use 
       * `selected`.
       * 
       * @attribute selectedModel
       * @type Object
       * @default null
       */
      selectedModel: null,

      /**
       * In single selection, this returns the selected index.
       * Note that you should not use this to set the selection. Instead use
       * `selected`.
       *
       * @attribute selectedIndex
       * @type number
       * @default -1
       */
      selectedIndex: -1,

      /**
       * Nodes with local name that are in the list will not be included 
       * in the selection items.  In the following example, `items` returns four
       * `core-item`'s and doesn't include `h3` and `hr`.
       *
       *     <core-selector excludedLocalNames="h3 hr">
       *       <h3>Header</h3>
       *       <core-item>Item1</core-item>
       *       <core-item>Item2</core-item>
       *       <hr>
       *       <core-item>Item3</core-item>
       *       <core-item>Item4</core-item>
       *     </core-selector>
       *
       * @attribute excludedLocalNames
       * @type string
       * @default ''
       */
      excludedLocalNames: '',

      /**
       * The target element that contains items.  If this is not set 
       * core-selector is the container.
       * 
       * @attribute target
       * @type Object
       * @default null
       */
      target: null,

      /**
       * This can be used to query nodes from the target node to be used for 
       * selection items.  Note this only works if `target` is set
       * and is not `core-selector` itself.
       *
       * Example:
       *
       *     <core-selector target="{{$.myForm}}" itemsSelector="input[type=radio]"></core-selector>
       *     <form id="myForm">
       *       <label><input type="radio" name="color" value="red"> Red</label> <br>
       *       <label><input type="radio" name="color" value="green"> Green</label> <br>
       *       <label><input type="radio" name="color" value="blue"> Blue</label> <br>
       *       <p>color = {{color}}</p>
       *     </form>
       * 
       * @attribute itemsSelector
       * @type string
       * @default ''
       */
      itemsSelector: '',

      /**
       * The event that would be fired from the item element to indicate
       * it is being selected.
       *
       * @attribute activateEvent
       * @type string
       * @default 'tap'
       */
      activateEvent: 'tap',

      /**
       * Set this to true to disallow changing the selection via the
       * `activateEvent`.
       *
       * @attribute notap
       * @type boolean
       * @default false
       */
      notap: false,

      defaultExcludedLocalNames: 'template',
      
      observe: {
        'selected multi': 'selectedChanged'
      },

      ready: function() {
        this.activateListener = this.activateHandler.bind(this);
        this.itemFilter = this.filterItem.bind(this);
        this.excludedLocalNamesChanged();
        this.observer = new MutationObserver(this.updateSelected.bind(this));
        if (!this.target) {
          this.target = this;
        }
      },

      /**
       * Returns an array of all items.
       *
       * @property items
       */
      get items() {
        if (!this.target) {
          return [];
        }
        var nodes = this.target !== this ? (this.itemsSelector ? 
            this.target.querySelectorAll(this.itemsSelector) : 
                this.target.children) : this.$.items.getDistributedNodes();
        return Array.prototype.filter.call(nodes, this.itemFilter);
      },

      filterItem: function(node) {
        return !this._excludedNames[node.localName];
      },

      excludedLocalNamesChanged: function() {
        this._excludedNames = {};
        var s = this.defaultExcludedLocalNames;
        if (this.excludedLocalNames) {
          s += ' ' + this.excludedLocalNames;
        }
        s.split(/\s+/g).forEach(function(n) {
          this._excludedNames[n] = 1;
        }, this);
      },

      targetChanged: function(old) {
        if (old) {
          this.removeListener(old);
          this.observer.disconnect();
          this.clearSelection();
        }
        if (this.target) {
          this.addListener(this.target);
          this.observer.observe(this.target, {childList: true});
          this.updateSelected();
        }
      },

      addListener: function(node) {
        Polymer.addEventListener(node, this.activateEvent, this.activateListener);
      },

      removeListener: function(node) {
        Polymer.removeEventListener(node, this.activateEvent, this.activateListener);
      },

      /**
       * Returns the selected item(s). If the `multi` property is true,
       * this will return an array, otherwise it will return 
       * the selected item or undefined if there is no selection.
       */
      get selection() {
        return this.$.selection.getSelection();
      },

      selectedChanged: function() {
        // TODO(ffu): Right now this is the only way to know that the `selected`
        // is an array and was mutated, as opposed to newly assigned.
        if (arguments.length === 1) {
          this.processSplices(arguments[0]);
        } else {
          this.updateSelected();
        }
      },
      
      updateSelected: function() {
        this.validateSelected();
        if (this.multi) {
          this.clearSelection(this.selected)
          this.selected && this.selected.forEach(function(s) {
            this.setValueSelected(s, true)
          }, this);
        } else {
          this.valueToSelection(this.selected);
        }
      },

      validateSelected: function() {
        // convert to an array for multi-selection
        if (this.multi && !Array.isArray(this.selected) && 
            this.selected != null) {
          this.selected = [this.selected];
        // use the first selected in the array for single-selection
        } else if (!this.multi && Array.isArray(this.selected)) {
          var s = this.selected[0];
          this.clearSelection([s]);
          this.selected = s;
        }
      },
      
      processSplices: function(splices) {
        for (var i = 0, splice; splice = splices[i]; i++) {
          for (var j = 0; j < splice.removed.length; j++) {
            this.setValueSelected(splice.removed[j], false);
          }
          for (var j = 0; j < splice.addedCount; j++) {
            this.setValueSelected(this.selected[splice.index + j], true);
          }
        }
      },

      clearSelection: function(excludes) {
        this.$.selection.selection.slice().forEach(function(item) {
          var v = this.valueForNode(item) || this.items.indexOf(item);
          if (!excludes || excludes.indexOf(v) < 0) {
            this.$.selection.setItemSelected(item, false);
          }
        }, this);
      },

      valueToSelection: function(value) {
        var item = this.valueToItem(value);
        this.$.selection.select(item);
      },
      
      setValueSelected: function(value, isSelected) {
        var item = this.valueToItem(value);
        if (isSelected ^ this.$.selection.isSelected(item)) {
          this.$.selection.setItemSelected(item, isSelected);
        }
      },

      updateSelectedItem: function() {
        this.selectedItem = this.selection;
      },

      selectedItemChanged: function() {
        if (this.selectedItem) {
          var t = this.selectedItem.templateInstance;
          this.selectedModel = t ? t.model : undefined;
        } else {
          this.selectedModel = null;
        }
        this.selectedIndex = this.selectedItem ? 
            parseInt(this.valueToIndex(this.selected)) : -1;
      },
      
      valueToItem: function(value) {
        return (value === null || value === undefined) ? 
            null : this.items[this.valueToIndex(value)];
      },

      valueToIndex: function(value) {
        // find an item with value == value and return it's index
        for (var i=0, items=this.items, c; (c=items[i]); i++) {
          if (this.valueForNode(c) == value) {
            return i;
          }
        }
        // if no item found, the value itself is probably the index
        return value;
      },

      valueForNode: function(node) {
        return node[this.valueattr] || node.getAttribute(this.valueattr);
      },

      // events fired from <core-selection> object
      selectionSelect: function(e, detail) {
        this.updateSelectedItem();
        if (detail.item) {
          this.applySelection(detail.item, detail.isSelected);
        }
      },

      applySelection: function(item, isSelected) {
        if (this.selectedClass) {
          item.classList.toggle(this.selectedClass, isSelected);
        }
        if (this.selectedProperty) {
          item[this.selectedProperty] = isSelected;
        }
        if (this.selectedAttribute && item.setAttribute) {
          if (isSelected) {
            item.setAttribute(this.selectedAttribute, '');
          } else {
            item.removeAttribute(this.selectedAttribute);
          }
        }
      },

      // event fired from host
      activateHandler: function(e) {
        if (!this.notap) {
          var i = this.findDistributedTarget(e.target, this.items);
          if (i >= 0) {
            var item = this.items[i];
            var s = this.valueForNode(item) || i;
            if (this.multi) {
              if (this.selected) {
                this.addRemoveSelected(s);
              } else {
                this.selected = [s];
              }
            } else {
              this.selected = s;
            }
            this.asyncFire('core-activate', {item: item});
          }
        }
      },

      addRemoveSelected: function(value) {
        var i = this.selected.indexOf(value);
        if (i >= 0) {
          this.selected.splice(i, 1);
        } else {
          this.selected.push(value);
        }
      },

      findDistributedTarget: function(target, nodes) {
        // find first ancestor of target (including itself) that
        // is in nodes, if any
        while (target && target != this) {
          var i = Array.prototype.indexOf.call(nodes, target);
          if (i >= 0) {
            return i;
          }
          target = target.parentNode;
        }
      },
      
      selectIndex: function(index) {
        var item = this.items[index];
        if (item) {
          this.selected = this.valueForNode(item) || index;
          return item;
        }
      },
      
      /**
       * Selects the previous item. This should be used in single selection only.
       *
       * @method selectPrevious
       * @param {boolean} wrapped if true and it is already at the first item,
       *                  wrap to the end
       * @returns the previous item or undefined if there is none
       */
      selectPrevious: function(wrapped) {
        var i = wrapped && !this.selectedIndex ? 
            this.items.length - 1 : this.selectedIndex - 1;
        return this.selectIndex(i);
      },
      
      /**
       * Selects the next item.  This should be used in single selection only.
       *
       * @method selectNext
       * @param {boolean} wrapped if true and it is already at the last item,
       *                  wrap to the front
       * @returns the next item or undefined if there is none
       */
      selectNext: function(wrapped) {
        var i = wrapped && this.selectedIndex >= this.items.length - 1 ? 
            0 : this.selectedIndex + 1;
        return this.selectIndex(i);
      }
      
    });
  ;


  (function() {
    
    var SKIP_ID = 'meta';
    var metaData = {}, metaArray = {};

    Polymer('core-meta', {
      
      /**
       * The type of meta-data.  All meta-data with the same type with be
       * stored together.
       * 
       * @attribute type
       * @type string
       * @default 'default'
       */
      type: 'default',
      
      alwaysPrepare: true,
      
      ready: function() {
        this.register(this.id);
      },
      
      get metaArray() {
        var t = this.type;
        if (!metaArray[t]) {
          metaArray[t] = [];
        }
        return metaArray[t];
      },
      
      get metaData() {
        var t = this.type;
        if (!metaData[t]) {
          metaData[t] = {};
        }
        return metaData[t];
      },
      
      register: function(id, old) {
        if (id && id !== SKIP_ID) {
          this.unregister(this, old);
          this.metaData[id] = this;
          this.metaArray.push(this);
        }
      },
      
      unregister: function(meta, id) {
        delete this.metaData[id || meta.id];
        var i = this.metaArray.indexOf(meta);
        if (i >= 0) {
          this.metaArray.splice(i, 1);
        }
      },
      
      /**
       * Returns a list of all meta-data elements with the same type.
       * 
       * @property list
       * @type array
       * @default []
       */
      get list() {
        return this.metaArray;
      },
      
      /**
       * Retrieves meta-data by ID.
       *
       * @method byId
       * @param {String} id The ID of the meta-data to be returned.
       * @returns Returns meta-data.
       */
      byId: function(id) {
        return this.metaData[id];
      }
      
    });
    
  })();
  
;

  
    Polymer('core-iconset', {
  
      /**
       * The URL of the iconset image.
       *
       * @attribute src
       * @type string
       * @default ''
       */
      src: '',

      /**
       * The width of the iconset image. This must only be specified if the
       * icons are arranged into separate rows inside the image.
       *
       * @attribute width
       * @type number
       * @default 0
       */
      width: 0,

      /**
       * A space separated list of names corresponding to icons in the iconset
       * image file. This list must be ordered the same as the icon images
       * in the image file.
       *
       * @attribute icons
       * @type string
       * @default ''
       */
      icons: '',

      /**
       * The size of an individual icon. Note that icons must be square.
       *
       * @attribute iconSize
       * @type number
       * @default 24
       */
      iconSize: 24,

      /**
       * The horizontal offset of the icon images in the inconset src image.
       * This is typically used if the image resource contains additional images
       * beside those intended for the iconset.
       *
       * @attribute offsetX
       * @type number
       * @default 0
       */
      offsetX: 0,
      /**
       * The vertical offset of the icon images in the inconset src image.
       * This is typically used if the image resource contains additional images
       * beside those intended for the iconset.
       *
       * @attribute offsetY
       * @type number
       * @default 0
       */
      offsetY: 0,
      type: 'iconset',

      created: function() {
        this.iconMap = {};
        this.iconNames = [];
        this.themes = {};
      },
  
      ready: function() {
        // TODO(sorvell): ensure iconset's src is always relative to the main
        // document
        if (this.src && (this.ownerDocument !== document)) {
          this.src = this.resolvePath(this.src, this.ownerDocument.baseURI);
        }
        this.super();
        this.updateThemes();
      },

      iconsChanged: function() {
        var ox = this.offsetX;
        var oy = this.offsetY;
        this.icons && this.icons.split(/\s+/g).forEach(function(name, i) {
          this.iconNames.push(name);
          this.iconMap[name] = {
            offsetX: ox,
            offsetY: oy
          }
          if (ox + this.iconSize < this.width) {
            ox += this.iconSize;
          } else {
            ox = this.offsetX;
            oy += this.iconSize;
          }
        }, this);
      },

      updateThemes: function() {
        var ts = this.querySelectorAll('property[theme]');
        ts && ts.array().forEach(function(t) {
          this.themes[t.getAttribute('theme')] = {
            offsetX: parseInt(t.getAttribute('offsetX')) || 0,
            offsetY: parseInt(t.getAttribute('offsetY')) || 0
          };
        }, this);
      },

      // TODO(ffu): support retrived by index e.g. getOffset(10);
      /**
       * Returns an object containing `offsetX` and `offsetY` properties which
       * specify the pixel locaion in the iconset's src file for the given
       * `icon` and `theme`. It's uncommon to call this method. It is useful,
       * for example, to manually position a css backgroundImage to the proper
       * offset. It's more common to use the `applyIcon` method.
       *
       * @method getOffset
       * @param {String|Number} icon The name of the icon or the index of the
       * icon within in the icon image.
       * @param {String} theme The name of the theme.
       * @returns {Object} An object specifying the offset of the given icon 
       * within the icon resource file; `offsetX` is the horizontal offset and
       * `offsetY` is the vertical offset. Both values are in pixel units.
       */
      getOffset: function(icon, theme) {
        var i = this.iconMap[icon];
        if (!i) {
          var n = this.iconNames[Number(icon)];
          i = this.iconMap[n];
        }
        var t = this.themes[theme];
        if (i && t) {
          return {
            offsetX: i.offsetX + t.offsetX,
            offsetY: i.offsetY + t.offsetY
          }
        }
        return i;
      },

      /**
       * Applies an icon to the given element as a css background image. This
       * method does not size the element, and it's often necessary to set 
       * the element's height and width so that the background image is visible.
       *
       * @method applyIcon
       * @param {Element} element The element to which the background is
       * applied.
       * @param {String|Number} icon The name or index of the icon to apply.
       * @param {Number} scale (optional, defaults to 1) A scaling factor 
       * with which the icon can be magnified.
       * @return {Element} The icon element.
       */
      applyIcon: function(element, icon, scale) {
        var offset = this.getOffset(icon);
        scale = scale || 1;
        if (element && offset) {
          var icon = element._icon || document.createElement('div');
          var style = icon.style;
          style.backgroundImage = 'url(' + this.src + ')';
          style.backgroundPosition = (-offset.offsetX * scale + 'px') + 
             ' ' + (-offset.offsetY * scale + 'px');
          style.backgroundSize = scale === 1 ? 'auto' :
             this.width * scale + 'px';
          if (icon.parentNode !== element) {
            element.appendChild(icon);
          }
          return icon;
        }
      }

    });

  ;

(function() {
  
  // mono-state
  var meta;
  
  Polymer('core-icon', {

    /**
     * The URL of an image for the icon. If the src property is specified,
     * the icon property should not be.
     *
     * @attribute src
     * @type string
     * @default ''
     */
    src: '',

    /**
     * Specifies the icon name or index in the set of icons available in
     * the icon's icon set. If the icon property is specified,
     * the src property should not be.
     *
     * @attribute icon
     * @type string
     * @default ''
     */
    icon: '',

    /**
     * Alternative text content for accessibility support.
     * If alt is present and not empty, it will set the element's role to img and add an aria-label whose content matches alt.
     * If alt is present and is an empty string, '', it will hide the element from the accessibility layer
     * If alt is not present, it will set the element's role to img and the element will fallback to using the icon attribute for its aria-label.
     * 
     * @attribute alt
     * @type string
     * @default ''
     */
    alt: null,

    observe: {
      'icon': 'updateIcon',
      'alt': 'updateAlt'
    },

    defaultIconset: 'icons',

    ready: function() {
      if (!meta) {
        meta = document.createElement('core-iconset');
      }

      // Allow user-provided `aria-label` in preference to any other text alternative.
      if (this.hasAttribute('aria-label')) {
        // Set `role` if it has not been overridden.
        if (!this.hasAttribute('role')) {
          this.setAttribute('role', 'img');
        }
        return;
      }
      this.updateAlt();
    },

    srcChanged: function() {
      var icon = this._icon || document.createElement('div');
      icon.textContent = '';
      icon.setAttribute('fit', '');
      icon.style.backgroundImage = 'url(' + this.src + ')';
      icon.style.backgroundPosition = 'center';
      icon.style.backgroundSize = '100%';
      if (!icon.parentNode) {
        this.appendChild(icon);
      }
      this._icon = icon;
    },

    getIconset: function(name) {
      return meta.byId(name || this.defaultIconset);
    },

    updateIcon: function(oldVal, newVal) {
      if (!this.icon) {
        this.updateAlt();
        return;
      }
      var parts = String(this.icon).split(':');
      var icon = parts.pop();
      if (icon) {
        var set = this.getIconset(parts.pop());
        if (set) {
          this._icon = set.applyIcon(this, icon);
          if (this._icon) {
            this._icon.setAttribute('fit', '');
          }
        }
      }
      // Check to see if we're using the old icon's name for our a11y fallback
      if (oldVal) {
        if (oldVal.split(':').pop() == this.getAttribute('aria-label')) {
          this.updateAlt();
        }
      }
    },

    updateAlt: function() {
      // Respect the user's decision to remove this element from
      // the a11y tree
      if (this.getAttribute('aria-hidden')) {
        return;
      }

      // Remove element from a11y tree if `alt` is empty, otherwise
      // use `alt` as `aria-label`.
      if (this.alt === '') {
        this.setAttribute('aria-hidden', 'true');
        if (this.hasAttribute('role')) {
          this.removeAttribute('role');
        }
        if (this.hasAttribute('aria-label')) {
          this.removeAttribute('aria-label');
        }
      } else {
        this.setAttribute('aria-label', this.alt ||
                                        this.icon.split(':').pop());
        if (!this.hasAttribute('role')) {
          this.setAttribute('role', 'img');
        }
        if (this.hasAttribute('aria-hidden')) {
          this.removeAttribute('aria-hidden');
        }
      }
    }

  });
  
})();
;


    Polymer('core-iconset-svg', {


      /**
       * The size of an individual icon. Note that icons must be square.
       *
       * @attribute iconSize
       * @type number
       * @default 24
       */
      iconSize: 24,
      type: 'iconset',

      created: function() {
        this._icons = {};
      },

      ready: function() {
        this.super();
        this.updateIcons();
      },

      iconById: function(id) {
        return this._icons[id] || (this._icons[id] = this.querySelector('[id="' + id +'"]'));
      },

      cloneIcon: function(id) {
        var icon = this.iconById(id);
        if (icon) {
          var content = icon.cloneNode(true);
          content.removeAttribute('id');
          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 ' + this.iconSize + ' ' +
              this.iconSize);
          // NOTE(dfreedm): work around https://crbug.com/370136
          svg.style.pointerEvents = 'none';
          svg.appendChild(content);
          return svg;
        }
      },

      get iconNames() {
        if (!this._iconNames) {
          this._iconNames = this.findIconNames();
        }
        return this._iconNames;
      },

      findIconNames: function() {
        var icons = this.querySelectorAll('[id]').array();
        if (icons.length) {
          return icons.map(function(n){ return n.id });
        }
      },

      /**
       * Applies an icon to the given element. The svg icon is added to the
       * element's shadowRoot if one exists or directly to itself.
       *
       * @method applyIcon
       * @param {Element} element The element to which the icon is
       * applied.
       * @param {String|Number} icon The name the icon to apply.
       * @return {Element} The icon element
       */
      applyIcon: function(element, icon) {
        var root = element;
        // remove old
        var old = root.querySelector('svg');
        if (old) {
          old.remove();
        }
        // install new
        var svg = this.cloneIcon(icon);
        if (!svg) {
          return;
        }
        svg.setAttribute('height', '100%');
        svg.setAttribute('width', '100%');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.display = 'block';
        root.insertBefore(svg, root.firstElementChild);
        return svg;
      },
      
      /**
       * Tell users of the iconset, that the set has loaded.
       * This finds all elements matching the selector argument and calls 
       * the method argument on them.
       * @method updateIcons
       * @param selector {string} css selector to identify iconset users, 
       * defaults to '[icon]'
       * @param method {string} method to call on found elements, 
       * defaults to 'updateIcon'
       */
      updateIcons: function(selector, method) {
        selector = selector || '[icon]';
        method = method || 'updateIcon';
        var deep = window.ShadowDOMPolyfill ? '' : 'html /deep/ ';
        var i$ = document.querySelectorAll(deep + selector);
        for (var i=0, e; e=i$[i]; i++) {
          if (e[method]) {
            e[method].call(e);
          }
        }
      }
      

    });

  ;


  (function() {

    var p = {

      eventDelegates: {
        down: 'downAction'
      },

      activeChanged: function() {
        this.super();

        if (this.$.ripple) {
          if (this.active) {
            // FIXME: remove when paper-ripple can have a default 'down' state.
            if (!this.lastEvent) {
              var rect = this.getBoundingClientRect();
              this.lastEvent = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
              }
            }
            this.$.ripple.downAction(this.lastEvent);
          } else {
            this.$.ripple.upAction();
          }
        }

        this.adjustZ();
      },

      disabledChanged: function() {
        this._disabledChanged();
        this.adjustZ();
      },

      recenteringTouchChanged: function() {
        if (this.$.ripple) {
          this.$.ripple.classList.toggle('recenteringTouch', this.recenteringTouch);
        }
      },

      fillChanged: function() {
        if (this.$.ripple) {
          this.$.ripple.classList.toggle('fill', this.fill);
        }
      },

      adjustZ: function() {
        if (!this.$.shadow) {
          return;
        }
        if (this.active) {
          this.$.shadow.setZ(2);
        } else if (this.disabled) {
          this.$.shadow.setZ(0);
        } else {
          this.$.shadow.setZ(1);
        }
      },

      downAction: function(e) {
        this._downAction();

        if (this.hasAttribute('noink')) {
          return;
        }

        this.lastEvent = e;
        if (!this.$.ripple) {
          var ripple = document.createElement('paper-ripple');
          ripple.setAttribute('id', 'ripple');
          ripple.setAttribute('fit', '');
          if (this.recenteringTouch) {
            ripple.classList.add('recenteringTouch');
          }
          if (!this.fill) {
            ripple.classList.add('circle');
          }
          this.$.ripple = ripple;
          this.shadowRoot.insertBefore(ripple, this.shadowRoot.firstChild);
          // No need to forward the event to the ripple because the ripple
          // is triggered in activeChanged
        }
      }

    };

    Polymer.mixin2(p, Polymer.CoreFocusable);
    Polymer('paper-button-base',p);

  })();

;


  (function() {

    var waveMaxRadius = 150;
    //
    // INK EQUATIONS
    //
    function waveRadiusFn(touchDownMs, touchUpMs, anim) {
      // Convert from ms to s
      var touchDown = touchDownMs / 1000;
      var touchUp = touchUpMs / 1000;
      var totalElapsed = touchDown + touchUp;
      var ww = anim.width, hh = anim.height;
      // use diagonal size of container to avoid floating point math sadness
      var waveRadius = Math.min(Math.sqrt(ww * ww + hh * hh), waveMaxRadius) * 1.1 + 5;
      var duration = 1.1 - .2 * (waveRadius / waveMaxRadius);
      var tt = (totalElapsed / duration);

      var size = waveRadius * (1 - Math.pow(80, -tt));
      return Math.abs(size);
    }

    function waveOpacityFn(td, tu, anim) {
      // Convert from ms to s.
      var touchDown = td / 1000;
      var touchUp = tu / 1000;
      var totalElapsed = touchDown + touchUp;

      if (tu <= 0) {  // before touch up
        return anim.initialOpacity;
      }
      return Math.max(0, anim.initialOpacity - touchUp * anim.opacityDecayVelocity);
    }

    function waveOuterOpacityFn(td, tu, anim) {
      // Convert from ms to s.
      var touchDown = td / 1000;
      var touchUp = tu / 1000;

      // Linear increase in background opacity, capped at the opacity
      // of the wavefront (waveOpacity).
      var outerOpacity = touchDown * 0.3;
      var waveOpacity = waveOpacityFn(td, tu, anim);
      return Math.max(0, Math.min(outerOpacity, waveOpacity));
    }

    // Determines whether the wave should be completely removed.
    function waveDidFinish(wave, radius, anim) {
      var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);

      // If the wave opacity is 0 and the radius exceeds the bounds
      // of the element, then this is finished.
      return waveOpacity < 0.01 && radius >= Math.min(wave.maxRadius, waveMaxRadius);
    };

    function waveAtMaximum(wave, radius, anim) {
      var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);

      return waveOpacity >= anim.initialOpacity && radius >= Math.min(wave.maxRadius, waveMaxRadius);
    }

    //
    // DRAWING
    //
    function drawRipple(ctx, x, y, radius, innerAlpha, outerAlpha) {
      // Only animate opacity and transform
      if (outerAlpha !== undefined) {
        ctx.bg.style.opacity = outerAlpha;
      }
      ctx.wave.style.opacity = innerAlpha;

      var s = radius / (ctx.containerSize / 2);
      var dx = x - (ctx.containerWidth / 2);
      var dy = y - (ctx.containerHeight / 2);

      ctx.wc.style.webkitTransform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
      ctx.wc.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';

      // 2d transform for safari because of border-radius and overflow:hidden clipping bug.
      // https://bugs.webkit.org/show_bug.cgi?id=98538
      ctx.wave.style.webkitTransform = 'scale(' + s + ',' + s + ')';
      ctx.wave.style.transform = 'scale3d(' + s + ',' + s + ',1)';
    }

    //
    // SETUP
    //
    function createWave(elem) {
      var elementStyle = window.getComputedStyle(elem);
      var fgColor = elementStyle.color;

      var inner = document.createElement('div');
      inner.style.backgroundColor = fgColor;
      inner.classList.add('wave');

      var outer = document.createElement('div');
      outer.classList.add('wave-container');
      outer.appendChild(inner);

      var container = elem.$.waves;
      container.appendChild(outer);

      elem.$.bg.style.backgroundColor = fgColor;

      var wave = {
        bg: elem.$.bg,
        wc: outer,
        wave: inner,
        waveColor: fgColor,
        maxRadius: 0,
        isMouseDown: false,
        mouseDownStart: 0.0,
        mouseUpStart: 0.0,
        tDown: 0,
        tUp: 0
      };
      return wave;
    }

    function removeWaveFromScope(scope, wave) {
      if (scope.waves) {
        var pos = scope.waves.indexOf(wave);
        scope.waves.splice(pos, 1);
        // FIXME cache nodes
        wave.wc.remove();
      }
    };

    // Shortcuts.
    var pow = Math.pow;
    var now = Date.now;
    if (window.performance && performance.now) {
      now = performance.now.bind(performance);
    }

    function cssColorWithAlpha(cssColor, alpha) {
        var parts = cssColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (typeof alpha == 'undefined') {
            alpha = 1;
        }
        if (!parts) {
          return 'rgba(255, 255, 255, ' + alpha + ')';
        }
        return 'rgba(' + parts[1] + ', ' + parts[2] + ', ' + parts[3] + ', ' + alpha + ')';
    }

    function dist(p1, p2) {
      return Math.sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2));
    }

    function distanceFromPointToFurthestCorner(point, size) {
      var tl_d = dist(point, {x: 0, y: 0});
      var tr_d = dist(point, {x: size.w, y: 0});
      var bl_d = dist(point, {x: 0, y: size.h});
      var br_d = dist(point, {x: size.w, y: size.h});
      return Math.max(tl_d, tr_d, bl_d, br_d);
    }

    Polymer('paper-ripple', {

      /**
       * The initial opacity set on the wave.
       *
       * @attribute initialOpacity
       * @type number
       * @default 0.25
       */
      initialOpacity: 0.25,

      /**
       * How fast (opacity per second) the wave fades out.
       *
       * @attribute opacityDecayVelocity
       * @type number
       * @default 0.8
       */
      opacityDecayVelocity: 0.8,

      backgroundFill: true,
      pixelDensity: 2,

      eventDelegates: {
        down: 'downAction',
        up: 'upAction'
      },

      ready: function() {
        this.waves = [];
      },

      downAction: function(e) {
        var wave = createWave(this);

        this.cancelled = false;
        wave.isMouseDown = true;
        wave.tDown = 0.0;
        wave.tUp = 0.0;
        wave.mouseUpStart = 0.0;
        wave.mouseDownStart = now();

        var rect = this.getBoundingClientRect();
        var width = rect.width;
        var height = rect.height;
        var touchX = e.x - rect.left;
        var touchY = e.y - rect.top;

        wave.startPosition = {x:touchX, y:touchY};

        if (this.classList.contains("recenteringTouch")) {
          wave.endPosition = {x: width / 2,  y: height / 2};
          wave.slideDistance = dist(wave.startPosition, wave.endPosition);
        }
        wave.containerSize = Math.max(width, height);
        wave.containerWidth = width;
        wave.containerHeight = height;
        wave.maxRadius = distanceFromPointToFurthestCorner(wave.startPosition, {w: width, h: height});

        // The wave is circular so constrain its container to 1:1
        wave.wc.style.top = (wave.containerHeight - wave.containerSize) / 2 + 'px';
        wave.wc.style.left = (wave.containerWidth - wave.containerSize) / 2 + 'px';
        wave.wc.style.width = wave.containerSize + 'px';
        wave.wc.style.height = wave.containerSize + 'px';

        this.waves.push(wave);

        if (!this._loop) {
          this._loop = this.animate.bind(this, {
            width: width,
            height: height
          });
          requestAnimationFrame(this._loop);
        }
        // else there is already a rAF
      },

      upAction: function() {
        for (var i = 0; i < this.waves.length; i++) {
          // Declare the next wave that has mouse down to be mouse'ed up.
          var wave = this.waves[i];
          if (wave.isMouseDown) {
            wave.isMouseDown = false
            wave.mouseUpStart = now();
            wave.mouseDownStart = 0;
            wave.tUp = 0.0;
            break;
          }
        }
        this._loop && requestAnimationFrame(this._loop);
      },

      cancel: function() {
        this.cancelled = true;
      },

      animate: function(ctx) {
        var shouldRenderNextFrame = false;

        var deleteTheseWaves = [];
        // The oldest wave's touch down duration
        var longestTouchDownDuration = 0;
        var longestTouchUpDuration = 0;
        // Save the last known wave color
        var lastWaveColor = null;
        // wave animation values
        var anim = {
          initialOpacity: this.initialOpacity,
          opacityDecayVelocity: this.opacityDecayVelocity,
          height: ctx.height,
          width: ctx.width
        }

        for (var i = 0; i < this.waves.length; i++) {
          var wave = this.waves[i];

          if (wave.mouseDownStart > 0) {
            wave.tDown = now() - wave.mouseDownStart;
          }
          if (wave.mouseUpStart > 0) {
            wave.tUp = now() - wave.mouseUpStart;
          }

          // Determine how long the touch has been up or down.
          var tUp = wave.tUp;
          var tDown = wave.tDown;
          longestTouchDownDuration = Math.max(longestTouchDownDuration, tDown);
          longestTouchUpDuration = Math.max(longestTouchUpDuration, tUp);

          // Obtain the instantenous size and alpha of the ripple.
          var radius = waveRadiusFn(tDown, tUp, anim);
          var waveAlpha =  waveOpacityFn(tDown, tUp, anim);
          var waveColor = cssColorWithAlpha(wave.waveColor, waveAlpha);
          lastWaveColor = wave.waveColor;

          // Position of the ripple.
          var x = wave.startPosition.x;
          var y = wave.startPosition.y;

          // Ripple gravitational pull to the center of the canvas.
          if (wave.endPosition) {

            // This translates from the origin to the center of the view  based on the max dimension of
            var translateFraction = Math.min(1, radius / wave.containerSize * 2 / Math.sqrt(2) );

            x += translateFraction * (wave.endPosition.x - wave.startPosition.x);
            y += translateFraction * (wave.endPosition.y - wave.startPosition.y);
          }

          // If we do a background fill fade too, work out the correct color.
          var bgFillColor = null;
          if (this.backgroundFill) {
            var bgFillAlpha = waveOuterOpacityFn(tDown, tUp, anim);
            bgFillColor = cssColorWithAlpha(wave.waveColor, bgFillAlpha);
          }

          // Draw the ripple.
          drawRipple(wave, x, y, radius, waveAlpha, bgFillAlpha);

          // Determine whether there is any more rendering to be done.
          var maximumWave = waveAtMaximum(wave, radius, anim);
          var waveDissipated = waveDidFinish(wave, radius, anim);
          var shouldKeepWave = !waveDissipated || maximumWave;
          // keep rendering dissipating wave when at maximum radius on upAction
          var shouldRenderWaveAgain = wave.mouseUpStart ? !waveDissipated : !maximumWave;
          shouldRenderNextFrame = shouldRenderNextFrame || shouldRenderWaveAgain;
          if (!shouldKeepWave || this.cancelled) {
            deleteTheseWaves.push(wave);
          }
       }

        if (shouldRenderNextFrame) {
          requestAnimationFrame(this._loop);
        }

        for (var i = 0; i < deleteTheseWaves.length; ++i) {
          var wave = deleteTheseWaves[i];
          removeWaveFromScope(this, wave);
        }

        if (!this.waves.length && this._loop) {
          // clear the background color
          this.$.bg.style.backgroundColor = null;
          this._loop = null;
          this.fire('core-transitionend');
        }
      }

    });

  })();

;

    Polymer('paper-icon-button',{

      publish: {

        /**
         * The URL of an image for the icon. If the src property is specified,
         * the icon property should not be.
         *
         * @attribute src
         * @type string
         * @default ''
         */
        src: '',

        /**
         * Specifies the icon name or index in the set of icons available in
         * the icon's icon set. If the icon property is specified,
         * the src property should not be.
         *
         * @attribute icon
         * @type string
         * @default ''
         */
        icon: '',

        recenteringTouch: true,
        fill: false

      },

      iconChanged: function(oldIcon) {
        var label = this.getAttribute('aria-label');
        if (!label || label === oldIcon) {
          this.setAttribute('aria-label', this.icon);
        }
      }

    });

  ;


  Polymer('paper-tab', {
    
    /**
     * If true, ink ripple effect is disabled.
     *
     * @attribute noink
     * @type boolean
     * @default false
     */
    noink: false,
    
    eventDelegates: {
      down: 'downAction',
      up: 'upAction'
    },

    downAction: function(e) {
      if (this.noink || (this.parentElement && this.parentElement.noink)) {
        return;
      }
      this.$.ink.downAction(e);
    },

    upAction: function() {
      this.$.ink.upAction();
    },
    
    cancelRipple: function() {
      this.$.ink.upAction();
    }
    
  });
  
;


  Polymer('paper-tabs', {
    
    /**
     * If true, ink ripple effect is disabled.
     *
     * @attribute noink
     * @type boolean
     * @default false
     */
    noink: false,
    
    /**
     * If true, the bottom bar to indicate the selected tab will not be shown.
     *
     * @attribute nobar
     * @type boolean
     * @default false
     */
    nobar: false,
    
    /**
     * If true, the slide effect for the bottom bar is disabled.
     *
     * @attribute noslide
     * @type boolean
     * @default false
     */
    noslide: false,
    
    /**
     * If true, tabs are scrollable and the tab width is based on the label width.
     *
     * @attribute scrollable
     * @type boolean
     * @default false
     */
    scrollable: false,
    
    /**
     * If true, dragging on the tabs to scroll is disabled.
     *
     * @attribute disableDrag
     * @type boolean
     * @default false
     */
    disableDrag: false,
    
    /**
     * If true, scroll buttons (left/right arrow) will be hidden for scrollable tabs.
     *
     * @attribute hideScrollButton
     * @type boolean
     * @default false
     */
    hideScrollButton: false,
    
    activateEvent: 'tap',
    
    step: 10,
    
    holdDelay: 10,
    
    ready: function() {
      this.super();
      this._trackxHandler = this.trackx.bind(this);
      Polymer.addEventListener(this.$.tabsContainer, 'trackx', this._trackxHandler);
      this._tabsObserver = new MutationObserver(this.updateBar.bind(this));
    },
    
    domReady: function() {
      this.async('scroll');
      this._tabsObserver.observe(this, {childList: true, subtree: true, characterData: true});
    },
    
    detached: function() {
      Polymer.removeEventListener(this.$.tabsContainer, 'trackx', this._trackxHandler);
      this._tabsObserver.disconnect();
    },
    
    trackStart: function(e) {
      if (!this.scrollable || this.disableDrag) {
        return;
      }
      var t = e.target;
      if (t && t.cancelRipple) {
        t.cancelRipple();
      }
      this._startx = this.$.tabsContainer.scrollLeft;
      e.preventTap();
    },
    
    trackx: function(e) {
      if (!this.scrollable || this.disableDrag) {
        return;
      }
      this.$.tabsContainer.scrollLeft = this._startx - e.dx;
    },
    
    scroll: function() {
      if (!this.scrollable) {
        return;
      }
      var tc = this.$.tabsContainer;
      var l = tc.scrollLeft;
      this.leftHidden = l === 0;
      this.rightHidden = l === (tc.scrollWidth - tc.clientWidth);
    },
    
    holdLeft: function() {
      this.holdJob = setInterval(this.scrollToLeft.bind(this), this.holdDelay);
    },
    
    holdRight: function() {
      this.holdJob = setInterval(this.scrollToRight.bind(this), this.holdDelay);
    },
    
    releaseHold: function() {
      clearInterval(this.holdJob);
      this.holdJob = null;
    },
    
    scrollToLeft: function() {
      this.$.tabsContainer.scrollLeft -= this.step;
    },
    
    scrollToRight: function() {
      this.$.tabsContainer.scrollLeft += this.step;
    },
    
    /**
     * Invoke this to update the size and position of the bottom bar.  Usually
     * you only need to call this if the `paper-tabs` is initially hidden and
     * later becomes visible.
     *
     * @method updateBar
     */
    updateBar: function() {
      this.async('selectedItemChanged');
    },
    
    selectedItemChanged: function(old) {
      var oldIndex = this.selectedIndex;
      this.super(arguments);
      var s = this.$.selectionBar.style;
      
      if (!this.selectedItem) {
        s.width = 0;
        s.left = 0;
        return;
      } 
      
      var r = this.$.tabsContent.getBoundingClientRect();
      this._w = r.width;
      this._l = r.left;
      
      r = this.selectedItem.getBoundingClientRect();
      this._sw = r.width;
      this._sl = r.left;
      this._sOffsetLeft = this._sl - this._l; 
      
      if (this.noslide || old == null) {
        this.positionBarForSelected();
        return;
      }
      
      var oldRect = old.getBoundingClientRect();
      
      var m = 5;
      this.$.selectionBar.classList.add('expand');
      if (oldIndex < this.selectedIndex) {
        s.width = this.calcPercent(this._sl + this._sw - oldRect.left) - m + '%';
        this._transitionCounter = 1;
      } else {
        s.width = this.calcPercent(oldRect.left + oldRect.width - this._sl) - m + '%';
        s.left = this.calcPercent(this._sOffsetLeft) + m + '%';
        this._transitionCounter = 2;
      }
      if (this.scrollable) {
        this.scrollToSelectedIfNeeded();
      }
    },
    
    scrollToSelectedIfNeeded: function() {
      var scrollLeft = this.$.tabsContainer.scrollLeft;
      // scroll to selected if needed
      if (this._sOffsetLeft + this._sw < scrollLeft || 
          this._sOffsetLeft - scrollLeft > this.$.tabsContainer.offsetWidth) {
        this.$.tabsContainer.scrollLeft = this._sOffsetLeft;
      }
    },
    
    positionBarForSelected: function() {
      var s = this.$.selectionBar.style;
      s.width = this.calcPercent(this._sw) + '%';
      s.left = this.calcPercent(this._sOffsetLeft) + '%';
    },
    
    calcPercent: function(w) {
      return 100 * w / this._w;
    },
    
    barTransitionEnd: function(e) {
      this._transitionCounter--;
      var cl = this.$.selectionBar.classList;
      if (cl.contains('expand') && !this._transitionCounter) {
        cl.remove('expand');
        cl.add('contract');
        this.positionBarForSelected();
      } else if (cl.contains('contract')) {
        cl.remove('contract');
      }
    }
    
  });
  
;
Polymer('core-pages');;

  Polymer('paper-shadow',{

    publish: {

      /**
       * The z-depth of this shadow, from 0-5. Setting this property
       * after element creation has no effect. Use `setZ()` instead.
       *
       * @attribute z
       * @type number
       * @default 1
       */
      z: 1,

      /**
       * Set this to true to animate the shadow when setting a new
       * `z` value.
       *
       * @attribute animated
       * @type boolean
       * @default false
       */
      animated: false

    },

    setZ: function(newZ) {
      if (this.z !== newZ) {
        this.$['shadow-bottom'].classList.remove('paper-shadow-bottom-z-' + this.z);
        this.$['shadow-bottom'].classList.add('paper-shadow-bottom-z-' + newZ);
        this.$['shadow-top'].classList.remove('paper-shadow-top-z-' + this.z);
        this.$['shadow-top'].classList.add('paper-shadow-top-z-' + newZ);
        this.z = newZ;
      }
    }

  });
;

  Polymer('love-heart', {});
;

(function() {

window.CoreStyle = window.CoreStyle || {
  g: {},
  list: {},
  refMap: {}
};

Polymer('core-style', {
  /**
   * The `id` property should be set if the `core-style` is a producer
   * of styles. In this case, the `core-style` should have text content
   * that is cssText.
   *
   * @attribute id
   * @type string
   * @default ''
   */


  publish: {
    /**
     * The `ref` property should be set if the `core-style` element is a 
     * consumer of styles. Set it to the `id` of the desired `core-style`
     * element.
     *
     * @attribute ref
     * @type string
     * @default ''
     */
    ref: ''
  },

  // static
  g: CoreStyle.g,
  refMap: CoreStyle.refMap,

  /**
   * The `list` is a map of all `core-style` producers stored by `id`. It 
   * should be considered readonly. It's useful for nesting one `core-style`
   * inside another.
   *
   * @attribute list
   * @type object (readonly)
   * @default {map of all `core-style` producers}
   */
  list: CoreStyle.list,

  // if we have an id, we provide style
  // if we have a ref, we consume/require style
  ready: function() {
    if (this.id) {
      this.provide();
    } else {
      this.registerRef(this.ref);
      if (!window.ShadowDOMPolyfill) {
        this.require();
      }  
    }
  },

  // can't shim until attached if using SD polyfill because need to find host
  attached: function() {
    if (!this.id && window.ShadowDOMPolyfill) {
      this.require();
    }
  },

  /****** producer stuff *******/

  provide: function() {
    this.register();
    // we want to do this asap, especially so we can do so before definitions
    // that use this core-style are registered.
    if (this.textContent) {
      this._completeProvide();
    } else {
      this.async(this._completeProvide);
    }
  },

  register: function() {
    var i = this.list[this.id];
    if (i) {
      if (!Array.isArray(i)) {
        this.list[this.id] = [i];
      }
      this.list[this.id].push(this);
    } else {
      this.list[this.id] = this;  
    }
  },

  // stamp into a shadowRoot so we can monitor dom of the bound output
  _completeProvide: function() {
    this.createShadowRoot();
    this.domObserver = new MutationObserver(this.domModified.bind(this))
        .observe(this.shadowRoot, {subtree: true, 
        characterData: true, childList: true});
    this.provideContent();
  },

  provideContent: function() {
    this.ensureTemplate();
    this.shadowRoot.textContent = '';
    this.shadowRoot.appendChild(this.instanceTemplate(this.template));
    this.cssText = this.shadowRoot.textContent;
  },

  ensureTemplate: function() {
    if (!this.template) {
      this.template = this.querySelector('template:not([repeat]):not([bind])');
      // move content into the template
      if (!this.template) {
        this.template = document.createElement('template');
        var n = this.firstChild;
        while (n) {
          this.template.content.appendChild(n.cloneNode(true));
          n = n.nextSibling;
        }
      }
    }
  },

  domModified: function() {
    this.cssText = this.shadowRoot.textContent;
    this.notify();
  },

  // notify instances that reference this element
  notify: function() {
    var s$ = this.refMap[this.id];
    if (s$) {
      for (var i=0, s; (s=s$[i]); i++) {
        s.require();
      }
    }
  },

  /****** consumer stuff *******/

  registerRef: function(ref) {
    //console.log('register', ref);
    this.refMap[this.ref] = this.refMap[this.ref] || [];
    this.refMap[this.ref].push(this);
  },

  applyRef: function(ref) {
    this.ref = ref;
    this.registerRef(this.ref);
    this.require();
  },

  require: function() {
    var cssText = this.cssTextForRef(this.ref);
    //console.log('require', this.ref, cssText);
    if (cssText) {
      this.ensureStyleElement();
      // do nothing if cssText has not changed
      if (this.styleElement._cssText === cssText) {
        return;
      }
      this.styleElement._cssText = cssText;
      if (window.ShadowDOMPolyfill) {
        this.styleElement.textContent = cssText;
        cssText = WebComponents.ShadowCSS.shimStyle(this.styleElement,
            this.getScopeSelector());
      }
      this.styleElement.textContent = cssText;
    }
  },

  cssTextForRef: function(ref) {
    var s$ = this.byId(ref);
    var cssText = '';
    if (s$) {
      if (Array.isArray(s$)) {
        var p = [];
        for (var i=0, l=s$.length, s; (i<l) && (s=s$[i]); i++) {
          p.push(s.cssText);
        }
        cssText = p.join('\n\n');
      } else {
        cssText = s$.cssText;
      }
    }
    if (s$ && !cssText) {
      console.warn('No styles provided for ref:', ref);
    }
    return cssText;
  },

  byId: function(id) {
    return this.list[id];
  },

  ensureStyleElement: function() {
    if (!this.styleElement) {
      this.styleElement = window.ShadowDOMPolyfill ? 
          this.makeShimStyle() :
          this.makeRootStyle();
    }
    if (!this.styleElement) {
      console.warn(this.localName, 'could not setup style.');
    }
  },

  makeRootStyle: function() {
    var style = document.createElement('style');
    this.appendChild(style);
    return style;
  },

  makeShimStyle: function() {
    var host = this.findHost(this);
    if (host) {
      var name = host.localName;
      var style = document.querySelector('style[' + name + '=' + this.ref +']');
      if (!style) {
        style = document.createElement('style');
        style.setAttribute(name, this.ref);
        document.head.appendChild(style);
      }
      return style;
    }
  },

  getScopeSelector: function() {
    if (!this._scopeSelector) {
      var selector = '', host = this.findHost(this);
      if (host) {
        var typeExtension = host.hasAttribute('is');
        var name = typeExtension ? host.getAttribute('is') : host.localName;
        selector = WebComponents.ShadowCSS.makeScopeSelector(name, 
            typeExtension);
      }
      this._scopeSelector = selector;
    }
    return this._scopeSelector;
  },

  findHost: function(node) {
    while (node.parentNode) {
      node = node.parentNode;
    }
    return node.host || wrap(document.documentElement);
  },

  /* filters! */
  // TODO(dfreedm): add more filters!

  cycle: function(rgb, amount) {
    if (rgb.match('#')) {
      var o = this.hexToRgb(rgb);
      if (!o) {
        return rgb;
      }
      rgb = 'rgb(' + o.r + ',' + o.b + ',' + o.g + ')';
    }

    function cycleChannel(v) {
      return Math.abs((Number(v) - amount) % 255);
    }

    return rgb.replace(/rgb\(([^,]*),([^,]*),([^,]*)\)/, function(m, a, b, c) {
      return 'rgb(' + cycleChannel(a) + ',' + cycleChannel(b) + ', ' 
          + cycleChannel(c) + ')';
    });
  },

  hexToRgb: function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }

});


})();
;

  Polymer('ikreations-title', {});
;

  Polymer("home-page");
  ;

  Polymer("aboutus-page");
  ;

  Polymer("services-page");
  ;

  Polymer("whyus-page");
  ;


    Polymer('core-xhr', {

      /**
       * Sends a HTTP request to the server and returns the XHR object.
       *
       * @method request
       * @param {Object} inOptions
       *    @param {String} inOptions.url The url to which the request is sent.
       *    @param {String} inOptions.method The HTTP method to use, default is GET.
       *    @param {boolean} inOptions.sync By default, all requests are sent asynchronously. To send synchronous requests, set to true.
       *    @param {Object} inOptions.params Data to be sent to the server.
       *    @param {Object} inOptions.body The content for the request body for POST method.
       *    @param {Object} inOptions.headers HTTP request headers.
       *    @param {String} inOptions.responseType The response type. Default is 'text'.
       *    @param {boolean} inOptions.withCredentials Whether or not to send credentials on the request. Default is false.
       *    @param {Object} inOptions.callback Called when request is completed.
       * @returns {Object} XHR object.
       */
      request: function(options) {
        var xhr = new XMLHttpRequest();
        var url = options.url;
        var method = options.method || 'GET';
        var async = !options.sync;
        //
        var params = this.toQueryString(options.params);
        if (params && method == 'GET') {
          url += (url.indexOf('?') > 0 ? '&' : '?') + params;
        }
        var xhrParams = this.isBodyMethod(method) ? (options.body || params) : null;
        //
        xhr.open(method, url, async);
        if (options.responseType) {
          xhr.responseType = options.responseType;
        }
        if (options.withCredentials) {
          xhr.withCredentials = true;
        }
        this.makeReadyStateHandler(xhr, options.callback);
        this.setRequestHeaders(xhr, options.headers);
        xhr.send(xhrParams);
        if (!async) {
          xhr.onreadystatechange(xhr);
        }
        return xhr;
      },
    
      toQueryString: function(params) {
        var r = [];
        for (var n in params) {
          var v = params[n];
          n = encodeURIComponent(n);
          r.push(v == null ? n : (n + '=' + encodeURIComponent(v)));
        }
        return r.join('&');
      },

      isBodyMethod: function(method) {
        return this.bodyMethods[(method || '').toUpperCase()];
      },
      
      bodyMethods: {
        POST: 1,
        PUT: 1,
        PATCH: 1,
        DELETE: 1
      },

      makeReadyStateHandler: function(xhr, callback) {
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            callback && callback.call(null, xhr.response, xhr);
          }
        };
      },

      setRequestHeaders: function(xhr, headers) {
        if (headers) {
          for (var name in headers) {
            xhr.setRequestHeader(name, headers[name]);
          }
        }
      }

    });

  ;


  Polymer('core-ajax', {
    /**
     * Fired when a response is received.
     *
     * @event core-response
     */

    /**
     * Fired when an error is received.
     *
     * @event core-error
     */

    /**
     * Fired whenever a response or an error is received.
     *
     * @event core-complete
     */

    /**
     * The URL target of the request.
     *
     * @attribute url
     * @type string
     * @default ''
     */
    url: '',

    /**
     * Specifies what data to store in the `response` property, and
     * to deliver as `event.response` in `response` events.
     *
     * One of:
     *
     *    `text`: uses `XHR.responseText`.
     *
     *    `xml`: uses `XHR.responseXML`.
     *
     *    `json`: uses `XHR.responseText` parsed as JSON.
     *
     *    `arraybuffer`: uses `XHR.response`.
     *
     *    `blob`: uses `XHR.response`.
     *
     *    `document`: uses `XHR.response`.
     *
     * @attribute handleAs
     * @type string
     * @default 'text'
     */
    handleAs: '',

    /**
     * If true, automatically performs an Ajax request when either `url` or `params` changes.
     *
     * @attribute auto
     * @type boolean
     * @default false
     */
    auto: false,

    /**
     * Parameters to send to the specified URL, as JSON.
     *
     * @attribute params
     * @type string (JSON)
     * @default ''
     */
    params: '',

    /**
     * The response for the current request, or null if it hasn't
     * completed yet or the request resulted in error.
     *
     * @attribute response
     * @type Object
     * @default null
     */
    response: null,

    /**
     * The error for the current request, or null if it hasn't
     * completed yet or the request resulted in success.
     *
     * @attribute error
     * @type Object
     * @default null
     */
    error: null,

    /**
     * Whether the current request is currently loading.
     *
     * @attribute loading
     * @type boolean
     * @default false
     */
    loading: false,

    /**
     * The progress of the current request.
     *
     * @attribute progress
     * @type {loaded: number, total: number, lengthComputable: boolean}
     * @default {}
     */
    progress: null,

    /**
     * The HTTP method to use such as 'GET', 'POST', 'PUT', or 'DELETE'.
     * Default is 'GET'.
     *
     * @attribute method
     * @type string
     * @default ''
     */
    method: '',

    /**
     * HTTP request headers to send.
     *
     * Example:
     *
     *     <core-ajax
     *         auto
     *         url="http://somesite.com"
     *         headers='{"X-Requested-With": "XMLHttpRequest"}'
     *         handleAs="json"
     *         on-core-response="{{handleResponse}}"></core-ajax>
     *
     * @attribute headers
     * @type Object
     * @default null
     */
    headers: null,

    /**
     * Optional raw body content to send when method === "POST".
     *
     * Example:
     *
     *     <core-ajax method="POST" auto url="http://somesite.com"
     *         body='{"foo":1, "bar":2}'>
     *     </core-ajax>
     *
     * @attribute body
     * @type Object
     * @default null
     */
    body: null,

    /**
     * Content type to use when sending data.
     *
     * @attribute contentType
     * @type string
     * @default 'application/x-www-form-urlencoded'
     */
    contentType: 'application/x-www-form-urlencoded',

    /**
     * Set the withCredentials flag on the request.
     *
     * @attribute withCredentials
     * @type boolean
     * @default false
     */
    withCredentials: false,

    /**
     * Additional properties to send to core-xhr.
     *
     * Can be set to an object containing default properties
     * to send as arguments to the `core-xhr.request()` method
     * which implements the low-level communication.
     *
     * @property xhrArgs
     * @type Object
     * @default null
     */
    xhrArgs: null,

    created: function() {
      this.progress = {};
    },

    ready: function() {
      this.xhr = document.createElement('core-xhr');
    },

    receive: function(response, xhr) {
      if (this.isSuccess(xhr)) {
        this.processResponse(xhr);
      } else {
        this.processError(xhr);
      }
      this.complete(xhr);
    },

    isSuccess: function(xhr) {
      var status = xhr.status || 0;
      return !status || (status >= 200 && status < 300);
    },

    processResponse: function(xhr) {
      var response = this.evalResponse(xhr);
      if (xhr === this.activeRequest) {
        this.response = response;
      }
      this.fire('core-response', {response: response, xhr: xhr});
    },

    processError: function(xhr) {
      var response = xhr.status + ': ' + xhr.responseText;
      if (xhr === this.activeRequest) {
        this.error = response;
      }
      this.fire('core-error', {response: response, xhr: xhr});
    },

    processProgress: function(progress, xhr) {
      if (xhr !== this.activeRequest) {
        return;
      }
      // We create a proxy object here because these fields
      // on the progress event are readonly properties, which
      // causes problems in common use cases (e.g. binding to
      // <paper-progress> attributes).
      var progressProxy = {
        lengthComputable: progress.lengthComputable,
        loaded: progress.loaded,
        total: progress.total
      }
      this.progress = progressProxy;
    },

    complete: function(xhr) {
      if (xhr === this.activeRequest) {
        this.loading = false;
      }
      this.fire('core-complete', {response: xhr.status, xhr: xhr});
    },

    evalResponse: function(xhr) {
      return this[(this.handleAs || 'text') + 'Handler'](xhr);
    },

    xmlHandler: function(xhr) {
      return xhr.responseXML;
    },

    textHandler: function(xhr) {
      return xhr.responseText;
    },

    jsonHandler: function(xhr) {
      var r = xhr.responseText;
      try {
        return JSON.parse(r);
      } catch (x) {
        console.warn('core-ajax caught an exception trying to parse response as JSON:');
        console.warn('url:', this.url);
        console.warn(x);
        return r;
      }
    },

    documentHandler: function(xhr) {
      return xhr.response;
    },

    blobHandler: function(xhr) {
      return xhr.response;
    },

    arraybufferHandler: function(xhr) {
      return xhr.response;
    },

    urlChanged: function() {
      if (!this.handleAs) {
        var ext = String(this.url).split('.').pop();
        switch (ext) {
          case 'json':
            this.handleAs = 'json';
            break;
        }
      }
      this.autoGo();
    },

    paramsChanged: function() {
      this.autoGo();
    },

    bodyChanged: function() {
      this.autoGo();
    },

    autoChanged: function() {
      this.autoGo();
    },

    // TODO(sorvell): multiple side-effects could call autoGo
    // during one micro-task, use a job to have only one action
    // occur
    autoGo: function() {
      if (this.auto) {
        this.goJob = this.job(this.goJob, this.go, 0);
      }
    },

    /**
     * Performs an Ajax request to the specified URL.
     *
     * @method go
     */
    go: function() {
      var args = this.xhrArgs || {};
      // TODO(sjmiles): we may want XHR to default to POST if body is set
      args.body = this.body || args.body;
      args.params = this.params || args.params;
      if (args.params && typeof(args.params) == 'string') {
        args.params = JSON.parse(args.params);
      }
      args.headers = this.headers || args.headers || {};
      if (args.headers && typeof(args.headers) == 'string') {
        args.headers = JSON.parse(args.headers);
      }
      var hasContentType = Object.keys(args.headers).some(function (header) {
        return header.toLowerCase() === 'content-type';
      });
      if (!hasContentType && this.contentType) {
        args.headers['Content-Type'] = this.contentType;
      }
      if (this.handleAs === 'arraybuffer' || this.handleAs === 'blob' ||
          this.handleAs === 'document') {
        args.responseType = this.handleAs;
      }
      args.withCredentials = this.withCredentials;
      args.callback = this.receive.bind(this);
      args.url = this.url;
      args.method = this.method;

      this.response = this.error = this.progress = null;
      this.activeRequest = args.url && this.xhr.request(args);
      if (this.activeRequest) {
        this.loading = true;
        var activeRequest = this.activeRequest;
        // IE < 10 doesn't support progress events.
        if ('onprogress' in activeRequest) {
          this.activeRequest.addEventListener(
              'progress',
              function(progress) {
                this.processProgress(progress, activeRequest);
              }.bind(this), false);
        } else {
          this.progress = {
            lengthComputable: false,
          }
        }
      }
      return this.activeRequest;
    }

  });

;

  Polymer('portfolio-service', {
    created: function() {
      this.portfolios = [];
    },
    portfoliosLoaded: function() {
      // Make a copy of the loaded data
      this.portfolios = this.$.ajax.response.slice(0);
    }
  });
  ;

  Polymer('portfolio-card',{});
  ;

  Polymer("portfolio-list");
  ;

  Polymer("contactus-page");
  