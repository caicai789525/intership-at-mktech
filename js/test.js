const todoInput = document.querySelector('#todo-input');
const addBtn = document.querySelector('#add-btn');
const todoList = document.querySelector('#todo-list');
const todoCount = document.querySelector('#todo-count');

// 从本地存储加载待办事项
function loadTodos() {
    try {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.forEach(todo => {
            createTodoItem(todo.text, todo.completed);
        });
        // 加载完成后更新待办事项数量
        updateTodoCount();
    } catch (error) {
        console.error('加载待办事项时出错:', error);
        localStorage.removeItem('todos'); // 清除错误数据
    }
}

// 创建待办事项元素
function createTodoItem(text, completed = false) {
    const todoItem = document.createElement('li');
    todoItem.innerHTML = `
        <input type="checkbox" ${completed ? 'checked' : ''}>
        <span ${completed ? 'style="text-decoration: line-through;"' : ''}>${text}</span>
        <button class="delete-btn">删除</button>
    `;
    if (todoList) {
        todoList.appendChild(todoItem);
    } else {
        console.error('未找到待办事项列表元素');
    }
}

// 添加待办事项
function addTodo() {
    const text = todoInput.value.trim();
    if (text) {
        createTodoItem(text);
        saveTodos();
        todoInput.value = '';
        // 添加后更新待办事项数量
        updateTodoCount();
    }
}

// 保存待办事项到本地存储
function saveTodos() {
    const todos = [];
    todoList.querySelectorAll('li').forEach(item => {
        const text = item.querySelector('span').textContent;
        const completed = item.querySelector('input').checked;
        todos.push({ text, completed });
    });
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 事件委托处理列表项操作
todoList.addEventListener('click', function(e) {
    const todoItem = e.target.closest('li');
    if (!todoItem) return;

    if (e.target.matches('input[type="checkbox"]')) {
        const span = todoItem.querySelector('span');
        span.style.textDecoration = e.target.checked ? 'line-through' : 'none';
        saveTodos();
    } else if (e.target.matches('.delete-btn')) {
        todoItem.remove();
        saveTodos();
        // 删除后更新待办事项数量
        updateTodoCount();
    }
});

// 绑定添加按钮点击事件
if (addBtn) {
    addBtn.addEventListener('click', addTodo);
} else {
    console.error('未找到添加按钮元素');
}

// 绑定输入框回车事件
if (todoInput) {
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
} else {
    console.error('未找到输入框元素');
}

// 更新待办事项数量
function updateTodoCount() {
    const count = todoList.querySelectorAll('li').length;
    todoCount.textContent = `当前待办事项数量: ${count}`;
}

// 页面加载时加载待办事项
window.addEventListener('load', loadTodos);
