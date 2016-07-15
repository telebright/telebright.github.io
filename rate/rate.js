function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var hotspot = getParameterByName("name");

var sel = document.getElementById('hotspot');
var el = document.createElement('h3');
el.innerHTML = hotspot;
sel.appendChild(el);

var submit = function() {
  window.location = "index.html";
};
