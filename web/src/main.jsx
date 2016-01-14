var {Router, Route, IndexRoute, Link} = ReactRouter;
var {createHistory} = window.History;

var UserMenu = React.createClass({
    getInitialState: function() {
        return {loggedIn:false, username:'', menuOpened:false, badData:false};
    },
    componentDidMount: function() {
        qwest.get('/session').then((xhr, response) => { 
            if (xhr.status == 200) {
                this.setState({loggedIn:true, username: response}); 
            }
        });
    },
    toggleForm: function() {
        var previous = this.state.menuOpened;
        this.setState({menuOpened: !previous});
    },
    login: function() {
        var credentals = {
            username: this.refs.usr.value,
            password: this.refs.pw.value
        };

        qwest.post('/login', credentals, {dataType:'json'})
            .complete((xhr, response) => {
                if (xhr.status == 404) {
                    this.setState({badData:true});
                } else {
                    window.location = '/produkty';
                }
            });
    },
    render: function() {
        var info = <span className="error">Złe hasło lub nazwa użytkownika</span>;

        var loginForm = 
            <div id="login-form">
                <input ref="usr" placeholder="Login" />
                <input ref="pw" type="password" placeholder="Hasło" />
                {this.state.badData && info}
                <button type="submit" onClick={this.login}>Zaloguj</button>
            </div>;


        if (this.state.loggedIn) {
            return (
                <div id="user">
                    <Link activeClassName="active" to="/produkty/dodaj">Dodaj produkt</Link>
                    <Link activeClassName="active" to="/kategorie/dodaj">Dodaj kategorię</Link>
                    <span className="username">{this.state.username}</span>
                    <a className="button" href="/logout">Wyloguj</a>
                </div> 
            );
        } else {
            return (
                <div id="user">
                    <Link activeClassName="active" to="/rejestracja">Rejestracja</Link>
                    <a href="#" onClick={this.toggleForm}>Zaloguj się</a>
                    {this.state.menuOpened && loginForm}
                </div> 
            );
        }
    }
});

var TopBar = (props) =>
    <div id="top-bar-wrap">
        <header id="top-bar">
            <span id="logo">Serwis do oceniania</span>
            <UserMenu />
        </header>
    </div>;

var MainMenu = () =>
    <div id="main-nav-wrap">
        <nav id="main-nav">
            <Link activeClassName="active" to="/produkty">Lista produktów</Link>
            <Link activeClassName="active" to="/uzytkownicy">Użytkownicy</Link>
        </nav>
    </div>

// -----------------------------------------------------------------

var CategoryForm = React.createClass({
    getInitialState: function() {
        return {attributes: [], name: ''};
    },
    updateTitle: function() {
        this.setState({name: this.refs.nazwa.value});
    },
    addAttribute: function(event) {
        if (event.keyCode != 13) return;

        var newAttrs = this.state.attributes.concat([this.refs.atrybut.value]);
        this.setState({attributes: newAttrs});
        this.refs.atrybut.value = '';
    },
    addCategory: function() {
        qwest.post('/api/categories/', this.state, {dataType:'json'})
            .then((xhr, response) => { alert('Kategoria dodana!'); })
    },
    render: function() {
        var attributes = this.state.attributes.map(
            attr => <li>{attr}</li>
        );

        return (
            <div>
                <h1>Dodaj kategorię {this.state.name}</h1>
                <input ref="nazwa" placeholder="Nazwa kategorii" onChange={this.updateTitle} />
                <ul>{attributes}</ul>
                <input ref="atrybut" onKeyDown={this.addAttribute} placeholder="Dodaj atrybut" /><br />
                <button onClick={this.addCategory}>Dodaj</button>
            </div>
        );
    }
});

var ProductForm = React.createClass({
    getInitialState: function() {
        return {category_id:0, attributes:[], categories:[]};
    },
    componentDidMount: function() {
        qwest.get('/api/categories/').then((xhr, response) => { 
            this.setState(response); 
            this.showFields();
        });
    },
    showFields: function() {
        var url = `/api/categories/${this.refs.kategoria.value}/attributes`; 
        qwest.get(url).then((xhr, response) => {
            response.category_id = this.refs.kategoria.value;
            this.setState(response);
        });
    },
    addProduct: function() {
        var attributes = {};
        for (let attr of this.state.attributes)
            attributes[attr.id] = this.refs[attr.id].value;

        var newProduct = {
            name: this.refs.nazwa.value,
            category_id: this.state.category_id,
            attributes: attributes
        };

        qwest.post('/api/products/', newProduct, {dataType:'json'})
            .then((xhr, response) => { alert('Produkt dodany!'); })
    },
    render: function() {
        var categories = this.state.categories.map(
            cat => <option value={cat.id}>{cat.name}</option>
        );

        var fields = this.state.attributes.map(
            attr => <tr><td>{attr.name}</td><td><input ref={attr.id} /></td></tr>
        );

        return (
            <div className="box box-60">
                <table>
                    <tbody>
                        <tr><td><b>Kategoria</b></td><td><select ref="kategoria" onChange={this.showFields}>{categories}</select></td></tr>
                        <tr><td><b>Nazwa produktu</b></td><td><input ref="nazwa" /></td></tr>
                        {fields}
                    </tbody>
                </table>
                <br /><button onClick={this.addProduct}>Dodaj produkt</button>
            </div>
        );
    }
});

