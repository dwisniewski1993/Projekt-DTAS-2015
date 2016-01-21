var React = require('react');
var qwest = require('qwest');

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
            .catch((e, xhr, response) => { alert(response.error); })
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


var AddCategory = React.createClass({
    render: function() {
        return (
            <div className="content-wrap">
                <CategoryForm />
            </div>
        );
    }
});

module.exports = {
    AddCategory: AddCategory
}