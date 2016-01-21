var React = require('react');
var {Link} = require('react-router');
var qwest = require('qwest');
var debounce = require('./debounce.js');

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
                        <Link to={`/uzytkownicy/${user.id}`}>{user.nick} ({user.mail})</Link>
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
        return {reviews: [], nick:"", mail:""};
    },
    componentDidMount: function() {
        qwest.get(`/api/users/${this.props.params.userId}`).then((xhr, response) => {
            this.setState(response);
        });
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
                <h1>{this.state.nick} ({this.state.mail})</h1>
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

module.exports = {
    UserListPage: UserListPage,
    UserPage: UserPage,
    RegisterPage: RegisterPage
}