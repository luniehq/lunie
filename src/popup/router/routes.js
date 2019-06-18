import SessionWelcome from 'common/TmSessionWelcome';
import SessionExplore from 'common/TmSessionExplore';
import SessionSignUp from 'common/TmSessionSignUp';
import SessionSignIn from 'common/TmSessionSignIn';
import SessionHardware from 'common/TmSessionHardware';
import SessionImport from 'common/TmSessionImport';
import SessionAccountDelete from 'common/TmSessionAccountDelete';

export default [
  {
    path: '/',
    component: SessionWelcome,
  },
];
