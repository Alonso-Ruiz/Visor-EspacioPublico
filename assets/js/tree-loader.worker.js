// Parse the inventory off the UI thread; transfer bounded batches on demand.
var trees;
var offset = 0;
self.onmessage = function () {
    try {
        if (!trees) {
            importScripts('../../data/rboles_parque_0.js');
            trees = json_rboles_parque_0.features || [];
        }
        var batch = trees.slice(offset, offset + 100);
        offset += batch.length;
        self.postMessage({ features: batch, done: offset >= trees.length });
    } catch (error) {
        self.postMessage({ error: String(error.message || error) });
    }
};
