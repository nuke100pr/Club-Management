const Por = require("../models/Por");
const User = require("../models/User");
const PrivilegeType = require("../models/PrivilegeType");
const Event = require("../models/Event");
const Post = require("../models/Posts");
const Project = require("../models/Project");
const Opportunity = require("../models/Opportunities");
const Resource = require("../models/Resource");
const Blog = require("../models/Blogs");
const Forum = require("../models/Forums");
const Club = require("../models/Clubs");


async function transformData(inputData) {


  const result = {
    success: true,
    data: {
      userId: inputData[0]?.user_id?._id?.toString() || null,
      userRole: inputData[0]?.user_id?.userRole,
      data: {
        clubs: {},
        boards: {},
      },
    },
  };

  // Helper function to merge permissions using OR logic
  const mergePermissions = (existingPerms, newPerms) => {
    if (!existingPerms) return newPerms;
    return {
      posts: existingPerms.posts || newPerms.posts,
      events: existingPerms.events || newPerms.events,
      projects: existingPerms.projects || newPerms.projects,
      resources: existingPerms.resources || newPerms.resources,
      opportunities: existingPerms.opportunities || newPerms.opportunities,
      blogs: existingPerms.blogs || newPerms.blogs,
      forums: existingPerms.forums || newPerms.forums,
    };
  };

  inputData.forEach((item) => {
    const permissions = {
      posts: item.privilegeTypeId.posts,
      events: item.privilegeTypeId.events,
      projects: item.privilegeTypeId.projects,
      resources: item.privilegeTypeId.resources,
      opportunities: item.privilegeTypeId.opportunities,
      blogs: item.privilegeTypeId.blogs,
      forums: item.privilegeTypeId.forums,
    };

    if (item.board_id) {
      const boardId = item.board_id._id.toString();
      result.data.data.boards[boardId] = mergePermissions(
        result.data.data.boards[boardId],
        permissions
      );
    }

    if (item.club_id) {
      const clubId = item.club_id._id.toString();
      result.data.data.clubs[clubId] = mergePermissions(
        result.data.data.clubs[clubId],
        permissions
      );
    }
  });

  return result;
}

async function getPrivilegesByUserId1(user_id) {
  try {
    const privileges = await Por.find({ user_id })  // Assuming the model is named Privilege
      .populate('privilegeTypeId')
      .populate('club_id')
      .populate('board_id')
      .populate('user_id');
    
    const user = await User.findById(user_id);  
    if (!user) {
      throw new Error('User not found');
    }
    if (privileges.length === 0) {


      // Return a consistent format - adjust according to your needs
      return { userId:user_id, userRole:user.userRole, data: {clubs:{},boards:{}},boardId:user?.board_id,clubId:user?.club_id };
    }
    const transformedprivileges = await transformData(privileges);
    transformedprivileges.data = {
      ...transformedprivileges.data,
      boardId: user?.board_id,
      clubId: user?.club_id
    };
    return transformedprivileges.data;
  } catch (error) {
    // Consider logging the error here
    throw error;  // Re-throwing is fine if you want the caller to handle it
  }
}

async function getPrivilegesByUserId(user_id) {
  try {
    const privileges = await Por.find({ user_id })
      .populate({
        path: "privilegeTypeId",
        select: "position",
      })
      .populate("club_id")
      .populate("board_id")
      .populate({
        path: "user_id",
        select: "name email userRole",
      });

    if (privileges.length === 0) {
      const user = await User.findById(user_id).select("name email userRole");
      if (!user) {
        throw new Error("User not found");
      }
      return {
        userId: user_id,
        userDetails: {
          name: user.name,
          email: user.email,
          userRole: user.userRole,
        },
        positions: [],
      };
    }

    const userDetails = {
      name: privileges[0].user_id.name,
      email: privileges[0].user_id.email,
      userRole: privileges[0].user_id.userRole,
    };

    const positions = [
      ...new Set(privileges.map((p) => p.privilegeTypeId.position)),
    ];

    return {
      userId: user_id,
      userDetails,
      positions,
    };
  } catch (error) {
    throw error;
  }
}

