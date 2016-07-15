var suburb = ['Three Anchor Bay', 'Athlone', ' Big Bay', 'Belhar', 'Bellville', 'Bergvliet', 'Blouberg', 'Bloubergstrand',
        'Bothasig', 'Brackenfell', 'Cavendish', 'City Centre', 'City Bowl', 'Claremont', 'Crawford', 'Durbanville',
        'Edgemead', 'Epping', 'Gardens', 'Goodwood', 'Houtbay', 'Kenilworth', 'Kraaifontein', 'Kuilsriver', 'Kuilsrivier',
        'Maitland', 'Meadowridge', 'Melkbosstrand', 'Milnerton','Mitchells Plain',  'Newlands', 'Noordhoek', 'Northern Suburbs',  'Observatory', 'Orangezicht',
        'Parklands', 'Parow', 'Pinelands', 'Plattekloof', 'Sea Point', 'Rondebosch',
        'Rylands', 'Sandown', 'Simonstown', 'Strand', 'Southern Suburbs','Tableview', 'Tokai', 'Tygervalley', 'Uitzight',
        'Waterfront', 'Wellington', 'Woodstock', 'Wynberg'];

var sel = document.getElementById('SuburbList');
for(var i = 0; i < suburb.length; i++) {
    var opt = document.createElement('option');
    opt.innerHTML = suburb[i];
    opt.value = suburb[i];
    sel.appendChild(opt);
}

var types = [ "Any", "Coffee Shop", "Restaurant", "Bar", "Hotel", "Supermarket"];
var sel2 = document.getElementById('type');
for(var i = 0; i < types.length; i++) {
    var opt = document.createElement('option');
    opt.innerHTML = types[i];
    opt.value = types[i];
    sel2.appendChild(opt);
}

function redirect(){
  var value = document.getElementById('SuburbList').value;
  var type = document.getElementById('type').value;
  window.location = "hotspots/hotspots.html?suburb="+ value + "&type=" + type;
}
