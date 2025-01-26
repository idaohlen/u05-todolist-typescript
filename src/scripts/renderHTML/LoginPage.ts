const LoginPage = `
    <header class="app-header">
      <h1>Todo List</h1>
      <iconify-icon icon="fa6-solid:pen-nib" class="app-header__icon"></iconify-icon>
    </header>
    <div class="login-form">
      <div class="login-form__row">
        <iconify-icon icon="solar:letter-outline" class="login-form__icon"></iconify-icon>
        <input type="email" placeholder="email" id="emailInput">
      </div>
      <div class="login-form__row">
        <iconify-icon icon="solar:lock-password-outline" class="login-form__icon"></iconify-icon>
        <input type="password" placeholder="password" id="passwordInput">
      </div>
      <div id="errorMessage" class="error-message"></div>
      <div class="login-form__buttons">
        <button id="registerUserBtn" class="btn btn--outline">Register</button>
        <button id="loginBtn" class="btn btn--gradient">Login</button>
      </div>
    </div>
  `

export default LoginPage;