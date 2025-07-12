export function initNotes() {
  const notesWindow = document.getElementById('notes-window');
  registerWindow(notesWindow);
  const notesSidebar = document.getElementById('notes-list');
  const notesEditor = document.getElementById('notes-editor');
  const addNoteBtn = document.getElementById('add-note-btn');
  const notesCloseBtn = notesWindow.querySelector('.close-btn');
  const notesMinBtn = notesWindow.querySelector('.min-btn');
  const notesMaxBtn = notesWindow.querySelector('.max-btn');
  const notesHeader = notesWindow.querySelector('.window-header');

  let notes = JSON.parse(localStorage.getItem('notes-data') || '[]');
  let selectedNoteId = null;
  let isNotesMaximized = false;
  let notesOriginalStyle = {};

  // NEW: State management functions
  function saveNotesState() {
    const notesState = {
      isOpen: !notesWindow.classList.contains('hidden'),
      width: notesWindow.style.width,
      height: notesWindow.style.height,
      left: notesWindow.style.left,
      top: notesWindow.style.top,
      isMaximized: isNotesMaximized,
      selectedNoteId: selectedNoteId,
      editorContent: notesEditor.value
    };
    localStorage.setItem('notesState', JSON.stringify(notesState));
  }

  function restoreNotesState() {
    const notesState = JSON.parse(localStorage.getItem('notesState')) || {};
    
    if (notesState.isOpen) {
      notesWindow.classList.remove('hidden');
      notesWindow.style.width = notesState.width || '800px';
      notesWindow.style.height = notesState.height || '600px';
      notesWindow.style.left = notesState.left || `${(window.innerWidth - 800) / 2}px`;
      notesWindow.style.top = notesState.top || `${(window.innerHeight - 600) / 2}px`;
      bringWindowToFront(notesWindow);
      
      isNotesMaximized = notesState.isMaximized || false;
      selectedNoteId = notesState.selectedNoteId || null;
      
      renderNotesList();
      
      // Restore selected note and editor content
      if (selectedNoteId && notes.find(n => n.id === selectedNoteId)) {
        selectNote(selectedNoteId);
      } else if (notes.length > 0) {
        selectNote(notes[0].id);
      } else {
        notesEditor.value = '';
      }
      
      // Restore editor content if it exists
      if (notesState.editorContent !== undefined) {
        notesEditor.value = notesState.editorContent;
      }
    }
  }

  function renderNotesList() {
    notesSidebar.innerHTML = '';
    notes.forEach(note => {
      const li = document.createElement('li');
      li.textContent = note.title || 'Untitled';
      if (note.id === selectedNoteId) li.classList.add('selected');
      li.onclick = () => selectNote(note.id);
      notesSidebar.appendChild(li);
    });
  }

  function selectNote(id) {
    selectedNoteId = id;
    const note = notes.find(n => n.id === id);
    notesEditor.value = note ? note.content : '';
    renderNotesList();
    saveNotesState(); 
  }

  function saveNotes() {
    localStorage.setItem('notes-data', JSON.stringify(notes));
  }

  // Add new note with state saving
  addNoteBtn.onclick = () => {
    const newNote = { id: Date.now(), title: 'New Note', content: '' };
    notes.unshift(newNote);
    saveNotes();
    selectNote(newNote.id);
    saveNotesState();
  };

  // Auto-save when typing with state saving
  notesEditor.oninput = () => {
    const note = notes.find(n => n.id === selectedNoteId);
    if (note) {
      note.content = notesEditor.value;
      // Use first line as title for sidebar
      note.title = notesEditor.value.split('\n')[0] || 'Untitled';
      saveNotes();
      renderNotesList();
    }
    saveNotesState(); 
  };

  //Open Notes window with state saving
  function openNotesWindow() {
    notesWindow.classList.remove('hidden');
    notesWindow.style.width = '800px';
    notesWindow.style.height = '600px';
    notesWindow.style.left = `${(window.innerWidth - 800) / 2}px`;
    notesWindow.style.top = `${(window.innerHeight - 600) / 2}px`;
    bringWindowToFront(notesWindow);
    
    renderNotesList();
    if (notes.length > 0) {
      selectNote(notes[0].id);
    } else {
      notesEditor.value = '';
    }
    
    saveNotesState();
  }

  // Click Notes icon to open
  document.getElementById('notes-icon').onclick = () => {
    if (notesWindow.classList.contains('hidden')) {
      openNotesWindow();
    } else {
      // If already open, just bring to front
      bringWindowToFront(notesWindow);
    }
  };

  //Close button with state saving
  notesCloseBtn.onclick = () => {
    notesWindow.classList.add('hidden');
    notesEditor.value = '';
    selectedNoteId = null;
    saveNotesState();
  };

  // Minimize button with state saving
  notesMinBtn.onclick = () => {
    notesWindow.classList.add('hidden');
    saveNotesState();
  };

  // Maximize/Restore button with state saving
  notesMaxBtn.onclick = () => {
    if (!isNotesMaximized) {
      notesOriginalStyle = {
        width: notesWindow.style.width,
        height: notesWindow.style.height,
        top: notesWindow.style.top,
        left: notesWindow.style.left,
        zIndex: notesWindow.style.zIndex
      };
      notesWindow.style.top = '24px';
      notesWindow.style.left = '0px';
      notesWindow.style.width = '100vw';
      notesWindow.style.height = 'calc(100vh - 24px)';
      notesWindow.style.zIndex = '10001';
      isNotesMaximized = true;
    } else {
      notesWindow.style.width = notesOriginalStyle.width || '800px';
      notesWindow.style.height = notesOriginalStyle.height || '600px';
      notesWindow.style.left = notesOriginalStyle.left || `${(window.innerWidth - 800) / 2}px`;
      notesWindow.style.top = notesOriginalStyle.top || `${(window.innerHeight - 600) / 2}px`;
      // Ensure z-index is always above menu bar when restoring
      notesWindow.style.zIndex = Math.max(parseInt(notesOriginalStyle.zIndex) || 2000, 10001);
      isNotesMaximized = false;
    }
    saveNotesState();
  };


  //Draggable header with state saving
  notesHeader.addEventListener('mousedown', function (e) {
    if (isNotesMaximized) return;
    let shiftX = e.clientX - notesWindow.getBoundingClientRect().left;
    let shiftY = e.clientY - notesWindow.getBoundingClientRect().top;
    
    function moveAt(pageX, pageY) {
      notesWindow.style.left = pageX - shiftX + 'px';
      notesWindow.style.top = pageY - shiftY + 'px';
    }
    
    function onMouseMove(e) { moveAt(e.pageX, e.pageY); }
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', function () {
      document.removeEventListener('mousemove', onMouseMove);
      saveNotesState(); // Save state after dragging
    }, { once: true });
  });

  //Auto-save state periodically
  function autoSaveState() {
    setInterval(() => {
      if (!notesWindow.classList.contains('hidden')) {
        saveNotesState();
      }
    }, 3000); // Save every 3 seconds if notes is open
  }

  //Initialize everything and restore state
  function initialize() {
    renderNotesList();
    if (notes.length > 0) selectNote(notes[0].id);
    restoreNotesState();
    autoSaveState();
  }

  // Initialize the notes app
  initialize();
}
