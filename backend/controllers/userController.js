const userService = require("../services/userService");
const passport = require("../services/googleAuthService");

class UserController {
  async createUser(req, res) {
    try {
      const userData = req.body;
      const newUser = await userService.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  googleAuth(req, res, next) {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    })(req, res, next);
  }

  googleAuthCallback(req, res, next) {
    passport.authenticate("google", { session: false }, async (err, user) => {
      if (err || !user) {
        return res.redirect("/login?error=Authentication failed");
      }

      try {
        const { token } = await userService.googleAuthCallback(user);
        return res.redirect(
          `${
            process.env.FRONTEND_URL
          }/login?token=${token}&user=${encodeURIComponent(
            JSON.stringify({
              id: user._id,
              name: user.name,
              email: user.email_id,
              department: user.department,
            })
          )}`
        );
      } catch (error) {
        return res.redirect("/login?error=Authentication failed");
      }
    })(req, res, next);
  }

  async getUserByEmail(req, res) {
    try {
      const { email } = req.params;
      const user = await userService.fetchUserByEmail(email);

      if (!user) {
        return res
          .status(404)
          .json({ error: "User not found with this email" });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await userService.deleteUserById(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async fetchUserDetails(req, res) {
    try {
      const { user_id } = req.params;
      const userDetails = await userService.fetchUserDetailsById(user_id);
      res.status(200).json(userDetails);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async editUserDetails(req, res) {
    try {
      const { user_id } = req.params;
      const updateData = req.body;
      const updatedDetails = await userService.editUserDetailsById(
        user_id,
        updateData
      );
      res.status(200).json(updatedDetails);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async listAllUsers(req, res) {
    try {
      const users = await userService.listAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async fetchAllUsers(req, res) {
    try {
      const users = await userService.fetchAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async fetchUsersByClubId(req, res) {
    try {
      const { club_id } = req.params;
      const users = await userService.fetchUsersByClubId(club_id);
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async editUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedUser = await userService.editUserById(id, updateData);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async unfollowClub(req, res) {
    try {
      const { user_id, club_id } = req.params;
      await userService.unfollowClub(user_id, club_id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async followClub(req, res) {
    try {
      const { user_id, club_id } = req.params;
      const follow = await userService.followClub(user_id, club_id);
      res.status(201).json(follow);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async likePost(req, res) {
    try {
      const { user_id, post_id } = req.params;
      const like = await userService.likePost(user_id, post_id);
      res.status(201).json(like);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async fetchLike(req, res) {
    try {
      const { user_id, post_id } = req.params;
      const like = await userService.fetchLike(user_id, post_id);
      res.status(200).json(like);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async unlikePost(req, res) {
    try {
      const { user_id, post_id } = req.params;
      await userService.unlikePost(user_id, post_id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async register(req, res) {
    try {
      const { email_address, password, name, department } = req.body;
      const { user, token } = await userService.registerUser({
        email_address,
        password,
        name,
        department,
      });
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email_id,
          department: user.department,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async login(req, res) {
    try {
      const { email_address, password } = req.body;
      const { user, token } = await userService.loginUser(
        email_address,
        password
      );
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email_id,
          department: user.department,
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  async assignClubAdmin(req, res) {
    try {
      const { userId, club_id } = req.body;
      const updatedUser = await userService.updateUserRole(
        userId,
        "club_admin",
        club_id
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Club admin role assigned successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async assignBoardAdmin(req, res) {
    try {
      const { userId, board_id } = req.body;
      const updatedUser = await userService.updateUserRole(
        userId,
        "board_admin",
        board_id
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Board admin role assigned successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async assignSuperAdmin(req, res) {
    try {
      const { userId } = req.body;
      const updatedUser = await userService.updateUserRole(
        userId,
        "super_admin",
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Super admin role assigned successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async removeAdminRole(req, res) {
    try {
      const { userId } = req.params;
      const updatedUser = await userService.updateUserRole(
        userId,
        "member",
        null
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Admin role removed successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new UserController();
