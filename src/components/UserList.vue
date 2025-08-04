<template>
  <div class="user-list">
    <h2>Lista de Usuarios</h2>
    <button @click="fetchUsers" class="btn">Cargar Usuarios</button>
    
    <div v-if="loading" class="loading">Cargando...</div>
    
    <ul v-if="users.length > 0" class="users">
      <li v-for="user in users" :key="user.id" class="user-item">
        <strong>{{ user.name }}</strong> - {{ user.email }}
      </li>
    </ul>
    
    <form @submit.prevent="addUser" class="add-user-form">
      <h3>Agregar Usuario</h3>
      <input v-model="newUser.name" placeholder="Nombre" required>
      <input v-model="newUser.email" type="email" placeholder="Email" required>
      <button type="submit" class="btn">Agregar</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UserList',
  data() {
    return {
      users: [],
      loading: false,
      newUser: {
        name: '',
        email: ''
      }
    };
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await axios.get('/api/users');
        this.users = response.data;
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      } finally {
        this.loading = false;
      }
    },
    async addUser() {
      try {
        const response = await axios.post('/api/users', this.newUser);
        this.users.push(response.data);
        this.newUser = { name: '', email: '' };
      } catch (error) {
        console.error('Error al agregar usuario:', error);
      }
    }
  },
  mounted() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
.user-list {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin: 10px 0;
}

.btn:hover {
  background-color: #369870;
}

.users {
  list-style: none;
  padding: 0;
}

.user-item {
  background-color: #f5f5f5;
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
}

.add-user-form {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-user-form input {
  width: 100%;
  padding: 8px;
  margin: 5px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loading {
  text-align: center;
  color: #666;
}
</style>