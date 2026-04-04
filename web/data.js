/**
 * DATABASE DELLE OPERE
 * Qui puoi aggiungere nuove opere. Assicurati che ogni opera abbia un ID unico.
 */

const widthMoltiplicator = 1.5; // Moltiplicatore per adattare le dimensioni delle opere alla scala della galleria

const exhibitionData = [
    {
        id: 1,
        title: "Saturno che divora i suoi figli",
        artist: "Francisco Goya",
        year: "1819-1823",
        tech: "Olio su tela",
        description: "Un'esplorazione delle forme geometriche che si fondono con i colori caldi del tramonto. L'opera rappresenta la sintesi tra natura e matematica, dove ogni linea è calcolata per creare armonia visiva.",
        color: "#ff7e5f",
        image: "assets/013.png",
        width: 0.81 * widthMoltiplicator, // Larghezza in metri
        position: { x: 18, y: 2.5, z: 26.05 },
        rotation: { y: 0 }
    },
    {
        id: 2,
        title: "Monaco in riva al mare",
        artist: "Caspar David Friedrich",
        year: "1808-1810",
        tech: "Olio su tela",
        description: "Un'opera introspettiva che utilizza cinquanta sfumature di blu per evocare la calma profonda dell'oceano notturno. L'artista invita lo spettatore a perdersi nell'assenza di rumore.",
        color: "#2193b0",
        image: "assets/012.png",
        width: 1.7 * widthMoltiplicator,
        position: { x: 26.95, y: 2, z: 30.8 },
        rotation: { y: -Math.PI / 2 }
    },
    {
        id: 3,
        title: "L'isola dei morti",
        artist: "Arnold Bocklin,",
        year: "1883, terza versione",
        tech: "Olio su tela",
        description: "La frenesia della città moderna catturata attraverso strappi, collage e vernice spray. Un ritratto crudo ma vibrante della vita metropolitana che non dorme mai.",
        color: "#cc2b5e",
        image: "assets/011.png",
        width: 1.5 * widthMoltiplicator,
        position: { x: 20, y: 2, z: 35.95 },
        rotation: { y: Math.PI }
    },
    {
        id: 4,
        title: "I Nottabuli",
        artist: "Edward Hopper",
        year: "1942",
        tech: "Olio su tela",
        description: "Delicate pennellate costruiscono la forma di un albero antico. Le radici affondano nella storia mentre i rami tendono verso un futuro incerto ma speranzoso.",
        color: "#56ab2f",
        image: "assets/022.png",
        width: 1.5 * widthMoltiplicator,
        position: { x: 26.95, y: 2, z: 19 },
        rotation: { y: -Math.PI / 2 }
    },
    {
        id: 5,
        title: "Tavola calda",
        artist: "Edward Hopper",
        year: "1927",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/021.png",
        width: 0.9 * widthMoltiplicator,
        position: { x: 26.95, y: 2, z: 12 },
        rotation: { y: -Math.PI  / 2}
    },
    {
        id: 6,
        title: "Domenica di primo mattino",
        artist: "Edward Hopper",
        year: "1930",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/023.png",
        width: 1.5 * widthMoltiplicator,
        position: { x: 20.5, y: 2, z: 5.05 },
        rotation: { y: 0}
    },
    {
        id: 7,
        title: "Paesaggio urbano con camion",
        artist: "Mario Sironi",
        year: "1920",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/025.png",
        width: 0.6 * widthMoltiplicator,
        position: { x: 14.05, y: 2, z: 9 },
        rotation: { y: Math.PI  / 2}
    },
    {
        id: 8,
        title: "L'enigma dell'ora",
        artist: "Giorgio de Chirico",
        year: "1910-11",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/024.png",
        width: 0.7 * widthMoltiplicator,
        position: { x: 14.05, y: 2, z: 18 },
        rotation: { y: Math.PI  / 2}
    },
    {
        id: 9,
        title: "Enigma di una giornata",
        artist: "Giorgio de Chirico",
        year: "1914",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/026.png",
        width: 1.4 * widthMoltiplicator,
        position: { x: 19, y: 2, z: 24.95 },
        rotation: { y: Math.PI }
    },
    {
        id: 10,
        title: "Enigma di un pomeriggio d’autunno",
        artist: "Giorgio de Chirico",
        year: "1910",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/031.png",
        width: 0.6 * widthMoltiplicator,
        position: { x: 8.5, y: 2, z: 24.95 },
        rotation: { y: Math.PI }
    },
    {
        id: 11,
        title: "La condizione umana I",
        artist: "René Magritte",
        year: "1933",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/032.png",
        width: 0.8 * widthMoltiplicator,
        position: { x: 4.05, y: 2, z: 15.5 },
        rotation: { y: Math.PI / 2}
    },
    {
        id: 12,
        title: "La condizione umana II",
        artist: "René Magritte",
        year: "1935",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/033.png",
        width: 0.8 * widthMoltiplicator,
        position: { x: 4.05, y: 2, z: 8 },
        rotation: { y: Math.PI / 2}
    },
    {
        id: 13,
        title: "Gli Amanti",
        artist: "René Magritte",
        year: "1928",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/034.png",
        width: 0.73 * widthMoltiplicator,
        position: { x: 12.95, y: 2, z: 15.5 },
        rotation: { y: -Math.PI / 2}
    },
    {
        id: 14,
        title: "La persistenza della memoria",
        artist: "Salvador Dalí",
        year: "1931",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/035.png",
        width: 0.35 * widthMoltiplicator,
        position: { x: 12.95, y: 2, z: 8 },
        rotation: { y: -Math.PI / 2}
    },
    {
        id: 15,
        title: "L'impero delle luci",
        artist: "René Magritte",
        year: "1954",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/041.png",
        width: 1.3 * widthMoltiplicator,
        position: { x: 20, y: 2.2, z: -1.95 },
        rotation: { y: 0}
    },
    {
        id: 16,
        title: "La Torre Rossa ad Halle",
        artist: "Ernst Ludwig Kirchner",
        year: "1915",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/042.png",
        width: 0.91 * widthMoltiplicator,
        position: { x: 20, y: 2, z: 3.95 },
        rotation: { y: Math.PI }
    },
    {
        id: 17,
        title: "Guernica",
        artist: "Pablo Picasso",
        year: "1937",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/051.png",
        width: 7.7 * widthMoltiplicator,
        position: { x: 8.5, y: 3, z: -21.95 },
        rotation: { y: 0 }
    },
    {
        id: 18,
        title: "Studio dal ritratto di Innocenzo X",
        artist: "Francis Bacon",
        year: "1953",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/053.png",
        width: 1.18 * widthMoltiplicator,
        position: { x: 22.95, y: 3, z: -17.5 },
        rotation: { y: -Math.PI / 2 }
    },
    {
        id: 19,
        title: "Il grido",
        artist: "Edvard Munch",
        year: "1893",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/052.png",
        width: 0.73 * widthMoltiplicator,
        position: { x: -5, y: 2.5, z: -21.95 },
        rotation: { y: 0 }
    },
    {
        id: 20,
        title: "L'intrigo",
        artist: "James Ensor",
        year: "1890",
        tech: "Olio su tela",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/054.png",
        width: 1.5 * widthMoltiplicator,
        position: { x: -2, y: 2.5, z: -13.05 },
        rotation: { y: Math.PI }
    },
];

/**
 * DATABASE DEI CARTELLI (TESTI)
 * Puoi aggiungere cartelli informativi o indicazioni.
 */
const signData = [
    {
        id: "sign-welcome",
        text: "BENVENUTI ALLA\nGALLERIA FIRENZE\n\nSeguite il percorso\nper esplorare le opere",
        position: { x: 8.6, y: 2.5, z: 26.001 },
        rotation: { y: 0 },
        fontSize: 64,
        textColor: "#ffffff",
        bgColor: "rgba(0, 0, 0, 0.7)",
        width: 3
    },
    {
        id: "sign-exit",
        text: "USCITA ->",
        position: { x: -20, y: 2.5, z: 5 },
        rotation: { y: Math.PI / 2 },
        fontSize: 48,
        textColor: "#ffcc00",
        bgColor: "#111111",
        width: 1.5
    }
];