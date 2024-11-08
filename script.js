const apiUrl = 'https://672dd967fd8979715643f2bd.mockapi.io/api/users/users';
let currentUserId = null;

// Fetch and display users
function fetchUsers() {
  fetch(apiUrl)
    .then(response => response.json())
    .then(users => {
      const usersList = document.getElementById('users-list');
      usersList.innerHTML = '';
      users.forEach(user => {
        usersList.innerHTML += `
          <div class="user-item" id="user-${user.id}">
            <span>${user.name}</span>
            <div>
              <button onclick="editUser(${user.id}, '${user.name}')">Edit</button>
              <button onclick="deleteUser(${user.id})">Delete</button>
            </div>
          </div>
        `;
      });
    })
    .catch(error => console.error('Error fetching users:', error));
}

// Create a new user
function createUser() {
  const nameInput = document.getElementById('name');
  const userName = nameInput.value.trim();
  if (!userName) return alert('Please enter a name.');

  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: userName })
  })
    .then(response => response.json())
    .then(() => {
      nameInput.value = '';
      fetchUsers();
      alert('User added successfully!');
    })
    .catch(error => console.error('Error creating user:', error));
}

// Edit an existing user (prefill form)
function editUser(id, name) {
  document.getElementById('name').value = name;
  currentUserId = id;
  document.getElementById('update-button').style.display = 'inline';
}

// Update the user with the specified ID
function updateUser() {
  const nameInput = document.getElementById('name');
  const updatedName = nameInput.value.trim();
  if (!updatedName) return alert('Please enter a name.');
  if (!currentUserId) return alert('No user selected for updating.');

  fetch(`${apiUrl}/${currentUserId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: updatedName })
  })
    .then(response => response.json())
    .then(() => {
      nameInput.value = '';
      currentUserId = null;
      document.getElementById('update-button').style.display = 'none';
      fetchUsers();
      alert('User updated successfully!');
    })
    .catch(error => console.error('Error updating user:', error));
}

// Delete a user
function deleteUser(id) {
  fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
    .then(() => {
      fetchUsers();
      alert('User deleted successfully!');
    })
    .catch(error => console.error('Error deleting user:', error));
}

// Load users when the page loads
document.addEventListener('DOMContentLoaded', fetchUsers);
