var query = window.location.search.substring(1).replace(/%20/g, " ");
var parameters = query.split("&");
var suburb = parameters[0].split("=")[1];
var type = parameters[1].split("=")[1];
var sel = document.getElementById('hotspots');
if (suburb in allhotspots) {
  var hotspots = allhotspots[suburb];
  for(var i = 0; i < hotspots.length; i++) {
    if (type == "Any" || type == hotspots[i]['type']) {
      var opt = document.createElement('li');
      opt.innerHTML =
      '<a href="../rate/rate.html?name=' + hotspots[i]['name'] + '"<em>'+ hotspots[i]['name'] + '</em></a>,<br>' + hotspots[i]['address'];
      sel.appendChild(opt);
    }
  }
} else {
  var opt = document.createElement('li');
  opt.innerHTML = "No hotspots available near you."
}

document.getElementById("location").innerHTML = "Location of the user: " + suburb;
