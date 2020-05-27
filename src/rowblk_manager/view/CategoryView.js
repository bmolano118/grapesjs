import { template } from 'underscore';
import Backbone from 'backbone';

export default Backbone.View.extend({
  template: template(`
  <div class="<%= pfx %>title">
    <i class="<%= pfx %>caret-icon"></i>
    <%= label %>
  </div>
  <div class="<%= pfx %>rowblks-c"></div>
  `),

  events: {},

  initialize(o = {}, config = {}) {
    this.config = config;
    const pfx = config.pStylePrefix || '';
    this.em = config.em;
    this.pfx = pfx;
    this.caretR = 'fa fa-caret-right';
    this.caretD = 'fa fa-caret-down';
    this.iconClass = `${pfx}caret-icon`;
    this.activeClass = `${pfx}open`;
    this.className = `${pfx}rowblk-category`;
    this.events[`click .${pfx}title`] = 'toggle';
    this.listenTo(this.model, 'change:open', this.updateVisibility);
    this.delegateEvents();
  },

  updateVisibility() {
    if (this.model.get('open')) this.open();
    else this.close();
  },

  open() {
    this.el.className = `${this.className} ${this.activeClass}`;
    this.getIconEl().className = `${this.iconClass} ${this.caretD}`;
    this.getRowblksEl().style.display = '';
  },

  close() {
    this.el.className = this.className;
    this.getIconEl().className = `${this.iconClass} ${this.caretR}`;
    this.getRowblksEl().style.display = 'none';
  },

  toggle() {
    var model = this.model;
    model.set('open', !model.get('open'));
  },

  getIconEl() {
    if (!this.iconEl) {
      this.iconEl = this.el.querySelector('.' + this.iconClass);
    }

    return this.iconEl;
  },

  getRowblksEl() {
    if (!this.rowblksEl) {
      this.rowblksEl = this.el.querySelector('.' + this.pfx + 'rowblks-c');
    }

    return this.rowblksEl;
  },

  append(el) {
    this.getRowblksEl().appendChild(el);
  },

  render() {
    const { em, el, $el, model } = this;
    const label =
      em.t(`rowblkManager.categories.${model.id}`) || model.get('label');
    el.innerHTML = this.template({
      pfx: this.pfx,
      label
    });
    el.className = this.className;
    $el.css({ order: model.get('order') });
    this.updateVisibility();

    return this;
  }
});
