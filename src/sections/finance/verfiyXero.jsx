import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';

function VerfiyXero() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const code = searchParams.get('code');
  const session = searchParams.get('session_state');
  console.log(code, session);

  const xeroCode = async () => {
    try {
      // Call the backend to exchange the authorization code for the access token
      const { data } = await axios.get(endpoints.auth.xeroCallback, {
        withCredentials: true,
        params: {
          code: code,
          session: session,
        },
      });
      // Navigate to another page or update the state after getting the token
      navigate('/dashboard'); // Example navigation after success
    } catch (error) {
      console.error(error);
    }
  };

  xeroCode();
  return <div>to Dashboard</div>;
}

export default VerfiyXero;
