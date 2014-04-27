var api = require('../'),
    assert = require('assert'),
    utils = api.utils,
    ArcDataset = api.ArcDataset;

var arcs1 = {
  xx: new Float64Array([1, 2, 3, 4]),
  yy: new Float64Array([0, 1, 0, 1]),
  nn: new Uint32Array([2, 2])
};

var arcs2 = {
  xx: new Float64Array([5, 6, 7, 8]),
  yy: new Float64Array([2, 3, 2, 3]),
  nn: new Uint32Array([0, 4])
};

var arcs3 = {
  xx: new Float64Array([9, 10]),
  yy: new Float64Array([4, 5]),
  nn: new Uint32Array([2])
};

var data1 = {
  arcs: new ArcDataset(arcs1.nn, arcs1.xx, arcs1.yy),
  layers: [{
    geometry_type: 'point',
    shapes: [[[0, 1]]]
  }, {
    geometry_type: 'polyline',
    shapes: [[[0, 1]]],
    data: new api.data.DataTable([{id: 1}])
  }]
};

var data2 = {
  arcs: new ArcDataset(arcs2.nn, arcs2.xx, arcs2.yy),
  layers: [{
    geometry_type: 'point',
    shapes: [null, [[2, 3], [4, 5]]]
  }, {
    geometry_type: 'polyline',
    shapes: [[[~1]], [[0]]],
    data: new api.data.DataTable([{id: 2}, {id: 3}])
  }]
};

describe('mapshaper-merging.js', function () {
  describe('mergeArcs()', function () {
    it('merge three sets of arcs', function () {
      var mergedArcs = api.mergeArcs([
          new ArcDataset(arcs1.nn, arcs1.xx, arcs1.yy),
          new ArcDataset(arcs2.nn, arcs2.xx, arcs2.yy),
          new ArcDataset(arcs3.nn, arcs3.xx, arcs3.yy)
      ]);
      var data = mergedArcs.getVertexData();
      var result = {
        xx: utils.toArray(data.xx),
        yy: utils.toArray(data.yy),
        nn: utils.toArray(data.nn)
      };
      var target = {
        xx: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        yy: [0, 1, 0, 1, 2, 3, 2, 3, 4, 5],
        nn: [2, 2, 0, 4, 2]
      }
      assert.deepEqual(result, target);
    })
  })

  describe('mergeDatasets() + mergeLayers()', function () {
    it('merge two datasets', function () {
      var merged = api.mergeDatasets([data1, data2]);
      merged.layers = api.mergeLayers(merged.layers);
      assert.deepEqual(merged.layers[0].shapes, [[[0, 1]], null, [[2, 3], [4, 5]]]);
      assert.deepEqual(merged.layers[1].shapes, [[[0, 1]], [[~3]], [[2]]]);
      assert.deepEqual(merged.layers[1].data.getRecords(), [{id: 1}, {id: 2}, {id: 3}]);
    })
  })
})