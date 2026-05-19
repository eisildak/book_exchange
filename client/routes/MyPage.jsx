const React = require('react');
import MyBookRow from '../components/MyBookRow';

class MyPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myoldbooks: [],
      adding: false,
      error: null,
      title: '',
      author: '',
      isbn: '',
      condition: 'Like New',
    };
    this.getMyOldBooks = this.getMyOldBooks.bind(this);
    this.rerender = this.rerender.bind(this);
    this.addManualBook = this.addManualBook.bind(this);
  }

  componentDidMount() {
    this.getMyOldBooks();
  }

  getMyOldBooks() {
    fetch(`/api/getMyOldBookList/${this.props.userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    })
      .then(r => r.json())
      .then(data => this.setState({ myoldbooks: data }))
      .catch(() => {});
  }

  addManualBook(e) {
    e.preventDefault();
    const { title, author, isbn, condition } = this.state;
    this.setState({ adding: true, error: null });

    fetch('/api/addManualBook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ title, author, isbn, condition, userId: this.props.userId })
    })
      .then(r => r.json())
      .then(() => {
        this.setState({ title: '', author: '', isbn: '', condition: 'Like New', adding: false });
        this.getMyOldBooks();
      })
      .catch(() => this.setState({ error: 'Kitap eklenemedi.', adding: false }));
  }

  rerender() {
    this.getMyOldBooks();
  }

  render() {
    const { myoldbooks, adding, error, title, author, isbn, condition } = this.state;

    const rows = [];
    if (myoldbooks.length > 0) {
      rows.push(
        <tr key="header">
          <th>Başlık</th>
          <th>Yazar</th>
          <th>ISBN</th>
          <th>Durum</th>
          <th></th>
        </tr>
      );
      myoldbooks.forEach((book, i) => {
        rows.push(<MyBookRow {...book} key={i} rerender={this.rerender} />);
      });
    }

    return (
      <div className="search-box">
        <form className="search-form" onSubmit={this.addManualBook}>
          <input
            type="text"
            placeholder="Kitap başlığı"
            value={title}
            onChange={e => this.setState({ title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Yazar"
            value={author}
            onChange={e => this.setState({ author: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="ISBN (isteğe bağlı)"
            value={isbn}
            onChange={e => this.setState({ isbn: e.target.value })}
          />
          <select
            value={condition}
            onChange={e => this.setState({ condition: e.target.value })}
            id="condition"
          >
            <option value="Like New">Sıfır Gibi</option>
            <option value="Fine">İyi</option>
            <option value="Very Good">Çok İyi</option>
            <option value="Good">Orta</option>
            <option value="Fair">Makul</option>
            <option value="Poor">Kötü</option>
          </select>
          <input type="submit" value={adding ? 'Ekleniyor...' : '+ Ekle'} disabled={adding} />
        </form>

        {error && <p style={{ color: '#e53e3e', margin: '10px 0 0', fontSize: 14 }}>{error}</p>}

        <div className="result-box">
          {rows.length > 0 && <table className="result-table">{rows}</table>}
        </div>
      </div>
    );
  }
}

export default MyPage;








