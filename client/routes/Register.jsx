const React = require('react');
import { Navigate } from "react-router-dom";

class Register extends React.Component {

  register = (e) => {
    e.preventDefault();
    fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        passwordconfirm: document.getElementById('passwordconfirm').value,
        email: document.getElementById('email').value,
        phone: '',
        address: '',
      })
    }).then(response => response.json())
      .then(data => {
        return this.props.changeState(data)
      });
  }

  render() {
    let { loggedIn, error } = this.props;
    return (
      <div className="usercred-box">
        {loggedIn && <Navigate to="/" replace={true} />}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="usercred-title">Kitap Takası</div>
        <form className="usercred-form">
          <input type="text" placeholder="kullanıcı adı" name="username" id="username" required />
          <input type="password" placeholder="şifre" name="password" id="password" required />
          <input type="password" placeholder="şifreyi onayla" name="passwordconfirm" id="passwordconfirm" required />
          <input type="email" placeholder="e-posta" name="email" id="email" required />
          <input type="submit" value="Kayıt Ol" onClick={this.register} />
        </form>
      </div>
    )
  }
}

export default Register;








