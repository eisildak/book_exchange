const React = require('react');
import { Link } from "react-router-dom";

class Nav extends React.Component {

  render() {
    const navComponents = [];
    if (this.props.loggedIn) {
      console.log(this.props)
      navComponents.push(
        <ul key={0} className="nav-items">
          <li key={0}><Link to="/">Ana Sayfa</Link></li>
          <li key={1}><Link to="/mypage">Kitaplarım</Link></li>
          <li key={2}><Link to="/exchange">İsteklerim</Link></li>
          <li key={3}><Link to="/search">Kitap Ara</Link></li>
          <li key={4}><Link to="/" onClick={this.props.logOut}>Çıkış Yap</Link></li>
        </ul>
      )
    } else {
      navComponents.push(
        <ul key={1} className="nav-items nav-auth">
          <li key={1}><Link to="/login">Giriş</Link></li>
          <li key={2}><Link to="/register">Kayıt Ol</Link></li>
        </ul>
      )
    }

    return (
      <div className="nav-bar">
        {navComponents}
      </div>
    )
  }
}

export default Nav;
