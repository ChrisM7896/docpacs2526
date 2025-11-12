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
  

  return (
    <>
      <div>
        <button onClick={login}>Formbar Oauth</button>
      </div>
    </>
  )
}

export default App