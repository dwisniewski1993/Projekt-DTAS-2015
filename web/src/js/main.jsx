var React = require('react');
var ReactDOM = require('react-dom');
var {Router, Route, IndexRoute} = require('react-router');
var {createHistory} = require('history');

// -----------------------

var {TopBar, MainMenu} = require('./Navigation.jsx');
var {AddCategory} = require('./Categories.jsx');
var {UserListPage, UserPage, RegisterPage} = require('./Users.jsx');
var {ProductList, ProductPage, AddProduct} = require('./Product.jsx');

// -----------------------

var App = (props) =>
    <div>
        <TopBar />
        <MainMenu />
        <main>{props.children}</main>
    </div>;

ReactDOM.render((
    <Router history={createHistory()}>
        <Route path="/" component={App}>
            <Route path="produkty" component={ProductList} />
            <Route path="produkty/dodaj" component={AddProduct} />
            <Route path="produkty/:productId" component={ProductPage} />
            <Route path="kategorie/dodaj" component={AddCategory} />
            <Route path="uzytkownicy" component={UserListPage} />
            <Route path="uzytkownicy/:userId" component={UserPage} />
            <Route path="rejestracja" component={RegisterPage} />
        </Route>
    </Router>
    ), document.getElementById("app")
);