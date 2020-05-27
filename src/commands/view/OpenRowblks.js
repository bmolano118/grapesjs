export default {
  run(editor, sender) {
    const rm = editor.RowblkManager;
    const pn = editor.Panels;

    if (!this.rowblks) {
      rm.render();
      const id = 'views-container';
      const rowblks = document.createElement('div');
      const panels = pn.getPanel(id) || pn.addPanel({ id });
      rowblks.appendChild(rm.getContainer());
      panels.set('appendContent', rowblks).trigger('change:appendContent');
      this.rowblks = rowblks;
    }

    this.rowblks.style.display = 'block';
  },

  stop() {
    const rowblks = this.rowblks;
    rowblks && (rowblks.style.display = 'none');
  }
};
