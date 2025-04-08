#!/bin/bash

# Create models directory
mkdir -p models

# Function to create a model file
create_model() {
  local filename=$1
  local content=$2
  echo "$content" > "models/$filename"
  echo "Created models/$filename"
}

# Create all model files
create_model "User.js" "$(cat <<EOF
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email_id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  registered_at: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
EOF
)"

create_model "UserDetails.js" "$(cat <<EOF
const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, ref: 'User' },
  image: { type: String, ref: 'File' },
  status: { type: String, required: true }
});

module.exports = mongoose.model('UserDetails', userDetailsSchema);
EOF
)"

create_model "File.js" "$(cat <<EOF
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  fileType: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true }
});

module.exports = mongoose.model('File', fileSchema);
EOF
)"

create_model "Boards.js" "$(cat <<EOF
const mongoose = require('mongoose');

const boardsSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, ref: 'File' },
  created_at: { type: Date, required: true },
  created_by: { type: String, required: true, ref: 'User' }
});

module.exports = mongoose.model('Boards', boardsSchema);
EOF
)"

create_model "Clubs.js" "$(cat <<EOF
const mongoose = require('mongoose');

const clubsSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  board_id: { type: String, required: true, ref: 'Boards' },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, ref: 'File' },
  created_at: { type: Date, required: true },
  created_by: { type: String, required: true, ref: 'User' }
});

module.exports = mongoose.model('Clubs', clubsSchema);
EOF
)"

create_model "UserRole.js" "$(cat <<EOF
const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, ref: 'User' },
  role: { type: String, enum: ['super_admin', 'admin', 'club_Admin', 'Normal'], required: true },
  club_id: { type: String, ref: 'Clubs' },
  board_id: { type: String, ref: 'Boards' }
});

module.exports = mongoose.model('UserRole', userRoleSchema);
EOF
)"

create_model "Posts.js" "$(cat <<EOF
const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  files: [{ type: String, ref: 'File' }],
  created_at: { type: Date, required: true },
  created_by: { type: String, required: true, ref: 'User' },
  club_id: { type: String, ref: 'Clubs' },
  board_id: { type: String, ref: 'Boards' }
});

module.exports = mongoose.model('Posts', postsSchema);
EOF
)"

create_model "PostLikes.js" "$(cat <<EOF
const mongoose = require('mongoose');

const postLikesSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, ref: 'User' },
  post_id: { type: String, required: true, ref: 'Posts' }
});

module.exports = mongoose.model('PostLikes', postLikesSchema);
EOF
)"

create_model "Event.js" "$(cat <<EOF
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  club_id: { type: String, required: true, ref: 'Clubs' },
  board_id: { type: String, required: true, ref: 'Boards' },
  event_or_session: { type: String, required: true },
  name: { type: String, required: true },
  venue: { type: String, required: true },
  timestamp: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, ref: 'File' },
  event_type_id: { type: String, required: true, ref: 'EventType' }
});

module.exports = mongoose.model('Event', eventSchema);
EOF
)"

create_model "EventType.js" "$(cat <<EOF
const mongoose = require('mongoose');

const eventTypeSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  content: { type: String, required: true }
});

module.exports = mongoose.model('EventType', eventTypeSchema);
EOF
)"

create_model "EventCoordinators.js" "$(cat <<EOF
const mongoose = require('mongoose');

const eventCoordinatorsSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  event_id: { type: String, required: true, ref: 'Event' },
  user_id: { type: String, required: true, ref: 'User' }
});

module.exports = mongoose.model('EventCoordinators', eventCoordinatorsSchema);
EOF
)"

create_model "RSVP.js" "$(cat <<EOF
const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  event_id: { type: String, required: true, ref: 'Event' },
  user_id: { type: String, required: true, ref: 'User' },
  timestamp: { type: String, required: true }
});

module.exports = mongoose.model('RSVP', rsvpSchema);
EOF
)"

create_model "ClubFollow.js" "$(cat <<EOF
const mongoose = require('mongoose');

const clubFollowSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  club_id: { type: String, required: true, ref: 'Clubs' },
  user_id: { type: String, required: true, ref: 'User' },
  timestamp: { type: String, required: true }
});

module.exports = mongoose.model('ClubFollow', clubFollowSchema);
EOF
)"

create_model "BoardFollow.js" "$(cat <<EOF
const mongoose = require('mongoose');

const boardFollowSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  board_id: { type: String, required: true, ref: 'Boards' },
  user_id: { type: String, required: true, ref: 'User' },
  timestamp: { type: String, required: true }
});

module.exports = mongoose.model('BoardFollow', boardFollowSchema);
EOF
)"

create_model "BanClub.js" "$(cat <<EOF
const mongoose = require('mongoose');

const banClubSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  club_id: { type: String, required: true, ref: 'Clubs' },
  banned_by_id: { type: String, required: true, ref: 'User' },
  banned_at: { type: String, required: true },
  reason: { type: String, required: true }
});

module.exports = mongoose.model('BanClub', banClubSchema);
EOF
)"

create_model "BanUser.js" "$(cat <<EOF
const mongoose = require('mongoose');

const banUserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, ref: 'User' },
  banned_by_id: { type: String, required: true, ref: 'User' },
  banned_at: { type: String, required: true },
  reason: { type: String, required: true }
});

module.exports = mongoose.model('BanUser', banUserSchema);
EOF
)"

create_model "ClubCreationRequest.js" "$(cat <<EOF
const mongoose = require('mongoose');

const clubCreationRequestSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  board_id: { type: String, required: true, ref: 'Boards' },
  user_id: { type: String, required: true, ref: 'User' },
  status: { type: String, enum: ['pending_admin_approval', 'pending_super_admin_approval'], required: true }
});

module.exports = mongoose.model('ClubCreationRequest', clubCreationRequestSchema);
EOF
)"

create_model "Blogs.js" "$(cat <<EOF
const mongoose = require('mongoose');

const blogsSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  introduction: { type: String, required: true },
  main_content: { type: String, required: true },
  conclusion: { type: String, required: true },
  author_info: { type: String, required: true },
  published_at: { type: Date, required: true },
  published_by: { type: String, required: true, ref: 'User' },
  keywords: [{ type: String }],
  image: { type: String, ref: 'File' },
  images: [{ type: String, ref: 'File' }]
});

module.exports = mongoose.model('Blogs', blogsSchema);
EOF
)"

create_model "Forums.js" "$(cat <<EOF
const mongoose = require('mongoose');

const forumsSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String, ref: 'File' },
  description: { type: String, required: true },
  number_of_views: { type: String, required: true },
  number_of_replies: { type: String, required: true },
  event_id: { type: String, ref: 'Event' },
  club_id: { type: String, ref: 'Clubs' },
  board_id: { type: String, ref: 'Boards' },
  user_id: { type: String, required: true, ref: 'User' },
  public_or_private: { type: String, required: true }
});

module.exports = mongoose.model('Forums', forumsSchema);
EOF
)"

create_model "ForumMember.js" "$(cat <<EOF
const mongoose = require('mongoose');

const forumMemberSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, ref: 'User' },
  forum_id: { type: String, required: true, ref: 'Forums' },
  joined_at: { type: String, required: true }
});

module.exports = mongoose.model('ForumMember', forumMemberSchema);
EOF
)"

create_model "ForumMemberBan.js" "$(cat <<EOF
const mongoose = require('mongoose');

const forumMemberBanSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, ref: 'User' },
  forum_id: { type: String, required: true, ref: 'Forums' },
  reason: { type: String, required: true },
  banned_at: { type: String, required: true },
  banned_by: { type: String, required: true, ref: 'User' }
});

module.exports = mongoose.model('ForumMemberBan', forumMemberBanSchema);
EOF
)"

create_model "ResourceLink.js" "$(cat <<EOF
const mongoose = require('mongoose');

const resourceLinkSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  resource_id: { type: String, required: true, ref: 'Resource' },
  content: { type: String, required: true }
});

module.exports = mongoose.model('ResourceLink', resourceLinkSchema);
EOF
)"

create_model "Resource.js" "$(cat <<EOF
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  resource_link_id: { type: String, required: true, ref: 'ResourceLink' },
  club_id: { type: String, ref: 'Clubs' },
  event_id: { type: String, ref: 'Event' },
  board_id: { type: String, ref: 'Boards' },
  user_id: { type: String, required: true, ref: 'User' }
});

module.exports = mongoose.model('Resource', resourceSchema);
EOF
)"

create_model "NotificationLink.js" "$(cat <<EOF
const mongoose = require('mongoose');

const notificationLinkSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  notification_id: { type: String, required: true, ref: 'Notification' },
  content: { type: String, required: true }
});

module.exports = mongoose.model('NotificationLink', notificationLinkSchema);
EOF
)"

