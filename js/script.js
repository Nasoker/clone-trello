const tasksColumns = document.querySelectorAll('.task-colum');
const body = document.querySelector('body');
const main = document.querySelector('main');
const addButton = document.querySelector('.task-add__item-buttons-add');
const modalWindowAddTask = document.querySelector('.modal-window-tasks');
const confirmButtonFromAddTask = modalWindowAddTask.querySelector('.modal-window__button-confirm');
const modalWindowAddTaskTitle = modalWindowAddTask.querySelector('.modal-window__content-input');
const modalWindowAddTaskDescription = modalWindowAddTask.querySelector('.modal-window__content-input-description');
const switchImgButtons = document.querySelectorAll('.background-row__list-item');
const deleteAllTasksButtons = document.querySelectorAll('.colum-tasks-delete');
const nickname = document.querySelector('.header-rightside__user-name');
const settingsButton = document.querySelector('.header-rightside__settings-button');
const modalWindowSettings = document.querySelector('.modal-window-settings');
let draggedTask = null;
let targetColumn = null;
let imgSrc = null;
let idCounter = 0;

const savedTasks = {
    column1 : {},
    column2 : {},
    column3 : {},
}

tasksColumns.forEach((tasksColumn) => {
    tasksColumn.addEventListener('dragenter', handlerDragEnter);
    tasksColumn.addEventListener('dragover', handlerDragOver);
    tasksColumn.addEventListener('drop', handlerDrop);
});

deleteAllTasksButtons.forEach((btn)=>{

    btn.addEventListener('click',()=>{
        const modalWindowConfirm = document.querySelector('.modal-window-confirm');
        const modalWindowConfirmTitle = modalWindowConfirm.querySelector('.modal-window__header-title');
        const modalWindowConfirmDescription = modalWindowConfirm.querySelector('.modal-window__content-description');
        const modalWindowConfirmButton = modalWindowConfirm.querySelector('.modal-window__button-confirm');
        const h2 = btn.parentElement;
        const targetColumn = h2.parentElement;
        const targetTasks = targetColumn.querySelectorAll('.task-list__item');

        modalWindowOn(modalWindowConfirm);
        closeChecking(modalWindowConfirm);

        modalWindowConfirmTitle.innerText = 'Are you sure you want to delete all tasks at this column?';
        modalWindowConfirmDescription.innerText = 'If you click Confrim button - all tasks at this column will be deleted, but if you click at Cancel button -  all tasks at this column will not be deleted ';
        
        modalWindowConfirmButton.addEventListener('click', () => {
            targetTasks.forEach((task)=>{
                task.remove();
                const returnedInfo = infoFromSavedTasks(targetColumn,task);
                const targetColumnClass = returnedInfo[2];
                savedTasks[targetColumnClass] = [];
            });
            counterTasks();
            modalWindowOff(modalWindowConfirm);
        });
    });
});

addButton.addEventListener('click', () => {
    const countTasksFromFirstColumn = Object.keys(savedTasks.column1).length;
    if(countTasksFromFirstColumn >= 6){
        return modalWindowAlert('You have maximum tasks at this column! Delete some tasks at this column!');
    } 
    modalWindowOn(modalWindowAddTask);
    closeChecking(modalWindowAddTask);
});

confirmButtonFromAddTask.addEventListener('click', () => {
    if (!modalWindowAddTaskTitle.value && !modalWindowAddTaskDescription.value) {
        return modalWindowAlert('You have an empty title or description! Check it!');
    }else if(modalWindowAddTaskTitle.value && !modalWindowAddTaskDescription.value){
        return modalWindowAlert('You have an empty description! Check it!');
    }else if(!modalWindowAddTaskTitle.value && modalWindowAddTaskDescription.value){
        return modalWindowAlert('You have an empty title or description! Check it!');
    }else {
        addTask();
        modalWindowOff(modalWindowAddTask);
        modalWindowAddTaskTitle.value = '';
        modalWindowAddTaskDescription.value = '';
    }
});

switchImgButtons.forEach((imgButton)=>{
    imgButton.addEventListener('click',()=>{
        imgSrc = setBackgroundImage(imgButton);
    });
})

