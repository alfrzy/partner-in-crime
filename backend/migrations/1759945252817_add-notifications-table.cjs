/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('notifications', {
    id: 'id',
    recipient_id: { type: 'integer', notNull: true, references: '"users"', onDelete: 'cascade' },
    sender_id: { type: 'integer', notNull: true, references: '"users"', onDelete: 'cascade' },
    type: { type: 'varchar(20)', notNull: true }, // 'like' atau 'comment'
    post_id: { type: 'integer', references: '"posts"', onDelete: 'cascade' },
    is_read: { type: 'boolean', notNull: true, default: false },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = pgm => {
  pgm.dropTable('notifications');
};