/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('chat_rooms', {
    id: 'id',
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createTable('chat_participants', {
    id: 'id',
    user_id: { type: 'integer', notNull: true, references: '"users"', onDelete: 'cascade' },
    room_id: { type: 'integer', notNull: true, references: '"chat_rooms"', onDelete: 'cascade' },
  });
  
  // Index untuk pencarian cepat
  pgm.addConstraint('chat_participants', 'chat_participants_user_id_room_id_key', { unique: ['user_id', 'room_id'] });

  pgm.createTable('messages', {
    id: 'id',
    room_id: { type: 'integer', notNull: true, references: '"chat_rooms"', onDelete: 'cascade' },
    sender_id: { type: 'integer', notNull: true, references: '"users"', onDelete: 'cascade' },
    content: { type: 'text', notNull: true },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = pgm => {
  pgm.dropTable('messages');
  pgm.dropTable('chat_participants');
  pgm.dropTable('chat_rooms');
};