import {css} from 'react-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {IconAvatar, Row} from 'universal/components';
import AcknowledgeButton from 'universal/modules/notifications/components/AcknowledgeButton/AcknowledgeButton';
import defaultStyles from 'universal/modules/notifications/helpers/styles';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import {clearNotificationLabel} from '../../helpers/constants';

const TeamArchived = (props) => {
  const {
    atmosphere,
    notification,
    submitting,
    submitMutation,
    onError,
    onCompleted
  } = props;
  const {notificationId, team: {teamName}} = notification;
  const acknowledge = () => {
    submitMutation();
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted);
  };

  return (
    <Row compact>
      <div className={css(defaultStyles.icon)}>
        <IconAvatar icon="archive" size="small" />
      </div>
      <div className={css(defaultStyles.message)}>
        {'The team '}<b>{teamName}</b>{' was archived.'}
      </div>
      <div className={css(defaultStyles.iconButton)}>
        <AcknowledgeButton
          aria-label={clearNotificationLabel}
          onClick={acknowledge}
          waiting={submitting}
        />
      </div>
    </Row>
  );
};

TeamArchived.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.object.isRequired
};

export default createFragmentContainer(
  TeamArchived,
  graphql`
    fragment TeamArchived_notification on NotifyTeamArchived {
      notificationId: id
      team {
        teamName: name
      }
    }
  `
);
