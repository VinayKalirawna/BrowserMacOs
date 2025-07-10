import { createFolder, 
    openfolder,
    currentSelectedFolderId,
    getFolders,
    setFolders,
    renderFolderFromData,
    triggerRename
 } from "./desktop.js"

const ContextMenu = document.getElementById('context-menu')
const folderContextMenu = document.getElementById("folder-context-menu")

export const showContextMenu = (x, y, type) =>{
    hidecContextMenu()

    if (type == 'folder'){
        ContextMenu.style.display = 'none'
        folderContextMenu.style.left = x + "px"
        folderContextMenu.style.top = y + "px"
        folderContextMenu.style.display = 'block'
    }else{
        folderContextMenu.style.display = "none"
        ContextMenu.style.left = x + 'px'
        ContextMenu.style.top = y + 'px'
        ContextMenu.style.display = 'block'
    }
}

export const hidecContextMenu = () => {
    ContextMenu.style.display = 'none'
    folderContextMenu.style.display = "none"
}

const newFolder = document.getElementById('New-Folder')

newFolder.addEventListener('click', (e) => {
    createFolder()   
    hidecContextMenu();     
})

// Open after clicking on open on context menu open
document.getElementById("folder-context-open").addEventListener(
    'click', () => {
        const folders = getFolders();
        const folder = folders.find(f => f.id === currentSelectedFolderId);
        if (folder) openfolder(folder);
        hidecContextMenu()
    }
)

// Move to bin after clicking on folder context menu move to bin
document.getElementById("folder-context-delete").addEventListener(
    'click', () => {
        const folders = getFolders();
        const updated = folders.filter(f => f.id != currentSelectedFolderId);
        setFolders(updated)

        const el = document.querySelector(`.desktop-folder[data-id="${currentSelectedFolderId}"]`);
        if (el) el.remove()
        hidecContextMenu();
    }
)

// Rename on clicking folder context menu
document.getElementById("folder-context-rename")
  .addEventListener('click', () => {
    const el = document.querySelector(`.desktop-folder[data-id="${currentSelectedFolderId}"]`);
    if (el) triggerRename(el);
    hidecContextMenu();
  });

// 4. Duplicate on clicking folder context menu
document.getElementById("folder-context-duplicate")
  .addEventListener('click', () => {
    const folders = getFolders();
    const original = folders.find(f => f.id == currentSelectedFolderId);
    if (!original) return;

    const duplicated = {
      ...original,
      id: Date.now(),
      name: original.name + " Copy",
      x: original.x + 20,
      y: original.y + 20
    };

    folders.push(duplicated);
    setFolders(folders);
    renderFolderFromData(duplicated);

    hidecContextMenu();
});

document.addEventListener("DOMContentLoaded", () => {
  const changeWallpaper = document.getElementById("Change-Wallpaper");
  const wallpaperPicker = document.getElementById("wallpaper-picker");

  changeWallpaper.addEventListener("click", () => {
    console.log("change wallpaper clicked");
    hidecContextMenu();
    wallpaperPicker.style.display = "block";
  });

  document.querySelectorAll(".wall-option").forEach((img) => {
    img.addEventListener("click", () => {
        console.log("Wallpaper clicked:", img.src);  
        const desktop = document.getElementById("desktop");
        desktop.style.backgroundImage = `url(${img.src})`;
        wallpaperPicker.style.display = "none";
        localStorage.setItem("wallpaper", img.src);
    });
  });
});