settingsButton.addEventListener(('click'),()=>{
    modalWindowOn(modalWindowSettings);
    closeChecking(modalWindowSettings);
    const modalWindowConfrim = modalWindowSettings.querySelector('.modal-window__button-confirm');
    const modalWindowInputNick = modalWindowSettings.querySelector('.modal-window__content-input');
    const musicRadioButtons = modalWindowSettings.querySelectorAll('.modal-window__sound-row-button-radio');
    const changeVolumeInput = modalWindowSettings.querySelector('.modal-window__change__volume-input');

    modalWindowConfrim.addEventListener(('click'),()=>{

        if (modalWindowInputNick.value !== ''){
            nickname.innerText = modalWindowInputNick.value;
        }
        
        musicRadioButtons.forEach((radioButton)=>{
            const musicElement = document.querySelector('audio');
            if (!radioButton.checked) {
                return
            }
            if (radioButton.classList.contains('soundOn') && !musicElement) {
                const number = changeVolumeInput.value / 100;
                playMusic(number);
                return;
            }
            if(radioButton.classList.contains('soundOff') && musicElement) {
                musicElement.remove();
            }
        });

        changeVolumeInput.addEventListener(('change'),()=>{
            const number = changeVolumeInput.value / 100;
            changeVolume(number);
        });
        modalWindowOff(modalWindowSettings);
        modalWindowInputNick.value = '';
    });
});

window.addEventListener('unload', () => {
	localStorage.setItem('tasks', JSON.stringify(savedTasks));
    const savedNickname = nickname.innerText;
    if(savedNickname === ''){
        return
    }else{
        localStorage.setItem('nickname', JSON.stringify(savedNickname));
    }
    
    if(!imgSrc){
    }else{
        localStorage.setItem('background', JSON.stringify(imgSrc));
    }

});

window.addEventListener('load', () => {
	const tasksJson = localStorage.getItem('tasks');
	const objectWithColumns = JSON.parse(tasksJson);

    const nicknameJson = localStorage.getItem('nickname');
    const savedNickname = JSON.parse(nicknameJson);

    const backgroundJson = localStorage.getItem('background');
    const savedBackground = JSON.parse(backgroundJson);
    if(!savedBackground){
        main.style.backgroundImage = "url(./img/city.jpg)";
    }else{
        main.style.backgroundImage = "url("+savedBackground+")";
    }

    const arrayTasksFromFirstColumn = Object.values(objectWithColumns.column1);
    const arrayTasksFromSecondColumn = Object.values(objectWithColumns.column2);
    const arrayTasksFromThirdColumn = Object.values(objectWithColumns.column3);

    arrayTasksFromFirstColumn.forEach((arrayTask)=>{
        addTaskFromLocalStorage(arrayTask[0],arrayTask[1],arrayTask[2],'column1');
    });

    arrayTasksFromSecondColumn.forEach((arrayTask)=>{
        addTaskFromLocalStorage(arrayTask[0],arrayTask[1],arrayTask[2],'column2');
    });

    arrayTasksFromThirdColumn.forEach((arrayTask)=>{
        addTaskFromLocalStorage(arrayTask[0],arrayTask[1],arrayTask[2],'column3');
    });
    counterTasks();
    
    if (nickname.innerText === '' && savedNickname === null){
        const welcomeWindow = document.querySelector('.modal-window-login');
        const welcomeWindowInput = welcomeWindow.querySelector('.modal-window__content-input');
        const welcomeWindowConfirmButton = welcomeWindow.querySelector('.modal-window__button-confirm');
        const musicRadioButtons = welcomeWindow.querySelectorAll('.modal-window__sound-row-button-radio');

        modalWindowOn(welcomeWindow);
        closeChecking(welcomeWindow);
        welcomeWindowConfirmButton.addEventListener('click',()=>{
            if (!welcomeWindowInput){
                modalWindowAlert('You have an empty nickname! Check it!')
            }
            nickname.innerText =  welcomeWindowInput.value;
            musicRadioButtons.forEach((radioButton)=>{
                if (radioButton.checked && radioButton.classList.contains('soundOn')){
                    playMusic()
                }else if (radioButton.checked && radioButton.classList.contains('soundOff')){
                    return
                }
            });
            modalWindowOff(welcomeWindow);
         });
        }else{
            nickname.innerText = savedNickname;
        } 
});

