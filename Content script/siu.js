/* Content script SIU para
https://siu.austral.edu.ar/portal/cursada/edicion/*
 */

console.log('SIU: content script iniciado.');

// El selector elegido para el tipo de página detectado
// Se elige en hrefChange, se usa en agregarBotones y en los listeners de esos botones
var selectoresParaEstaPagina;

// Disparador del evento de cambio de href
// Código de https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
var oldHref = document.location.href;
new MutationObserver(mutations => {
	var newHref = document.location.href;
	if(oldHref != newHref){
		hrefChange(newHref, oldHref);
		oldHref = newHref;
	}
}).observe(
	document.querySelector("body"),
 	{childList: true, subtree: true}
);

// Listener de cambio de href
// Si llegó a una página donde se pueda actuar, muestra los botonesvar
// newHred != oldHref, garantizado
function hrefChange(newHref, oldHref){
	// Recorre los tipos de página a ver cuál detecta
	// Evalúa siempre todos, incluso sigue cuando ya lo encontró, igual son pocos
	selectoresParaEstaPagina = {tipo:'ninguno'};
	for(i=0; i<selectoresPorPagina.length; i++){
		var selectores = selectoresPorPagina[i];
		if(newHref.startsWith(selectores.href)){
			selectoresParaEstaPagina = selectores;
			setTimeout(()=>{agregarBotones();}, 1000);
			console.log('Entrando a página tipo ' + selectoresParaEstaPagina.tipo);
			break;
		}
	}
}

// Selectores para cada tipo de página
// Se accede con selectoresPorPagina[tipoDePagina]
var selectoresPorPagina;

// Los botones se crean una sola vez al principio, y se agegan al DOM cada vez que la aplicación los quita
var botonPegarNotas = document.createElement('button');
botonPegarNotas.className = "btn btn-small";
botonPegarNotas.innerText = 'Pegar notas';
botonPegarNotas.addEventListener('click', accionPegarNotas);

var botonCopiarAlumnos = document.createElement('button');
botonCopiarAlumnos.className = "btn btn-small";
botonCopiarAlumnos.innerText = 'Copiar alumnos';
botonCopiarAlumnos.addEventListener('click', accionCopiarAlumnos);

// Agregar botones
// botonera es el elemento contenedor donde se insertarán los botones a la izquierda
// TODO: agregar transición para aparición suave
function agregarBotones(){
	var botonera = document.querySelector(selectoresParaEstaPagina.botonera);
	if(botonera){
		// Es una página operable
		botonera.insertBefore(botonPegarNotas, botonera.firstElementChild);
		botonera.insertBefore(botonCopiarAlumnos, botonera.firstElementChild);	
	} else {
		console.log('No se pudo insertar la botonera', window.location.href, selectoresParaEstaPagina);
	}
}

// Alumnos es un array del objeto literal alumno
function pegarEnTabla(alumnos){
	// recorre la tabla de vista y pega la nota correspondiente a cada alumno
	var filasTabla = document.querySelectorAll(selectoresParaEstaPagina.filas);
	filasTabla.forEach(fila => {
		var nombre = fila.querySelector(selectoresParaEstaPagina.nombre).innerText;
		var alumno = alumnos.find(alumno => alumno.nombre == nombre);
		//console.log(nombre, alumno);
		if(alumno && alumno.nota){
			var nota = parseFloat(alumno.nota.replace(',', '.'));
			var aprobado = nota >= 4;
			var desaprobado = nota < 4;
			var ausente = alumno.nota.slice(0, 1).toLowerCase() == 'a';
			var paginaCursada = selectoresParaEstaPagina.tipo == 'Cursada';

			if(aprobado || desaprobado || ausente){
				fila.querySelector(selectoresParaEstaPagina.nota).value = 
					aprobado || desaprobado? nota.toFixed(paginaCursada? 2 : 0) : ausente? 'A' : '';

				fila.querySelector(selectoresParaEstaPagina.resultado).value = 
					aprobado? 'A' : desaprobado? 'R' : ausente? 'U' : '';

				// En página de Cursada
				if(paginaCursada)
					fila.querySelector(selectoresParaEstaPagina.condicion).value = 
						aprobado? '4' : desaprobado? '3' : ausente? 'U' : '';
			}
			// Nunca se da la condición para el valor ''; se expresa así por claridad
		}
	})
}

// Parser del clipboard que pega las notas
function parsearRango(rango){
	// rango es una tabla TAB/ENTER
	// en esta versión se procesa un único caso de dos columnas sin encabezados: alumno, nota
	var filas = rango.split('\n');
	console.log(filas);
	alumnos = filas.map(fila => {
		var datos = fila.split('\t');
		var alumno = {nombre:datos[0], nota:datos[1]};
		return alumno;
	});
	console.log(alumnos);
	pegarEnTabla(alumnos);
}

// click listener para Pegar notas
function accionPegarNotas(){
	navigator.clipboard.readText().then(parsearRango);
}

// click listener, copia al portapapeles la lista de alumnos de la vista
function accionCopiarAlumnos(){
	var lista = [...document.querySelectorAll(selectoresParaEstaPagina.filas + ' ' + selectoresParaEstaPagina.nombre)].map(span => span.innerText).join('\n');
	console.log(lista);
	navigator.clipboard.writeText(lista);
}

// Obtiene los selectores leídos del archivo selctores.json
fetch(chrome.runtime.getURL('selectores.json')).
then(respuesta => respuesta.json()).
then((selectores)=>{
	selectoresPorPagina = selectores;
	// dispara el primer cambio
	hrefChange(oldHref);
});