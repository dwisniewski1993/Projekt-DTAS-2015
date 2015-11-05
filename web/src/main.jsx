var App = React.createClass({
    render: function() {
        return (<div>
            <TopBar />
            <ReviewList />
            </div>
        );
    }
});

var TopBar = React.createClass({
    render: function() {
        return (
            <div id="top">
                <span id="logo">Test</span>
            </div>
        );
    }
});

var Review = React.createClass({
    render: function() {
        return <div className="review">nick: {this.props.nickname}<br />review: {this.props.text_review}</div>;
    }
});

var ReviewList = React.createClass({
    componentDidMount: function() {
      qwest.get('/products/2/reviews')
        .then((xhr, response) => { this.setState(response); })
    },
    getInitialState: function() {
        return {reviews: []};
    },
    render: function() {
        var list = this.state.reviews.map(
            reviewData => { return <Review key={reviewData.nickname} {...reviewData}/>; }
        );
        return <div>{list}</div>;
    }
});


ReactDOM.render(
    <App />,
    document.getElementById('app')
);