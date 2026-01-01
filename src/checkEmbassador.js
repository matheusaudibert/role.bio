const { getUserProfile } = require('./apiService');

async function checkAmbassadors(client) {
  console.log("Starting daily ambassador check...");
  const guildId = process.env.SERVER_ID;
  const roleId = process.env.CARGO;

  if (!guildId || !roleId) return console.error("Missing SERVER_ID or CARGO in .env");

  const guild = await client.guilds.fetch(guildId).catch(() => null);
  if (!guild) return console.error("Guild not found");

  await guild.members.fetch({ time: 60000 }).catch(err => console.error("Could not fetch all members:", err));

  const role = guild.roles.cache.get(roleId);
  if (!role) return console.error("Role not found");

  console.log(`Checking members with the role: ${role.name}`);
  const members = Array.from(role.members.values());
  console.log(`Found ${members.length} ambassadors to check.`);

  if (members.length === 0) return;

  let index = 0;

  const interval = setInterval(async () => {
    if (index >= members.length) {
      clearInterval(interval);
      console.log("Daily ambassador check completed.");
      return;
    }

    const member = members[index];
    index++;

    try {
      const profileData = await getUserProfile(member.id);
      const userClan = profileData?.user?.clan;

      if (!userClan || userClan.identity_guild_id !== guildId) {
        console.log(`User ${member.user.tag} lost the tag. Removing role...`);
        await member.roles.remove(roleId).catch(e => console.error(`Failed to remove role: ${e.message}`));
      }
    } catch (err) {
      console.error(`Error checking member ${member.id}:`, err);
    }

  }, 5000);
}

function startAmbassadorCheck(client) {
  checkAmbassadors(client);

  setInterval(() => {
    checkAmbassadors(client);
  }, 1000 * 60 * 60 * 24);
}

module.exports = { startAmbassadorCheck };
