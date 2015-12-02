var {Router, Route, IndexRoute, Link} = ReactRouter;
var {createHistory} = window.History;

var TopBar = (props) =>
    <div id="top-bar-wrap">
        <header id="top-bar">
            <span id="logo">Serwis do oceniania</span>
            <div id="user">
                <span>{props.username}</span>
                <div id="avatar">xD</div>
            </div>
        </header>
    </div>;

var MainMenu = () =>
    <div id="main-nav-wrap">
        <nav id="main-nav">
            <Link activeClassName="active" to="/produkty">Lista produktów</Link>
            <Link activeClassName="active" to="/produkty/dodaj">Dodaj produkt</Link>
            <Link activeClassName="active" to="/kategorie/dodaj">Dodaj kategorię</Link>
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
            attr => <input ref={attr.id} placeholder={attr.name} />
        );

        return (
            <div>
                <h1>Dodaj produkt</h1>
                <select ref="kategoria" onChange={this.showFields}>{categories}</select>
                <input ref="nazwa" placeholder="Nazwa produktu" />
                {fields}
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

var ReviewList = React.createClass({
    getInitialState: function() {
        return {reviews: []};
    },
    componentDidMount: function() {
        qwest.get(`/api/products/${this.props.productId}/reviews`)
            .then((xhr, response) => { this.setState(response); });
    },
    addReview: function(review) {
        var reviews = this.state.reviews.concat([review]);
        this.setState({reviews:reviews});
    },
    render: function() {
        var reviews = this.state.reviews.map(data =>
            <div className="user-review">
                <p>{data.comment}</p>
                <b>{data.nick}</b>, {data.rating}/10
            </div>
        );

        var avg = 0;
        if (this.state.reviews.length) {
            var ratings = this.state.reviews.map(data => data.rating);
            avg = ratings.reduce((prev,curr) => prev+curr) / ratings.length;
        }

        return (
            <div className="box reviews">
                <h2>Opinie</h2>
                {reviews}
                Średnia: {avg}<br /><br />
                <ReviewForm productId={this.props.productId}
                    addReview={this.addReview} />
            </div>
        );
    }
});

var ReviewForm = React.createClass({
    getInitialState: function() {
        return {
            rating: 0,
            color: "positive"
        };
    },
    componentDidMount: function() {
        this.updateRating();
    },
    updateRating: function() {
        var newRating = this.refs.rating.value;

        var color = "positive";
        if (newRating <= 3)
            color = "negative";
        else if (newRating <= 6)
            color = "mixed";

        this.setState({rating: newRating, color: color});
    },
    addReview: function() {
        var review = {
            pid: this.props.productId,
            nick: this.refs.nick.value,
            rating: parseInt(this.refs.rating.value),
            comment: this.refs.comment.value
        }

        qwest.post('/api/reviews/', review, {dataType:'json'})
            .then((xhr, response) => { this.props.addReview(review); })
    },
    render: function() {
        return (
            <div>
                <h2>Oceń produkt</h2>
                <div className="form-row">
                    <span className="name">Twój nick</span>
                    <input className="value" ref="nick" type="text" />
                </div>
                <div className="form-row">
                    <span className="name">
                        Ocena: <span className={`rating ${this.state.color}`}>{this.state.rating}</span>
                    </span>
                    <input className="value" ref="rating" onChange={this.updateRating}
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

// -----------------------------------------------------------------

var App = (props) =>
    <div>
        <TopBar username="user 1" />
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
        </Route>
    </Router>
    ), document.body
);