create_model "Notification.js" "$(cat <<EOF
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  link_id: { type: String, required: true, ref: 'NotificationLink' },
  user_id: { type: String, required: true, ref: 'User' },
  status: { type: String, enum: ['read', 'not_read'], required: true }
});

module.exports = mongoose.model('Notification', notificationSchema);
EOF
)"

create_model "NotificationSettings.js" "$(cat <<EOF
const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, ref: 'User' },
  posts: { type: Boolean, required: true },
  events: { type: Boolean, required: true },
  blogs: { type: Boolean, required: true },
  projects: { type: Boolean, required: true },
  approval: { type: Boolean, required: true },
  resource: { type: Boolean, required: true },
  forum: { type: Boolean, required: true },
  memberships: { type: Boolean, required: true },
  opportunities: { type: Boolean, required: true }
});

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);
EOF
)"

create_model "Opportunities.js" "$(cat <<EOF
const mongoose = require('mongoose');

const opportunitiesSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  creator_id: { type: String, required: true, ref: 'User' },
  creator_type: { type: String, enum: ['admin', 'student_body'], required: true },
  expiry_date: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive'], required: true },
  external_link: { type: String, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  board_id: { type: String, ref: 'Boards' },
  club_id: { type: String, ref: 'Clubs' },
  event_id: { type: String, ref: 'Event' },
  keywords: [{ type: String }],
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true }
});

module.exports = mongoose.model('Opportunities', opportunitiesSchema);
EOF
)"

create_model "OpportunityApplication.js" "$(cat <<EOF
const mongoose = require('mongoose');

const opportunityApplicationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  opportunity_id: { type: String, required: true, ref: 'Opportunities' },
  applicant_id: { type: String, required: true, ref: 'User' },
  submitted_at: { type: Date, required: true },
  updated_at: { type: Date, required: true }
});

module.exports = mongoose.model('OpportunityApplication', opportunityApplicationSchema);
EOF
)"

create_model "Badge.js" "$(cat <<EOF
const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  user_id: { type: String, required: true, ref: 'User' },
  given_on: { type: Date, required: true },
  club_id: { type: String, ref: 'Clubs' },
  board_id: { type: String, ref: 'Boards' },
  badge_type_id: { type: String, required: true, ref: 'BadgeType' }
});

module.exports = mongoose.model('Badge', badgeSchema);
EOF
)"

create_model "BadgeType.js" "$(cat <<EOF
const mongoose = require('mongoose');

const badgeTypeSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  emoji: { type: String, required: true }
});

module.exports = mongoose.model('BadgeType', badgeTypeSchema);
EOF
)"

create_model "Project.js" "$(cat <<EOF
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  club_id: { type: String, required: true, ref: 'Clubs' },
  board_id: { type: String, required: true, ref: 'Boards' },
  start_date: { type: String, required: true },
  status: { type: String, enum: ['Running', 'Completed', 'Inactive'], required: true },
  end_date: { type: String, required: true },
  created_on: { type: Date, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true }
});

module.exports = mongoose.model('Project', projectSchema);
EOF
)"

create_model "ProjectMembers.js" "$(cat <<EOF
const mongoose = require('mongoose');

const projectMembersSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  project_id: { type: String, required: true, ref: 'Project' },
  user_id: { type: String, required: true, ref: 'User' },
  added_on: { type: String, required: true }
});

module.exports = mongoose.model('ProjectMembers', projectMembersSchema);
EOF
)"

create_model "Privilege.js" "$(cat <<EOF
const mongoose = require('mongoose');

const privilegeSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  privilege_type_id: { type: String, required: true, ref: 'PrivilegeType' },
  club_id: { type: String, ref: 'Clubs' },
  user_id: { type: String, required: true, ref: 'User' }
});

module.exports = mongoose.model('Privilege', privilegeSchema);
EOF
)"

create_model "PrivilegeType.js" "$(cat <<EOF
const mongoose = require('mongoose');

const privilegeTypeSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  posts: { type: Boolean, required: true },
  events: { type: Boolean, required: true },
  projects: { type: Boolean, required: true },
  resources: { type: Boolean, required: true },
  opportunities: { type: Boolean, required: true },
  blogs: { type: Boolean, required: true },
  forums: { type: Boolean, required: true }
});

module.exports = mongoose.model('PrivilegeType', privilegeTypeSchema);
EOF
)"

echo "All models generated successfully in the 'models' directory."