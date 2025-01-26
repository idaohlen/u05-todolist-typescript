const ListPage = `
  <header class="app-header">
    <h1>Todo List</h1>
    <iconify-icon icon="fa6-solid:pen-nib" class="app-header__icon"></iconify-icon>
    <button id="settingsBtn" class="settings-btn" title="Settings">
      <iconify-icon icon="solar:settings-outline"></iconify-icon>
    </button>
  </header>

  <div class="new-todo">
    <form id="newTodoForm" class="new-todo__form">
      <button id="chooseCategoryBtn" class="btn btn--round">
        <iconify-icon id="newCategoryIcon" icon="solar:menu-dots-bold"></iconify-icon>
      </button>
      <input type="text" class="new-todo__input" id="todoInput" placeholder="Take the dog for a walk...">
      <input type="text" id="dueByInput" class="hidden-input">
      <button id="dueByBtn" class="new-todo__dueby-btn"><iconify-icon icon="solar:calendar-bold"></iconify-icon></button>
      <button id="addTodoBtn" class="new-todo__add-btn"><iconify-icon icon="solar:add-circle-bold"></iconify-icon></button>
    </form>
  </div>

  <div class="dueby-filters">
    <button class="btn btn--rounded btn--pastel filter-btn active-filter">All</button>
    <button class="btn btn--rounded btn--pastel filter-btn">Today</button>
    <button class="btn btn--rounded btn--pastel filter-btn">This week</button>
    <button class="btn btn--rounded btn--pastel filter-btn">This month</button>
    <button class="btn btn--rounded btn--pastel filter-btn">Overdue</button>
  </div>

  <div class="todos-container"></div>

  <div class="category-filters"></div>

  <dialog id="editTodoDialog" class="todo-dialog">
  <button id="cancelBtn" value="cancel" class="todo-dialog__cancel-btn">
    <iconify-icon icon="icon-park-outline:close-one" class="icon"></iconify-icon>
  </button>
    <form method="dialog">
      <h2 class="todo-dialog__heading">Edit todo</h2>
      <div class="todo-dialog__form-inputs">
        <button id="editTodoCategory" class="btn btn--round todo-dialog__edit-category-btn">
          <iconify-icon icon="solar:menu-dots-bold"></iconify-icon>
        </button>
        <input type="text" id="editTodoInput" class="todo-dialog__todo-input">
        <input type="text" id="editDueByInput" class="hidden-input">
        <button id="editDueByInputBtn" class="new-todo__dueby-btn edit-todo__dueby-btn">
          <iconify-icon icon="solar:calendar-bold"></iconify-icon>
        </button>
      </div>
      <div class="todo-dialog__actions">
        <button id="deleteTodoBtn" value="delete" class="btn btn--gray">Delete</button>
        <button id="saveTodoBtn" value="save" class="btn">Save</button>
      </div>
    </form>
  </dialog>

  <div id="categoryPopup" class="category-popup"></div>
`;

export default ListPage;