function handlerDragStart(event) {
    draggedTask = this;
    const taskList = draggedTask.parentElement;
    targetColumn = taskList.parentElement;
    draggedTask.classList.add('task-list__item-active');
}

function handlerDragEnd(event) {
    this.classList.remove('task-list__item-active');
}

function handlerDragEnter(event) {
    event.preventDefault();
}

function handlerDragOver(event) {
    event.preventDefault();
}

function handlerDrop(event) {
    const tasksColumn = this;
    const taskList = tasksColumn.querySelector('.task-list');
    const counter = tasksColumn.querySelector('.task-colum__counter');
    let targetColumnClass = tasksColumn.className;
    targetColumnClass = targetColumnClass.slice(11,18);
    const columnLength = Object.keys(savedTasks[targetColumnClass]).length;
    if(columnLength >= 6){
        return modalWindowAlert('You have maximum tasks at this column! Delete some tasks at this column!');
    } 
    const returnedFromFunction = deleteTaskFromSavedTasks(targetColumn,draggedTask);
    const draggedTaskId = returnedFromFunction[0];
    const savedTask = returnedFromFunction[1];

    if (taskList.parentElement.classList.contains('column1')) {
        draggedTask.style.backgroundColor = '#FFEEE7';
        savedTasks.column1[draggedTaskId] = savedTask;
    } else if (taskList.parentElement.classList.contains('column2')) {
        draggedTask.style.backgroundColor = '#FFFFEC';
        savedTasks.column2[draggedTaskId] = savedTask;
    } else if (taskList.parentElement.classList.contains('column3')) {
        savedTasks.column3[draggedTaskId] = savedTask;
        draggedTask.style.backgroundColor = '#F5FCF1';
        draggedTask.removeAttribute('draggable');
        const imgDraggedTask = draggedTask.querySelector('.list-item__task-info-img-avatar');
        imgDraggedTask.setAttribute('draggable','false');
    }

    taskList.append(draggedTask);
    counterTasks();
}

function closeChecking(modalWindow){
    const headerButton = modalWindow.querySelector('.modal-window__header-button');
    const closeButton = modalWindow.querySelector('.modal-window__button-cancel');

    headerButton.addEventListener('click',()=>{
        modalWindowOff(modalWindow)
    });

    closeButton.addEventListener('click',()=>{
        modalWindowOff(modalWindow)
    });
    modalWindowAddTaskTitle.value = '';
    modalWindowAddTaskDescription.value = '';
}

function modalWindowOff(modalWindow) {
    modalWindow.classList.add('hidden');
    body.classList.remove('stop-scrolling');
}

function modalWindowOn(modalWindow) {
    modalWindow.classList.remove('hidden');
    body.classList.add('stop-scrolling');
}

function deleteTaskFromSavedTasks(column,targetTask){
    let targetColumnClass = column.className;
    targetColumnClass = targetColumnClass.slice(11,18);
    let taskId = targetTask.className;
    taskId = taskId.slice(28,29);
    const savedTask = savedTasks[targetColumnClass][taskId];
    delete savedTasks[targetColumnClass][taskId];
    return [taskId, savedTask, targetColumnClass]
}

function infoFromSavedTasks(column,targetTask){
    let targetColumnClass = column.className;
    targetColumnClass = targetColumnClass.slice(11,18);
    let taskId = targetTask.className;
    taskId = taskId.slice(28,29);
    const savedTask = savedTasks[targetColumnClass][taskId];
    return [taskId, savedTask, targetColumnClass]
}

function createElement(elementName,elementClasses){
    const element = document.createElement(elementName);
    const classes = elementClasses;
    classes.forEach((e)=>{
        element.classList.add(e);
    });
    return element
}

