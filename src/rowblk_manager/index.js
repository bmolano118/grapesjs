/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/rowblk_manager/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  rowblkManager: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const rowblkManager = editor.RowblkManager;
 * ```
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [getAllVisible](#getallvisible)
 * * [remove](#remove)
 * * [getConfig](#getconfig)
 * * [getCategories](#getcategories)
 * * [getContainer](#getcontainer)
 * * [render](#render)
 *
 * @module RowblkManager
 */
import { isElement } from 'underscore';
import defaults from './config/config';
import Rowblks from './model/Rowblks';
import RowblkCategories from './model/Categories';
import RowblksView from './view/RowblksView';

export default () => {
  var c = {};
  var rowblks, rowblksVisible, rowblksView;
  var categories = [];

  return {
    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'RowblkManager',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     * @return {this}
     * @private
     */
    init(config) {
      c = config || {};
      const em = c.em;

      for (let name in defaults) {
        if (!(name in c)) {
          c[name] = defaults[name];
        }
      }

      // Global rowblks collection
      rowblks = new Rowblks([]);
      rowblksVisible = new Rowblks([]);
      categories = new RowblkCategories();
      rowblksView = new RowblksView(
        {
          collection: rowblksVisible,
          categories
        },
        c
      );

      // Setup the sync between the global and public collections
      rowblks.listenTo(rowblks, 'add', model => {
        rowblksVisible.add(model);
        em && em.trigger('rowblk:add', model);
      });

      rowblks.listenTo(rowblks, 'remove', model => {
        rowblksVisible.remove(model);
        em && em.trigger('rowblk:remove', model);
      });

      rowblks.listenTo(rowblks, 'reset', coll => {
        rowblksVisible.reset(coll.models);
      });

      return this;
    },

    /**
     * Get configuration object
     * @return {Object}
     */
    getConfig() {
      return c;
    },

    /**
     * Load default rowblks if the collection is empty
     */
    onLoad() {
      const rowblks = this.getAll();
      !rowblks.length && rowblks.reset(c.rowblks);
    },

    postRender() {
      const elTo = this.getConfig().appendTo;

      if (elTo) {
        const el = isElement(elTo) ? elTo : document.querySelector(elTo);
        el.appendChild(this.render());
      }
    },

    /**
     * Add new rowblk to the collection.
     * @param {string} id Rowblk id
     * @param {Object} opts Options
     * @param {string} opts.label Name of the rowblk
     * @param {string} opts.content HTML content
     * @param {string|Object} opts.category Group the rowblk inside a catgegory.
     *                                      You should pass objects with id property, eg:
     *                                      {id: 'some-uid', label: 'My category'}
     *                                      The string will be converted in:
     *                                      'someid' => {id: 'someid', label: 'someid'}
     * @param {Object} [opts.attributes={}] Rowblk attributes
     * @return {Rowblk} Added rowblk
     * @example
     * rowblkManager.add('h1-rowblk', {
     *   label: 'Heading',
     *   content: '<h1>Put your title here</h1>',
     *   category: 'Basic',
     *   attributes: {
     *     title: 'Insert h1 rowblk'
     *   }
     * });
     */
    add(id, opts) {
      var obj = opts || {};
      obj.id = id;
      return rowblks.add(obj);
    },

    /**
     * Return the rowblk by id
     * @param  {string} id Rowblk id
     * @example
     * const rowblk = rowblkManager.get('h1-rowblk');
     * console.log(JSON.stringify(rowblk));
     * // {label: 'Heading', content: '<h1>Put your ...', ...}
     */
    get(id) {
      return rowblks.get(id);
    },

    /**
     * Return all rowblks
     * @return {Collection}
     * @example
     * const rowblks = rowblkManager.getAll();
     * console.log(JSON.stringify(rowblks));
     * // [{label: 'Heading', content: '<h1>Put your ...'}, ...]
     */
    getAll() {
      return rowblks;
    },

    /**
     * Return the visible collection, which containes rowblks actually rendered
     * @return {Collection}
     */
    getAllVisible() {
      return rowblksVisible;
    },

    /**
     * Remove a rowblk by id
     * @param {string} id Rowblk id
     * @return {Rowblk} Removed rowblk
     */
    remove(id) {
      return rowblks.remove(id);
    },

    /**
     * Get all available categories.
     * It's possible to add categories only within rowblks via 'add()' method
     * @return {Array|Collection}
     */
    getCategories() {
      return categories;
    },

    /**
     * Return the Rowblks container element
     * @return {HTMLElement}
     */
    getContainer() {
      return rowblksView.el;
    },

    /**
     * Render rowblks
     * @param  {Array} rowblks Rowblks to render, without the argument will render all global rowblks
     * @param  {Object} [opts={}] Options
     * @param  {Boolean} [opts.external] Render rowblks in a new container (HTMLElement will be returned)
     * @param  {Boolean} [opts.ignoreCategories] Render rowblks without categories
     * @return {HTMLElement} Rendered element
     * @example
     * // Render all rowblks (inside the global collection)
     * rowblkManager.render();
     *
     * // Render new set of rowblks
     * const rowblks = rowblkManager.getAll();
     * const filtered = rowblks.filter(rowblk => rowblk.get('category') == 'sections')
     *
     * rowblkManager.render(filtered);
     * // Or a new set from an array
     * rowblkManager.render([
     *  {label: 'Label text', content: '<div>Content</div>'}
     * ]);
     *
     * // Back to rowblks from the global collection
     * rowblkManager.render();
     *
     * // You can also render your rowblks outside of the main rowblk container
     * const newRowblksEl = rowblkManager.render(filtered, { external: true });
     * document.getElementById('some-id').appendChild(newRowblksEl);
     */
    render(rowblks, opts = {}) {
      const toRender = rowblks || this.getAll().models;

      if (opts.external) {
        return new RowblksView(
          {
            collection: new Rowblks(toRender),
            categories
          },
          {
            ...c,
            ...opts
          }
        ).render().el;
      }

      if (!rowblksView.rendered) {
        rowblksView.render();
        rowblksView.rendered = 1;
      }

      rowblksView.updateConfig(opts);
      rowblksView.collection.reset(toRender);
      return this.getContainer();
    }
  };
};
