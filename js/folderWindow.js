export function initFolderWindow() {
    const folderWindow = document.getElementById('folder-window');
    const folderMain = document.getElementById('folder-main');
    const folderWindowTitle = document.getElementById('folder-window-title');
    const currentFolderDisplay = document.getElementById('current-folder-display');
    const header = folderWindow.querySelector('.window-header');
    const closeBtn = folderWindow.querySelector('.close-btn');
    const minBtn = folderWindow.querySelector('.min-btn');
    const maxBtn = folderWindow.querySelector('.max-btn');
    
    let isMaximized = false;
    let originalStyle = {};
    let currentFolderId = null;
    let currentFolderName = '';
    let selectedItem = null;
    let currentView = 'grid';
    let navigationHistory = [];
    let currentHistoryIndex = -1;

    // Open folder window function
    window.openFolderWindow = function(folderId, folderName) {
        currentFolderId = folderId;
        currentFolderName = folderName;
        
        // Set window title and display
        folderWindowTitle.textContent = folderName;
        currentFolderDisplay.textContent = folderName;
        
        // Position and show window
        folderWindow.classList.remove('hidden');
        folderWindow.style.width = '800px';
        folderWindow.style.height = '500px';
        folderWindow.style.left = `${(window.innerWidth - 800) / 2}px`;
        folderWindow.style.top = `${(window.innerHeight - 500) / 2}px`;
        folderWindow.style.zIndex = 3000;
        
        // Load folder contents
        loadFolderContents();
        
        // Reset navigation
        navigationHistory = [];
        currentHistoryIndex = -1;
        updateNavigationButtons();
    };

    // Load folder contents
    function loadFolderContents() {
        const folderContents = JSON.parse(localStorage.getItem(`folder_${currentFolderId}_contents`)) || [];
        renderFolderItems(folderContents);
    }

    // Render folder items
    function renderFolderItems(items) {
        folderMain.innerHTML = '';
        folderMain.className = `folder-main folder-${currentView}`;

        if (items.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-folder-message';
            emptyMessage.textContent = 'This folder is empty';
            folderMain.appendChild(emptyMessage);
            return;
        }

        items.forEach(item => {
            const itemEl = createFolderItem(item);
            folderMain.appendChild(itemEl);
        });
    }

    // Create folder item element with drag functionality
    function createFolderItem(item) {
        const itemEl = document.createElement('div');
        itemEl.className = 'folder-item';
        itemEl.dataset.id = item.id;
        itemEl.dataset.type = item.type;

        const iconEl = document.createElement('img');
        iconEl.className = 'folder-item-icon';
        iconEl.draggable = false; // Prevent default drag behavior
        
        if (item.type === 'folder') {
            iconEl.src = 'https://res.cloudinary.com/dphhbdytb/image/upload/v1751706954/Screenshot_2025-07-05_at_2.26.50_PM-removebg-preview_rcb9sk.png';
        } else {
            iconEl.textContent = item.icon || '📄';
            iconEl.style.fontSize = '32px';
            iconEl.style.display = 'flex';
            iconEl.style.alignItems = 'center';
            iconEl.style.justifyContent = 'center';
        }

        const nameEl = document.createElement('div');
        nameEl.className = 'folder-item-name';
        nameEl.textContent = item.name;

        itemEl.appendChild(iconEl);
        itemEl.appendChild(nameEl);

        // Make item draggable - FIXED VERSION
        makeFolderItemDraggable(itemEl, item);

        // Event listeners
        itemEl.addEventListener('click', (e) => {
            e.stopPropagation();
            selectFolderItem(itemEl);
        });

        itemEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            openFolderItem(item);
        });

        itemEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectFolderItem(itemEl);
            showFolderItemContextMenu(e, item);
        });

        return itemEl;
    }

    // FIXED: Enhanced drag functionality for folder items
    function makeFolderItemDraggable(itemEl, item) {
        let isDragging = false;
        let dragStartX, dragStartY;
        let initialX, initialY;
        let dragThreshold = 8;
        let clickStartTime = 0;
        let hasMoved = false;

        itemEl.addEventListener('mousedown', (e) => {
            // Only handle left mouse button
            if (e.button !== 0) return;
            
            e.preventDefault(); // Prevent text selection
            clickStartTime = Date.now();
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            hasMoved = false;
            
            // Get initial position relative to folder main container
            const rect = itemEl.getBoundingClientRect();
            const containerRect = folderMain.getBoundingClientRect();
            initialX = rect.left - containerRect.left;
            initialY = rect.top - containerRect.top;

            const onMouseMove = (e) => {
                const deltaX = e.clientX - dragStartX;
                const deltaY = e.clientY - dragStartY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // Check if we've moved enough to start dragging
                if (!isDragging && distance > dragThreshold) {
                    isDragging = true;
                    hasMoved = true;
                    itemEl.classList.add('dragging');
                    
                    // Make item position absolute for dragging
                    itemEl.style.position = 'absolute';
                    itemEl.style.zIndex = '1000';
                    
                    // Select the item being dragged
                    selectFolderItem(itemEl);
                    
                    // Prevent text selection during drag
                    document.body.style.userSelect = 'none';
                }

                if (isDragging) {
                    e.preventDefault();
                    
                    // Calculate new position
                    const newX = initialX + deltaX;
                    const newY = initialY + deltaY;
                    
                    // Get container bounds
                    const containerRect = folderMain.getBoundingClientRect();
                    const itemRect = itemEl.getBoundingClientRect();
                    
                    // Constrain within container bounds
                    const maxX = containerRect.width - itemRect.width;
                    const maxY = containerRect.height - itemRect.height;
                    
                    const constrainedX = Math.max(0, Math.min(newX, maxX));
                    const constrainedY = Math.max(0, Math.min(newY, maxY));
                    
                    itemEl.style.left = constrainedX + 'px';
                    itemEl.style.top = constrainedY + 'px';
                }
            };

            const onMouseUp = (e) => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                
                // Restore text selection
                document.body.style.userSelect = '';

                if (isDragging) {
                    isDragging = false;
                    itemEl.classList.remove('dragging');
                    
                    // Get final position
                    const finalX = parseInt(itemEl.style.left) || initialX;
                    const finalY = parseInt(itemEl.style.top) || initialY;
                    
                    // DON'T reset positioning - this was the bug!
                    // Keep the item in its new position
                    itemEl.style.zIndex = '';
                    
                    // Update item position in storage
                    updateItemPosition(item.id, finalX, finalY);
                    
                    showNotification(`"${item.name}" moved`);
                }
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        
        // Prevent default drag behavior on images
        const img = itemEl.querySelector('img');
        if (img) {
            img.addEventListener('dragstart', (e) => e.preventDefault());
        }
    }

    // Update item position in storage
    function updateItemPosition(itemId, x, y) {
        const folderContents = JSON.parse(localStorage.getItem(`folder_${currentFolderId}_contents`)) || [];
        const itemIndex = folderContents.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            folderContents[itemIndex].x = x;
            folderContents[itemIndex].y = y;
            localStorage.setItem(`folder_${currentFolderId}_contents`, JSON.stringify(folderContents));
        }
    }

    // Select folder item
    function selectFolderItem(itemEl) {
        document.querySelectorAll('.folder-item').forEach(item => {
            item.classList.remove('selected');
        });
        itemEl.classList.add('selected');
        selectedItem = itemEl;
    }

    // Open folder item
    function openFolderItem(item) {
        if (item.type === 'folder') {
            // Open nested folder
            window.openFolderWindow(item.id, item.name);
        } else {
            console.log('Opening file:', item.name);
        }
    }

    // Create new folder in current folder
    function createNewFolderInFolder() {
        const newFolder = {
            id: Date.now(),
            name: 'New Folder',
            type: 'folder',
            icon: '📁',
            parentId: currentFolderId,
            x: 0,
            y: 0
        };

        // Get current folder contents
        const folderContents = JSON.parse(localStorage.getItem(`folder_${currentFolderId}_contents`)) || [];
        folderContents.push(newFolder);
        localStorage.setItem(`folder_${currentFolderId}_contents`, JSON.stringify(folderContents));

        // Refresh view
        loadFolderContents();
        showNotification(`New folder created in "${currentFolderName}"`);
    }

    // Move item to trash
    function moveItemToTrash() {
        if (selectedItem) {
            const itemId = parseInt(selectedItem.dataset.id);
            const itemName = selectedItem.querySelector('.folder-item-name').textContent;
            
            // Add to trash
            const trashItems = JSON.parse(localStorage.getItem('trash_items')) || [];
            trashItems.push({
                id: itemId,
                name: itemName,
                type: selectedItem.dataset.type,
                originalLocation: 'folder',
                originalParentId: currentFolderId,
                trashedAt: new Date().toISOString()
            });
            localStorage.setItem('trash_items', JSON.stringify(trashItems));

            // Remove from current folder
            const folderContents = JSON.parse(localStorage.getItem(`folder_${currentFolderId}_contents`)) || [];
            const updatedContents = folderContents.filter(item => item.id !== itemId);
            localStorage.setItem(`folder_${currentFolderId}_contents`, JSON.stringify(updatedContents));

            // Refresh view
            loadFolderContents();
            selectedItem = null;
            
            showNotification(`"${itemName}" moved to Trash`);
        }
    }

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }

    // Update navigation buttons
    function updateNavigationButtons() {
        const backBtn = document.getElementById('folder-back-btn');
        const forwardBtn = document.getElementById('folder-forward-btn');
        
        if (backBtn && forwardBtn) {
            backBtn.disabled = currentHistoryIndex <= 0;
            forwardBtn.disabled = currentHistoryIndex >= navigationHistory.length - 1;
        }
    }

    // Context menu functions
    function showFolderItemContextMenu(e, item) {
        const menu = document.getElementById('folder-window-item-context-menu');
        if (menu) {
            const rect = folderMain.getBoundingClientRect();
            
            menu.style.left = (e.clientX - rect.left) + 'px';
            menu.style.top = (e.clientY - rect.top) + 'px';
            menu.classList.remove('hidden');
        }
    }

    function hideFolderContextMenus() {
        const contextMenu = document.getElementById('folder-window-context-menu');
        const itemContextMenu = document.getElementById('folder-window-item-context-menu');
        
        if (contextMenu) contextMenu.classList.add('hidden');
        if (itemContextMenu) itemContextMenu.classList.add('hidden');
    }

    // Window controls
    closeBtn.onclick = () => {
        folderWindow.classList.add('hidden');
    };

    minBtn.onclick = () => {
        folderWindow.classList.add('hidden');
    };

    maxBtn.onclick = () => {
        if (!isMaximized) {
            originalStyle = {
                width: folderWindow.style.width,
                height: folderWindow.style.height,
                top: folderWindow.style.top,
                left: folderWindow.style.left,
                zIndex: folderWindow.style.zIndex
            };
            folderWindow.style.top = '0px';
            folderWindow.style.left = '0px';
            folderWindow.style.width = '100vw';
            folderWindow.style.height = 'calc(100vh - 24px)';
            folderWindow.style.zIndex = '10001';
            isMaximized = true;
        } else {
            folderWindow.style.width = originalStyle.width || '800px';
            folderWindow.style.height = originalStyle.height || '500px';
            folderWindow.style.left = originalStyle.left || `${(window.innerWidth - 800) / 2}px`;
            folderWindow.style.top = originalStyle.top || `${(window.innerHeight - 500) / 2}px`;
            folderWindow.style.zIndex = originalStyle.zIndex || '2000';
            isMaximized = false;
        }
    };

    // Draggable window
    header.addEventListener('mousedown', function(e) {
        if (isMaximized) return;
        let shiftX = e.clientX - folderWindow.getBoundingClientRect().left;
        let shiftY = e.clientY - folderWindow.getBoundingClientRect().top;
        
        function moveAt(pageX, pageY) {
            folderWindow.style.left = pageX - shiftX + 'px';
            folderWindow.style.top = pageY - shiftY + 'px';
        }
        
        function onMouseMove(e) { moveAt(e.pageX, e.pageY); }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', function() {
            document.removeEventListener('mousemove', onMouseMove);
        }, { once: true });
    });

    // View controls
    document.querySelectorAll('.folder-view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.folder-view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            loadFolderContents();
        });
    });

    // Context menu event listeners
    const newFolderBtn = document.getElementById('folder-window-new-folder');
    const deleteBtn = document.getElementById('folder-window-item-delete');
    
    if (newFolderBtn) {
        newFolderBtn.addEventListener('click', () => {
            createNewFolderInFolder();
            hideFolderContextMenus();
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            moveItemToTrash();
            hideFolderContextMenus();
        });
    }

    // Context menu for empty space
    folderMain.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const clickedItem = e.target.closest('.folder-item');
        if (!clickedItem) {
            const menu = document.getElementById('folder-window-context-menu');
            if (menu) {
                const rect = folderMain.getBoundingClientRect();
                
                menu.style.left = (e.clientX - rect.left) + 'px';
                menu.style.top = (e.clientY - rect.top) + 'px';
                menu.classList.remove('hidden');
            }
        }
    });

    // Hide context menus on click
    folderMain.addEventListener('click', () => {
        hideFolderContextMenus();
        if (selectedItem) {
            selectedItem.classList.remove('selected');
            selectedItem = null;
        }
    });

    // Prevent context menu from showing outside folder window
    folderWindow.addEventListener('contextmenu', (e) => {
        e.stopPropagation();
    });
}
