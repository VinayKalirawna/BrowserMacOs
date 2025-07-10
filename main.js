import { initDesktop } from "./js/desktop.js";
import { initSafari } from './js/dock/safari.js';
import { initNotes } from './js/dock/notes.js';
import { initCamera } from "./js/dock/camera.js";
import { initTerminal } from "./js/dock/terminal.js";
import { initFinder } from "./js/dock/finder.js";
import { initMenuBar } from "./js/menuBar.js";
import { initFolderWindow } from "./js/folderWindow.js";

initDesktop();
initSafari();
initNotes();
initCamera();
initTerminal();
initFinder();
initFolderWindow();
initMenuBar();