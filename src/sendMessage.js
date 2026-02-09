const {
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  TextDisplayBuilder,
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags
} = require('discord.js');

async function sendMessage(client) {
  const channelId = process.env.CHANNEL_ID;
  if (!channelId) return console.error("CHANNEL_ID is missing in .env");

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel) return console.error("Channel not found");

  try {
    let fetched;
    do {
      fetched = await channel.messages.fetch({ limit: 100 });

      const recent = fetched.filter(m => Date.now() - m.createdTimestamp < 1209600000);
      const oldMsgs = fetched.filter(m => Date.now() - m.createdTimestamp >= 1209600000);

      if (recent.size > 1) {
        await channel.bulkDelete(recent).catch(err => console.error("Bulk delete failed:", err));
      } else if (recent.size === 1) {
        await recent.first().delete().catch(err => console.error("Single delete failed:", err));
      }

      for (const [, msg] of oldMsgs) {
        await msg.delete().catch(err => console.error("Old msg delete failed:", err));
      }
    } while (fetched.size >= 100);
  } catch (err) {
    console.error("Could not clear channel:", err);
  }

  const components = [
    new ContainerBuilder()
      .setAccentColor(1722367)
      .addMediaGalleryComponents(
        new MediaGalleryBuilder()
          .addItems(
            new MediaGalleryItemBuilder()
              .setURL("https://i.postimg.cc/8cXQwVRy/PROGRAMADORES7.png"),
          ),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("# Torne-se um embaixador"),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("Aqui no **Servidor dos Programadores** temos um sistema de **embaixadores**, membros que ajudam a divulgar e fortalecer nossa comunidade."),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("Para ganhar o cargo <@&1409756076794187846> você deve ser membro do servidor há **pelo menos 1 mês** e utilizar a **tag do servidor** no seu perfil."),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("Esta é a tag do servidor atualmente:"),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("# <:tag:1456035378044600501> CODE"),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("Para receber o seu cargo basta clicar no botão abaixo que o bot verificará o seu perfil."),
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("-# Se você retirar o convite da sua biografia você perderá o cargo."),
      ),
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setLabel("Ganhar cargo")
          .setCustomId("verify_profile"),
        new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel("Como colocar a tag do servidor?")
          .setURL("https://support.discord.com/hc/pt-br/articles/31444248479639-Tags-do-servidor#h_01JT6VKRACHQADX7EBXR84QTAQ"),
      ),
  ];

  try {
    const webhook = await channel.createWebhook({
      name: 'Embaixador',
      avatar: 'https://i.postimg.cc/vBtMx4BF/leaf-fill.png',
    });

    await webhook.send({
      components,
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });
    console.log("Message sent via webhook!");

    await webhook.delete();
  } catch (err) {
    console.error("Error sending webhook:", err);
  }
}

module.exports = sendMessage;