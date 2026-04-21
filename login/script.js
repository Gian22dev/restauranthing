// Animacion dinamica

function irARegistro() {
    document.querySelector(".login__card").classList.add("active");
}

function irALogin() {
    document.querySelector(".login__card").classList.remove("active");
}


// Cambio de texto de los botones

const login = document.getElementById("loginBtn");
const register = document.getElementById("registerBtn");
const register2 = document.getElementById("register2Btn");


const originalLogin = login.textContent;
const newLogin = "登录";
const originalRegister = register.textContent;
const newRegister = "注册";
const originalRegister2 = register2.textContent;
const newRegister2 = "创建账户";

login.addEventListener("mouseenter", () => {
    login.textContent = newLogin;
});

login.addEventListener("mouseleave", () => {
    login.textContent = originalLogin;
});


register.addEventListener("mouseenter", () => {
    register.textContent = newRegister;
});

register.addEventListener("mouseleave", () => {
    register.textContent = originalRegister;
});

register2.addEventListener("mouseenter", () => {
    register2.textContent = newRegister2;
});

register2.addEventListener("mouseleave", () => {
    register2.textContent = originalRegister2;
});





