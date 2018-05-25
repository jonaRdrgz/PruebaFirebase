/**
  Documento que comunica la base de datos firebase  con la API para extraer la información
  Autor: Jonathan Rodríguez
*/

jQuery(document).ready(function () {
	requestInfo(); // Se realiza la petición
});

/** Función que realiza la petición a  la API */
function requestInfo(){
  $.ajax({
    type: "GET",
    url:"https://api.punkapi.com/v2/beers" ,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      $.each(data, function (i, beer) {
       quantityDrunk = 0;
       var quantityAvailable = Math.floor((Math.random() * 50) + 1);
          writeBeerData(beer["id"], beer["name"], beer["tagline"], beer["first_brewed"], beer["ibu"],      //Inserción en la base
              beer["ph"], beer["description"], quantityAvailable, quantityDrunk);
     });
    },
    error: function (data) {
      alert("Ha ocurrido un error: " + JSON.stringify(data));
    }

  });
}

/**
 * Inserta los parámetros en la base de datos
 * @param {any} id
 * @param {any} name
 * @param {any} tagLine
 * @param {any} firstBrewed
 * @param {any} ibu
 * @param {any} ph
 * @param {any} description
 * @param {any} available
 * @param {any} quantityDrunk
 */
function writeBeerData(id, name, tagLine, firstBrewed, ibu, ph, description, available, quantityDrunk) {
  var beersRef = firebase.database().ref("beers/" + id);
  beersRef.set ({
    id : id,
    name: name,
    tagLine: tagLine,
    firstBrewed: firstBrewed,
    ibu: ibu,
    ph: ph,
    available: available,
    quantityDrunk : quantityDrunk, 
    description: description
  });
}