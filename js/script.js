/**
 * Script de Validação e Envio do Formulário de Contato via Web3Forms
 * Dra. Camila Siqueira | Psicologia Clínica
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Elementos dos campos
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const messageInput = document.getElementById('message');

  // Elementos de mensagem de erro individual
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const phoneError = document.getElementById('phone-error');
  const messageError = document.getElementById('message-error');

  // Elementos do botão de envio e alerta geral
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const btnIcon = document.getElementById('btn-icon');
  const formAlert = document.getElementById('form-alert');

  // --------------------------------------------------------------------------
  // 1. Máscara amigável para telefone/WhatsApp no padrão brasileiro
  // --------------------------------------------------------------------------
  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10) {
      // (11) 98765-4321
      value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length > 5) {
      // (11) 8765-4321 ou intermediário
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d{0,2})$/, '($1');
    }

    e.target.value = value;
  });

  // --------------------------------------------------------------------------
  // 2. Funções auxiliares para feedback visual dos campos
  // --------------------------------------------------------------------------
  function showError(input, errorEl, message) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('active');
    }
  }

  function clearError(input, errorEl) {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('active');
    }
  }

  // --------------------------------------------------------------------------
  // 3. Regras de validação individuais
  // --------------------------------------------------------------------------
  function validateName() {
    const value = nameInput.value.trim();
    if (!value) {
      showError(nameInput, nameError, 'Por favor, informe seu nome completo.');
      return false;
    }
    if (value.length < 3) {
      showError(nameInput, nameError, 'O nome deve ter no mínimo 3 caracteres.');
      return false;
    }
    clearError(nameInput, nameError);
    return true;
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!value) {
      showError(emailInput, emailError, 'Por favor, informe seu endereço de e-mail.');
      return false;
    }
    if (!emailRegex.test(value)) {
      showError(emailInput, emailError, 'Por favor, digite um e-mail válido (ex: seuemail@exemplo.com).');
      return false;
    }
    clearError(emailInput, emailError);
    return true;
  }

  function validatePhone() {
    const rawValue = phoneInput.value.replace(/\D/g, '');
    if (!rawValue) {
      showError(phoneInput, phoneError, 'Por favor, informe seu telefone ou WhatsApp para retorno.');
      return false;
    }
    if (rawValue.length < 10) {
      showError(phoneInput, phoneError, 'Digite um número de telefone válido com DDD (mínimo 10 dígitos).');
      return false;
    }
    clearError(phoneInput, phoneError);
    return true;
  }

  function validateMessage() {
    const value = messageInput.value.trim();
    if (!value) {
      showError(messageInput, messageError, 'Por favor, escreva uma breve mensagem sobre o que você busca.');
      return false;
    }
    if (value.length < 10) {
      showError(messageInput, messageError, 'A mensagem deve ter pelo menos 10 caracteres.');
      return false;
    }
    clearError(messageInput, messageError);
    return true;
  }

  // Limpeza de erros em tempo real conforme o usuário digita
  nameInput.addEventListener('input', () => { if (nameInput.classList.contains('is-invalid')) validateName(); });
  emailInput.addEventListener('input', () => { if (emailInput.classList.contains('is-invalid')) validateEmail(); });
  phoneInput.addEventListener('input', () => { if (phoneInput.classList.contains('is-invalid')) validatePhone(); });
  messageInput.addEventListener('input', () => { if (messageInput.classList.contains('is-invalid')) validateMessage(); });

  // --------------------------------------------------------------------------
  // 4. Exibição de alertas gerais (Sucesso / Erro)
  // --------------------------------------------------------------------------
  function showAlert(type, title, description) {
    if (!formAlert) return;

    const isSuccess = type === 'success';
    formAlert.className = `form-alert ${isSuccess ? 'success' : 'error'}`;

    const iconSvg = isSuccess
      ? `<svg class="form-alert-icon" viewBox="0 0 24 24" fill="currentColor">
           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
         </svg>`
      : `<svg class="form-alert-icon" viewBox="0 0 24 24" fill="currentColor">
           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
         </svg>`;

    formAlert.innerHTML = `
      ${iconSvg}
      <div class="form-alert-content">
        <strong class="form-alert-title">${title}</strong>
        <span>${description}</span>
      </div>
    `;

    formAlert.style.display = 'flex';
    formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    if (!formAlert) return;
    formAlert.style.display = 'none';
    formAlert.innerHTML = '';
  }

  // --------------------------------------------------------------------------
  // 5. Envio do Formulário via Web3Forms (AJAX / Fetch)
  // --------------------------------------------------------------------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    // Validação geral de todos os campos
    const isNameValid = validateName();
    const isPhoneValid = validatePhone();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();

    if (!isNameValid || !isPhoneValid || !isEmailValid || !isMessageValid) {
      // Foca no primeiro campo com erro
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Estado visual de carregamento
    submitBtn.disabled = true;
    btnText.textContent = 'Enviando...';
    btnSpinner.style.display = 'inline-block';
    if (btnIcon) btnIcon.style.display = 'none';

    try {
      const formData = new FormData(form);
      const jsonObject = Object.fromEntries(formData.entries());
      const jsonBody = JSON.stringify(jsonObject);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: jsonBody
      });

      const result = await response.json();

      if (response.status === 200 && result.success) {
        showAlert(
          'success',
          'Mensagem enviada com sucesso!',
          'Obrigado pelo contato. Suas informações foram recebidas com total sigilo e responderei em até 24 horas úteis.'
        );
        form.reset();

        // Limpa classes residuais
        [nameInput, emailInput, phoneInput, messageInput].forEach(input => {
          input.classList.remove('is-invalid');
        });
      } else {
        const errorMsg = result.message || 'Ocorreu um erro no servidor ao tentar enviar seus dados.';
        showAlert(
          'error',
          'Falha no envio da mensagem',
          `${errorMsg} Se preferir, entre em contato direto pelo WhatsApp (11) 99999-9999.`
        );
      }
    } catch (error) {
      console.error('Erro de conexão com Web3Forms:', error);
      showAlert(
        'error',
        'Erro de conexão',
        'Não foi possível estabelecer contato com o servidor. Verifique sua conexão com a internet ou entre em contato diretamente pelo WhatsApp.'
      );
    } finally {
      // Restaura o botão ao estado normal
      submitBtn.disabled = false;
      btnText.textContent = 'Enviar Mensagem';
      btnSpinner.style.display = 'none';
      if (btnIcon) btnIcon.style.display = 'inline-block';
    }
  });
});
