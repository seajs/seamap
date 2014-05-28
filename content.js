document.body.setAttribute('data-seajs', '');

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.greeting === "seajs"){
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = 'if(typeof seajs === "object" && typeof seajs.cache === "object"){var cache = {};Object.keys(seajs.cache).forEach(function(k){cache[k]={deps:[]};seajs.cache[k].dependencies.forEach(function(dep){cache[k].deps.push(seajs.resolve(dep, k));});});document.body.setAttribute("data-seajs", JSON.stringify({cache:cache,base:seajs.data.base,cwd:seajs.data.cwd}));}';
    document.head.appendChild(script);
    document.head.removeChild(script);
    var data = document.body.getAttribute('data-seajs');
//    console.log(JSON.parse(data));
    if(data) {
      sendResponse({
        status: 1,
        data: data
      });
    }
    else {
      sendResponse({
        status: 0
      });
    }
  }
});