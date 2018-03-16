import React, { Component } from 'react';
import './App.css';
import Signup from './Signup';
import Login from './Login';
import {UserProfile} from './UserProfile';
import axios from 'axios';

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      token: '',
      user: {}
    }
    this.liftTokenToState = this.liftTokenToState.bind(this)
    this.logout = this.logout.bind(this)
  }

  liftTokenToState(data){
    console.log(data.user, data.token);
    this.setState({
      token: data.token,
      user:data.user
    })
  }

  logout(){
    console.log('logging out');
    localStorage.removeItem('mernToken')
    this.setState({token:'',user:{}})
  }

  componentDidMount() {
    var token = localStorage.getItem('mernToken')
    console.log(token);
    if(token === 'undefined' || token === 'null' || token === ''|| token === undefined){
      localStorage.removeItem('mernToken')
      this.setState({
        token:'',
        user:{}
      })
    } else {
      axios.post('/auth/me/from/token', {token}).then(result=>{
        localStorage.setItem('mernToken', result.data.token)
        this.setState({
          token: result.data.token,
          user: result.data.user
        })
      }).catch(error=>console.log(error))
    }
  }

  render() {
    let theUser = this.state.user
    if (typeof theUser === 'object' && Object.keys(theUser).length > 0){
      return(
        <div>
          <UserProfile user={theUser} logout={this.logout} />
        </div>
      )
    } else {
      return (
        <div className="App">
          <Signup liftToken={this.liftTokenToState} />
          <Login liftToken={this.liftTokenToState} />
        </div>
      )
    }
  }
}

export default App;