function addButtons() {
    const buttonsParent = createElement('div',['task-list__item-buttons']);
    const buttonDelete = createElement('button',['task-list__item-buttons-delete']);
    const buttonDeleteImg = createElement('i',['far', 'fa-times-circle', 'task-list__item-buttons-delete-icon']);
    const buttonEdit = createElement('button',['task-list__item-buttons-edit']);
    const buttonEditImg = createElement('i',['far', 'fa-edit', 'task-list__item-buttons-edit-icon']);

    let targetTask = null;

    buttonDelete.addEventListener('click', () => {
        const modalWindowConfirm = document.querySelector('.modal-window-confirm');
        const modalWindowConfirmTitle = modalWindowConfirm.querySelector('.modal-window__header-title');
        const modalWindowConfirmDescription = modalWindowConfirm.querySelector('.modal-window__content-description');
        const modalWindowConfirmButton = modalWindowConfirm.querySelector('.modal-window__button-confirm');
        targetTask = buttonsParent.parentElement;
        const taskList = targetTask.parentElement;
        const column = taskList.parentElement;

        modalWindowOn(modalWindowConfirm);
        closeChecking(modalWindowConfirm);

        modalWindowConfirmTitle.innerText = 'Are you sure you want to delete this task?';
        modalWindowConfirmDescription.innerText = 'If you click Confrim button - task will be deleted, but if you click at Cancel button - task will not be deleted ';

        modalWindowConfirmButton.addEventListener('click', () => {
            targetTask.remove();
            modalWindowOff(modalWindowConfirm);
            deleteTaskFromSavedTasks(column,targetTask);
            counterTasks();
        });
    });

    buttonEdit.addEventListener('click',() => {
        const modalWindowEdit = document.querySelector('.modal-window-edit');
        const modalWindowEditTitle = modalWindowEdit.querySelector('.modal-window__content-input');
        const modalWindowEditDescription = modalWindowEdit.querySelector('.modal-window__content-input-description');
        const modalWindowEditButtonConfirm = modalWindowEdit.querySelector('.modal-window__button-confirm');
        modalWindowOn(modalWindowEdit);
        closeChecking(modalWindowEdit);

        targetTask = buttonsParent.parentElement;
        const taskList = targetTask.parentElement;
        const column = taskList.parentElement;

        const titleFromTask = targetTask.querySelector('.list-item__task-info-title');
        const descriptionFromTask = targetTask.querySelector('.task-list__item-text');
        const dateFromTask = targetTask.querySelector('.list-item__task-info-date').innerText;
        modalWindowEditTitle.value = titleFromTask.innerText;
        modalWindowEditDescription.value = descriptionFromTask.innerText;
    
        modalWindowEditButtonConfirm.addEventListener('click', () => {
            if (!modalWindowEditTitle.value && !modalWindowEditDescription.value) {
                return modalWindowAlert('You have an empty title or description! Check it!');
            }else if(modalWindowEditTitle.value && !modalWindowEditDescription.value){
                return modalWindowAlert('You have an empty description! Check it!');
            }else if(!modalWindowEditTitle.value && modalWindowEditDescription.value){
                return modalWindowAlert('You have an empty title or description! Check it!');
            }else {
            const returnedInfoFromFunction = infoFromSavedTasks(column,targetTask);
            const taskId = returnedInfoFromFunction[0];
            const columnClass = returnedInfoFromFunction[2];
            savedTasks[columnClass][taskId].splice(0,2);
            savedTasks[columnClass][taskId] = [modalWindowEditTitle.value,modalWindowEditDescription.value, dateFromTask];
            titleFromTask.innerText = modalWindowEditTitle.value;
            descriptionFromTask.innerText = modalWindowEditDescription.value;
            modalWindowOff(modalWindowEdit);
            }
        });
    });

    buttonDelete.append(buttonDeleteImg);
    buttonEdit.append(buttonEditImg);
    buttonsParent.append(buttonDelete,buttonEdit);
    
    return buttonsParent
}

function createInfoAboutTask(title, date) {

    const infoAboutTask = createElement('div',['list-item__task-info']);
    const taskImg = createElement('div',['list-item__task-info-img']);
    const taskAvatar = createElement('img',['list-item__task-info-img-avatar']);
    const taskTitle = createElement('div',['list-item__task-info-title']);
    const taskDate = createElement('div',['list-item__task-info-date']);

    taskAvatar.src = 'img/avatar.jpg';
    taskTitle.innerText = title;
    taskDate.innerText = date;
    taskImg.append(taskAvatar);
    infoAboutTask.append(taskImg, taskTitle, taskDate);

    return infoAboutTask
}

function getDate() {
    const date = new Date();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const year = date.getFullYear();

    return day + '.' + month + '.' + year
}

