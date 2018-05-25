
/**
  Documento que comunica la vista con la base de datos firebase
  Autor: Jonathan Rodríguez
*/
jQuery(document).ready(function () {
    $('#tableBeer').dataTable();
    $('[data-toggle="tooltip"]').tooltip();
    init();                       // Se inicializa firebase
    getBeersInformation();        // Refresca la tabla

});

/**
 * Función que Inicializa los parámetros para la connexion con firebase
 * */
function init() {
    var config = {
        apiKey: "AIzaSyCaQDP-TK7gJVQ_EobjlF_UDrppbxCaBg4",
        authDomain: "pruebajonardrgz.firebaseapp.com",
        databaseURL: "https://pruebajonardrgz.firebaseio.com",
        projectId: "pruebajonardrgz",
        storageBucket: "pruebajonardrgz.appspot.com",
        messagingSenderId: "341726809583"
    };
    firebase.initializeApp(config);
}

/**
 * Función que agrega elementos en el Html para insertar una bebida en la base de datos
 * @param {int} pIdBeer id de la cerveza
 */
function addFieldToInsertBeer(pIdBeer) {
    $("#buttonPlus" + pIdBeer).hide();
    $("#buttonMinus" + pIdBeer).show();
    $("#quantity" + pIdBeer).show();
    $("#buttonAdd" + pIdBeer).show();
}

/**
 * Elimina elementos del Html
 * @param {any} pIdBeer id de la cerveza
 */
function removeFieldToInsertBeer(pIdBeer) {
    $("#buttonPlus" + pIdBeer).show();
    $("#buttonMinus" + pIdBeer).hide();
    $("#quantity" + pIdBeer).hide();
    $("#buttonAdd" + pIdBeer).hide();
}

/**
 * Agrega  un registro de bebida en la base de datos
 * @param {any} pIdBeer
 */
function addBeer(pIdBeer) {
    var quantity = $("#quantity" + pIdBeer).val();
    if (validateQuantity(quantity)) {
        if (isAvalaible(quantity, pIdBeer)) {
            updateQuantityAvailable(quantity, pIdBeer);
            getBeersInformation();
        }

    }
}

/**
 * Actualiza la cantidad disponible en la base de datos
 * @param {any} quantity cantidad a actualizar
 * @param {any} pIdBeer  id de la cerveza a actualizar
 */
function updateQuantityAvailable(quantity, pIdBeer) {
    var databaseRef = firebase.database().ref("beers/" + pIdBeer + "/available");
    databaseRef.transaction(function (available) {
        if (available - quantity >= 0) {
            updateQuantityDrunk(pIdBeer, quantity);
            toastr["success"]("Saved Data", "Success");
            return parseInt(available) - parseInt(quantity);
        }
        else {
            toastr["error"]("Request not available", "Error");
            return available;
        }
    });
}

/**
 * Retorna true si la cantidad solicitada esta disponible
 * @param {any} quantity cantidad solicitada
 * @param {any} pIdBeer  id de la cerveza a actualizar
 */
function isAvalaible(quantity, pIdBeer) {
    var databaseRef = firebase.database().ref("beers/" + pIdBeer + "/available");
    databaseRef.on("value", function (data) {
        if (data.val() - quantity < 0) {
            return false;
        }
    });
    return true;
}

/**
 * Actualiza la cantidad tomada en la base de datos
 * @param {any} quantity cantidad a actualizar
 * @param {any} pIdBeer  id de la cerveza a actualizar
 */
function updateQuantityDrunk(pIdBeer, quantity) {
    var databaseRef = firebase.database().ref("beers/" + pIdBeer + "/quantityDrunk");
    databaseRef.transaction(function (quantityDrunk) {
        return parseInt(quantityDrunk) + parseInt(quantity);
    });
}


