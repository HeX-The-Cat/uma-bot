const { subscribe } = require("diagnostics_channel");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ActionRow,
  messageLink,
} = require("discord.js");
const fs = require("fs");
const path = "./src/embedData.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("moderator-embeds")
    .setDescription("Manage moderator embeds")
    .addSubcommand((subcommand) => subcommand.setName("create-join-embed").setDescription('Create "looking to join" list embed'))
    .addSubcommand((subcommand) => subcommand.setName("create-members-embed").setDescription('Create "already member" list embed'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove-already-member")
        .setDescription('Remove user from "Already Member" list')
        .addIntegerOption((option) => option.setName("list-number").setDescription("Choose the user number to remove").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove-looking-to-join")
        .setDescription('Remove user from "Looking to Join" list')
        .addIntegerOption((option) => option.setName("list-number").setDescription("Choose the user number to remove").setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const moderatorEmbedData = await interaction.client.moderatorEmbedsManager.getModeratorEmbedsData();

    try {
      switch (subcommand) {
        case "create-members-embed": {
          try {
            const memberEmbed = interaction.client.moderatorEmbedsManager.refreshMembersEmbed();
            if (moderatorEmbedData.alreadyMemberEmbedId !== "") {
              try {
                const getMessageStatus = await interaction.channel.messages.fetch(moderatorEmbedData.alreadyMemberEmbedId);
                await interaction.reply({
                  content: `Embed already exists`,
                  flags: MessageFlags.Ephemeral,
                });
                console.log("Already Member Embed already exists.");
              } catch (error) {
                const sentEmbed = await interaction.channel.send({ embeds: [memberEmbed] });
                moderatorEmbedData.alreadyMemberEmbedId = sentEmbed.id;
                await interaction.client.moderatorEmbedsManager.setModeratorChannelId(interaction.channel.id);
                await interaction.client.moderatorEmbedsManager.setAlreadyMemberEmbedId(moderatorEmbedData.alreadyMemberEmbedId);
                await interaction.reply({
                  content: "Id was found in database but embed was not found from channel. Sent new embed.",
                  flags: MessageFlags.Ephemeral,
                });
                console.log("Already Member Embed's id was found in database but message wasn't found in channel. Sent new Embed");
              }
            } else {
              try {
                const sentEmbed = await interaction.channel.send({ embeds: [memberEmbed] });
                moderatorEmbedData.alreadyMemberEmbedId = sentEmbed.id;
                await interaction.client.moderatorEmbedsManager.setModeratorChannelId(interaction.channel.id);
                await interaction.client.moderatorEmbedsManager.setAlreadyMemberEmbedId(moderatorEmbedData.alreadyMemberEmbedId);
                await interaction.reply({
                  content: "Already Member Embed created",
                  flags: MessageFlags.Ephemeral,
                });
                console.log("Already Member Embed created");
              } catch (error) {
                await interaction.reply({
                  content: "Failed to create already member embed",
                  flags: MessageFlags.Ephemeral,
                });
                console.log("Failed to create already member embed: ", error);
              }
            }
          } catch (error) {
            console.log("Failed to load member embed data: ", error);
          }
          break;
        }
        case "create-join-embed": {
          try {
            const joinEmbed = interaction.client.moderatorEmbedsManager.refreshJoinEmbed();
            if (moderatorEmbedData.joinRequestEmbedId !== "") {
              try {
                const getMessageStatus = await interaction.channel.messages.fetch(moderatorEmbedData.joinRequestEmbedId);
                await interaction.reply({
                  content: `Embed already exists`,
                  flags: MessageFlags.Ephemeral,
                });
                console.log(" Looking to Join embed already exists.");
              } catch (error) {
                const sentEmbed = await interaction.channel.send({ embeds: [joinEmbed] });
                moderatorEmbedData.joinRequestEmbedId = sentEmbed.id;
                await interaction.client.moderatorEmbedsManager.setModeratorChannelId(interaction.channel.id);
                await interaction.client.moderatorEmbedsManager.setJoinRequestEmbedId(moderatorEmbedData.joinRequestEmbedId);
                await interaction.reply({
                  content: "Id was found in database but embed was not found from channel. Sent new embed.",
                  flags: MessageFlags.Ephemeral,
                });
                console.log("\"Looking to Join embed\"'s id was found in database but message wasn't found in channel. Sent new Embed");
              }
            } else {
              try {
                const sentEmbed = await interaction.channel.send({ embeds: [joinEmbed] });
                moderatorEmbedData.joinRequestEmbedId = sentEmbed.id;
                await interaction.client.moderatorEmbedsManager.setModeratorChannelId(interaction.channel.id);
                await interaction.client.moderatorEmbedsManager.setJoinRequestEmbedId(moderatorEmbedData.joinRequestEmbedId);
                await interaction.reply({
                  content: " Looking to Join embed created",
                  flags: MessageFlags.Ephemeral,
                });
                console.log(" Looking to Join enbed created");
              } catch (error) {
                await interaction.reply({
                  content: "Failed to create Looking to Join embed",
                  flags: MessageFlags.Ephemeral,
                });
                console.log("Failed to create Looking to Join embed: ", error);
              }
            }
          } catch (error) {
            console.log("Failed to load Looking to Join embed data: ", error);
          }

          break;
        }
        case "remove-already-member": {
          const num = interaction.options.getInteger("list-number");
          await interaction.client.moderatorEmbedsManager.removeAlreadyMemberList(num);
          await interaction.client.moderatorEmbedsManager.editMembersEmbed(interaction);
          await interaction.reply({
            content: 'Removed user from "Already Member" list',
            flags: MessageFlags.Ephemeral,
          });
          break;
        }
        case "remove-looking-to-join": {
          const num = interaction.options.getInteger("list-number");
          await interaction.client.moderatorEmbedsManager.removeJoinRequestList(num);
          await interaction.client.moderatorEmbedsManager.editJoinEmbed(interaction);
          await interaction.reply({
            content: 'Removed user from "Looking to Join" list',
            flags: MessageFlags.Ephemeral,
          });
          break;
        }
      }
    } catch (error) {
      await interaction.reply({ content: "Error processing moderator embed command", flags: MessageFlags.Ephemeral });
      console.log("Error processing moderator embed command: ", error);
    }
  },
};
