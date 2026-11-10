import CustomerLoginPage from './CustomerLoginPage';

export default function CustomerRegisterPage({ onNavigateLogin, onSelectProduct, onNavigateSellerLogin }) {
  return (
    <CustomerLoginPage
      initialTab="register"
      onLoginSuccess={onNavigateLogin}
      onNavigateSellerLogin={onNavigateSellerLogin}
      onSelectProduct={onSelectProduct}
    />
  );
}
