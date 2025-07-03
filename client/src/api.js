import axios from 'axios';

// Cria uma instância "pré-configurada" do axios
const api = axios.create({
    baseURL: 'http://localhost:8081/api' // A URL base da sua API
});

// Adiciona um "interceptor": um código que roda ANTES de cada requisição
api.interceptors.request.use(async (config) => {
    // Pega o token salvo no navegador
    const token = localStorage.getItem('token');
    if (token) {
        // Se o token existir, adiciona o cabeçalho de autorização
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;