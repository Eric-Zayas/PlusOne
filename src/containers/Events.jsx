// Import React and Redux Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Waypoint from 'react-waypoint';
import { filter } from 'lodash/collection';
import { escapeRegExp } from 'lodash/string';

// local dependencies
import { Container, Search, Grid, Divider, Modal, Button } from 'semantic-ui-react';
import MenuBar from '../components/MenuBar';
import GridEvent from '../components/GridEvent';
import Event from '../components/Event';
import { fetchEvents } from '../actions/eventActions';
import { joinEvent } from '../actions/actions';
import '../../public/styles/events.scss';

class Events extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalFocus: false,
      page: 1,
      weather : [],
    };

    this.handleElementClick = this.handleElementClick.bind(this);
    this.getWeather = this.getWeather.bind(this);
  }

  componentWillMount() {
    this.resetComponent();
  }

  getMoreEvents = () => {
    this.setState({ page: this.state.page});
    this.props.fetchEvents(this.state.page);
    console.log(this.state.page);
  }

  clearModalFocus = () => this.setState({ modalFocus: false })

  handleElementClick = (event) => {
    this.setState({ modalFocus: event });
  }

  handleJoinEvent = (user, event) => this.props.joinEvent(user, event);

  resetComponent = () => this.setState({ isLoading: false, results: [], value: '' });

  handleResultSelect = (e, result) => this.setState({ value: result.description })

  handleSearchChange = (e, value) => {
    this.setState({ isLoading: true, value });

    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent();

      const re = new RegExp(escapeRegExp(this.state.value), 'i');
      const isMatch = result => re.test(result.description);

      this.setState({
        isLoading: false,
        results: filter(this.props.eventsList, isMatch),
      });
    }, 500);
  }
  
  getWeather(){
    const { user } = this.props;
    const geoLoc =  user.events[0].lat + ',' + user.events[0].lng;
    const time = moment(user.events.date_time).format('X');
 
    fetch(`/api/weather?info=${time}&loc=${geoLoc}`,{
      headers: {'Content-Type': 'application/json'},
      method: "GET",
    })
    .then((response) => {
       console.log('get weather is being called');
      return response.json();
    })
    .then((data) => {
     
      let arr = [];
      arr.push(data.hourly.summary);
      arr.push(data.hourly.data[0].temperature);
      this.setState({weather : arr});
      user.events.weather = this.state.weather
    })
  }

  render = () => {
    const { eventsList, user } = this.props;
    const { isLoading, value, results } = this.state;

    return (
      <Container className="events-page" >
        <MenuBar />
        <Search
          loading={isLoading}
          onSearchChange={this.handleSearchChange}
          results={results}
          value={value}
          {...this.props}
        />
        <Divider />
        <Grid centered columns={2} stackable stretched >
          {eventsList === undefined ? null : eventsList.map((event) => {
            return (
              <GridEvent key={event.id} event={event} handleElementClick={this.handleElementClick} />
            );
          })}
        </Grid>
        <Modal
          dimmer="blurring"
          basic
          onClose={() => this.clearModalFocus()}
          size="small"
          open={Boolean(this.state.modalFocus)}
         
        >
          <Event
            parent="Grid"
            user={user}
            event={this.state.modalFocus}
            deleteClick=""
            changeModalFocusClick=""
            joinEvent={this.handleJoinEvent}
            weather={this.state.weather}
          
          />
        </Modal>
        <Waypoint
          onEnter={() => this.getMoreEvents()}
        />
      </Container>
    );
  }
}

const mapStatetoProps = ({ events, user }) => ({ 
  eventsList: events.eventsList,
  user,
});

export default connect(
  mapStatetoProps,
  {
    fetchEvents,
    joinEvent,
  })(Events);
