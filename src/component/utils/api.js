import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://mountain-chain.onrender.com/mountainchain/api'
});