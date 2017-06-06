import React, { Component } from 'react';
import moment from 'moment';
import { Card, Image, Button, Rating, Header, Divider, Label, Icon } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import LoginModal from '../components/LoginModal';
import '../../public/styles/event.scss';

class Event extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalFocus: false,
    };
    this.bottomPart = this.bottomPart.bind(this);
    this.getEventCreator = this.getEventCreator.bind(this);
    this.changeModalState = this.changeModalState.bind(this);
    this.clearModalFocus = this.clearModalFocus.bind(this);
  }
  getEventCreator(event) {
    console.log(this.props);
    fetch(`/events/${event.id}`, { credentials: 'include' })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.users.forEach((user) => {
          if (user.role === 'creator') {
            return user.display_name;
          }
        });
      });
  }

  changeModalState() {
    this.setState({ modalFocus: true });
  }

  clearModalFocus(){
    this.setState({ modalFocus: false });
  } 

  bottomPart() {
    if (parent === 'User') {
    // parent === user
      const role = event.role;
      const roleStyle = { color: roleStyles[role] };
      if (role === 'creator') {
      // role === creator
        event.full ? (
        // event is full
          bottomPart = (
            <Card.Content extra >
              <Card.Header>
                This event's roster is curently <strong style={roleStyle}>full</strong>!
              </Card.Header>
              <Button negative onClick={() => deleteClick(event)}>Delete Event</Button>
            </Card.Content>
          )
        ) : (
        // event is not full
          bottomPart = (
            <Card.Content extra >
              <Button.Group widths={2}>
                <Button onClick={() => changeModalFocusClick('Modal')} >View Roster</Button>
                <Button.Or />
                <Button negative onClick={() => deleteClick(event)}>Delete Event</Button>
              </Button.Group>
            </Card.Content>
          )
        );
      } else {
      // role !== creator
        this.props.showConfirmButtons ? (
        // if show confirm buttons
          bottomPart = (
            <Card.Content extra>
              <Card.Header>Are you sure you want to leave this event?</Card.Header>
              <Button.Group widths={2}>
                <Button
                  onClick={this.props.handleLeaveClick.bind(null, this.props.user, this.props.event)}
                  content="Yes, Leave event."
                />
                <Button.Or />
                <Button
                  negative
                  onClick={toggleConfirm}
                  content="No, I don't want to leave the event"
                />
              </Button.Group>
            </Card.Content>
          )
        ) : (
          bottomPart = (
            <Card.Content extra>
              <Card.Header>
                Your current status for this event:
                  <strong style={roleStyle}> {role.toUpperCase()} </strong>
              </Card.Header>
              <Button negative onClick={toggleConfirm}>Leave Event</Button>
            </Card.Content>
          )
        );
      }
    } else if (parent === 'Grid') {
    // parent === Grid
      if (user.display_name) {
        !joinConfirm ? (
          bottomPart = (
            <Card.Content extra>
              <Button
                onClick={() => {
                  joinEvent(user, event);
                  toggleJoin();
                }}
              >
                Join Event
              </Button>
              <Label className="message-button" position="bottom right">
                <Icon name="mail outline" />
                  Message
                <Label.Detail>Veronika - Creator</Label.Detail>
              </Label>
            </Card.Content>
          )
        ) : (
          bottomPart = (
            <Card.Content extra>
              <Card.Header
                content="Success!"
              />
              <Button
                content="Close"
                onClick={() => {
                  changeModalFocusClick();
                  toggleJoin();
                }}
              />
            </Card.Content>
          )
        );
      } else {
      // user exists
        bottomPart = (
          <Card.Content extra>
            <Card.Header>Log in to join events!</Card.Header>
            <LoginModal />
          </Card.Content>
        )
      }
    }
  }
  render() {
    const roleStyles = { creator: 'green', approved: 'green', pending: 'orange', declined: 'red' };
    const imgStyle = {
      height: '220px',
    };
    return (
      <div>
        <Card centered fluid raised>
          <Image src={event.img_url} style={imgStyle} />
          <Card.Content>
            <Card.Header>
              {event.title}
            </Card.Header>
            <Card.Meta>
              <span className="date">
                Takes place {moment(event.date_time).format('ll')}
              </span>
            </Card.Meta>
            <Divider />
            <Card.Description>
              <Header sub className="eventInfoHeader"> Description: </Header>
              {event.description}
              <Header sub className="eventInfoHeader"> Location: </Header>
              {event.location}
              <Header sub className="eventInfoHeader"> Weather: </Header>
              {
                this.props.weather ? (
                  <div>
                    <p>{this.props.weather[1]}</p>
                    <p>{this.props.weather[0]}</p>
                  </div>
                ) : (
                  null
                )
              }
              <Header sub>Required Skill: </Header>
              <Rating defaultRating={event.skill_level} maxRating={5} disabled />
            </Card.Description>
          </Card.Content>
          {this.bottomPart()}
        </Card>
        <Modal
          dimmer="blurring"
          basic
          onClose={() => this.props.clearModalFocus()}
          size="small"
          open={Boolean(this.state.modalFocus)}
        >
        <Card centered fluid>
          <Inbox />
        </Card>
      </Modal>
    </div>
    );
  }
}

Event.propTypes = {
  showConfirmButtons: PropTypes.bool.isRequired,
  joinConfirm: PropTypes.bool.isRequired,
  parent: PropTypes.string.isRequired,
  changeModalFocusClick: PropTypes.func.isRequired,
  deleteClick: PropTypes.func.isRequired,
  handleLeaveClick: PropTypes.func.isRequired,
  toggleConfirm: PropTypes.func.isRequired,
  joinEvent: PropTypes.func.isRequired,
  event: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    date_time: PropTypes.string,
    full: PropTypes.number,
    needs: PropTypes.number,
    category: PropTypes.string,
    img_url: PropTypes.string,
    location: PropTypes.string,
    lat: PropTypes.number,
    lng: PropTypes.number,
    skill_level: PropTypes.number,
    habitat: PropTypes.string,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
  }).isRequired,
  user: PropTypes.shape({
    id: PropTypes.number,
    oauth_provider: PropTypes.string,
    provider_id: PropTypes.string,
    display_name: PropTypes.string,
    img_url: PropTypes.string,
    contact_number: PropTypes.string,
    email: PropTypes.string,
    bio: PropTypes.string,
    age: PropTypes.number,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    messages: PropTypes.any,
    events: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
};

export default Event;
