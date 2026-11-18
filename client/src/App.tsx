
import './App.css';
import LoginButton from "./components/oauth/LoginButton";
import BigQueryButton from "./components/oauth/BigQueryButton";
import LogoutButton from "./components/oauth/LogoutButton";


const App = () => {

  return (
    <div className="App">
      <LoginButton />
      <BigQueryButton />
      <LogoutButton />
    </div>
  );
}

export default App;
