import styled from 'react-emotion';
import ui from 'universal/styles/ui';

const MeetingCopy = styled('div')(({margin}) => ({
  color: ui.colorText,
  fontSize: ui.meetingCopyFontSize,
  lineHeight: 1.5,
  margin: margin || '1.5em 0'
}));

export default MeetingCopy;
