import LoginHero from "../Components/login_component/LoginHero";
import LoginForm from "../Components/login_component/LoginForm";
import "../styles/login.css";
export default function Login() {
  return (
    <main className="login-page min-h-screen flex flex-col lg:flex-row">
      <LoginHero />
      <LoginForm />
    </main>
  );
}
