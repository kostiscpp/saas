import React, { useState ,useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import infographic from '../center.png';  // Ensure the path is correct for the new infographic
import Header from './Header';
import Footer from './Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const BuyCredits = ({token }) => {
  const [amount, setAmount] = useState(0);
  const [credit, setCredit] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    // Check if the user is logged in
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/');
    }

    const fetchCreditBalance = async () => {
      try {
        console.log('Token in:', token);
        const response = await axios.get('http://localhost:6900/get-user-by-token', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('Credit balance response:', response.data);
        if (response.data.user.creditAmount) {
          setCredit(response.data.user.creditAmount); // Set the initial credit balance
        }
      } catch (error) {
        console.error('Error fetching credit balance:', error);
        setError('Unable to fetch credit balance.');
      }
    };

    fetchCreditBalance();
  }, [navigate]);

  const handleBuyCredits = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    
    try {
      console.log('Token:', token);

      const response = await axios.post('http://localhost:6900/add-credit', {
        token: localStorage.getItem('token'),
        creditAmount: parseInt(amount),
        form: 'purchase'
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      console.log('Credit purchase response:', response.data);

      if (response.data === 'Credit updated successfully') {
        setSuccess(`Successfully purchased ${amount} credits!`);
        setCredit((prevCredit) => prevCredit + parseInt(amount)); // Update credit state after purchase
        setAmount(response.data.newCreditAmount);
      } else {
        setError(response.data.error || 'Failed to purchase credits. Please try again.');
      }
    } catch (error) {
      console.error('Error buying credits:', error.response ? error.response.data : error);
      setError(error.response && error.response.data.error 
               ? error.response.data.error 
               : 'An error occurred while purchasing credits.');
    }
  };

  const handleGoHome = () => {
    navigate('/home'); // Navigate to the home page
  };

  return (
      <div className="d-flex flex-column min-vh-100">
        <Header/>
        <button
            className="btn btn-light"
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={handleGoHome}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <main className="container my-4 flex-grow-1">
          <div className="text-center">
            <h2 style={{marginBottom: '2rem'}}>Buy Credits</h2>
            <p>Current Credit Balance: {credit} </p>
            {error && <p style={{color: 'red'}}>{error}</p>}
            {success && <p style={{color: 'green'}}>{success}</p>}
            <form onSubmit={handleBuyCredits}>
              <div>
                <label htmlFor="amount">Amount of credits to buy:</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    required
                    style={{marginTop: '1rem'}}
                />
              </div>
              <button type="submit" className="btn btn-primary"
                      style={{backgroundColor: '#00A86B', borderColor: '#00A86B', marginTop: '1rem'}}>
                Buy Credits
              </button>
            </form>
          </div>
        </main>

        <Footer/>
      </div>
  );
};

export default BuyCredits;
/////done?
