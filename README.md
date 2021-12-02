# Pegar notas en SIU Guaraní

Éste es el código de una extensión de Chrome, originalmente desarrollada para la Universidad Austral, pero que se puede adaptar a otras instituciones.

La extensión actúa en páginas de profesores del SIU, ejecutando un _content script_ que agrega dos botones: Copiar alumnos y Pegar notas.

El archivo selectores.json tiene las url que activan el código y los selectores de elementos necesarios para su operación.  Se pueden cambiar para adaptar a cada institución.

## Selectores
La extensión actúa en tres páginas: notas de cursada, notas de evaluaciones, y notas de exámenes.  Para cada una se define la url que la identifica y una serie de selectores:

    tipo: 'Cursada',
    href:'https://siu.austral.edu.ar/portal/cursada/edicion/', // se detecta con href.startsWith(...)
    botonera:'div#cabecera div.pull-right',	// Contenedor para los botones a agregar
    filas:'form.form-renglones tbody tr', // Filas de la tabla, una fila para cada alumno

    // Los siguientes selectores se aplican sobre cada fila:
    nombre:'span.nombre',	// nombre completo del alumno, que se obtiene con .innerText
    nota:'input[data-tipo="nota"]', // nota del alumno, se introduce en .value
    resultado:'select[data-tipo="resultado"]', // resultado en .value: U:ausente, A:aprobado, R:reprobado
    condicion:'select[data-tipo="cond_regularidad"]' // condición de regularidad en .value: 4:aprobado, 3:desaprobado

