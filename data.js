window.RUTA_DATA = {
  meta: {
    title: 'Ruta Perú',
    reviewed: '19 de agosto de 2026',
    reviewISO: '2026-08-19',
    principle: 'Aprender primero. Practicar después. Simular al final.'
  },

  nav: [
    { group: 'Tu aprendizaje', items: [
      ['moto', '🏍', 'Motocicleta'],
      ['auto', '🚗', 'Automóvil']
    ]}
  ],

  sources: {
    banks: {
      title: 'Balotarios para el examen de conocimientos',
      norm: 'Publicación oficial MTC',
      entity: 'Ministerio de Transportes y Comunicaciones',
      url: 'https://www.gob.pe/institucion/mtc/informes-publicaciones/1928110-examen-de-conocimientos-para-postulantes-a-licencias-de-conducir',
      note: 'El MTC publica balotarios diferenciados por clase y categoría y mantiene un simulador oficial.'
    },
    ai: {
      title: 'Balotario Clase A, categoría I',
      norm: 'R.D. N.° 5980-2017-MTC/15',
      entity: 'Ministerio de Transportes y Comunicaciones',
      url: 'https://www.gob.pe/institucion/mtc/normas-legales/10341-5980-2017-mtc-15',
      note: 'Aprueba el balotario A-I para la evaluación de conocimientos y dispone su aplicación a nivel nacional.'
    },
    biib: {
      title: 'Balotario Clase B, categoría II-B',
      norm: 'R.D. N.° 004-2020-MTC/18',
      entity: 'Ministerio de Transportes y Comunicaciones',
      url: 'https://www.gob.pe/institucion/mtc/normas-legales/454568-004-2020-mtc-18',
      note: 'Aprueba los balotarios de Clase B categorías II-A, II-B y II-C.'
    },
    rnt: {
      title: 'TUO del Reglamento Nacional de Tránsito – Código de Tránsito',
      norm: 'D.S. N.° 016-2009-MTC y modificatorias',
      entity: 'Ministerio de Transportes y Comunicaciones',
      url: 'https://www.gob.pe/institucion/mtc/normas-legales/9897-016-2009-mtc',
      note: 'Base normativa general. La aplicación debe considerar sus modificaciones posteriores.'
    },
    speed: {
      title: 'Límites máximos de velocidad en zonas urbanas',
      norm: 'D.S. N.° 025-2021-MTC',
      entity: 'Ministerio de Transportes y Comunicaciones',
      url: 'https://www.gob.pe/26617-nuevos-limites-de-velocidad-en-zonas-urbanas-a-nivel-nacional',
      note: 'Calles y jirones: 30 km/h. Avenidas: 50 km/h, salvo señalización específica aplicable.'
    },
    manual: {
      title: 'Manual de Dispositivos de Control de Tránsito Automotor',
      norm: 'R.D. N.° 26-2024-MTC/18',
      entity: 'Ministerio de Transportes y Comunicaciones',
      url: 'https://www.gob.pe/institucion/mtc/normas-legales/6150395-26-2024-mtc-18',
      note: 'Es la actualización vigente del manual de señales y dispositivos de control de tránsito.'
    },
    license: {
      title: 'Clasificación de licencias de conducir',
      norm: 'Reglamento Nacional del Sistema de Emisión de Licencias de Conducir',
      entity: 'Ministerio de Transportes y Comunicaciones',
      url: 'https://portal.mtc.gob.pe/transportes/terrestre/licencias/info_general_clasificacion_licencias.html',
      note: 'A-I comprende vehículos particulares permitidos por su categoría. B-II-B autoriza vehículos L3 y L4 y también los comprendidos en B-II-A.'
    },
    helmet: {
      title: 'Especificaciones técnicas para cascos de motocicleta',
      norm: 'R.D. N.° 0012-2025-MTC/18, modificada por R.D. N.° 0028-2025-MTC/18',
      entity: 'Ministerio de Transportes y Comunicaciones',
      url: 'https://www.gob.pe/institucion/mtc/normas-legales/7485473-0028-2025-mtc-18',
      note: 'Regulación técnica vigente para cascos de conductores y acompañantes de motocicletas.'
    },
    update2026: {
      title: 'Modificación del Reglamento Nacional de Tránsito',
      norm: 'D.S. N.° 011-2026-MTC',
      entity: 'Ministerio de Transportes y Comunicaciones',
      url: 'https://www.gob.pe/institucion/mtc/normas-legales/8042204-011-2026-mtc',
      note: 'Modificación de 2026 que debe considerarse al revisar preguntas históricas del balotario.'
    }
  },

  vehicles: {
    moto: {
      title: 'Motocicleta',
      icon: '🏍️',
      license: 'Clase B · Categoría II-B',
      questionCount: 204,
      bankFile: 'data/questions-moto.json',
      source: 'biib',
      intro: 'Empieza por lo que necesitas para circular en motocicleta y después practica con el balotario B-II-B completo.',
      units: [
        {
          id: 'm1',
          title: 'Antes de salir a la vía',
          subtitle: 'Licencia, documentos, casco y acompañante',
          rules: [
            {title:'Licencia correcta', law:'La licencia B-II-B autoriza la conducción de vehículos de las categorías L3 y L4 y también los comprendidos en B-II-A.', plain:'Para una motocicleta convencional, tu referencia es B-II-B.', practice:'Verifica que la licencia esté vigente antes de conducir.', mistake:'Pensar que cualquier licencia Clase B autoriza automáticamente cualquier vehículo menor.', source:'license'},
            {title:'Casco del conductor y acompañante', law:'El casco de seguridad para conductor y acompañante está sujeto a las especificaciones técnicas aprobadas por el MTC y a sus modificaciones vigentes.', plain:'No basta con usar cualquier casco: debe cumplir la especificación técnica aplicable.', practice:'Revisa certificación, estado, ajuste y sistema de retención antes de salir.', mistake:'Guiarse por publicaciones antiguas que citan especificaciones ya sustituidas.', source:'helmet'},
            {title:'Documentación y habilitación', law:'El conductor debe contar con la documentación y condiciones habilitantes exigibles para circular, según el Reglamento Nacional de Tránsito y normas complementarias.', plain:'Licencia vigente, identificación del vehículo y seguro obligatorio son parte del control básico.', practice:'Antes de un viaje largo revisa documentos y vigencias.', mistake:'Esperar a una intervención para descubrir que un documento venció.', source:'rnt'}
          ]
        },
        {
          id: 'm2',
          title: 'Señales, semáforos y marcas',
          subtitle: 'Aprende a leer la vía antes de maniobrar',
          rules: [
            {title:'Obediencia a los dispositivos', law:'Conductores y peatones deben obedecer los dispositivos de control del tránsito, salvo instrucción válida en contrario de la autoridad competente.', plain:'La señalización organiza la circulación; no es opcional.', practice:'Mira señal vertical, semáforo y marcas antes de decidir un giro.', mistake:'Fijarse solo en el vehículo de adelante.', source:'rnt'},
            {title:'Manual vigente', law:'Las señales y dispositivos se interpretan con el Manual de Dispositivos de Control de Tránsito Automotor vigente.', plain:'Reglamentarias, preventivas e informativas cumplen funciones distintas.', practice:'Primero identifica la familia de la señal y luego su mensaje.', mistake:'Memorizar un dibujo antiguo sin verificar el manual vigente.', source:'manual'},
            {title:'Semáforo ámbar', law:'La luz ámbar advierte el cambio de fase; la conducta depende de si es posible detenerse de manera segura antes de ingresar a la intersección.', plain:'No significa acelerar para “ganarle” al rojo.', practice:'Anticipa la detención cuando tu ubicación y velocidad lo permiten.', mistake:'Interpretar el ámbar como una autorización para acelerar.', source:'rnt'}
          ]
        },
        {
          id: 'm3',
          title: 'Prioridad e intersecciones',
          subtitle: 'Quién pasa, cuándo detenerte y cómo girar',
          rules: [
            {title:'Autoridad de tránsito', law:'Las indicaciones del efectivo de la PNP asignado al control del tránsito prevalecen sobre el semáforo cuando dirige la circulación.', plain:'Si el semáforo dice una cosa y el efectivo te ordena otra, sigue al efectivo.', practice:'Reduce velocidad y busca sus señales manuales al aproximarte.', mistake:'Ignorar al efectivo porque la luz está verde.', source:'update2026'},
            {title:'Giros', law:'Todo cambio de dirección debe prepararse con anticipación, ubicación adecuada y señalización durante la maniobra.', plain:'Señaliza antes de moverte, no después.', practice:'Posiciónate con tiempo y verifica espejos y puntos ciegos.', mistake:'Cruzar varios carriles en el último momento.', source:'rnt'},
            {title:'Cruces peatonales', law:'El conductor debe respetar la prioridad y las zonas destinadas al cruce de peatones conforme a la regulación aplicable.', plain:'La motocicleta no tiene prioridad por ser pequeña o maniobrable.', practice:'Reduce velocidad cerca de pasos peatonales e intersecciones.', mistake:'Pasar por un espacio estrecho mientras un peatón cruza.', source:'rnt'}
          ]
        },
        {
          id: 'm4',
          title: 'Carriles y adelantamientos',
          subtitle: 'Muévete de forma visible y predecible',
          rules: [
            {title:'Uso del carril', law:'La motocicleta está sujeta a las reglas generales de circulación, carriles, adelantamiento y señalización.', plain:'Ser más angosta no elimina las reglas del carril.', practice:'Mantén una trayectoria predecible y espacio de seguridad.', mistake:'Zigzaguear entre vehículos como si las reglas de carril no aplicaran.', source:'rnt'},
            {title:'Cambio de carril', law:'Antes de cambiar de carril se debe advertir la maniobra y comprobar que pueda realizarse sin peligro.', plain:'Direccional + observación + espacio suficiente.', practice:'Comprueba espejo y punto ciego antes de desplazarte.', mistake:'Usar la direccional como si otorgara prioridad automática.', source:'rnt'},
            {title:'Adelantamiento', law:'El adelantamiento está sujeto a restricciones de lugar, visibilidad, señalización y seguridad.', plain:'Que la moto quepa no significa que el adelantamiento sea legal o seguro.', practice:'No inicies la maniobra si no tienes visibilidad y espacio para terminarla.', mistake:'Adelantar dentro de una situación de conflicto solo por encontrar un hueco.', source:'rnt'}
          ]
        },
        {
          id: 'm5',
          title: 'Velocidad, luces y noche',
          subtitle: 'Controla el riesgo antes de que aparezca',
          rules: [
            {title:'Velocidad urbana', law:'En calles y jirones el límite máximo general es 30 km/h y en avenidas 50 km/h, salvo señalización específica aplicable.', plain:'El límite antiguo de 60 km/h en avenidas ya no es la referencia general.', practice:'Usa el límite real como máximo, no como velocidad que debas mantener siempre.', mistake:'Aprender una pregunta histórica del balotario sin contrastarla con la norma vigente.', source:'speed'},
            {title:'Velocidad segura', law:'Además del límite máximo, la conducción debe adecuarse a las condiciones de la vía, tránsito, visibilidad y clima.', plain:'A veces conducir legalmente exige ir bastante por debajo del máximo.', practice:'Reduce antes de la curva, no dentro de ella.', mistake:'Confundir “máximo permitido” con “velocidad segura”.', source:'rnt'},
            {title:'Visibilidad nocturna', law:'El uso de luces y las reglas de visibilidad deben cumplirse según la situación de circulación.', plain:'De noche necesitas ver y ser visto sin deslumbrar a otros.', practice:'Al aproximarte a otro vehículo en sentido contrario evita mantener luces que deslumbren.', mistake:'Creer que más luz siempre significa más seguridad.', source:'rnt'}
          ]
        },
        {
          id: 'm6',
          title: 'Infracciones y emergencias',
          subtitle: 'Qué hacer cuando algo sale mal',
          rules: [
            {title:'No memorices solo la multa', law:'Las infracciones se tipifican por conducta y sus consecuencias pueden incluir multa, puntos, medidas preventivas u otras sanciones.', plain:'Primero entiende qué conducta está prohibida; el monto puede cambiar con la UIT.', practice:'Estudia código, conducta y consecuencia por separado.', mistake:'Memorizar únicamente una cifra en soles de un balotario antiguo.', source:'rnt'},
            {title:'Alcohol y conducción', law:'La normativa prohíbe conducir bajo efectos que comprometan la capacidad y contempla controles y sanciones.', plain:'La decisión segura es no conducir después de consumir alcohol.', practice:'Planifica un medio de retorno antes de consumir.', mistake:'Confiar en “sentirse bien” como prueba de aptitud.', source:'rnt'},
            {title:'Accidente de tránsito', law:'El balotario evalúa obligaciones y nociones de primeros auxilios para actuar frente a un siniestro.', plain:'Protege la escena, solicita ayuda y evita agravar lesiones.', practice:'Aprende primero qué no debes mover o improvisar.', mistake:'Actuar con prisa sin asegurar la zona ni pedir asistencia.', source:'banks'}
          ]
        }
      ]
    },

    auto: {
      title: 'Automóvil',
      icon: '🚗',
      license: 'Clase A · Categoría I',
      questionCount: 200,
      bankFile: 'data/questions-auto.json',
      source: 'ai',
      intro: 'Aprende las reglas esenciales para automóvil particular y después recorre el balotario A-I completo.',
      units: [
        {
          id: 'a1',
          title: 'Antes de conducir',
          subtitle: 'Licencia, documentos y condiciones básicas',
          rules: [
            {title:'Licencia A-I', law:'La licencia A-I autoriza vehículos particulares comprendidos en las categorías vehiculares que establece la clasificación oficial.', plain:'Es la categoría de referencia para automóvil particular.', practice:'Verifica la categoría real del vehículo en su identificación.', mistake:'Elegir la licencia solo por el aspecto o tamaño del vehículo.', source:'license'},
            {title:'Documentos exigibles', law:'Durante la conducción deben cumplirse las obligaciones documentarias previstas por el Reglamento Nacional de Tránsito y normas complementarias.', plain:'Licencia, identificación vehicular y seguro obligatorio forman parte del control habitual.', practice:'Comprueba vigencias antes de un viaje.', mistake:'Conducir mientras se “tramita después” un documento obligatorio.', source:'rnt'},
            {title:'Condición del vehículo', law:'El vehículo debe circular en condiciones que no comprometan la seguridad y cumplir las exigencias técnicas que le correspondan.', plain:'Frenos, neumáticos, luces y visibilidad son parte de conducir legalmente y con seguridad.', practice:'Haz una revisión visual breve antes de salir a carretera.', mistake:'Pensar que la inspección técnica reemplaza tu revisión cotidiana.', source:'rnt'}
          ]
        },
        {
          id: 'a2',
          title: 'Señales y semáforos',
          subtitle: 'Entiende lo que la vía te está diciendo',
          rules: [
            {title:'Dispositivos de control', law:'Conductores y peatones están obligados a obedecer los dispositivos de control, salvo instrucción válida en contrario de la autoridad competente.', plain:'Señales, semáforos y marcas no compiten entre sí: se interpretan dentro de una jerarquía y contexto.', practice:'Escanea la vía antes de llegar a la intersección.', mistake:'Mirar el semáforo cuando ya estás dentro del cruce.', source:'rnt'},
            {title:'Señales verticales', law:'El manual vigente organiza señales reglamentarias, preventivas e informativas, entre otros dispositivos.', plain:'Cada familia responde a una pregunta: qué debo hacer, qué riesgo viene o qué información necesito.', practice:'Clasifica la señal antes de memorizar su código.', mistake:'Aprender solo números de señal.', source:'manual'},
            {title:'Marcas en pavimento', law:'Las marcas horizontales complementan la regulación de carriles, cruces, límites y maniobras.', plain:'Una línea no es decoración: comunica permiso, separación o restricción.', practice:'Observa color y continuidad de la marca antes de cambiar de posición.', mistake:'Cruzar una marca sin comprobar qué maniobra autoriza.', source:'manual'}
          ]
        },
        {
          id: 'a3',
          title: 'Prioridad e intersecciones',
          subtitle: 'Decide antes de entrar al conflicto',
          rules: [
            {title:'PNP y semáforo', law:'La indicación del efectivo de tránsito asignado al control prevalece sobre el semáforo cuando dirige la circulación.', plain:'Verde no significa avanzar si el efectivo ordena detenerte.', practice:'Busca primero señales manuales cuando hay control policial.', mistake:'Seguir al auto de adelante sin verificar la instrucción.', source:'update2026'},
            {title:'Giro con anticipación', law:'El cambio de dirección debe señalizarse y ejecutarse desde una posición adecuada y con seguridad.', plain:'El giro comienza antes de mover el volante: observas, señalizas y te ubicas.', practice:'No cambies varios carriles justo antes de girar.', mistake:'Activar la direccional durante el giro.', source:'rnt'},
            {title:'Peatones', law:'El conductor debe respetar las reglas de prioridad y los espacios destinados a peatones.', plain:'La protección del usuario vulnerable forma parte de la conducción.', practice:'Reduce velocidad antes del cruce, no después de ver al peatón.', mistake:'Bloquear el paso peatonal al detenerte.', source:'rnt'}
          ]
        },
        {
          id: 'a4',
          title: 'Carriles y adelantamiento',
          subtitle: 'Orden, distancia y maniobras previsibles',
          rules: [
            {title:'Posición en la vía', law:'La circulación debe respetar carriles, sentidos, demarcaciones y reglas de utilización de la calzada.', plain:'Tu carril organiza tu trayectoria y la de los demás.', practice:'Elige el carril con anticipación según la maniobra que realizarás.', mistake:'Usar el carril izquierdo lentamente y generar obstrucción cuando la norma exige otra conducta.', source:'rnt'},
            {title:'Cambio de carril', law:'Toda maniobra debe advertirse y realizarse solo cuando exista espacio y seguridad suficientes.', plain:'La direccional avisa; no te concede el espacio.', practice:'Espejo, direccional, punto ciego y desplazamiento progresivo.', mistake:'Cambiar de carril por reacción tardía.', source:'rnt'},
            {title:'Adelantamiento', law:'El adelantamiento se permite únicamente cuando las condiciones de vía, señalización y visibilidad lo hacen legal y seguro.', plain:'Necesitas espacio para salir, sobrepasar y regresar.', practice:'Si no ves dónde terminarás la maniobra, no la inicies.', mistake:'Adelantar cerca de un punto de conflicto sin visibilidad suficiente.', source:'rnt'}
          ]
        },
        {
          id: 'a5',
          title: 'Velocidad y conducción nocturna',
          subtitle: 'El máximo legal no siempre es seguro',
          rules: [
            {title:'Límites urbanos vigentes', law:'En calles y jirones: 30 km/h. En avenidas: 50 km/h, salvo señalización específica aplicable.', plain:'Las referencias antiguas de 40 y 60 km/h fueron modificadas.', practice:'Aprende primero 30/50 como regla urbana general vigente.', mistake:'Responder un balotario antiguo sin revisar si la velocidad cambió.', source:'speed'},
            {title:'Adaptación de velocidad', law:'El conductor debe adecuar la velocidad a las condiciones existentes incluso cuando se encuentre por debajo del máximo.', plain:'Lluvia, oscuridad o congestión reducen el margen de seguridad.', practice:'Aumenta distancia y reduce velocidad cuando disminuye la visibilidad.', mistake:'Mantener el máximo porque “la ley lo permite”.', source:'rnt'},
            {title:'Luces en carretera', law:'Las luces deben utilizarse de acuerdo con las condiciones y sin perjudicar la visibilidad de otros usuarios.', plain:'Al cruzarte con otro vehículo de noche evita deslumbrarlo.', practice:'Anticipa el cambio de luces y mantén limpia la superficie de los faros.', mistake:'Conservar luces altas frente a tráfico que viene en sentido contrario.', source:'rnt'}
          ]
        },
        {
          id: 'a6',
          title: 'Infracciones, seguros y accidentes',
          subtitle: 'Comprende consecuencias y actuación básica',
          rules: [
            {title:'Infracción = conducta', law:'La infracción se identifica por la conducta tipificada; las sanciones y medidas se aplican conforme al cuadro vigente.', plain:'No estudies solamente montos en soles.', practice:'Relaciona conducta, riesgo y consecuencia.', mistake:'Memorizar una UIT histórica como si fuera permanente.', source:'rnt'},
            {title:'Seguro obligatorio', law:'El balotario incluye responsabilidad civil y seguros obligatorios de accidentes de tránsito como materia de evaluación.', plain:'El seguro forma parte del sistema de protección frente a daños derivados de siniestros.', practice:'Comprueba la vigencia antes de circular.', mistake:'Confundir tener póliza con estar exento de responsabilidades de conducción.', source:'banks'},
            {title:'Primeros auxilios', law:'La evaluación oficial incluye nociones de primeros auxilios en caso de accidentes de tránsito.', plain:'El objetivo inicial es evitar nuevos riesgos y activar ayuda adecuada.', practice:'Señaliza, protege la escena y solicita asistencia.', mistake:'Mover a una persona lesionada sin necesidad inmediata o sin criterio de emergencia.', source:'banks'}
          ]
        }
      ]
    }
  }
};