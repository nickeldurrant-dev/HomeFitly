import { callbackParameters, recoverySession, changePassword } from './recovery';
import './callback.css';

const config = { url: import.meta.env.VITE_SUPABASE_URL, key: import.meta.env.VITE_SUPABASE_ANON_KEY };
const params = callbackParameters(new URL(window.location.href));
// Tokens stay in memory and are removed from browser history immediately.
window.history.replaceState(null, '', window.location.pathname);
const title = document.querySelector<HTMLHeadingElement>('#title')!;
const message = document.querySelector<HTMLParagraphElement>('#message')!;
const form = document.querySelector<HTMLFormElement>('#password-form')!;
const error = document.querySelector<HTMLParagraphElement>('#error')!;
const submit = document.querySelector<HTMLButtonElement>('#save')!;
const password = document.querySelector<HTMLInputElement>('#password')!;
const confirmation = document.querySelector<HTMLInputElement>('#confirmation')!;
let accessToken = '';

void recoverySession(params, config).then(session => {
  accessToken = session.token;
  title.textContent = session.recovery ? 'Choose a new password' : 'Email confirmed';
  message.textContent = session.recovery ? 'Use a strong password that you do not use anywhere else.' : 'Your email is confirmed. Open HomeFitly and sign in to continue.';
  form.hidden = !session.recovery;
  if (session.recovery) password.focus();
  else accessToken = '';
}).catch((cause: Error) => {
  title.textContent = 'We could not open this link';
  message.textContent = cause.message;
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  error.textContent = '';
  submit.disabled = true;
  submit.textContent = 'Saving…';
  try {
    await changePassword(password.value, confirmation.value, accessToken, config);
    accessToken = '';
    password.value = ''; confirmation.value = '';
    form.hidden = true;
    title.textContent = 'Password updated';
    message.textContent = 'You can now sign in to HomeFitly with your new password.';
  } catch (cause) {
    error.textContent = cause instanceof Error ? cause.message : 'Please try again.';
  } finally {
    submit.disabled = false;
    submit.textContent = 'Save new password';
  }
});
