function readSeajsCacheToBody() {
  $('#canvas').html('');
  $('#base').html('');
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs[0];
    chrome.tabs.sendMessage(tab.id,{
      greeting: "seajs"
    }, function(response) {
      if(response.status === 1) {
        var data = JSON.parse(response.data);
        console.log(data);
        render(data);
        $('#base').html('base: ' + data.base);
      }
      else {
        $('#canvas').html('<p>没有模块内容</p>');
      }
    });
  });
}

var width = 720;
var height = 80;
var ABSOLUTE_RE = /^\/\/.|:\//
/* only do all this when document has finished loading (needed for RaphaelJS) */
function render(data) {
  var g = new Graph();
  var cache = data.cache;
  var count = 0;
  Object.keys(cache).forEach(function(k) {
    var s = k;
    var dir = dirname(k);
    if(ABSOLUTE_RE.test(s)) {
      if(s.indexOf(data.base) == 0) {
        s = './' + s.slice(data.base.length).replace(/^\//, '');
        s = relative(dir, dirname(s));
      }
    }
    else {
      var base = basename(k);
      var s = relative(dir, data.base);
      if(s) {
        s += '/' + base;
      }
      else {
        s = base;
      }
    }
    g.addNode(k, { label: s });
    count++;
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
  var renderer = new Graph.Renderer.Raphael('canvas', g, width, Math.round(height * Math.max(4, (count / 4))));
  renderer.draw();
};

readSeajsCacheToBody();
$('button').click(readSeajsCacheToBody);


// https://github.com/joyent/node/blob/master/lib/path.js#L310
var splitPathRe =
  /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// https://github.com/joyent/node/blob/master/lib/path.js#L400
function relative(from, to) {
//  from = exports.resolve(from).substr(1);
//  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

// https://github.com/joyent/node/blob/master/lib/path.js#L445
function dirname(path) {
  var result = splitPath(path),
    root = result[0],
    dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};

// https://github.com/joyent/node/blob/master/lib/path.js#L464
function basename(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};