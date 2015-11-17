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
            <h2>{props.name}</h2>
            {attrs}
        </div>
    );

};

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
            <Route path="kategorie/dodaj" component={AddCategory} />
        </Route>
    </Router>
    ), document.body
);