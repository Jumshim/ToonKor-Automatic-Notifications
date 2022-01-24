'use strict';

//python -m SimpleHTTPServer
//create a new app inside 
//network call -> db -> render

class Thingy extends React.Component{
  componentDidMount() {
    console.log('Component Did Mount');
  }

  componentDidUpdate() {
    console.log('Component did update');
  }

  componentWillUnmount() {
    console.log('Component has unmounted');
  }

  render() {
    return (
      <span>{this.props.value}</span>
    );
  }
}

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false, data: [] };
  }

  componentDidMount() {
    fetch('http://localhost:3000/data').then(res => res.json()).then(res => this.setState({ data: res }));
    console.log('Component Did Mount');
  }

  componentDidUpdate() {
    console.log('Component did update');
  }

  componentWillUnmount() {
    console.log('Component has unmounted');
  }

  render() {
    if (this.state.liked) {
      return 'You liked this.';
    }

    console.log(this.state);

    return (
      <div>
        {this.state.data.map(webtoon => <Thingy value={webtoon.title}></Thingy>)}
        <button onClick={() => this.setState({ liked: true })}>
          Like
        </button>
      </div>
    );
  }
}



const domContainer = document.querySelector('#like_button_container');
ReactDOM.render(<LikeButton/>, domContainer);