/**Actualiza la información de la tabla de disponibles */
function getBeersInformation() {
    var htmlBodyTable = "";
    $('#tableBeer').dataTable().fnDestroy();
    $('#bodyTableBeer').html(htmlBodyTable);
    $('#tableBeer').dataTable();
    firebase.database().ref().child("beers").orderByChild("available").startAt(1).on("child_added", function (data) {
        htmlBodyTable += insertDataIntoTable(data.val().name, data.val().tagLine, data.val().firstBrewed, data.val().available,
            data.val().quantityDrunk, data.val().ibu, data.val().id);
        updateTable(htmlBodyTable, "Top 5", getTopFiveBeers);
    });

    $("#titleBeers").html("Available Beers");
}

/**Actualiza la información de la tabla top 5 */
function getTopFiveBeers() {
    var htmlBodyTable = "";
    firebase.database().ref().child("beers").orderByChild("quantityDrunk").limitToLast(5).on("child_added", function (data) {
        htmlBodyTable += insertDataIntoTable(data.val().name, data.val().tagLine, data.val().firstBrewed, data.val().available,
            data.val().quantityDrunk, data.val().ibu, data.val().id);
        updateTable(htmlBodyTable, "Available Beers", getBeersInformation);
    });
    $("#titleBeers").html("Top 5");
}

/**
 * Reinicia Datatable
 * @param {any} htmlBodyTable cuerpo de la tabla a reiniciar
 * @param {any} text          nuevo texto
 * @param {any} actioner      evento para el boton de la tabla
 */
function updateTable(htmlBodyTable, text, actioner) {
    $('#tableBeer').dataTable().fnDestroy();
    $('#bodyTableBeer').html(htmlBodyTable);
    $('#tableBeer').dataTable({
        dom: 'Bfrtip',
        responsive: true,
        order: "Top 5" != text ? [[4, 'desc']] : [[1, 'desc']],
        columnDefs: [
            { responsivePriority: 1, targets: 0 },
            { responsivePriority: 2, targets: 6 }
        ],
        buttons: [
            {
                text: text,
                className: 'buttonPrimary',
                action: function (e, dt, node, config) {
                    actioner();
                }
            }
        ]
    });
}

/**
 * Agrega los parámetros a string que será insertado en un datatable
 * @param {any} name
 * @param {any} tagline
 * @param {any} firstBrewed
 * @param {any} available
 * @param {any} quantityDrunk
 * @param {any} ibu
 * @param {any} id
 */
function insertDataIntoTable(name, tagline, firstBrewed, available, quantityDrunk, ibu, id) {
    return '<tr>\
            <td>'+ name + '</td>\
            <td>'+ tagline + '</td>\
            <td>'+ firstBrewed + '</td>\
            <td>'+ available + '</td>\
            <td>'+ quantityDrunk + '</td>\
            <td>'+ ibu + '</td>\
            <td><button  id="buttonPlus'+ id + '" data-toggle="tooltip" data-placement="top" title="Press to add Beer" \
               onclick="addFieldToInsertBeer('+ id + ');" class="btn-link col-md-12"><i class="fas fa-plus-circle">\
            </i></button>\
            <input type="number" class="col-md-7  col-sm-7 col-xs-12" id="quantity'+ id + '" style="display: none;" min="1">\
            <button type="button" onclick="addBeer('+ id + ')"  id="buttonAdd' + id + '"\
             class="btn btn-sm btn-success col-md-4  col-sm-4  col-xs-12" style="display: none;">add</button>\
            <button  id="buttonMinus'+ id + '" onclick="removeFieldToInsertBeer(' + id + ');"\
             data-toggle="tooltip" data-placement="top" title="Press to close" class="btn-link btn-sm col-md-4 \
              col-sm-4 col-xs-12 text-center test" style="display: none;"  ><i class="fas fa-minus-circle"></i>\
            </button></td>\
          </tr>';
}

/**
 * Valida que la cantidad cumpla con las restricciones
 * @param {any} quantity
 */
function validateQuantity(quantity) {
    if (quantity <= 0 || quantity == "") {
        toastr["error"]("Must be a positive number greater than zero", "Error");
        return false;
    }
    return true;
}

//Opciones de Toastr
toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}