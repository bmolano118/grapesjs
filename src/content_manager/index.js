/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/content_manager/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  contentManager: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const contentManager = editor.ContentManager;
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
 * @module ContentManager
 */
import { isElement } from 'underscore';
import defaults from './config/config';
import Contents from './model/Contents';
import ContentCategories from './model/Categories';
import ContentsView from './view/ContentsView';

export default () => {
  var c = {};
  var contents, contentsVisible, contentsView;
  var categories = [];

  return {
    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'ContentManager',

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

      // Global contents collection
      contents = new Contents([]);
      contentsVisible = new Contents([]);
      categories = new ContentCategories();
      contentsView = new ContentsView(
        {
          collection: contentsVisible,
          categories
        },
        c
      );

      // Setup the sync between the global and public collections
      contents.listenTo(contents, 'add', model => {
        contentsVisible.add(model);
        em && em.trigger('content:add', model);
      });

      contents.listenTo(contents, 'remove', model => {
        contentsVisible.remove(model);
        em && em.trigger('content:remove', model);
      });

      contents.listenTo(contents, 'reset', coll => {
        contentsVisible.reset(coll.models);
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
     * Load default contents if the collection is empty
     */
    onLoad() {
      const contents = this.getAll();
      !contents.length && contents.reset(c.contents);
    },

    postRender() {
      const elTo = this.getConfig().appendTo;

      if (elTo) {
        const el = isElement(elTo) ? elTo : document.querySelector(elTo);
        el.appendChild(this.render());
      }
    },

    /**
     * Add new content to the collection.
     * @param {string} id Content id
     * @param {Object} opts Options
     * @param {string} opts.label Name of the content
     * @param {string} opts.content HTML content
     * @param {string|Object} opts.category Group the content inside a catgegory.
     *                                      You should pass objects with id property, eg:
     *                                      {id: 'some-uid', label: 'My category'}
     *                                      The string will be converted in:
     *                                      'someid' => {id: 'someid', label: 'someid'}
     * @param {Object} [opts.attributes={}] Content attributes
     * @return {Content} Added content
     * @example
     * contentManager.add('h1-content', {
     *   label: 'Heading',
     *   content: '<h1>Put your title here</h1>',
     *   category: 'Basic',
     *   attributes: {
     *     title: 'Insert h1 content'
     *   }
     * });
     */
    add(id, opts) {
      var obj = opts || {};
      obj.id = id;
      return contents.add(obj);
    },

    /**
     * Return the content by id
     * @param  {string} id Content id
     * @example
     * const content = contentManager.get('h1-content');
     * console.log(JSON.stringify(content));
     * // {label: 'Heading', content: '<h1>Put your ...', ...}
     */
    get(id) {
      return contents.get(id);
    },

    /**
     * Return all contents
     * @return {Collection}
     * @example
     * const contents = contentManager.getAll();
     * console.log(JSON.stringify(contents));
     * // [{label: 'Heading', content: '<h1>Put your ...'}, ...]
     */
    getAll() {
      return contents;
    },

    /**
     * Return the visible collection, which containes contents actually rendered
     * @return {Collection}
     */
    getAllVisible() {
      return contentsVisible;
    },

    /**
     * Remove a content by id
     * @param {string} id Content id
     * @return {Content} Removed content
     */
    remove(id) {
      return contents.remove(id);
    },

    /**
     * Get all available categories.
     * It's possible to add categories only within contents via 'add()' method
     * @return {Array|Collection}
     */
    getCategories() {
      return categories;
    },

    /**
     * Return the Contents container element
     * @return {HTMLElement}
     */
    getContainer() {
      return contentsView.el;
    },

    /**
     * Render contents
     * @param  {Array} contents Contents to render, without the argument will render all global contents
     * @param  {Object} [opts={}] Options
     * @param  {Boolean} [opts.external] Render contents in a new container (HTMLElement will be returned)
     * @param  {Boolean} [opts.ignoreCategories] Render contents without categories
     * @return {HTMLElement} Rendered element
     * @example
     * // Render all contents (inside the global collection)
     * contentManager.render();
     *
     * // Render new set of contents
     * const contents = contentManager.getAll();
     * const filtered = contents.filter(content => content.get('category') == 'sections')
     *
     * contentManager.render(filtered);
     * // Or a new set from an array
     * contentManager.render([
     *  {label: 'Label text', content: '<div>Content</div>'}
     * ]);
     *
     * // Back to contents from the global collection
     * contentManager.render();
     *
     * // You can also render your contents outside of the main content container
     * const newContentsEl = contentManager.render(filtered, { external: true });
     * document.getElementById('some-id').appendChild(newContentsEl);
     */
    render(contents, opts = {}) {
      const toRender = contents || this.getAll().models;

      if (opts.external) {
        return new ContentsView(
          {
            collection: new Contents(toRender),
            categories
          },
          {
            ...c,
            ...opts
          }
        ).render().el;
      }

      if (!contentsView.rendered) {
        contentsView.render();
        contentsView.rendered = 1;
      }

      contentsView.updateConfig(opts);
      contentsView.collection.reset(toRender);
      return this.getContainer();
    }
  };
};