async function getPrivilegesByBoardId(board_id) {
  try {
    const privileges = await Por.find({ board_id })
      .populate({
        path: "privilegeTypeId",
        select: "position",
      })
      .populate({
        path: "user_id",
        select: "name email_id userRole",
      });

    if (privileges.length === 0) {
      return { boardId: board_id, users: [] };
    }

    const usersMap = {};

    privileges.forEach((privilege) => {
      const userId = privilege.user_id._id.toString();

      if (!usersMap[userId]) {
        usersMap[userId] = {
          userDetails: {
            name: privilege.user_id.name,
            email: privilege.user_id.email_id,
            userRole: privilege.user_id.userRole,
          },
          positions: new Set(),
        };
      }

      if (privilege.privilegeTypeId?.position) {
        usersMap[userId].positions.add(privilege.privilegeTypeId.position);
      }
    });

    const users = Object.entries(usersMap).map(([userId, data]) => ({
      userId,
      userDetails: data.userDetails,
      positions: Array.from(data.positions),
    }));

    return {
      boardId: board_id,
      users,
    };
  } catch (error) {
    throw error;
  }
}

async function getPrivilegesByClubId(club_id) {
  try {
    const privileges = await Por.find({ club_id })
      .populate({
        path: "privilegeTypeId",
        select: "position",
      })
      .populate({
        path: "user_id",
        select: "name email_id userRole",
      });

    if (privileges.length === 0) {
      return { clubId: club_id, users: [] };
    }

    const usersMap = {};

    privileges.forEach((privilege) => {
      const userId = privilege.user_id._id.toString();

      if (!usersMap[userId]) {
        usersMap[userId] = {
          userDetails: {
            name: privilege.user_id.name,
            email: privilege.user_id.email_id,
            userRole: privilege.user_id.userRole,
          },
          positions: new Set(),
        };
      }

      if (privilege.privilegeTypeId?.position) {
        usersMap[userId].positions.add(privilege.privilegeTypeId.position);
      }
    });

    const users = Object.entries(usersMap).map(([userId, data]) => ({
      userId,
      userDetails: data.userDetails,
      positions: Array.from(data.positions),
    }));

    return {
      clubId: club_id,
      users,
    };
  } catch (error) {
    throw error;
  }
}

async function getBoardEntityCounts(board_id) {
  try {
    const [
      eventsCount,
      postsCount,
      projectsCount,
      opportunitiesCount,
      resourcesCount,
      blogsCount,
      forumsCount,
      clubsCount,
    ] = await Promise.all([
      Event.countDocuments({ board_id }),
      Post.countDocuments({ board_id }),
      Project.countDocuments({ board_id }),
      Opportunity.countDocuments({ board_id }),
      Resource.countDocuments({ board_id }),
      Blog.countDocuments({ board_id }),
      Forum.countDocuments({ board_id }),
      Club.countDocuments({ board_id }),
    ]);

    return {
      boardId: board_id,
      counts: {
        events: eventsCount,
        posts: postsCount,
        projects: projectsCount,
        opportunities: opportunitiesCount,
        resources: resourcesCount,
        blogs: blogsCount,
        forums: forumsCount,
        clubs: clubsCount,
      },
    };
  } catch (error) {
    throw error;
  }
}

async function getClubEntityCounts(club_id) {
  try {
    const [
      eventsCount,
      postsCount,
      projectsCount,
      opportunitiesCount,
      resourcesCount,
      blogsCount,
      forumsCount,
    ] = await Promise.all([
      Event.countDocuments({ club_id }),
      Post.countDocuments({ club_id }),
      Project.countDocuments({ club_id }),
      Opportunity.countDocuments({ club_id }),
      Resource.countDocuments({ club_id }),
      Blog.countDocuments({ club_id }),
      Forum.countDocuments({ club_id }),
    ]);

    return {
      clubId: club_id,
      counts: {
        events: eventsCount,
        posts: postsCount,
        projects: projectsCount,
        opportunities: opportunitiesCount,
        resources: resourcesCount,
        blogs: blogsCount,
        forums: forumsCount,
      },
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getPrivilegesByUserId,
  getPrivilegesByUserId1,
  getPrivilegesByBoardId,
  getPrivilegesByClubId,
  getBoardEntityCounts,
  getClubEntityCounts,
};
