function readSeajsCacheToBody() {
  $('#canvas').html('');
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs[0];
    chrome.tabs.sendMessage(tab.id,{
      greeting: "seajs"
    }, function(response) {
      if(response.status === 1) {
        var data = JSON.parse(response.data);
        console.log(data);
        render(data);
      }
      else {
        //
      }
    });
  });
}

var width = 720;
var height = 540;
/* only do all this when document has finished loading (needed for RaphaelJS) */
function render(data) {
  var g = new Graph();
  var cache = data.cache;
  Object.keys(cache).forEach(function(k) {
    g.addNode(k, { label: k });
  });
  Object.keys(cache).forEach(function(k) {
    var node = cache[k];
    node.deps.forEach(function(dep) {
      g.addEdge(k, dep, { directed: true });
    });
  });
  /* layout the graph using the Spring layout implementation */
  var layouter = new Graph.Layout.Spring(g);
  layouter.layout();
  /* draw the graph using the RaphaelJS draw implementation */
  var renderer = new Graph.Renderer.Raphael('canvas', g, width, height);
  renderer.draw();
};

readSeajsCacheToBody();
$('button').click(readSeajsCacheToBody);