var Product = (props) => {
    var attrs = [];

    for (let attr in props)
        if (attr != 'name' && attr != 'id')
            attrs.push( <div className="attribute">{attr}: {props[attr]}</div> )

    return (
        <div className="item">
            <h2><Link to={`/produkty/${props.id}`}>{props.name}</Link></h2>
            {attrs}
        </div>
    );

};

var ColorsMixin = {
    ratingToCss: function(rating) {
        var r,g,b=0;
        if(rating <= 5) {
            r=255;
            g=Math.floor((rating/5)*255);
        } else {
            r=Math.floor(((10-rating)/5)*255);
            g=255;
        }

        return { background: `rgb(${r},${g},${b})` };   
    }
};

var ReviewList = React.createClass({
    mixins: [ColorsMixin],
    getInitialState: function() {
        return {reviews: [], loggedIn:false, username:''};
    },
    componentDidMount: function() {
        qwest.get(`/api/products/${this.props.productId}/reviews`)
            .then((xhr, response) => { this.setState(response); });
        qwest.get('/session').then((xhr, response) => { 
            this.setState({loggedIn:true, username: response}); });
    },
    addReview: function(review) {
        var reviews = this.state.reviews.concat([review]);
        this.setState({reviews:reviews});
    },
    render: function() {
        var form = <ReviewForm productId={this.props.productId}
                    addReview={this.addReview}
                    username={this.state.username} />;

        var reviews = this.state.reviews.map(data =>
            <div className="user-review">
                <p>{data.comment}</p>
                <b>{data.nick}</b>, {data.rating}/10
            </div>
        );

        var avg = 0;
        if (this.state.reviews.length) {
            var ratings = this.state.reviews.map(data => data.rating);
            avg = +(ratings.reduce((prev,curr) => prev+curr) / ratings.length).toFixed(2);
        }

        return (
            <div className="box reviews">
                <h2>Opinie</h2>
                {reviews}
                Średnia: <span className="rating" style={this.ratingToCss(avg)}>{avg}</span>
                <br /><br />
                {this.state.loggedIn && form}
            </div>
        );
    }
});

var ReviewForm = React.createClass({
    mixins: [ColorsMixin],
    getInitialState: function() {
        return {rating: 10};
    },
    componentDidMount: function() {

        this.refs.rating.value = 10;
    },
    updateRating: function() {
        this.setState( {rating: this.refs.rating.value} );
    },
    addReview: function() {
        var review = {
            pid: this.props.productId,
            nick: this.props.username,
            rating: parseInt(this.refs.rating.value),
            comment: this.refs.comment.value
        }

        this.refs.comment.value = '';

        qwest.post('/api/reviews/', review, {dataType:'json'})
            .then((xhr, response) => { this.props.addReview(review); })
    },
    render: function() {
        return (
            <div>
                <h2>Oceń produkt</h2>
                <div className="form-row">
                    <span className="name">
                        Ocena: <span className={`rating`}
                            style={this.ratingToCss(this.state.rating)}>
                            {this.state.rating}</span>
                    </span>
                    <input className="value" ref="rating" onInput={this.updateRating}
                        type="range" min="1" max="10" step="1" />
                </div>
                <div className="form-row">
                    <span className="name">Komentarz</span>
                    <textarea className="value" ref="comment" />
                </div>
                <div className="form-row">
                    <span className="name"></span>
                    <button onClick={this.addReview}>Dodaj opinię</button>
                </div>                
            </div>
        );
    }
});

// -----------------------

var ProductList = React.createClass({
    getInitialState: function() {
        return {categories:[], category_id:0, products: []};
    },
    componentDidMount: function() {
        qwest.get('/api/categories/').then((xhr, response) => { 
            this.setState(response); 
            this.showProducts();
        });
    },
    showProducts: function() {
        var url = `/api/categories/${this.refs.kategoria.value}/products`; 
        qwest.get(url).then((xhr, response) => {
            response.category_id = this.refs.kategoria.value;
            this.setState(response);
        });
    },
    render: function() {
        var categories = this.state.categories.map(
            cat => <option value={cat.id}>{cat.name}</option>
        );

        var products = this.state.products
            .map(prodData => <Product {...prodData} />);

        return (
            <div className="content-wrap">
                <h1>Lista produktów</h1>
                <select ref="kategoria" onChange={this.showProducts}>{categories}</select>
                {products}
            </div>
        );
    }
});

