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
      console.log(data);

      console.log(data);
      return {
        userData: data.data,
        userId: data.data.userId,
        isSuperAdmin: data.data.userRole === "super_admin",
        isClubAdmin: data.data.userRole === "club_admin",
        isBoardAdmin: data.data.userRole === "board_admin",
        board_id: data?.data?.boardId,
        club_id: data?.data?.clubId,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }
  
