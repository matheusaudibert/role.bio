require('dotenv').config();
const { Client, GatewayIntentBits, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const sendMessage = require('./src/sendMessage');
const { getUserProfile } = require('./src/apiService');
const { startAmbassadorCheck } = require('./src/checkEmbassador');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const cooldowns = new Map();

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  sendMessage(client);
  startAmbassadorCheck(client);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'verify_profile') {
    const createResponse = (text) => {
      const component = new ContainerBuilder()
        .setAccentColor(1722367)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(text)
        );

      return {
        content: "",
        components: [component],
        flags: MessageFlags.IsComponentsV2,
        ephemeral: true
      };
    };

    const roleId = process.env.CARGO;
    let member;
    try {
      member = await interaction.guild.members.fetch(interaction.user.id);
    } catch (error) {
      console.error("Error fetching member:", error);
      return interaction.reply(createResponse('Erro ao verificar suas permissões.'));
    }

    if (roleId && member.roles.cache.has(roleId)) {
      return interaction.reply(createResponse('Você já possui o cargo de Embaixador.'));
    }

    if (cooldowns.has(interaction.user.id)) {
      const expirationTime = cooldowns.get(interaction.user.id) + 60000;
      const now = Date.now();
      if (now < expirationTime) {
        const timeLeft = Math.floor((expirationTime - now) / 1000);
        return interaction.reply(createResponse(`Por favor, aguarde ${timeLeft} segundos antes de tentar verificar novamente.`));
      }
    }

    cooldowns.set(interaction.user.id, Date.now());
    setTimeout(() => cooldowns.delete(interaction.user.id), 60000);

    const profileData = await getUserProfile(interaction.user.id);

    if (!profileData || !profileData.user) {
      return interaction.reply(createResponse('Erro ao obter dados do perfil. Tente novamente.'));
    }

    const userClan = profileData.user.clan;
    const targetServerId = process.env.SERVER_ID;

    if (userClan && userClan.identity_guild_id === targetServerId) {
      try {
        if (roleId) {
          await member.roles.add(roleId);
          await interaction.reply(createResponse('Você recebeu o cargo de Embaixador.'));
        }
      } catch (err) {
        console.error("Erro ao dar cargo:", err);
        await interaction.reply(createResponse('Tag verificada, mas não consegui te dar o cargo.'));
      }
    } else {
      await interaction.reply(createResponse('Você não esta utilizando a tag do servidor no seu perfil. Adicione a tag e tente novamente.'));
    }
  }
});

client.login(process.env.BOT_TOKEN);
