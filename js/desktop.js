import { hidecContextMenu, showContextMenu } from "./contextMenu.js";

// DOM reference
const desktopElement = document.getElementById("desktop");


let lastRightClickX;
let lastRightClickY;

export let currentSelectedFolderId;
let folders = []

export const initDesktop = () => {
    const savedWallpaper = localStorage.getItem("wallpaper");
    if(savedWallpaper) {
        desktopElement.style.backgroundImage = `url(${savedWallpaper})`;
    };

    desktopElement.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    lastRightClickX = e.pageX
    lastRightClickY = e.pageY
    showContextMenu(e.pageX, e.pageY, 'desktop');
    });

    desktopElement.addEventListener("click", () => {
    hidecContextMenu();
    });
    //Load and render folders from localStorage
    const savedFolders = JSON.parse(localStorage.getItem("folders")) || [];
    folders = savedFolders;

    savedFolders.forEach(folder => {
    renderFolder(folder);
    });

    desktopElement.addEventListener("click", (e) => {
        hidecContextMenu();

        // Deselect all folders
        document.querySelectorAll('.desktop-folder').forEach(f => {
            f.classList.remove('selected');
        });
    });
};



// Create folder (called from context menu)
export const createFolder = () => {
  const desktop = document.getElementById("desktop");


  // Create folder element
  const folder = document.createElement("div");
  folder.classList.add("desktop-folder");
  folder.style.top = `${lastRightClickY}px`;
  folder.style.left = `${lastRightClickX}px`;

  // Add folder icon
  const icon = document.createElement("img");
  icon.classList.add("folder-icon");
  icon.src =
    "https://res.cloudinary.com/dphhbdytb/image/upload/v1751706954/Screenshot_2025-07-05_at_2.26.50_PM-removebg-preview_rcb9sk.png";

  const name = document.createElement("p");
  name.classList.add("folder-name");
  name.textContent = "New Folder";

  // Assemble and add to desktop
  folder.appendChild(icon);
  folder.appendChild(name);
  desktop.appendChild(folder);

  const folderData = {
    id: Date.now(),
    name: "New Folder",
    x: lastRightClickX,
    y: lastRightClickY
    };

    folder.dataset.id = folderData.id;

    folders.push(folderData);
    localStorage.setItem("folders", JSON.stringify(folders))

    makeFolderInteractive(folder);
};


// Rendering the data
const renderFolder = (folderData) => {
  const { name, x, y } = folderData;

  const desktop = document.getElementById("desktop");

  const folder = document.createElement("div");
  folder.classList.add("desktop-folder");
  folder.style.top = `${y}px`;
  folder.style.left = `${x}px`;
  folder.dataset.id = folderData.id;

  const icon = document.createElement("img");
  icon.classList.add("folder-icon");
  icon.src =
    "https://res.cloudinary.com/dphhbdytb/image/upload/v1751706954/Screenshot_2025-07-05_at_2.26.50_PM-removebg-preview_rcb9sk.png";

  const label = document.createElement("p");
  label.classList.add("folder-name");
  label.textContent = name;

  folder.appendChild(icon);
  folder.appendChild(label);
  desktop.appendChild(folder);

  makeFolderInteractive(folder)
}

// Function to open the oflder when double clicked
export const openfolder = (folderData) => {
    // Simply call the openFolderWindow function that's already defined in folderWindow.js
    if (window.openFolderWindow) {
        window.openFolderWindow(folderData.id, folderData.name);
    } else {
        console.error('openFolderWindow function not available');
    }
}



// the function for dragging, selecting, renaming and opening the folder
function makeFolderInteractive(folder) {
    const label = folder.querySelector('.folder-name')

    folder.addEventListener('mousedown', (e) => {
        if (e.button != 0 ) return
        
        let isDragging = true

        const startX = e.clientX
        const startY = e.clientY
        const initialLeft = parseInt(folder.style.left)
        const initialTop = parseInt(folder.style.top)

        const onMouseMove = (e) => {

            if(!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            folder.style.left = `${initialLeft + deltaX}px`;
            folder.style.top = `${initialTop + deltaY}px`;
        };

        const onMouseUp = (e) => {
            isDragging = false;

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp)

            const newX = parseInt(folder.style.left)
            const newY = parseInt(folder.style.top)

            const id = parseInt(folder.dataset.id)

            const folderObj = folders.find((f) => f.id == id);
            if(folderObj) {
                folderObj.x = newX;
                folderObj.y = newY;
                localStorage.setItem('folders', JSON.stringify(folders));
            }
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp)
    });

    // Renaming

    label.addEventListener('dblclick', () => {
        const input = document.createElement("input")
        input.type = "text"
        input.value = label.textContent
        input.classList.add("rename-input");

        folder.replaceChild(input, label)
        input.focus();
        input.select();

        input.addEventListener('blur', () => {
            const newName = input.value.trim() || "Unitiled"
            const newLabel = document.createElement("p");
            newLabel.classList.add("folder-name");
            newLabel.textContent = newName

            folder.replaceChild(newLabel, input)

            const id = parseInt(folder.dataset.id)

            const folderObj = folders.find((f) => f.id === id);
            if (folderObj) {
                folderObj.name = newName;
                localStorage.setItem("folders", JSON.stringify(folders));
            }

            makeFolderInteractive(folder)
        })

        input.addEventListener('keydown', (e) => {
            if(e.key === "Enter") input.blur();

        });
    });

    // Single click select

    folder.addEventListener("click", (e) => {
        e.stopPropagation();

        document.querySelectorAll(".desktop-folder").forEach(f => {
            f.classList.remove("selected");
        });

        folder.classList.add("selected")
    });

    // Double click to open
    const folderIcon = folder.querySelector('.folder-icon')
    folderIcon.addEventListener("dblclick", (e) => {
        const id = parseInt(folder.dataset.id);
        const folderObj = folders.find(f => f.id === id);

        if(folderObj) {
            openfolder(folderObj)
        }
    })

    // Context-Menu of folde when right clicked
    folder.addEventListener('contextmenu',(e) => {
        e.preventDefault()
        e.stopPropagation()

        document.querySelectorAll(".desktop-folder").forEach(f => {
            f.classList.remove("selected");
        });

        folder.classList.add("selected")
        currentSelectedFolderId = parseInt(folder.dataset.id);

        showContextMenu(e.pageX, e.pageY, "folder")
    })
}


export const getFolders = () => folders;
export const setFolders = (newFolders) => {
  folders = newFolders;
  localStorage.setItem("folders", JSON.stringify(folders));
};

export const renderFolderFromData = (data) => renderFolder(data);

// Make rename logic reusable
export const triggerRename = (folderEl) => {
  const label = folderEl.querySelector(".folder-name");
  const input = document.createElement("input");
  input.type = "text";
  input.value = label.textContent;
  input.classList.add("rename-input");

  folderEl.replaceChild(input, label);
  input.focus();
  input.select();

  input.addEventListener("blur", () => {
    const newName = input.value.trim() || "Untitled";
    const newLabel = document.createElement("p");
    newLabel.classList.add("folder-name");
    newLabel.textContent = newName;
    folderEl.replaceChild(newLabel, input);

    const id = parseInt(folderEl.dataset.id);
    const folderObj = folders.find((f) => f.id === id);
    if (folderObj) {
      folderObj.name = newName;
      localStorage.setItem("folders", JSON.stringify(folders));
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
  });
};
