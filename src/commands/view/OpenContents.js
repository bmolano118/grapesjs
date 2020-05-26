export default {
  run(editor, sender) {
    const bm = editor.ContentManager;
    const pn = editor.Panels;

    if (!this.contents) {
      bm.render();
      const id = 'views-container';
      const contents = document.createElement('div');
      const panels = pn.getPanel(id) || pn.addPanel({ id });
      contents.appendChild(bm.getContainer());
      panels.set('appendContent', contents).trigger('change:appendContent');
      this.contents = contents;
    }

    this.contents.style.display = 'block';
  },

  stop() {
    const contents = this.contents;
    contents && (contents.style.display = 'none');
  }
};
