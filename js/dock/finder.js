export function initFinder() {
    const finderWindow = document.getElementById('finder-window');
    registerWindow(finderWindow);
    const finderMain = document.getElementById('finder-main');
    const currentPath = document.getElementById('current-path');
    const header = finderWindow.querySelector('.window-header');
    const closeBtn = finderWindow.querySelector('.close-btn');
    const minBtn = finderWindow.querySelector('.min-btn');
    const maxBtn = finderWindow.querySelector('.max-btn');
    
    let isMaximized = false;
    let originalStyle = {};
    let currentLocation = 'desktop';
    let selectedItem = null;
    let currentView = 'grid';
    
    // Data structure for different locations
    const locationData = {
        desktop: {
            name: 'Desktop',
            items: []
        },
        documents: {
            name: 'Documents',
            items: [
                { id: 1, name: 'Notes.txt', type: 'file', icon: '📄' },
                { id: 2, name: 'Projects', type: 'folder', icon: '📁' },
                { id: 3, name: 'Resume.pdf', type: 'file', icon: '📄' }
            ]
        },
        downloads: {
            name: 'Downloads',
            items: [
                { id: 4, name: 'Image.jpg', type: 'file', icon: '🖼️' },
                { id: 5, name: 'Video.mp4', type: 'file', icon: '🎬' }
            ]
        },
        applications: {
            name: 'Applications',
            items: [
                { 
                    id: 6, 
                    name: 'Instagram', 
                    type: 'app', 
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1024px-Instagram_icon.png',
                    url: 'https://instagram.com'
                },
                { 
                    id: 7, 
                    name: 'Spotify', 
                    type: 'app', 
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/1024px-Spotify_logo_without_text.svg.png',
                    url: 'https://spotify.com'
                },
                { 
                    id: 8, 
                    name: 'YouTube', 
                    type: 'app', 
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1024px-YouTube_full-color_icon_%282017%29.svg.png',
                    url: 'https://youtube.com'
                }
            ]
        }
    };

    // State management functions
    function saveFinderState() {
        const finderState = {
            isOpen: !finderWindow.classList.contains('hidden'),
            width: finderWindow.style.width,
            height: finderWindow.style.height,
            left: finderWindow.style.left,
            top: finderWindow.style.top,
            isMaximized: isMaximized,
            currentLocation: currentLocation,
            currentView: currentView
        };
        localStorage.setItem('finderState', JSON.stringify(finderState));
    }

    function restoreFinderState() {
        const finderState = JSON.parse(localStorage.getItem('finderState')) || {};
        
        if (finderState.isOpen) {
            finderWindow.classList.remove('hidden');
            finderWindow.style.width = finderState.width || '900px';
            finderWindow.style.height = finderState.height || '600px';
            finderWindow.style.left = finderState.left || `${(window.innerWidth - 900) / 2}px`;
            finderWindow.style.top = finderState.top || `${(window.innerHeight - 600) / 2}px`;
            bringWindowToFront(finderWindow);
            
            isMaximized = finderState.isMaximized || false;
            currentLocation = finderState.currentLocation || 'desktop';
            currentView = finderState.currentView || 'grid';
            
            // Update active sidebar item
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.location === currentLocation) {
                    item.classList.add('active');
                }
            });
            
            // Update active view button
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.view === currentView) {
                    btn.classList.add('active');
                }
            });
            
            initializeLocationData();
            loadLocation(currentLocation);
        }
    }

    // Initialize location data from localStorage
    function initializeLocationData() {
        // Load custom folders for each location
        Object.keys(locationData).forEach(location => {
            const savedFolders = JSON.parse(localStorage.getItem(`${location}_folders`)) || [];
            
            // Add saved folders to the location data
            savedFolders.forEach(folder => {
                const existingIndex = locationData[location].items.findIndex(item => item.id === folder.id);
                if (existingIndex === -1) {
                    locationData[location].items.push({
                        id: folder.id,
                        name: folder.name,
                        type: 'folder',
                        icon: '📁',
                        isCustom: true
                    });
                }
            });
        });
    }

    // Save folder to specific location
    function saveFolderToLocation(location, folder) {
        const savedFolders = JSON.parse(localStorage.getItem(`${location}_folders`)) || [];
        savedFolders.push(folder);
        localStorage.setItem(`${location}_folders`, JSON.stringify(savedFolders));
    }

    // Remove folder from specific location
    function removeFolderFromLocation(location, folderId) {
        const savedFolders = JSON.parse(localStorage.getItem(`${location}_folders`)) || [];
        const updatedFolders = savedFolders.filter(f => f.id !== folderId);
        localStorage.setItem(`${location}_folders`, JSON.stringify(updatedFolders));
    }

    // Update folder in specific location
    function updateFolderInLocation(location, folderId, newName) {
        const savedFolders = JSON.parse(localStorage.getItem(`${location}_folders`)) || [];
        const folder = savedFolders.find(f => f.id === folderId);
        if (folder) {
            folder.name = newName;
            localStorage.setItem(`${location}_folders`, JSON.stringify(savedFolders));
        }
    }

    // Open Finder window with state saving
    function openFinderWindow() {
        finderWindow.classList.remove('hidden');
        finderWindow.style.width = '900px';
        finderWindow.style.height = '600px';
        finderWindow.style.left = `${(window.innerWidth - 900) / 2}px`;
        finderWindow.style.top = `${(window.innerHeight - 800) / 2}px`;
        bringWindowToFront(finderWindow);
        
        initializeLocationData();
        loadLocation('desktop');
        saveFinderState();
    }

    // Click finder icon to open
    document.getElementById('finder-icon').onclick = () => {
        if (finderWindow.classList.contains('hidden')) {
            openFinderWindow();
        } else {
            bringWindowToFront(finderWindow);
        }
    };


    // Window controls with state saving
    closeBtn.onclick = () => {
        finderWindow.classList.add('hidden');
        saveFinderState();
    };

    minBtn.onclick = () => {
        finderWindow.classList.add('hidden');
        saveFinderState();
    };

    maxBtn.onclick = () => {
        if (!isMaximized) {
            originalStyle = {
                width: finderWindow.style.width,
                height: finderWindow.style.height,
                top: finderWindow.style.top,
                left: finderWindow.style.left,
                zIndex: finderWindow.style.zIndex
            };
            
            // Add maximized class and set individual properties
            finderWindow.classList.add('maximized');
            finderWindow.style.top = '24px';
            finderWindow.style.left = '0px';
            finderWindow.style.width = '100vw';
            finderWindow.style.height = 'calc(100vh - 24px)';
            finderWindow.style.zIndex = '10001';
            isMaximized = true;
        } else {
            // Remove maximized class and restore original values
            finderWindow.classList.remove('maximized');
            finderWindow.style.width = originalStyle.width || '900px';
            finderWindow.style.height = originalStyle.height || '600px';
            finderWindow.style.left = originalStyle.left || `${(window.innerWidth - 900) / 2}px`;
            finderWindow.style.top = originalStyle.top || `${(window.innerHeight - 600) / 2}px`;
            finderWindow.style.zIndex = originalStyle.zIndex || '2000';
            isMaximized = false;
        }
        saveFinderState();
    };
    // Add escape key handler for fullscreen
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMaximized && !finderWindow.classList.contains('hidden')) {
            maxBtn.click(); 
        }
    });




    // Draggable header with state saving
    header.addEventListener('mousedown', function(e) {
        if (isMaximized) return;
        let shiftX = e.clientX - finderWindow.getBoundingClientRect().left;
        let shiftY = e.clientY - finderWindow.getBoundingClientRect().top;
        
        function moveAt(pageX, pageY) {
            finderWindow.style.left = pageX - shiftX + 'px';
            finderWindow.style.top = pageY - shiftY + 'px';
        }
        
        function onMouseMove(e) { moveAt(e.pageX, e.pageY); }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', function() {
            document.removeEventListener('mousemove', onMouseMove);
            saveFinderState(); 
        }, { once: true });
    });

    // Sidebar navigation with state saving
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const location = item.dataset.location;
            loadLocation(location);
            saveFinderState();
        });
    });

    // View controls with state saving
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            renderItems();
            saveFinderState();
        });
    });

    // Load location content
    function loadLocation(location) {
        currentLocation = location;
        currentPath.textContent = locationData[location].name;
        
        // Special handling for desktop to maintain backward compatibility
        if (location === 'desktop') {
            const desktopFolders = JSON.parse(localStorage.getItem('folders')) || [];
            const customDesktopFolders = JSON.parse(localStorage.getItem('desktop_folders')) || [];
            
            // Merge both old and new desktop folders
            const allDesktopFolders = [...desktopFolders, ...customDesktopFolders];
            
            // Remove duplicates based on ID
            const uniqueFolders = allDesktopFolders.filter((folder, index, self) => 
                index === self.findIndex(f => f.id === folder.id)
            );
            
            locationData.desktop.items = uniqueFolders.map(folder => ({
                id: folder.id,
                name: folder.name,
                type: 'folder',
                icon: '📁',
                folderData: folder,
                isCustom: true
            }));
        }
        
        renderItems();
    }

    // Render items in current view
    function renderItems() {
        const items = locationData[currentLocation].items;
        finderMain.innerHTML = '';
        finderMain.className = `finder-main finder-${currentView}`;

        items.forEach(item => {
            const itemEl = createFinderItem(item);
            finderMain.appendChild(itemEl);
        });
    }

    // Create finder item element
    function createFinderItem(item) {
        const itemEl = document.createElement('div');
        itemEl.className = 'finder-item';
        itemEl.dataset.id = item.id;
        itemEl.dataset.type = item.type;

        const iconEl = document.createElement('img');
        iconEl.className = 'finder-item-icon';
        
        if (item.type === 'folder') {
            iconEl.src = 'https://res.cloudinary.com/dphhbdytb/image/upload/v1751706954/Screenshot_2025-07-05_at_2.26.50_PM-removebg-preview_rcb9sk.png';
        } else if (item.type === 'app' && item.icon.startsWith('http')) {
            iconEl.src = item.icon;
        } else {
            iconEl.textContent = item.icon;
            iconEl.style.fontSize = '32px';
            iconEl.style.display = 'flex';
            iconEl.style.alignItems = 'center';
            iconEl.style.justifyContent = 'center';
        }

        const nameEl = document.createElement('div');
        nameEl.className = 'finder-item-name';
        nameEl.textContent = item.name;

        itemEl.appendChild(iconEl);
        itemEl.appendChild(nameEl);

        // Add event listeners
        itemEl.addEventListener('click', (e) => {
            e.stopPropagation();
            selectItem(itemEl);
        });

        itemEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            openItem(item);
        });

        itemEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            selectItem(itemEl);
            
            const finderMainRect = finderMain.getBoundingClientRect();
            const x = e.clientX - finderMainRect.left;
            const y = e.clientY - finderMainRect.top;
            
            showFinderContextMenu(x, y, item);
        });

        return itemEl;
    }

    // Select item
    function selectItem(itemEl) {
        document.querySelectorAll('.finder-item').forEach(item => {
            item.classList.remove('selected');
        });
        itemEl.classList.add('selected');
        selectedItem = itemEl;
    }

    // Open item
    function openItem(item) {
        if (item.type === 'app' && item.url) {
            window.open(item.url, '_blank');
        } else if (item.type === 'folder') {
            console.log('Opening folder:', item.name);
        } else {
            console.log('Opening file:', item.name);
        }
    }

    // FIXED: Prevent desktop context menu when right-clicking anywhere in Finder window
    finderWindow.addEventListener('contextmenu', (e) => {
        e.stopPropagation(); 
        
        // Check if we're in the finder main area
        const isInFinderMain = e.target.closest('#finder-main');
        
        if (isInFinderMain) {
            return;
        } else {
            e.preventDefault();
        }
    });

    // Context menu for finder content with improved positioning
    finderMain.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const clickedItem = e.target.closest('.finder-item');

        if (!clickedItem) {
            const finderMainRect = finderMain.getBoundingClientRect();
            const x = e.clientX - finderMainRect.left;
            const y = e.clientY - finderMainRect.top;

            showFinderContextMenu(x, y, null);
        }
    });

    // Hide context menus on click
    finderMain.addEventListener('click', () => {
        hideFinderContextMenus();
        if (selectedItem) {
            selectedItem.classList.remove('selected');
            selectedItem = null;
        }
    });

    // Context menu functions with improved positioning
    function showFinderContextMenu(x, y, item) {
        hideFinderContextMenus();
        
        const menu = item && (item.type === 'folder' || item.type === 'file') 
            ? document.getElementById('finder-folder-context-menu')
            : document.getElementById('finder-context-menu');
        
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        menu.classList.remove('hidden');
        adjustMenuPosition(menu, x, y);
    }

    function adjustMenuPosition(menu, x, y) {
        requestAnimationFrame(() => {
            const menuRect = menu.getBoundingClientRect();
            const finderMainRect = finderMain.getBoundingClientRect();
            
            let adjustedX = x;
            let adjustedY = y;
            
            const finderMainWidth = finderMain.offsetWidth;
            const finderMainHeight = finderMain.offsetHeight;
            
            if (x + menuRect.width > finderMainWidth) {
                adjustedX = Math.max(0, finderMainWidth - menuRect.width - 5);
            }
            
            if (y + menuRect.height > finderMainHeight) {
                adjustedY = Math.max(0, finderMainHeight - menuRect.height - 5);
            }
            
            adjustedX = Math.max(5, adjustedX);
            adjustedY = Math.max(5, adjustedY);
            
            menu.style.left = adjustedX + 'px';
            menu.style.top = adjustedY + 'px';
        });
    }

    function hideFinderContextMenus() {
        document.getElementById('finder-context-menu').classList.add('hidden');
        document.getElementById('finder-folder-context-menu').classList.add('hidden');
    }

    // Context menu actions
    document.getElementById('finder-new-folder').addEventListener('click', () => {
        createFinderFolder();
        hideFinderContextMenus();
    });

    document.getElementById('finder-folder-delete').addEventListener('click', () => {
        deleteSelectedItem();
        hideFinderContextMenus();
    });

    document.getElementById('finder-folder-rename').addEventListener('click', () => {
        renameSelectedItem();
        hideFinderContextMenus();
    });

    // Folder operations with state saving
    function createFinderFolder() {
        const newFolder = {
            id: Date.now(),
            name: 'New Folder',
            type: 'folder',
            icon: '📁',
            isCustom: true
        };
        
        // Add to current location's items
        locationData[currentLocation].items.push(newFolder);
        
        // Save to localStorage for the current location
        if (currentLocation === 'desktop') {
            // Maintain backward compatibility for desktop
            const desktopFolders = JSON.parse(localStorage.getItem('folders')) || [];
            const folderData = {
                id: newFolder.id,
                name: newFolder.name,
                x: 100,
                y: 100
            };
            desktopFolders.push(folderData);
            localStorage.setItem('folders', JSON.stringify(desktopFolders));
        } else {
            // Use new storage system for other locations
            const folderData = {
                id: newFolder.id,
                name: newFolder.name
            };
            saveFolderToLocation(currentLocation, folderData);
        }
        
        // Refresh the view
        renderItems();
        saveFinderState();
    }

    function deleteSelectedItem() {
        if (selectedItem) {
            const itemId = parseInt(selectedItem.dataset.id);
            const item = locationData[currentLocation].items.find(item => item.id === itemId);
            
            if (item && item.isCustom) {
                // Remove from location data
                locationData[currentLocation].items = locationData[currentLocation].items.filter(item => item.id !== itemId);
                
                // Remove from localStorage
                if (currentLocation === 'desktop') {
                    const desktopFolders = JSON.parse(localStorage.getItem('folders')) || [];
                    const updatedFolders = desktopFolders.filter(f => f.id !== itemId);
                    localStorage.setItem('folders', JSON.stringify(updatedFolders));
                    
                    // Remove from desktop as well
                    const desktopFolder = document.querySelector(`.desktop-folder[data-id="${itemId}"]`);
                    if (desktopFolder) desktopFolder.remove();
                } else {
                    removeFolderFromLocation(currentLocation, itemId);
                }
                
                // Refresh the view
                renderItems();
                saveFinderState();
            }
        }
    }

    function renameSelectedItem() {
        if (selectedItem) {
            const nameEl = selectedItem.querySelector('.finder-item-name');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = nameEl.textContent;
            input.style.width = '100%';
            input.style.textAlign = 'center';
            input.style.fontSize = '11px';
            
            nameEl.replaceWith(input);
            input.focus();
            input.select();
            
            input.addEventListener('blur', () => {
                const newName = input.value.trim() || 'Untitled';
                const newNameEl = document.createElement('div');
                newNameEl.className = 'finder-item-name';
                newNameEl.textContent = newName;
                input.replaceWith(newNameEl);
                
                // Update in memory
                const itemId = parseInt(selectedItem.dataset.id);
                const item = locationData[currentLocation].items.find(item => item.id === itemId);
                if (item) {
                    item.name = newName;
                }
                
                // Update in localStorage
                if (currentLocation === 'desktop') {
                    const desktopFolders = JSON.parse(localStorage.getItem('folders')) || [];
                    const folder = desktopFolders.find(f => f.id === itemId);
                    if (folder) {
                        folder.name = newName;
                        localStorage.setItem('folders', JSON.stringify(desktopFolders));
                        
                        // Update desktop folder name too
                        const desktopFolder = document.querySelector(`.desktop-folder[data-id="${itemId}"] .folder-name`);
                        if (desktopFolder) desktopFolder.textContent = newName;
                    }
                } else {
                    updateFolderInLocation(currentLocation, itemId, newName);
                }
                
                saveFinderState();
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') input.blur();
            });
        }
    }

    // Auto-save state periodically
    function autoSaveState() {
        setInterval(() => {
            if (!finderWindow.classList.contains('hidden')) {
                saveFinderState();
            }
        }, 5000);
    }

    // Initialize everything and restore state
    function initialize() {
        restoreFinderState();
        autoSaveState();
    }

    // Initialize the finder
    initialize();
}
