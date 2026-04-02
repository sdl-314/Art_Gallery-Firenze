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
        color: "#ff7e5f", // Colore usato come placeholder
        // Posizione: x (sinistra/destra), y (altezza), z (profondità)
        position: { x: 21, y: 2, z: 0.26 }, // Parete di fondo
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
        position: { x: -9.8, y: 2, z: 0 }, // Parete sinistra
        rotation: { y: Math.PI / 2 } // Ruotato di 90 gradi
    },
    {
        id: 3,
        title: "Caos Urbano",
        artist: "Luca Verdi",
        year: "2025",
        tech: "Tecnica Mista",
        description: "La frenesia della città moderna catturata attraverso strappi, collage e vernice spray. Un ritratto crudo ma vibrante della vita metropolitana che non dorme mai.",
        color: "#cc2b5e",
        position: { x: 4.1, y: 2, z: 8 }, // Parete destra (verso il fondo)
        rotation: { y: Math.PI / 2 } // Ruotato di -90 gradi
    },
    {
        id: 4,
        title: "L'Albero della Vita",
        artist: "Sofia Neri",
        year: "2022",
        tech: "Acquerello",
        description: "Delicate pennellate costruiscono la forma di un albero antico. Le radici affondano nella storia mentre i rami tendono verso un futuro incerto ma speranzoso.",
        color: "#56ab2f",
        position: { x: 12.9, y: 2, z: 7 }, // Parete destra (verso l'ingresso)
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
        position: { x: 0, y: 2, z: 9.8 }, // Parete posteriore (ingresso)
        rotation: { y: Math.PI }
    }
];