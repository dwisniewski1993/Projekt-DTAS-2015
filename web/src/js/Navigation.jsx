var React = require('react');
var {Link} = require('react-router');
var qwest = require('qwest');

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
            .then((xhr,response) => {window.location = '/produkty'; })
            .catch((e, xhr, response) => { this.setState({badData:true}); })
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
    </div>;

module.exports = {
    TopBar: TopBar,
    MainMenu: MainMenu
};