import Backbone from 'backbone';
import { isString, isObject, bindAll } from 'underscore';
import RowblkView from './RowblkView';
import CategoryView from './CategoryView';

export default Backbone.View.extend({
  initialize(opts, config) {
    bindAll(this, 'getSorter', 'onDrag', 'onDrop');
    this.config = config || {};
    this.categories = opts.categories || '';
    this.renderedCategories = [];
    var ppfx = this.config.pStylePrefix || '';
    this.ppfx = ppfx;
    this.noCatClass = `${ppfx}rowblks-no-cat`;
    this.rowblkContClass = `${ppfx}rowblks-c`;
    this.catsClass = `${ppfx}rowblk-categories`;
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
    this.em = this.config.em;
    this.tac = 'test-tac';
    this.grabbingCls = this.ppfx + 'grabbing';

    if (this.em) {
      this.config.getSorter = this.getSorter;
      this.canvas = this.em.get('Canvas');
    }
  },

  updateConfig(opts = {}) {
    this.config = {
      ...this.config,
      ...opts
    };
  },

  /**
   * Get sorter
   * @private
   */
  getSorter() {
    if (!this.em) return;
    if (!this.sorter) {
      var utils = this.em.get('Utils');
      var canvas = this.canvas;
      this.sorter = new utils.Sorter({
        container: canvas.getBody(),
        placer: canvas.getPlacerEl(),
        containerSel: '*',
        itemSel: '*',
        pfx: this.ppfx,
        onStart: this.onDrag,
        onEndMove: this.onDrop,
        onMove: this.onMove,
        document: canvas.getFrameEl().contentDocument,
        direction: 'a',
        wmargin: 1,
        nested: 1,
        em: this.em,
        canvasRelative: 1
      });
    }
    return this.sorter;
  },

  /**
   * Callback when rowblk is on drag
   * @private
   */
  onDrag(e) {
    this.em.stopDefault();
    this.em.trigger('rowblk:drag:start', e);
  },

  onMove(e) {
    this.em.trigger('rowblk:drag:move', e);
  },

  /**
   * Callback when rowblk is dropped
   * @private
   */
  onDrop(model) {
    const em = this.em;
    em.runDefault();

    if (model && model.get) {
      if (model.get('activeOnRender')) {
        model.trigger('active');
        model.set('activeOnRender', 0);
      }

      em.trigger('rowblk:drag:stop', model);
    }
  },

  /**
   * Add new model to the collection
   * @param {Model} model
   * @private
   * */
  addTo(model) {
    this.add(model);
  },

  /**
   * Render new model inside the view
   * @param {Model} model
   * @param {Object} fragment Fragment collection
   * @private
   * */
  add(model, fragment) {
    const { config } = this;
    var frag = fragment || null;
    var view = new RowblkView(
      {
        model,
        attributes: model.get('attributes')
      },
      config
    );
    var rendered = view.render().el;
    var category = model.get('category');

    // Check for categories
    if (category && this.categories && !config.ignoreCategories) {
      if (isString(category)) {
        category = {
          id: category,
          label: category
        };
      } else if (isObject(category) && !category.id) {
        category.id = category.label;
      }

      var catModel = this.categories.add(category);
      var catId = catModel.get('id');
      var catView = this.renderedCategories[catId];
      var categories = this.getCategoriesEl();
      model.set('category', catModel);

      if (!catView && categories) {
        catView = new CategoryView(
          {
            model: catModel
          },
          this.config
        ).render();
        this.renderedCategories[catId] = catView;
        categories.appendChild(catView.el);
      }

      catView && catView.append(rendered);
      return;
    }

    if (frag) frag.appendChild(rendered);
    else this.append(rendered);
  },

  getCategoriesEl() {
    if (!this.catsEl) {
      this.catsEl = this.el.querySelector(`.${this.catsClass}`);
    }

    return this.catsEl;
  },

  getRowblksEl() {
    if (!this.rowblksEl) {
      this.rowblksEl = this.el.querySelector(
        `.${this.noCatClass} .${this.rowblkContClass}`
      );
    }

    return this.rowblksEl;
  },

  append(el) {
    let rowblks = this.getRowblksEl();
    rowblks && rowblks.appendChild(el);
  },

  render() {
    const ppfx = this.ppfx;
    const frag = document.createDocumentFragment();
    this.catsEl = null;
    this.rowblksEl = null;
    this.renderedCategories = [];
    this.el.innerHTML = `
      <div class="${this.catsClass}"></div>
      <div class="${this.noCatClass}">
        <div class="${this.rowblkContClass}"></div>
      </div>
    `;

    this.collection.each(model => this.add(model, frag));
    this.append(frag);
    const cls = `${this.rowblkContClass}s ${ppfx}one-bg ${ppfx}two-color`;
    this.$el.addClass(cls);
    return this;
  }
});
