var React = require('react');
var {Link} = require('react-router');
var qwest = require('qwest');

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
            .catch((e, xhr, response) => { alert(response.error); })
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
            .catch((e, xhr, response) => { alert(response.error); })
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

module.exports = {
    AddProduct: AddProduct,
    ProductList: ProductList,
    ProductPage: ProductPage
}