/**
 * DATABASE DELLE OPERE
 * Qui puoi aggiungere nuove opere. Assicurati che ogni opera abbia un ID unico.
 */

const exhibitionData = [
    {
        id: 1,
        title: "Tramonto Geometrico",
        artist: "Alessandro Rossi",
        year: "2024",
        tech: "Arte Digitale",
        description: "Un'esplorazione delle forme geometriche che si fondono con i colori caldi del tramonto. L'opera rappresenta la sintesi tra natura e matematica, dove ogni linea è calcolata per creare armonia visiva.",
        color: "#ff7e5f",
        image: "assets/001.png",
        width: 3.0, // Larghezza in metri
        position: { x: 21, y: 2, z: 0.26 },
        rotation: { y: 0 }
    },
    {
        id: 2,
        title: "Silenzio Blu",
        artist: "Maria Bianchi",
        year: "2023",
        tech: "Olio su tela",
        description: "Un'opera introspettiva che utilizza cinquanta sfumature di blu per evocare la calma profonda dell'oceano notturno. L'artista invita lo spettatore a perdersi nell'assenza di rumore.",
        color: "#2193b0",
        image: "assets/002.png",
        width: 2.5,
        position: { x: -9.8, y: 2, z: 0 },
        rotation: { y: Math.PI / 2 }
    },
    {
        id: 3,
        title: "Caos Urbano",
        artist: "Luca Verdi",
        year: "2025",
        tech: "Tecnica Mista",
        description: "La frenesia della città moderna catturata attraverso strappi, collage e vernice spray. Un ritratto crudo ma vibrante della vita metropolitana che non dorme mai.",
        color: "#cc2b5e",
        image: "assets/003.png",
        width: 2.0,
        position: { x: 4.1, y: 2, z: 8 },
        rotation: { y: Math.PI / 2 }
    },
    {
        id: 4,
        title: "L'Albero della Vita",
        artist: "Sofia Neri",
        year: "2022",
        tech: "Acquerello",
        description: "Delicate pennellate costruiscono la forma di un albero antico. Le radici affondano nella storia mentre i rami tendono verso un futuro incerto ma speranzoso.",
        color: "#56ab2f",
        image: "assets/004.png",
        width: 5,
        position: { x: 12.9, y: 2, z: 7 },
        rotation: { y: -Math.PI / 2 }
    },
    {
        id: 5,
        title: "Struttura 01",
        artist: "Davide Gialli",
        year: "2024",
        tech: "Scultura 3D (Render)",
        description: "Un monolite astratto al centro della stanza. Rappresenta la solidità della materia digitale.",
        color: "#606c88",
        image: "assets/005.png",
        width: 4.0,
        position: { x: 0, y: 2, z: 9.8 },
        rotation: { y: Math.PI }
    }
];

/**
 * DATABASE DEI CARTELLI (TESTI)
 * Puoi aggiungere cartelli informativi o indicazioni.
 */
const signData = [
    {
        id: "sign-welcome",
        text: "BENVENUTI ALLA\nGALLERIA FIRENZE\n\nSeguite il percorso\nper esplorare le opere",
        position: { x: 8.6, y: 2.5, z: 30 },
        rotation: { y: 0 },
        fontSize: 32,
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