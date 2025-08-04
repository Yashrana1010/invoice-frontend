// frontend/src/components/XeroCallback.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function XeroCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Prevent multiple executions on the same code
    const currentUrl = window.location.href;
    const lastProcessedUrl = sessionStorage.getItem('xero_last_processed_url');

    if (lastProcessedUrl === currentUrl) {
      console.warn('=== DUPLICATE CALLBACK DETECTED ===');
      console.warn('This URL has already been processed. Redirecting to avoid code reuse.');
      setError('Authorization already processed. Redirecting...');
      setTimeout(() => navigate('/login?error=duplicate_callback'), 1000);
      return;
    }

    // Mark this URL as being processed
    sessionStorage.setItem('xero_last_processed_url', currentUrl);

    const handleXeroCallback = async () => {
      console.log('=== XERO CALLBACK HANDLER STARTED ===');
      console.log('Current URL:', window.location.href);

      try {
        // Parse URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        console.log('=== URL PARAMETER EXTRACTION ===');
        console.log('Authorization code:', code ? `${code.substring(0, 20)}...` : 'NULL');
        console.log('State parameter:', state);
        console.log('Error parameter:', error);
        console.log('Error description:', errorDescription);

        // Check for OAuth errors first
        if (error) {
          console.error('=== OAUTH ERROR DETECTED ===');
          console.error('Error type:', error);
          console.error('Error description:', errorDescription);

          setError(`OAuth error: ${error} - ${errorDescription || 'Unknown error'}`);
          setTimeout(() => navigate('/login?error=oauth_error'), 2000);
          return;
        }

        // Validate required parameters
        if (!code) {
          console.error('=== MISSING AUTHORIZATION CODE ===');
          console.error('No authorization code in URL parameters');

          setError('No authorization code received from Xero');
          setTimeout(() => navigate('/login?error=no_code'), 2000);
          return;
        }

        // State validation warning
        if (!state) {
          console.warn('=== STATE PARAMETER WARNING ===');
          console.warn('No state parameter received - this might be a security issue');
        }

        console.log('=== SENDING CODE TO BACKEND FOR TOKEN EXCHANGE ===');

        // Send the authorization code to your backend
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        const response = await axios.post(`${API_BASE_URL}/xero/callback`, {
          code: code,
          state: state
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000, // 15 seconds timeout
        });

        console.log('=== TOKEN EXCHANGE SUCCESS ===');
        console.log('Response status:', response.status);
        console.log('Response data keys:', Object.keys(response.data));

        const { access_token, refresh_token, id_token, expires_in, user_info } = response.data;

        if (!access_token) {
          console.error('=== ACCESS TOKEN MISSING ===');
          throw new Error('No access token received from backend');
        }

        console.log('=== STORING TOKENS IN LOCALSTORAGE ===');

        // Store tokens in localStorage
        localStorage.setItem('token', access_token);
        console.log('✅ Access token stored');

        if (refresh_token) {
          localStorage.setItem('xero_refresh_token', refresh_token);
          console.log('✅ Refresh token stored');
        }

        if (id_token) {
          localStorage.setItem('xero_id_token', id_token);
          console.log('✅ ID token stored');
        }

        // Store token expiry
        if (expires_in) {
          const expiryTime = Date.now() + (expires_in * 1000);
          localStorage.setItem('xero_token_expiry', expiryTime.toString());
          console.log('✅ Token expiry stored:', new Date(expiryTime).toISOString());
        }

        // Store user info if provided
        if (user_info) {
          localStorage.setItem('xero_user_info', JSON.stringify(user_info));
          console.log('✅ User info stored');
        }

        console.log('=== AUTHENTICATION PROCESS COMPLETE ===');

        // Force a small delay to ensure localStorage is written
        await new Promise(resolve => setTimeout(resolve, 200));

        // Verify tokens are stored
        console.log('=== VERIFYING TOKEN STORAGE ===');
        console.log('Token stored:', !!localStorage.getItem('token'));
        console.log('Refresh token stored:', !!localStorage.getItem('xero_refresh_token'));

        // Trigger auth context refresh
        if (window.authContext && typeof window.authContext.checkAuth === 'function') {
          console.log('Triggering auth context refresh...');
          window.authContext.checkAuth();
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('xero-auth-success', {
          detail: {
            tokens: response.data,
            timestamp: Date.now()
          }
        }));

        console.log('Redirecting to home page...');
        navigate('/', { replace: true });

      } catch (error) {
        console.error('=== CRITICAL ERROR IN CALLBACK HANDLER ===');
        console.error('Error:', error);

        let errorMessage = 'Token exchange failed';

        if (error.response) {
          console.error('=== SERVER ERROR RESPONSE ===');
          console.error('Status:', error.response.status);
          console.error('Data:', error.response.data);

          if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.status === 400) {
            errorMessage = 'Bad Request - Invalid authorization code or configuration';
          } else if (error.response.status === 401) {
            errorMessage = 'Unauthorized - Invalid client credentials';
          } else if (error.response.status === 500) {
            errorMessage = 'Server error - Please try again';
          }
        } else if (error.request) {
          console.error('=== NETWORK ERROR ===');
          errorMessage = 'Network error - Could not reach authentication server';
        } else {
          console.error('=== SETUP ERROR ===');
          errorMessage = error.message || 'Unknown error occurred';
        }

        setError(errorMessage);
        setTimeout(() => navigate('/login?error=token_exchange_failed'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleXeroCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        padding: '20px'
      }}>
        <div>Processing Xero login...</div>
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Please wait while we complete your authentication.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        padding: '20px',
        color: '#d32f2f'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Authentication Error</div>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>{error}</div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Redirecting to login page...
        </div>
      </div>
    );
  }

  return null;
}