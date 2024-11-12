import { Helmet } from 'react-helmet-async';

import ForgetPassword from 'src/sections/auth-demo/forget-password';

// ----------------------------------------------------------------------

export default function ModernForgetPasswordPage() {
  return (
    <>
      <Helmet>
        <title> Auth Classic: Forget Password</title>
      </Helmet>

      <ForgetPassword />
    </>
  );
}