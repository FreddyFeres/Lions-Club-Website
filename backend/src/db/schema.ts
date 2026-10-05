import {
  pgTable, text, boolean, integer, doublePrecision,
  timestamp, unique,
} from 'drizzle-orm/pg-core';

// ── Users ─────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:               text('id').primaryKey(),
  email:            text('email').notNull().unique(),
  password:         text('password').notNull(),
  firstName:        text('first_name').notNull(),
  lastName:         text('last_name').notNull(),
  phone:            text('phone'),
  avatar:           text('avatar'),
  role:             text('role').notNull().default('normal_user'),
  membershipNumber: text('membership_number').unique(),
  duesPaidUntil:    timestamp('dues_paid_until'),
  isActive:         boolean('is_active').notNull().default(true),
  bio:              text('bio'),
  address:          text('address'),
  occupation:       text('occupation'),
  createdAt:        timestamp('created_at').notNull().defaultNow(),
  updatedAt:        timestamp('updated_at').notNull().defaultNow(),
});

// ── Refresh Tokens ────────────────────────────────────────────────────────────
export const refreshTokens = pgTable('refresh_tokens', {
  id:        text('id').primaryKey(),
  token:     text('token').notNull().unique(),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ── Events ────────────────────────────────────────────────────────────────────
export const events = pgTable('events', {
  id:          text('id').primaryKey(),
  title:       text('title').notNull(),
  slug:        text('slug').notNull().unique(),
  description: text('description').notNull(),
  location:    text('location').notNull(),
  startDate:   timestamp('start_date').notNull(),
  endDate:     timestamp('end_date'),
  image:       text('image'),
  category:    text('category').notNull().default('general'),
  capacity:    integer('capacity'),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
});

// ── Event Bookings ────────────────────────────────────────────────────────────
export const eventBookings = pgTable('event_bookings', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventId:   text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  status:    text('status').notNull().default('confirmed'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  unq: unique().on(t.userId, t.eventId),
}));

// ── Meetings ──────────────────────────────────────────────────────────────────
export const meetings = pgTable('meetings', {
  id:          text('id').primaryKey(),
  title:       text('title').notNull(),
  description: text('description'),
  location:    text('location').notNull(),
  date:        timestamp('date').notNull(),
  agenda:      text('agenda'),
  pvFile:      text('pv_file'),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
});

// ── Meeting Attendance ────────────────────────────────────────────────────────
export const meetingAttendance = pgTable('meeting_attendance', {
  id:         text('id').primaryKey(),
  meetingId:  text('meeting_id').notNull().references(() => meetings.id, { onDelete: 'cascade' }),
  userId:     text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rsvpStatus: text('rsvp_status').notNull().default('pending'),
  status:     text('status'),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
  updatedAt:  timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  unq: unique().on(t.meetingId, t.userId),
}));

// ── Transactions ──────────────────────────────────────────────────────────────
export const transactions = pgTable('transactions', {
  id:          text('id').primaryKey(),
  type:        text('type').notNull(),
  category:    text('category').notNull(),
  amount:      doublePrecision('amount').notNull(),
  description: text('description').notNull(),
  date:        timestamp('date').notNull(),
  receipt:     text('receipt'),
  userId:      text('user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
});

// ── Donations ─────────────────────────────────────────────────────────────────
export const donations = pgTable('donations', {
  id:        text('id').primaryKey(),
  name:      text('name'),
  email:     text('email'),
  amount:    doublePrecision('amount').notNull(),
  message:   text('message'),
  anonymous: boolean('anonymous').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ── Documents ─────────────────────────────────────────────────────────────────
export const documents = pgTable('documents', {
  id:         text('id').primaryKey(),
  title:      text('title').notNull(),
  category:   text('category').notNull().default('general'),
  fileUrl:    text('file_url').notNull(),
  fileName:   text('file_name').notNull(),
  fileSize:   integer('file_size'),
  mimeType:   text('mime_type'),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  isPublic:   boolean('is_public').notNull().default(false),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
});

// ── Service Hours ─────────────────────────────────────────────────────────────
export const serviceHours = pgTable('service_hours', {
  id:           text('id').primaryKey(),
  userId:       text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  activity:     text('activity').notNull(),
  description:  text('description'),
  hours:        doublePrecision('hours').notNull(),
  date:         timestamp('date').notNull(),
  status:       text('status').notNull().default('pending'),
  rejectReason: text('reject_reason'),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
  updatedAt:    timestamp('updated_at').notNull().defaultNow(),
});

// ── Applications ──────────────────────────────────────────────────────────────
export const applications = pgTable('applications', {
  id:                     text('id').primaryKey(),
  userId:                 text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  birthDate:              text('birth_date').notNull(),
  statusType:             text('status_type').notNull(),
  fieldOfStudy:           text('field_of_study').notNull(),
  hasPastExperience:      boolean('has_past_experience').notNull().default(false),
  pastExperienceDetails:  text('past_experience_details'),
  skills:                 text('skills').notNull(),
  motivation:             text('motivation').notNull(),
  discoveryChannel:       text('discovery_channel').notNull(),
  availability:           text('availability').notNull(),
  readyForResponsibility: boolean('ready_for_responsibility').notNull().default(false),
  status:                 text('status').notNull().default('pending'),
  createdAt:              timestamp('created_at').notNull().defaultNow(),
  updatedAt:              timestamp('updated_at').notNull().defaultNow(),
});

// ── Notifications ─────────────────────────────────────────────────────────────
export const notifications = pgTable('notifications', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:     text('title').notNull(),
  message:   text('message').notNull(),
  type:      text('type').notNull().default('info'),
  isRead:    boolean('is_read').notNull().default(false),
  link:      text('link'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
