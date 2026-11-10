export type Group = { name: string; words: [string, string, string, string] };

// Cada puzzle: 4 grupos de 4 palabras, de más fácil a más difícil.
export const PUZZLES: Group[][] = [
  [
    { name: "Planetas", words: ["MARTE", "VENUS", "SATURNO", "NEPTUNO"] },
    { name: "Instrumentos", words: ["PIANO", "FLAUTA", "VIOLÍN", "BATERÍA"] },
    { name: "Deportes", words: ["TENIS", "RUGBY", "GOLF", "BOXEO"] },
    { name: "Frutas", words: ["MANZANA", "PERA", "UVA", "MELÓN"] },
  ],
  [
    { name: "Colores", words: ["ROJO", "AZUL", "VERDE", "NEGRO"] },
    { name: "Días de la semana", words: ["LUNES", "MARTES", "JUEVES", "VIERNES"] },
    { name: "Océanos", words: ["PACÍFICO", "ATLÁNTICO", "ÍNDICO", "ÁRTICO"] },
    { name: "Estaciones", words: ["VERANO", "OTOÑO", "INVIERNO", "PRIMAVERA"] },
  ],
  [
    { name: "Partes del cuerpo", words: ["MANO", "PIE", "OREJA", "NARIZ"] },
    { name: "Para leer", words: ["LIBRO", "DIARIO", "REVISTA", "CARTA"] },
    { name: "Dulces", words: ["CHOCOLATE", "CARAMELO", "ALFAJOR", "HELADO"] },
    { name: "Muebles", words: ["MESA", "SILLA", "SOFÁ", "CAMA"] },
  ],
  [
    { name: "Animales de granja", words: ["VACA", "OVEJA", "CERDO", "GALLINA"] },
    { name: "Felinos", words: ["LEÓN", "TIGRE", "PUMA", "JAGUAR"] },
    { name: "Aves", words: ["ÁGUILA", "PALOMA", "LORO", "BÚHO"] },
    { name: "Animales marinos", words: ["DELFÍN", "BALLENA", "TIBURÓN", "PULPO"] },
  ],
  [
    { name: "Países de Sudamérica", words: ["CHILE", "PERÚ", "BRASIL", "URUGUAY"] },
    { name: "Marcas de autos", words: ["FORD", "FIAT", "RENAULT", "TOYOTA"] },
    { name: "Marcas deportivas", words: ["NIKE", "ADIDAS", "REEBOK", "TOPPER"] },
    { name: "Bebidas", words: ["AGUA", "JUGO", "CAFÉ", "TÉ"] },
  ],
  [
    { name: "Provincias argentinas", words: ["SALTA", "JUJUY", "MENDOZA", "CHACO"] },
    { name: "Ciudades del mundo", words: ["PARÍS", "LONDRES", "TOKIO", "BERLÍN"] },
    { name: "Profesiones", words: ["MÉDICO", "PILOTO", "BOMBERO", "ABOGADO"] },
    { name: "Herramientas", words: ["MARTILLO", "SERRUCHO", "TALADRO", "PINZA"] },
  ],
  [
    { name: "Se pueden romper", words: ["CORAZÓN", "RÉCORD", "HIELO", "PROMESA"] },
    { name: "Se pueden cruzar", words: ["CALLE", "PUENTE", "DESIERTO", "RÍO"] },
    { name: "Se pueden cortar", words: ["PELO", "PAPEL", "TORTA", "CABLE"] },
    { name: "Se pueden pagar", words: ["CUENTA", "DEUDA", "IMPUESTO", "ALQUILER"] },
  ],
  [
    { name: "Tienen alas", words: ["AVIÓN", "MARIPOSA", "ÁNGEL", "MURCIÉLAGO"] },
    { name: "Tienen patas", words: ["MESA", "ARAÑA", "PERRO", "BANCO"] },
    { name: "Tienen hojas", words: ["ÁRBOL", "CUADERNO", "LECHUGA", "PUERTA"] },
    { name: "Tienen cuerdas", words: ["GUITARRA", "ARPA", "RAQUETA", "CELLO"] },
  ],
  [
    { name: "Idiomas", words: ["ESPAÑOL", "INGLÉS", "PORTUGUÉS", "ITALIANO"] },
    { name: "Superhéroes", words: ["BATMAN", "SUPERMAN", "HULK", "THOR"] },
    { name: "Comidas argentinas", words: ["ASADO", "EMPANADA", "MILANESA", "CHORIPÁN"] },
    { name: "Bailes", words: ["TANGO", "SAMBA", "CUMBIA", "VALS"] },
  ],
  [
    { name: "Deportistas argentinos", words: ["MESSI", "MARADONA", "GINÓBILI", "SABATINI"] },
    { name: "Escritores argentinos", words: ["BORGES", "CORTÁZAR", "SÁBATO", "WALSH"] },
    { name: "Músicos argentinos", words: ["CERATI", "SPINETTA", "SOSA", "CHARLY"] },
    { name: "Barrios porteños", words: ["PALERMO", "RECOLETA", "BELGRANO", "CABALLITO"] },
  ],
];
