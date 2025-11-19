import './App.css'

function App() {

  const login = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth-url');
      const data = await response.json();
      window.location.href = data.authURL;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  };
  
  function getUsername() {
    fetch('http://localhost:3001/api/user', {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      let userDisplay = document.getElementById('userDisplay');
      userDisplay.textContent = (`Welcome ${data.username}`);
    })
    .catch(error => {
      console.error('Error fetching username:', error);
    });
  };

  return (
    <>
      <div>
      <div id="userDisplay"></div>
        <button onClick={login}>Formbar Oauth</button>
        <button onClick={getUsername}>Get Username</button>
      </div>
    </>
  )
};

export default App