const { default: axios } = require('axios');

const apiController = {};

apiController.findBook = (req, res, next) => {
  if (res.locals.bookInDB) return next();
  const { isbn } = req.body;
  axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
    .then((response) => {
      const items = response.data.items;
      if (!items || items.length === 0) {
        return next({ log: 'Book not found', message: { err: 'ISBN not found in Google Books' } });
      }
      const info = items[0].volumeInfo;
      res.locals.book = {
        isbn_13: isbn,
        title: info.title || 'Unknown',
        author: info.authors ? info.authors.join(', ') : 'Unknown',
        subjects: info.categories ? info.categories[0] : 'Unknown',
      };
      return next();
    })
    .catch((err) => {
      return next({ log: 'ERROR in apiController.findBook', message: { err: String(err) } });
    });
};

// Author lookup now handled inside findBook via Google Books
apiController.findAuthor = (req, res, next) => next();

module.exports = apiController;



















// const { default: axios } = require("axios");


// const apiController = {};
// // from MDN
// // fetch('http://example.com/movies.json')
// //   .then(response => response.json())
// //   .then(data => console.log(data));
// apiController.findBook = (req, res, next) => {
//   if (res.locals.bookInDB) {
//     return next();
//   } else {
//     const isbn = req.body.isbn;
//     let authorEndpoint;
//     axios.get(`https://openlibrary.org/isbn/${isbn}.json`)
//       .then(response => {
//         const bookInfo = response.data;
//         const { isbn_13, title, authors, subjects } = bookInfo;
//         axios.get('https://openlibrary.org/authors/OL548174A.json')
//         console.log(isbn_13[0], title, authors[0], subjects[0])
//         res.locals.authorEndpoint = authors[0].key;
//         res.locals.book = { isbn_13: isbn_13[0], name: title, subjects: subjects[0] };
//         return next();
//       })
//       .catch(err => {
//         const defaultErr = {
//           log: 'ERROR found in apiController.findBook',
//           message: { err: 'There was an error.' + `${isbn}` + 'not found.' }
//         };
//         return next(defaultErr);
//       });
//   }
// }
// //error message display isbn

// apiController.findAuthor = (req, res, next) => {
//   const authorEndpoint = res.locals.authorEndpoint;
//   axios.get(`https://openlibrary.org/${authorEndpoint}.json`)
//     .then(response => {
//       const authorInfo = response.data;
//       const { name } = authorInfo;
//       console.log('name', name)
//       res.locals.book = { ...res.locals.book, name };
//       console.log(res.locals.book)
//       return next();
//     })
//     .catch(err => {
//       const defaultErr = {
//         log: 'ERROR found in apiController.findAuthor',
//         message: { err: 'There was an error' + err }
//       };
//       return next(defaultErr);
//     });
// }


// module.exports = apiController;