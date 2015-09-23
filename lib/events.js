'use strict';

module.exports = {
  CLIENT_CONNECTED:'client:connected',

  CLIENT_CREATE_PUBLIC_ROOM:'client:create-public-room',
  CLIENT_FIND_PUBLIC_ROOM:'client:find-public-room',
  CLIENT_CREATE_PRIVATE_ROOM:'client:create-private-room',
  CLIENT_JOIN_PRIVATE_ROOM:'client:join-private-room',
  CLIENT_READY:'client:ready',

  ROOM_CREATED:'room:created',
  ROOM_NOT_FOUND:'room:not-found',
  ROOM_FOUND:'room:found',
  ROOM_JOINED:'room:joined',

  GAME_READY:'game:ready',
  GAME_FAILED:'game:failed'
};
