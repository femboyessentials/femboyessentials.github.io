document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const authContainer = document.getElementById('auth-container');
    const mainApp = document.getElementById('main-app');
    const loginView = document.getElementById('login-view');
    const signupView = document.getElementById('signup-view');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const logoutBtn = document.getElementById('logout-btn');
    const usernameDisplay = document.getElementById('username-display');
    const serversList = document.querySelector('.servers-list');
    const serverNameDisplay = document.getElementById('server-name');
    const channelsList = document.getElementById('channels-list');
    const channelNameDisplay = document.getElementById('channel-name');
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const addServerBtn = document.getElementById('add-server-btn');
    const addServerModal = document.getElementById('add-server-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addServerForm = document.getElementById('add-server-form');
    
    // App State
    let state = {
        users: [],
        servers: [],
        currentUser: null,
        currentServerId: null,
        currentChannelId: null,
    };

    // Utility Functions
    const saveState = () => {
        localStorage.setItem('chatsphere_state', JSON.stringify(state));
    };

    const loadState = () => {
        const savedState = localStorage.getItem('chatsphere_state');
        if (savedState) {
            state = JSON.parse(savedState);
        } else {
            // Initialize with some default data if no state is saved
            state.users.push({ id: 1, username: 'admin', password: 'password' });
            state.servers.push({
                id: 1,
                name: "Welcome Sphere",
                ownerId: 1,
                iconUrl: 'default-server-icon.png',
                channels: [
                    { id: 1, name: 'general', messages: [{ userId: 1, username: 'admin', content: 'Welcome to ChatSphere!' }] },
                    { id: 2, name: 'introductions', messages: [] }
                ]
            });
            saveState();
        }
    };

    const generateId = () => Date.now();

    // Rendering Functions
    const render = () => {
        if (state.currentUser) {
            authContainer.classList.add('hidden');
            mainApp.style.display = 'flex';
            usernameDisplay.textContent = state.currentUser.username;
            renderServers();
            renderChannels();
            renderMessages();
        } else {
            authContainer.classList.remove('hidden');
            mainApp.style.display = 'none';
        }
    };

    const renderServers = () => {
        serversList.innerHTML = ''; // Clear existing servers
        state.servers.forEach(server => {
            const serverIcon = document.createElement('div');
            serverIcon.className = 'server-icon';
            if (server.id === state.currentServerId) {
                serverIcon.classList.add('active');
            }
            serverIcon.dataset.serverId = server.id;
            
            const img = document.createElement('img');
            img.src = server.iconUrl || 'default-server-icon.png';
            img.alt = server.name;
            serverIcon.appendChild(img);
            
            serverIcon.addEventListener('click', () => selectServer(server.id));
            serversList.insertBefore(serverIcon, addServerBtn);
        });
    };

    const renderChannels = () => {
        channelsList.innerHTML = '';
        const currentServer = state.servers.find(s => s.id === state.currentServerId);
        if (currentServer) {
            serverNameDisplay.textContent = currentServer.name;
            currentServer.channels.forEach(channel => {
                const channelEl = document.createElement('div');
                channelEl.className = 'channel';
                if (channel.id === state.currentChannelId) {
                    channelEl.classList.add('active');
                }
                channelEl.dataset.channelId = channel.id;
                channelEl.textContent = channel.name;
                channelEl.addEventListener('click', () => selectChannel(channel.id));
                channelsList.appendChild(channelEl);
            });
        } else {
            serverNameDisplay.textContent = 'Select a Sphere';
        }
    };
    
    const renderMessages = () => {
        messagesContainer.innerHTML = '';
        const currentServer = state.servers.find(s => s.id === state.currentServerId);
        if (currentServer) {
            const currentChannel = currentServer.channels.find(c => c.id === state.currentChannelId);
            if (currentChannel) {
                channelNameDisplay.textContent = currentChannel.name;
                messageInput.placeholder = `Message #${currentChannel.name}`;
                currentChannel.messages.forEach(msg => {
                    const messageEl = document.createElement('div');
                    messageEl.className = 'message';
                    messageEl.innerHTML = `
                        <img src="default-user-icon.png" alt="avatar" class="avatar">
                        <div class="message-content">
                            <span class="username">${msg.username}</span>
                            <div class="text">${msg.content}</div>
                        </div>
                    `;
                    messagesContainer.appendChild(messageEl);
                });
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            } else {
                channelNameDisplay.textContent = '';
                messageInput.placeholder = 'Select a channel';
            }
        } else {
            channelNameDisplay.textContent = '';
            messageInput.placeholder = '';
        }
    };

    // State Changers / Actions
    const selectServer = (serverId) => {
        state.currentServerId = serverId;
        const server = state.servers.find(s => s.id === serverId);
        if (server && server.channels.length > 0) {
            state.currentChannelId = server.channels[0].id;
        } else {
            state.currentChannelId = null;
        }
        saveState();
        render();
    };

    const selectChannel = (channelId) => {
        state.currentChannelId = channelId;
        saveState();
        render();
    };

    // Auth Logic
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.classList.add('hidden');
        signupView.classList.remove('hidden');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;

        if (state.users.find(u => u.username === username)) {
            alert('Username already exists!');
            return;
        }

        const newUser = { id: generateId(), username, password };
        state.users.push(newUser);
        state.currentUser = { id: newUser.id, username: newUser.username };
        saveState();
        render();
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const user = state.users.find(u => u.username === username && u.password === password);
        if (user) {
            state.currentUser = { id: user.id, username: user.username };
            saveState();
            render();
        } else {
            alert('Invalid username or password');
        }
    });

    logoutBtn.addEventListener('click', () => {
        state.currentUser = null;
        state.currentServerId = null;
        state.currentChannelId = null;
        saveState();
        render();
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && messageInput.value.trim() !== '') {
            const server = state.servers.find(s => s.id === state.currentServerId);
            const channel = server?.channels.find(c => c.id === state.currentChannelId);
            if (channel) {
                channel.messages.push({
                    userId: state.currentUser.id,
                    username: state.currentUser.username,
                    content: messageInput.value.trim()
                });
                messageInput.value = '';
                saveState();
                renderMessages();
            }
        }
    });

    // Modal Logic
    addServerBtn.addEventListener('click', () => {
        addServerModal.classList.remove('hidden');
    });
    closeModalBtn.addEventListener('click', () => {
        addServerModal.classList.add('hidden');
    });
    addServerModal.addEventListener('click', (e) => {
        if(e.target === addServerModal) {
            addServerModal.classList.add('hidden');
        }
    });

    addServerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const serverName = document.getElementById('new-server-name').value;
        if (!serverName.trim()) return;

        const newServer = {
            id: generateId(),
            name: serverName,
            ownerId: state.currentUser.id,
            iconUrl: 'default-server-icon.png',
            channels: [
                { id: generateId(), name: 'general', messages: [] },
                { id: generateId(), name: 'random', messages: [] }
            ]
        };
        state.servers.push(newServer);
        selectServer(newServer.id);
        saveState();
        render();
        addServerModal.classList.add('hidden');
        addServerForm.reset();
    });

    // Initial Load
    loadState();
    render();
});

