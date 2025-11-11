import { createApp } from "vue";
import { createPinia } from "pinia";
import "./assets/style.css";
import App from "./App.vue";
import router from "./router/index";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount("#app");

// Title index.html swap when user leaves or returns to the page
const originalTitle = document.title;

window.addEventListener("blur", () => {
  document.title = "Busca aquí tu ruta !!️";
});

window.addEventListener("focus", () => {
  document.title = originalTitle;
});
