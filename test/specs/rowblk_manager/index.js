import RowblkManager from 'rowblk_manager';
import RowblksView from './view/RowblksView';

describe('RowblkManager', () => {
  describe('Main', () => {
    var obj;
    var idTest;
    var optsTest;

    beforeEach(() => {
      idTest = 'h1-rowblk';
      optsTest = {
        label: 'Heading',
        content: '<h1>Test</h1>'
      };
      obj = new RowblkManager().init();
      obj.render();
    });

    afterEach(() => {
      obj = null;
    });

    test('Object exists', () => {
      expect(obj).toBeTruthy();
    });

    test('No rowblks inside', () => {
      expect(obj.getAll().length).toEqual(0);
    });

    test('No categories inside', () => {
      expect(obj.getCategories().length).toEqual(0);
    });

    test('Add new rowblk', () => {
      var model = obj.add(idTest, optsTest);
      expect(obj.getAll().length).toEqual(1);
    });

    test('Added rowblk has correct data', () => {
      var model = obj.add(idTest, optsTest);
      expect(model.get('label')).toEqual(optsTest.label);
      expect(model.get('content')).toEqual(optsTest.content);
    });

    test('Add rowblk with attributes', () => {
      optsTest.attributes = { class: 'test' };
      var model = obj.add(idTest, optsTest);
      expect(model.get('attributes').class).toEqual('test');
    });

    test('The id of the rowblk is unique', () => {
      var model = obj.add(idTest, optsTest);
      var model2 = obj.add(idTest, { other: 'test' });
      expect(model).toEqual(model2);
    });

    test('Get rowblk by id', () => {
      var model = obj.add(idTest, optsTest);
      var model2 = obj.get(idTest);
      expect(model).toEqual(model2);
    });

    test('Render rowblks', () => {
      obj.render();
      expect(obj.getContainer()).toBeTruthy();
    });
  });
});