var ProductPage = React.createClass({
    getInitialState: function() {
        return {
            name: "",
            reviews: [],
            attributes: [],
            id: this.props.params.productId
        };
    },
    componentDidMount: function() {
        qwest.get(`/api/products/${this.state.id}`).then((xhr, response) => {
            this.setState(response);
        });
    },
    render: function() {
            var attributes = this.state.attributes
                .map(data => <tr><td><b>{data.name}</b></td><td>{data.value}</td></tr>);

        return (
            <div className="content-wrap">
                <h1>{this.state.name}</h1>
                <div className="box attributes">
                    <h2>Cechy produktu</h2>
                    <table><tbody>{attributes}</tbody></table>
                </div>
                <ReviewList productId={this.state.id} />
            </div>
        );
    }
});

var AddProduct = React.createClass({
    render: function() {
        return (
            <div className="content-wrap">
                <h1>Dodaj produkt</h1>
                <ProductForm />
            </div>
        );
    }
});

var AddCategory = React.createClass({
    render: function() {
        return (
            <div className="content-wrap">
                <CategoryForm />
            </div>
        );
    }
});

// -----------------------

var UserListPage = React.createClass({
    getInitialState: function() {
        return {users:[]};
    },
    componentDidMount: function() {
        qwest.get('/api/users').then((xhr, response) => {
            this.setState(response);
        });
    },
    render: function() {
        var users = this.state.users.map(
            user => 
                <li>
                    <div className="user">
                        <Link to={`/uzytkownicy/${user.nick}`}>{user.nick} ({user.mail})</Link>
                    </div>
                </li>
        );

        return (
            <div className="content-wrap">
                <h1>Użytkownicy</h1>
                <ul>{users}</ul>
            </div>
        );
    }
});

var UserPage = React.createClass({
    getInitialState: function() {
        return {reviews: []};
    },
    componentDidMount: function() {
        qwest.get(`/api/users/${this.props.params.userId}/reviews`).then((xhr, response) => {
            this.setState(response);
        });
    },
    render: function() {
        var userReviews = this.state.reviews.map(
            rev => <div className="user-review">
                <Link to={`/produkty/${rev.id}`}><b>{rev.name}</b></Link>
                <p>{rev.comment} ({rev.rating}/10)</p>
            </div>
        );

        return ( 
            <div className="content-wrap">
                <h1>{this.props.params.userId}</h1>
                <div className="box"><h2>Opinie użytkownika</h2>{userReviews}</div>
            </div>
        );
    }
});

var RegisterPage = React.createClass({
    getInitialState: function() {
        return { nickError: false, emailError: false };
    },
    componentDidMount: function() {
        this.checkNick = debounce(this.checkNick, 500);
        this.checkMail = debounce(this.checkMail, 500);
    },
    register: function() {
        var data = {
            username: this.refs.usr.value,
            email: this.refs.mail.value,
            password: this.refs.pw.value
        };

        if (!data.username || !data.email || !data.password) {
            this.setState({nickError: 'Żadne z pól nie może być puste'});
        } else {
            qwest.post('/api/users', data, {dataType:'json'})
                .then((xhr, response) => { window.location = '/'; });
        }
    },
    checkNick: function() {
        var data = {username: this.refs.usr.value}
        qwest.post('/api/availability/name', data, {dataType:'json'})
            .then((xhr, response) => {
                if (response.error) {
                    this.setState({nickError: response.error});
                } else {
                    this.setState({nickError: false});
                }
            });
    },
    checkMail: function() {
        var data = {email: this.refs.mail.value}
        qwest.post('/api/availability/email', data, {dataType:'json'})
            .then((xhr, response) => {
                if (response.error) {
                    this.setState({emailError: response.error});
                } else {
                    this.setState({emailError: false});
                }
            });
    },
    render: function() {
        var error = <span className="error">{this.state.emailError||this.state.nickError}</span>;

        return (
            <div className="content-wrap">
                <h1>Zarejestruj się</h1>
                <div className="box box-60">
                    {(this.state.emailError||this.state.nickError)&&error}
                    <table><tbody>
                    <tr><td>Nazwa użytkownika</td> <td><input onChange={this.checkNick} ref="usr" /></td></tr>
                    <tr><td>Adres email</td> <td><input onChange={this.checkMail} ref="mail" /></td></tr>
                    <tr><td>Hasło</td> <td><input ref="pw" type="password" /></td></tr>
                    </tbody></table>
                    <br /><button onClick={this.register}>Zarejestruj się</button>
                </div>
            </div>
        );
    }
});

// -----------------------------------------------------------------

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
    ), document.body
);