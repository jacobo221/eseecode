/**************************************************************
 * Add here the id and name of the installed themes,          *
 **************************************************************/

$e.ui.themes.init = () => {
    $e.ui.themes.available = $e.ui.themes.available.concat([
        { id: "sharp", name: "Sharp" },
        { id: "retro", name: "Retro" },
        { id: "psychedelic", name: "Psychedelic"},
    ]);
}