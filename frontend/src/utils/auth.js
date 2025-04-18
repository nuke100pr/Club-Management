export async function getUserIdFromToken() {
  function getCookie(name) {
    if (typeof document === "undefined") return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  }

  function decodeJWT(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error decoding JWT:", e);
      return null;
    }
  }

  const authToken = getCookie("auth_token");
  if (!authToken) return null;

  const decodedToken = decodeJWT(authToken);
  return decodedToken?.id || null;
}

export async function fetchUserData() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) return null;

    const response = await fetch(`http://localhost:5000/misc/misc1/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Prepare the result object
    const result = {
      userData: data.data,
      userId: data.data.userId,
      isSuperAdmin: data.data.userRole === "super_admin",
      isClubAdmin: data.data.userRole === "club_admin",
      isBoardAdmin: data.data.userRole === "board_admin",
      board_id: data?.data?.boardId,
      club_id: data?.data?.clubId,
    };

    // If the user is a board admin, fetch all clubs for that board
    if (data.data.userRole === "board_admin" && data.data.boardId) {
      try {
        const clubsResponse = await fetch(
          `http://localhost:5000/boards/${data.data.boardId}/clubs`
        );

        if (clubsResponse.ok) {
          const clubsData = await clubsResponse.json();
          // Extract club IDs and add to result
          result.clubArray = clubsData.map((club) => club._id);
        } else {
          console.error(
            "Failed to fetch clubs for board admin:",
            clubsResponse.status
          );
        }
      } catch (clubError) {
        console.error("Error fetching clubs for board admin:", clubError);
      }
    }
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

/**
 * Checks if a user has permission for a specific action type
 * @param {string} permissionType - Type of permission to check (posts, events, projects, resources, opportunities, blogs, forums)
 * @param {Object} userData - User data object containing permissions
 * @param {string} boardId - ID of the board to check permissions for
 * @param {string} clubId - ID of the club to check permissions for
 * @returns {boolean} - True if user has permission, false otherwise
 */
export async function hasPermission(permissionType, userData, boardId, clubId) {
  // Case 1: If user is a superadmin, they have all permissions
  if (userData.isSuperAdmin) {
    return true;
  }

  // Case 2: If user is a board admin and we're checking for a club under their board
  if (userData.isBoardAdmin && boardId === userData.boardId) {
    // If clubId is provided, check if it's in the clubArray
    if (clubId && userData.clubArray && userData.clubArray.includes(clubId)) {
      return true;
    }
    // If no clubId is provided, they have permission for board-level operations
    if (!clubId) {
      return true;
    }
  }

  // Case 3: If user is a club admin for the specific club
  if (userData.isClubAdmin && clubId === userData.club_id) {
    return true;
  }

  // Case 4: Check specific permissions in userData.data
  if (userData.userData && userData.userData.data) {
    // Check in clubs permissions if clubId is provided
    if (
      clubId &&
      userData.userData.data.clubs &&
      userData.userData.data.clubs[clubId]
    ) {
      return !!userData.userData.data.clubs[clubId][permissionType];
    }

    // Check in boards permissions if boardId is provided
    if (
      boardId &&
      userData.userData.data.boards &&
      userData.userData.data.boards[boardId]
    ) {
      return !!userData.userData.data.boards[boardId][permissionType];
    }
  }

  // Case 5: Check in the nested userData structure
  if (userData.userData && userData.userData.data) {
    // Check clubs permissions
    const clubs = userData.userData.data.clubs;
    if (clubId && clubs && clubs[clubId]) {
      return !!clubs[clubId][permissionType];
    }

    // Check boards permissions
    const boards = userData.userData.data.boards;
    if (boardId && boards && boards[boardId]) {
      return !!boards[boardId][permissionType];
    }
  }

  // Case 6: Check directly in userData.data structure
  if (userData.data) {
    // Check clubs permissions
    const clubs = userData.data.clubs;
    if (clubId && clubs && clubs[clubId]) {
      return !!clubs[clubId][permissionType];
    }

    // Check boards permissions
    const boards = userData.data.boards;
    if (boardId && boards && boards[boardId]) {
      return !!boards[boardId][permissionType];
    }
  }

  // If none of the above conditions are met, user doesn't have permission
  return false;
}
