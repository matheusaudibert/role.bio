async function getUserProfile(userId) {
  try {
    const response = await fetch(`https://discord.com/api/v10/users/${userId}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': process.env.ACCOUNT_TOKEN
      }
    });

    if (!response.ok) {
      console.error(`Error fetching profile: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Request failed:", error);
    return null;
  }
}

module.exports = { getUserProfile };