function addTask() {
    const title = modalWindowAddTaskTitle.value;
    const description = modalWindowAddTaskDescription.value;
    const date = getDate();
    const taskList = document.querySelector('.column1').querySelector('.task-list');
    idCounter+=1;
    const task = createElement('li',['task-list__item', 'list-item', 'id'+idCounter]);
    const taskText = createElement('p',['task-list__item-text']);
    const buttons = addButtons();
    const info = createInfoAboutTask(title, date);

    task.style.backgroundColor = '#FFEEE7';
    task.setAttribute('draggable', 'true');
    taskText.innerText = description;
    task.append(info,taskText,buttons);

    task.addEventListener('dragstart', handlerDragStart);
    task.addEventListener('dragend', handlerDragEnd);
    savedTasks.column1[idCounter] = [title,description,date]
    taskList.append(task);
    counterTasks();
}

function addTaskFromLocalStorage(title, description, date, chooseColumn){
    const column = '.'+chooseColumn;
    const columnNode = document.querySelector(column);
    const taskList = columnNode.querySelector('.task-list');
    idCounter+=1;
    const task = createElement('li',['task-list__item', 'list-item','id'+idCounter]);
    const taskText = createElement('p',['task-list__item-text']);
    const buttons = addButtons();
    const info = createInfoAboutTask(title, date);

    task.setAttribute('draggable', 'true');
    taskText.innerText = description;
    task.append(info,taskText,buttons);

    task.addEventListener('dragstart', handlerDragStart);
    task.addEventListener('dragend', handlerDragEnd);
    
    if (columnNode.classList.contains('column1')) {
        task.style.backgroundColor = '#FFEEE7';
        savedTasks.column1[idCounter] = [title,description,date];
    } else if (taskList.parentElement.classList.contains('column2')) {
        task.style.backgroundColor = '#FFFFEC';
        savedTasks.column2[idCounter] = [title,description,date];
    } else if (taskList.parentElement.classList.contains('column3')) {
        task.style.backgroundColor = '#F5FCF1';
        savedTasks.column3[idCounter] = [title,description,date];
        task.removeAttribute('draggable');
        const imgDraggedTask = task.querySelector('.list-item__task-info-img-avatar');
        imgDraggedTask.setAttribute('draggable','false');
    }

    taskList.append(task);
    return task;
}

function setBackgroundImage(imgButton){
    const main = document.querySelector('main');
    const img = imgButton.querySelector('.background-row__list-item-button-img');
    const imgSrc = img.getAttribute('src');
    main.style.backgroundImage = "url("+imgSrc+")";
    return imgSrc
}

function counterTasks(){
    const counters = document.querySelectorAll('.task-colum__counter');
    counters.forEach((counter)=>{
        const h2 = counter.parentElement;
        const column = h2.parentElement;
        if(column.classList.contains('column1')){
            counter.innerText = Object.keys(savedTasks.column1).length+'/6 tasks'
        }else if(column.classList.contains('column2')){
            counter.innerText = Object.keys(savedTasks.column2).length+'/6 tasks'
        }else if(column.classList.contains('column3')){
            counter.innerText = Object.keys(savedTasks.column3).length+'/6 tasks'
        }
    });
}

function playMusic(volumeNumber){
    let musicElement = document.createElement('audio');
    musicElement.src = './music/chillMusic.mp3'
    musicElement.style.display = 'none';
    if(volumeNumber){
        musicElement.volume = volumeNumber
    }
    body.append(musicElement);
    musicElement.addEventListener("canplaythrough", event => {
        musicElement.play();
      });
}

function changeVolume(number){
    const musicElement = document.querySelector('audio');
    musicElement.volume = number.toString();
}

function modalWindowAlert(text){
    const modalWindow = document.querySelector('.modal-window-alert');
    const modalWindowConfirm = modalWindow.querySelector('.modal-window__button-confirm');
    const modalWindowClose = modalWindow.querySelector('.modal-window__header-button');
    const modalWindowText = modalWindow.querySelector('.modal-window__content-description');
    modalWindowText.innerText = text;
    modalWindowOn(modalWindow);

    modalWindowClose.addEventListener(('click'),()=>{
        modalWindowOff(modalWindow);
    });

    modalWindowConfirm.addEventListener(('click'),()=>{
        modalWindowOff(modalWindow);
    });
}